import { useState } from 'react'
import { motion } from 'motion/react'
import { Star, GitFork, Wand2, Circle } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const FILTERS = ['All Quests', 'Active', 'Completed']

const QUESTS = [
  {
    name: 'DevQuest Portfolio',
    description: 'Gamified career intelligence platform with RPG mechanics',
    language: 'TypeScript',
    langColor: '#3178c6',
    stars: 12,
    forks: 3,
    status: 'Active',
    statusColor: '#f0c040',
  },
  {
    name: 'ML Pipeline Engine',
    description: 'Automated machine learning pipeline orchestration tool',
    language: 'Python',
    langColor: '#3572A5',
    stars: 34,
    forks: 8,
    status: 'Completed',
    statusColor: '#22c55e',
  },
  {
    name: 'Real-Time Chat API',
    description: 'WebSocket-based messaging system with end-to-end encryption',
    language: 'Go',
    langColor: '#00ADD8',
    stars: 21,
    forks: 5,
    status: 'Completed',
    statusColor: '#22c55e',
  },
]

export default function QuestLog() {
  const [activeFilter, setActiveFilter] = useState(0)

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="mb-8">
        <h1
          className="font-display text-3xl tracking-wide sm:text-4xl"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #60a5fa, #2563eb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 16px rgba(59, 130, 246, 0.25))',
          }}
        >
          Quest Log
        </h1>
        <p className="mt-2 font-body text-sm text-text-muted">
          Your GitHub adventures and conquests
        </p>
      </motion.div>

      {/* Filter tabs */}
      <motion.div variants={item} className="mb-6 flex gap-2">
        {FILTERS.map((filter, i) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(i)}
            className={`relative rounded-lg border px-4 py-1.5 font-heading text-xs tracking-wider transition-all duration-200 ${
              activeFilter === i
                ? 'border-accent-blue/40 bg-accent-blue/10 text-accent-blue'
                : 'border-border-subtle/40 bg-transparent text-text-muted hover:border-border-subtle hover:text-text-secondary'
            }`}
          >
            {filter}
          </button>
        ))}
      </motion.div>

      {/* Quest cards */}
      <div className="flex flex-col gap-4">
        {QUESTS.map((quest) => (
          <motion.div
            key={quest.name}
            variants={item}
            className="group relative overflow-hidden rounded-xl border border-border-subtle/40 bg-bg-card/30 p-5 backdrop-blur-sm transition-colors duration-200 hover:bg-bg-card-hover/30"
            whileHover={{ x: 4, transition: { duration: 0.15 } }}
          >
            {/* Left status border */}
            <div
              className="absolute top-2 bottom-2 left-0 w-[2px] rounded-full"
              style={{
                backgroundColor: quest.statusColor,
                boxShadow: `0 0 6px ${quest.statusColor}50`,
              }}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 pl-3">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-heading text-sm tracking-wide text-text-primary">
                    {quest.name}
                  </h3>
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-medium tracking-wider uppercase"
                    style={{
                      color: quest.statusColor,
                      backgroundColor: `${quest.statusColor}15`,
                      border: `1px solid ${quest.statusColor}25`,
                    }}
                  >
                    {quest.status}
                  </span>
                </div>
                <p className="mb-3 text-xs text-text-muted">{quest.description}</p>

                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <Circle className="h-2.5 w-2.5 fill-current" style={{ color: quest.langColor }} />
                    {quest.language}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" /> {quest.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="h-3 w-3" /> {quest.forks}
                  </span>
                </div>
              </div>

              <button
                className="flex items-center gap-1.5 self-start rounded-lg border border-accent-purple/30 bg-accent-purple/5 px-3 py-1.5 text-[10px] font-medium tracking-wider text-accent-purple uppercase transition-all hover:border-accent-purple/50 hover:bg-accent-purple/10"
              >
                <Wand2 className="h-3 w-3" />
                Analyze Quest
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
