'use client'

import { useCallback } from 'react'
import { useVoiceSession } from '@/hooks/useVoiceSession'
import SessionLayout from '@/components/SessionLayout'
import ChatTranscript from '@/components/ChatTranscript'

export default function ExplainPage() {
  const {
    voiceState,
    messages,
    isStarted,
    error,
    startSession,
    startListening,
    stopListening,
    stopSpeaking,
  } = useVoiceSession('explain')

  const handleMicClick = useCallback(() => {
    if (voiceState === 'speaking') {
      stopSpeaking()
    } else if (voiceState === 'listening') {
      stopListening()
    } else if (voiceState === 'idle') {
      startListening()
    }
  }, [voiceState, stopSpeaking, stopListening, startListening])

  return (
    <SessionLayout
      title="Explication du Chapitre"
      subtitle="Structure de l'atome · Physique-Chimie"
      icon={<BookIcon />}
      accentColor="bg-indigo-600"
      voiceState={voiceState}
      isStarted={isStarted}
      error={error}
      onStart={startSession}
      onMicClick={handleMicClick}
    >
      <ChatTranscript messages={messages} />
    </SessionLayout>
  )
}

function BookIcon() {
  return (
    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
      <path d="M6 2v18l6-3 6 3V2H6zm10 14.55L12 14.8l-4 1.75V4h8v12.55z" />
    </svg>
  )
}
