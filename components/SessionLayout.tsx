'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { VoiceState } from '@/hooks/useVoiceSession'
import VoiceOrb from './VoiceOrb'

interface Props {
  title: string
  subtitle: string
  icon: ReactNode
  accentColor: string
  voiceState: VoiceState
  isStarted: boolean
  error: string | null
  onStart: () => void
  onMicClick: () => void
  children: ReactNode
}

export default function SessionLayout({
  title,
  subtitle,
  icon,
  accentColor,
  voiceState,
  isStarted,
  error,
  onStart,
  onMicClick,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </Link>

        <div className="flex items-center gap-3">
          <span className={`p-2 rounded-xl ${accentColor}`}>{icon}</span>
          <div>
            <h1 className="font-bold text-base">{title}</h1>
            <p className="text-slate-400 text-xs">{subtitle}</p>
          </div>
        </div>

        <div className="w-16" />
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        {/* Chat panel */}
        <div className="flex-1 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
          {children}
        </div>

        {/* Voice control panel */}
        <div className="w-full lg:w-72 flex flex-col items-center justify-center gap-8 p-8 bg-slate-900">
          {!isStarted ? (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className={`p-6 rounded-3xl ${accentColor} bg-opacity-20`}>
                <span className="block">{icon}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">{title}</h2>
                <p className="text-slate-400 text-sm leading-relaxed">{subtitle}</p>
              </div>
              <button
                onClick={onStart}
                className={`w-full py-4 rounded-2xl font-bold text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${accentColor}`}
              >
                Démarrer la session
              </button>
            </div>
          ) : (
            <>
              <VoiceOrb
                state={voiceState}
                onClick={onMicClick}
              />

              <div className="text-center text-xs text-slate-500 max-w-[200px]">
                Appuyez sur l&apos;orbe pour parler. Le professeur s&apos;arrête si vous
                interrompez.
              </div>
            </>
          )}

          {error && (
            <div className="w-full bg-red-900/50 border border-red-500/50 text-red-300 text-xs rounded-xl p-3 text-center">
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
