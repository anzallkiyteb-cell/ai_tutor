'use client'

import { useCallback, useEffect, useState } from 'react'
import { useVoiceSession } from '@/hooks/useVoiceSession'
import SessionLayout from '@/components/SessionLayout'
import ChatTranscript from '@/components/ChatTranscript'

export default function ExercisesPage() {
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
  } = useVoiceSession('exercise')

  const [exerciseStarted, setExerciseStarted] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const handleMicClick = useCallback(() => {
    if (voiceState === 'speaking') {
      stopSpeaking()
    } else if (voiceState === 'listening') {
      stopListening()
    } else if (voiceState === 'idle') {
      startListening()
    }
  }, [voiceState, stopSpeaking, stopListening, startListening])

  // Auto-start exercises after session
  useEffect(() => {
    if (isStarted && !exerciseStarted) {
      setExerciseStarted(true)
      const timer = setTimeout(() => {
        sendMessage(
          "Je suis prêt. Commence les exercices sur la structure de l'atome."
        )
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isStarted, exerciseStarted, sendMessage])

  // Track score from assistant messages
  useEffect(() => {
    const assistantMsgs = messages.filter((m) => m.role === 'assistant')
    const lastMsg = assistantMsgs[assistantMsgs.length - 1]?.content ?? ''
    const correctMatch = lastMsg.match(/(\d+)\s*\/\s*(\d+)/)?.[0]
    if (correctMatch) {
      const [c, t] = correctMatch.split('/').map(Number)
      if (!isNaN(c) && !isNaN(t)) setScore({ correct: c, total: t })
    }
  }, [messages])

  const scorePercent = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0

  return (
    <SessionLayout
      title="Exercices Interactifs"
      subtitle="Structure de l'atome · Quiz vocal"
      icon={<PencilIcon />}
      accentColor="bg-violet-600"
      voiceState={voiceState}
      isStarted={isStarted}
      error={error}
      onStart={startSession}
      onMicClick={handleMicClick}
    >
      <div className="flex flex-col h-full">
        {/* Score bar */}
        {score.total > 0 && (
          <div className="px-4 pt-4 pb-2 border-b border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Score</span>
              <span className="font-bold text-violet-300">
                {score.correct} / {score.total} — {scorePercent}%
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-violet-500 transition-all duration-500"
                style={{ width: `${scorePercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Chat */}
        <div className="flex-1 overflow-hidden">
          <ChatTranscript messages={messages} />
        </div>
      </div>
    </SessionLayout>
  )
}

function PencilIcon() {
  return (
    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  )
}
