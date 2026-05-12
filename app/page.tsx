import Link from 'next/link'

const cards = [
  {
    href: '/explain',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 2v18l6-3 6 3V2H6zm10 14.55L12 14.8l-4 1.75V4h8v12.55z" />
      </svg>
    ),
    badge: 'Explication',
    title: 'Expliquer le Chapitre',
    description:
      "Le professeur IA explique la structure de l'atome section par section avec voix naturelle. Interrompez à tout moment pour poser une question.",
    features: ['Explication progressive', 'Interruption vocale', 'Q&R en temps réel'],
    gradient: 'from-indigo-600 to-indigo-800',
    ring: 'ring-indigo-500/30 hover:ring-indigo-400/60',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    arrowColor: 'text-indigo-400',
    glow: 'hover:shadow-indigo-500/20',
  },
  {
    href: '/summary',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z" />
      </svg>
    ),
    badge: 'Résumé',
    title: 'Résumé du Chapitre',
    description:
      "L'IA génère un résumé structuré et complet, le lit à voix haute et l'affiche visuellement. Posez des questions sur n'importe quel point.",
    features: ['Résumé structuré visuel', 'Lecture vocale', 'Points clés mis en valeur'],
    gradient: 'from-emerald-600 to-emerald-800',
    ring: 'ring-emerald-500/30 hover:ring-emerald-400/60',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    arrowColor: 'text-emerald-400',
    glow: 'hover:shadow-emerald-500/20',
  },
  {
    href: '/exercises',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V9h14v11z" />
      </svg>
    ),
    badge: 'Exercices',
    title: 'Exercices Interactifs',
    description:
      'Le professeur IA vous pose des questions oralement, évalue vos réponses vocales, corrige et explique. Basé sur les devoirs réels du cours.',
    features: ['Quiz vocal adaptatif', 'Correction instantanée', 'Score en temps réel'],
    gradient: 'from-violet-600 to-violet-800',
    ring: 'ring-violet-500/30 hover:ring-violet-400/60',
    badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    arrowColor: 'text-violet-400',
    glow: 'hover:shadow-violet-500/20',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-8 shadow-2xl shadow-indigo-500/30">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
            </svg>
          </div>

          <div className="inline-flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-full px-4 py-1.5 text-xs text-slate-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Propulsé par NVIDIA NIM · Llama 3.1 · Parakeet STT · Magpie TTS
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Professeur IA Privé
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed">
            Votre assistant pédagogique personnel pour{' '}
            <span className="text-white font-semibold">Physique-Chimie</span>.
            Apprenez, posez des questions et pratiquez en conversation vocale naturelle.
          </p>

          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4z" />
              </svg>
              Conversation vocale
            </span>
            <span className="text-slate-700">·</span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              Correction en temps réel
            </span>
            <span className="text-slate-700">·</span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14l-4-4 1.41-1.41L10 13.17l6.59-6.59L18 8l-8 8z" />
              </svg>
              100% Gratuit
            </span>
          </div>
        </div>

        {/* Course badge */}
        <div className="mb-10 bg-slate-800/50 border border-slate-700/50 rounded-2xl px-6 py-4 flex items-center gap-4 max-w-xl w-full">
          <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Cours chargé</p>
            <p className="font-semibold text-slate-200 text-sm">
              Chapitre I — Structure de l&apos;atome
            </p>
            <p className="text-xs text-slate-500 mt-0.5">+ Devoir N°1 avec correction (2023)</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Prêt
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`
                group relative flex flex-col rounded-3xl overflow-hidden
                bg-slate-900 border border-slate-800
                ring-2 ${card.ring} transition-all duration-300
                hover:shadow-2xl ${card.glow} hover:-translate-y-1
              `}
            >
              <div className={`h-1.5 w-full bg-gradient-to-r ${card.gradient}`} />

              <div className="p-7 flex flex-col flex-1">
                <span
                  className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full border mb-5 ${card.badgeColor}`}
                >
                  {card.badge}
                </span>

                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-105 transition-transform duration-300`}
                >
                  {card.icon}
                </div>

                <h2 className="text-xl font-bold text-white mb-3">{card.title}</h2>

                <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                  {card.description}
                </p>

                <ul className="space-y-2 mb-7">
                  {card.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                      <svg
                        className={`w-3.5 h-3.5 flex-shrink-0 ${card.arrowColor}`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <div
                  className={`flex items-center justify-between rounded-xl px-4 py-3 bg-gradient-to-r ${card.gradient} bg-opacity-10 border border-white/10 group-hover:border-white/20 transition-colors`}
                >
                  <span className="text-sm font-semibold text-white">Démarrer</span>
                  <svg
                    className={`w-5 h-5 ${card.arrowColor} group-hover:translate-x-1 transition-transform`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <footer className="mt-20 text-center text-xs text-slate-600">
          <p>Propulsé par NVIDIA NIM · Meta Llama 3.1 · Parakeet ASR · Magpie TTS</p>
          <p className="mt-1">Physique-Chimie · Terminale · 2023-2024</p>
        </footer>
      </div>
    </div>
  )
}
