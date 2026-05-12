'use client'

import { useEffect, useRef } from 'react'
import { Message } from '@/hooks/useVoiceSession'

interface Props {
  messages: Message[]
}

export default function ChatTranscript({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500 text-sm italic">
          La conversation apparaîtra ici...
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
        >
          {/* Avatar */}
          <div
            className={`
              w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold
              ${msg.role === 'assistant'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-600 text-white'
              }
            `}
          >
            {msg.role === 'assistant' ? 'P' : 'E'}
          </div>

          {/* Bubble */}
          <div
            className={`
              max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed
              ${msg.role === 'assistant'
                ? 'bg-slate-700 text-slate-100 rounded-tl-sm'
                : 'bg-indigo-600 text-white rounded-tr-sm'
              }
            `}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
            <span className="text-xs opacity-50 mt-1 block">
              {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
