'use client'

import { VoiceState } from '@/hooks/useVoiceSession'

interface Props {
  state: VoiceState
  onClick: () => void
}

const stateConfig = {
  idle: {
    label: 'Appuyer pour parler',
    bg: 'bg-slate-700 hover:bg-slate-600',
    ring: 'ring-slate-500',
    pulse: false,
    icon: MicIcon,
  },
  listening: {
    label: 'Écoute en cours...',
    bg: 'bg-red-600',
    ring: 'ring-red-400',
    pulse: true,
    icon: StopIcon,
  },
  processing: {
    label: 'Traitement...',
    bg: 'bg-amber-600',
    ring: 'ring-amber-400',
    pulse: true,
    icon: SpinnerIcon,
  },
  speaking: {
    label: 'Cliquer pour interrompre',
    bg: 'bg-emerald-600 hover:bg-emerald-500',
    ring: 'ring-emerald-400',
    pulse: true,
    icon: SpeakerIcon,
  },
}

export default function VoiceOrb({ state, onClick }: Props) {
  const config = stateConfig[state]
  const Icon = config.icon

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onClick}
        disabled={state === 'processing'}
        className={`
          relative w-24 h-24 rounded-full transition-all duration-300 cursor-pointer
          ${config.bg} ring-4 ${config.ring}
          flex items-center justify-center shadow-2xl
          disabled:cursor-not-allowed disabled:opacity-70
          ${config.pulse ? 'animate-pulse' : ''}
        `}
        aria-label={config.label}
      >
        {config.pulse && (
          <span className={`absolute inset-0 rounded-full ${config.bg} animate-ping opacity-30`} />
        )}
        <Icon />
      </button>
      <span className="text-sm text-slate-400 font-medium">{config.label}</span>
    </div>
  )
}

function MicIcon() {
  return (
    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zM5.5 10.5A6.5 6.5 0 0 0 18.5 10.5h2A8.5 8.5 0 0 1 13 18.45V22h-2v-3.55A8.5 8.5 0 0 1 3.5 10.5h2z" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

function SpeakerIcon() {
  return (
    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
      <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06C18.01 19.86 21 16.28 21 12c0-4.28-2.99-7.86-7-8.77z" />
    </svg>
  )
}
