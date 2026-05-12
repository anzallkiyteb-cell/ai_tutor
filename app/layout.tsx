import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Professeur IA Privé — Physique-Chimie',
  description:
    "Votre assistant pédagogique IA pour la Physique-Chimie. Explication vocale, résumé et exercices interactifs basés sur le cours Structure de l'atome.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950">{children}</body>
    </html>
  )
}
