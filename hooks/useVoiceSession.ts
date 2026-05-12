'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export type SessionMode = 'explain' | 'summary' | 'exercise'
export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

type SpeechRecognitionCtor = new () => SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionCtor
    webkitSpeechRecognition: SpeechRecognitionCtor
  }
}

// Strip markdown formatting so TTS doesn't read symbols aloud
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')   // **bold** → bold
    .replace(/\*([^*]+)\*/g, '$1')        // *italic* → italic
    .replace(/`{1,3}[^`]*`{1,3}/g, '')   // `code` / ```block``` → remove
    .replace(/#{1,6}\s*/g, '')            // ## headings → remove #
    .replace(/^\s*[-*+]\s+/gm, '')        // bullet points → remove marker
    .replace(/^\s*\d+\.\s+/gm, '')        // numbered lists → remove number
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [link](url) → link text
    .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')   // __bold__ / _italic_
    .replace(/~~([^~]+)~~/g, '$1')        // ~~strikethrough~~
    .replace(/>\s*/g, '')                 // > blockquote
    .replace(/\n{2,}/g, '. ')            // paragraph breaks → pause
    .replace(/\n/g, ' ')                  // single newlines → space
    .replace(/\s{2,}/g, ' ')             // collapse multiple spaces
    .trim()
}

// Split text into speakable sentences on punctuation boundaries
function extractSentences(buffer: string): { sentences: string[]; remainder: string } {
  // Match on .  !  ?  :  followed by space or end-of-string
  const re = /[^.!?:]+[.!?:](?:\s|$)/g
  const sentences: string[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = re.exec(buffer)) !== null) {
    const s = match[0].trim()
    if (s.length > 3) sentences.push(s)
    lastIndex = re.lastIndex
  }

  return { sentences, remainder: buffer.slice(lastIndex) }
}

function getFrenchVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find((v) => v.lang === 'fr-FR' && v.localService) ||
    voices.find((v) => v.lang.startsWith('fr') && v.localService) ||
    voices.find((v) => v.lang.startsWith('fr')) ||
    null
  )
}

export function useVoiceSession(mode: SessionMode) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [messages, setMessages] = useState<Message[]>([])
  const [transcript, setTranscript] = useState('')
  const [isStarted, setIsStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const sessionIdRef = useRef<string | null>(null)

  // Speech queue — sentences are pushed here and spoken one-by-one
  const speechQueueRef = useRef<string[]>([])
  const isSpeakingRef = useRef(false)
  const stopRequestedRef = useRef(false)
  const resumeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { sessionIdRef.current = sessionId }, [sessionId])

  // Create session
  useEffect(() => {
    fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    })
      .then((r) => r.json())
      .then((d) => setSessionId(d.sessionId))
      .catch(() => setError('Impossible de créer la session'))

    return () => {
      stopRequestedRef.current = true
      window.speechSynthesis?.cancel()
      recognitionRef.current?.abort()
      abortRef.current?.abort()
      if (resumeTimerRef.current) clearInterval(resumeTimerRef.current)
    }
  }, [mode])

  // ── Core TTS: speak one sentence, then drain the queue ───────────────────
  const speakNextInQueue = useCallback(() => {
    if (stopRequestedRef.current) {
      isSpeakingRef.current = false
      return
    }
    if (speechQueueRef.current.length === 0) {
      isSpeakingRef.current = false
      return
    }

    const sentence = speechQueueRef.current.shift()!
    isSpeakingRef.current = true
    setVoiceState('speaking')

    const utterance = new SpeechSynthesisUtterance(sentence)
    const voice = getFrenchVoice()
    if (voice) utterance.voice = voice
    utterance.lang = 'fr-FR'
    utterance.rate = 0.93
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onend = () => {
      if (stopRequestedRef.current) {
        isSpeakingRef.current = false
        setVoiceState('idle')
        return
      }
      speakNextInQueue()
    }
    utterance.onerror = () => {
      if (stopRequestedRef.current) {
        isSpeakingRef.current = false
        setVoiceState('idle')
        return
      }
      speakNextInQueue()
    }

    window.speechSynthesis.speak(utterance)
  }, [])

  // Push a sentence into the queue and start speaking if not already
  const enqueueSentence = useCallback((sentence: string) => {
    const clean = stripMarkdown(sentence)
    if (!clean.trim()) return
    speechQueueRef.current.push(clean)
    if (!isSpeakingRef.current) {
      speakNextInQueue()
    }
  }, [speakNextInQueue])

  // Speak a full text immediately (for greetings / opening messages)
  const speakText = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!text.trim() || typeof window === 'undefined') { resolve(); return }

      stopRequestedRef.current = false
      speechQueueRef.current = []
      window.speechSynthesis.cancel()

      // Chrome bug: voices may not be loaded yet on first call
      const doSpeak = () => {
        const cleanText = stripMarkdown(text)
        const { sentences, remainder } = extractSentences(cleanText)
        const all = sentences.length > 0 ? sentences : [cleanText]
        if (remainder.trim()) all.push(remainder.trim())

        let remaining = all.length

        const speakOne = (sentence: string) => {
          const utterance = new SpeechSynthesisUtterance(sentence)
          const voice = getFrenchVoice()
          if (voice) utterance.voice = voice
          utterance.lang = 'fr-FR'
          utterance.rate = 0.93
          utterance.pitch = 1.0
          utterance.volume = 1.0

          utterance.onend = () => {
            remaining--
            if (remaining === 0) {
              setVoiceState('idle')
              resolve()
            }
          }
          utterance.onerror = () => {
            remaining--
            if (remaining === 0) {
              setVoiceState('idle')
              resolve()
            }
          }
          window.speechSynthesis.speak(utterance)
        }

        setVoiceState('speaking')

        // Chrome bug: speechSynthesis pauses after ~15s
        if (resumeTimerRef.current) clearInterval(resumeTimerRef.current)
        resumeTimerRef.current = setInterval(() => {
          if (window.speechSynthesis.paused) window.speechSynthesis.resume()
        }, 5000)

        all.forEach(speakOne)
      }

      if (window.speechSynthesis.getVoices().length > 0) {
        doSpeak()
      } else {
        window.speechSynthesis.onvoiceschanged = () => { doSpeak() }
      }
    })
  }, [])

  const stopSpeaking = useCallback(() => {
    stopRequestedRef.current = true
    speechQueueRef.current = []
    isSpeakingRef.current = false
    if (resumeTimerRef.current) clearInterval(resumeTimerRef.current)
    window.speechSynthesis?.cancel()
    setVoiceState('idle')
  }, [])

  // ── Streaming LLM + simultaneous TTS ─────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    const sid = sessionIdRef.current
    if (!sid || !text.trim()) return

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text, timestamp: Date.now() },
    ])
    setVoiceState('processing')

    // Reset TTS state for new response
    stopRequestedRef.current = false
    speechQueueRef.current = []
    isSpeakingRef.current = false
    window.speechSynthesis.cancel()
    if (resumeTimerRef.current) clearInterval(resumeTimerRef.current)
    resumeTimerRef.current = setInterval(() => {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume()
    }, 5000)

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    let response: Response | null = null
    try {
      response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid, message: text, mode }),
        signal: abortRef.current.signal,
      })
    } catch {
      setVoiceState('idle')
      setError('Erreur de connexion au serveur')
      return
    }

    if (!response.ok) {
      setVoiceState('idle')
      setError('Erreur de traitement — réessayez')
      return
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let fullText = ''
    let speakBuffer = ''   // accumulates tokens until a sentence boundary

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      fullText += chunk
      speakBuffer += chunk

      // Update the displayed message in real-time
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last?.role === 'assistant') {
          return [...prev.slice(0, -1), { ...last, content: fullText }]
        }
        return [...prev, { role: 'assistant', content: fullText, timestamp: Date.now() }]
      })

      // Extract complete sentences from buffer and speak them immediately
      const { sentences, remainder } = extractSentences(speakBuffer)
      speakBuffer = remainder
      sentences.forEach(enqueueSentence)
    }

    // Speak any trailing text that didn't end with punctuation
    if (speakBuffer.trim()) {
      enqueueSentence(speakBuffer.trim())
    }

    // When queue drains, set idle
    const pollIdle = setInterval(() => {
      if (!isSpeakingRef.current && speechQueueRef.current.length === 0) {
        clearInterval(pollIdle)
        if (resumeTimerRef.current) clearInterval(resumeTimerRef.current)
        setVoiceState('idle')
      }
    }, 200)
  }, [mode, enqueueSentence])

  // ── STT via Web Speech API ────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (voiceState === 'speaking') stopSpeaking()
    setError(null)

    const SpeechRecognitionClass =
      window.SpeechRecognition ?? window.webkitSpeechRecognition

    if (!SpeechRecognitionClass) {
      setError('Reconnaissance vocale non supportée. Utilisez Chrome ou Edge.')
      return
    }

    const recognition = new SpeechRecognitionClass()
    recognitionRef.current = recognition
    recognition.lang = 'fr-FR'
    recognition.interimResults = true
    recognition.continuous = false
    recognition.maxAlternatives = 1

    let finalTranscript = ''

    recognition.onstart = () => setVoiceState('listening')

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) finalTranscript += result[0].transcript
        else interim += result[0].transcript
      }
      setTranscript(finalTranscript || interim)
    }

    recognition.onend = () => {
      if (finalTranscript.trim()) sendMessage(finalTranscript.trim())
      else setVoiceState('idle')
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed')
        setError('Accès au microphone refusé. Autorisez le micro dans votre navigateur.')
      setVoiceState('idle')
    }

    recognition.start()
  }, [voiceState, stopSpeaking, sendMessage])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const startSession = useCallback(async () => {
    setIsStarted(true)

    const opening =
      mode === 'explain'
        ? "Bonjour ! Je suis votre professeur de physique-chimie. Je vais vous expliquer le Chapitre I : Structure de l'atome. Vous pouvez m'interrompre à tout moment. On commence ?"
        : mode === 'summary'
        ? "Bonjour ! Je vais vous présenter un résumé complet du Chapitre I : Structure de l'atome. Prêt ?"
        : "Bonjour ! On va faire des exercices sur la Structure de l'atome. Je vais vous poser des questions une par une. Prêt ?"

    setMessages([{ role: 'assistant', content: opening, timestamp: Date.now() }])
    await new Promise((r) => setTimeout(r, 300))
    await speakText(opening)
  }, [mode, speakText])

  return {
    voiceState,
    messages,
    transcript,
    isStarted,
    error,
    startSession,
    startListening,
    stopListening,
    stopSpeaking,
    sendMessage,
  }
}
