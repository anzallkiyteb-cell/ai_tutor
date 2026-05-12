'use client'

import { useCallback, useEffect, useState } from 'react'
import { useVoiceSession } from '@/hooks/useVoiceSession'
import SessionLayout from '@/components/SessionLayout'
import ChatTranscript from '@/components/ChatTranscript'

interface SummarySection {
  heading: string
  points: string[]
}

function parseSummary(text: string): SummarySection[] {
  const lines = text.split('\n').filter((l) => l.trim())
  const sections: SummarySection[] = []
  let current: SummarySection | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (/^(#{1,3}|[IVX]+\.|[0-9]+\.)\s/.test(trimmed)) {
      if (current) sections.push(current)
      current = {
        heading: trimmed.replace(/^(#{1,3}|[IVX]+\.|[0-9]+\.)\s*/, ''),
        points: [],
      }
    } else if (/^[-•*]\s/.test(trimmed) && current) {
      current.points.push(trimmed.replace(/^[-•*]\s*/, ''))
    } else if (current && trimmed) {
      current.points.push(trimmed)
    }
  }
  if (current) sections.push(current)
  return sections
}

export default function SummaryPage() {
  const {
    voiceState,
    messages,
    isStarted,
    error,
    startSession,
    startListening,
    stopListening,
    stopSpeaking,
    sendMessage,
  } = useVoiceSession('summary')

  const [summaryStarted, setSummaryStarted] = useState(false)

  const handleMicClick = useCallback(() => {
    if (voiceState === 'speaking') {
      stopSpeaking()
    } else if (voiceState === 'listening') {
      stopListening()
    } else if (voiceState === 'idle') {
      startListening()
    }
  }, [voiceState, stopSpeaking, stopListening, startListening])

  // Auto-generate summary after session starts
  useEffect(() => {
    if (isStarted && !summaryStarted) {
      setSummaryStarted(true)
      const timer = setTimeout(() => {
        sendMessage(
          "Génère maintenant le résumé complet et structuré du chapitre sur la structure de l'atome."
        )
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isStarted, summaryStarted, sendMessage])

  // Extract last assistant message for visual summary
  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant')
  const summaryContent = lastAssistantMsg?.content ?? ''
  const sections = summaryContent ? parseSummary(summaryContent) : []

  return (
    <SessionLayout
      title="Résumé du Chapitre"
      subtitle="Structure de l'atome · Résumé interactif"
      icon={<SummaryIcon />}
      accentColor="bg-emerald-600"
      voiceState={voiceState}
      isStarted={isStarted}
      error={error}
      onStart={startSession}
      onMicClick={handleMicClick}
    >
      {sections.length > 0 ? (
        <div className="overflow-y-auto h-full p-6">
          <h2 className="text-2xl font-bold mb-6 text-emerald-400">
            Résumé : Structure de l&apos;atome
          </h2>
          <div className="grid gap-4">
            {sections.map((section, i) => (
              <div
                key={i}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-5"
              >
                <h3 className="font-bold text-emerald-300 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  {section.heading}
                </h3>
                <ul className="space-y-2">
                  {section.points.map((point, j) => (
                    <li key={j} className="flex gap-2 text-sm text-slate-300">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">▸</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Raw chat for questions */}
          {messages.length > 2 && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <h3 className="text-sm font-semibold text-slate-400 mb-4">Questions & Réponses</h3>
              <ChatTranscript messages={messages.slice(2)} />
            </div>
          )}
        </div>
      ) : (
        <ChatTranscript messages={messages} />
      )}
    </SessionLayout>
  )
}

function SummaryIcon() {
  return (
    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z" />
    </svg>
  )
}
