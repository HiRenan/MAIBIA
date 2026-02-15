import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Star, GitFork, Wand2, Circle, Search, SortAsc, Zap, X } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Modal from '../components/ui/Modal'
import { SkeletonCard } from '../components/ui/SkeletonLoader'
import { api } from '../services/api'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary'
type Status = 'Active' | 'Completed'

const RARITY_COLORS: Record<Rarity, string> = {
  Common: '#94a3b8',
  Rare: '#3b82f6',
  Epic: '#8b5cf6',
  Legendary: '#f0c040',
}

interface Quest {
  name: string
  description: string
  language: string
  langColor: string
  stars: number
  forks: number
  status: Status
  statusColor: string
  rarity: Rarity
  xp: number
  techStack: string[]
  contributors: number
  aiAnalysis: {
    score: number
    summary: string
    strengths: string[]
    improvements: string[]
  }
}

const QUESTS: Quest[] = [
  {
    name: 'DevQuest Portfolio',
    description: 'Gamified career intelligence platform with RPG mechanics, 3D backgrounds, and interactive skill trees.',
    language: 'TypeScript',
    langColor: '#3178c6',
    stars: 12,
    forks: 3,
    status: 'Active',
    statusColor: '#f0c040',
    rarity: 'Legendary',
    xp: 500,
    techStack: ['React', 'Three.js', 'FastAPI', 'Tailwind'],
    contributors: 1,
    aiAnalysis: {
      score: 92,
      summary: 'Highly ambitious project combining gamification with portfolio presentation. Excellent use of 3D and animation.',
      strengths: ['Unique concept', 'Rich UI/UX', 'Modern stack', 'Clean architecture'],
      improvements: ['Add unit tests', 'Improve mobile performance', 'Add CI/CD pipeline'],
    },
  },
  {
    name: 'ML Pipeline Engine',
    description: 'Automated machine learning pipeline orchestration tool with streaming data processing and auto-scaling.',
    language: 'Python',
    langColor: '#3572A5',
    stars: 34,
    forks: 8,
    status: 'Completed',
    statusColor: '#22c55e',
    rarity: 'Epic',
    xp: 350,
    techStack: ['Python', 'Pandas', 'PostgreSQL', 'Docker'],
    contributors: 3,
    aiAnalysis: {
      score: 88,
      summary: 'Solid data engineering project with well-designed abstractions. Performance improvements are impressive.',
      strengths: ['Great documentation', 'Scalable design', '3x speedup achieved'],
      improvements: ['Add more test coverage', 'Consider async patterns'],
    },
  },
  {
    name: 'Real-Time Chat API',
    description: 'WebSocket-based messaging system with end-to-end encryption and presence indicators.',
    language: 'Go',
    langColor: '#00ADD8',
    stars: 21,
    forks: 5,
    status: 'Completed',
    statusColor: '#22c55e',
    rarity: 'Rare',
    xp: 250,
    techStack: ['Go', 'WebSocket', 'Redis', 'PostgreSQL'],
    contributors: 2,
    aiAnalysis: {
      score: 85,
      summary: 'Efficient real-time system with low latency. Good use of Go concurrency patterns.',
      strengths: ['Low latency', 'Secure encryption', 'Clean Go idioms'],
      improvements: ['Add rate limiting', 'Implement message queuing'],
    },
  },
  {
    name: 'React Component Library',
    description: 'Accessible, themeable UI components with Storybook documentation and automated visual testing.',
    language: 'TypeScript',
    langColor: '#3178c6',
    stars: 67,
    forks: 12,
    status: 'Completed',
    statusColor: '#22c55e',
    rarity: 'Epic',
    xp: 400,
    techStack: ['React', 'TypeScript', 'Storybook', 'Jest'],
    contributors: 5,
    aiAnalysis: {
      score: 90,
      summary: 'Well-documented component library with great accessibility. High reuse potential.',
      strengths: ['A11y compliant', 'Full Storybook docs', 'Visual regression tests'],
      improvements: ['Add SSR support', 'Reduce bundle size'],
    },
  },
  {
    name: 'CLI Task Manager',
    description: 'Terminal-based task management with Git integration and time tracking features.',
    language: 'Rust',
    langColor: '#dea584',
    stars: 8,
    forks: 1,
    status: 'Active',
    statusColor: '#f0c040',
    rarity: 'Common',
    xp: 150,
    techStack: ['Rust', 'SQLite', 'Git'],
    contributors: 1,
    aiAnalysis: {
      score: 75,
      summary: 'Nice learning project for Rust. Good CLI design with useful Git integration.',
      strengths: ['Fast execution', 'Git awareness', 'Clean Rust code'],
      improvements: ['Add more commands', 'Implement sync', 'Publish to crates.io'],
    },
  },
  {
    name: 'Data Viz Dashboard',
    description: 'Interactive analytics dashboard with real-time charting, custom queries, and export capabilities.',
    language: 'JavaScript',
    langColor: '#f1e05a',
    stars: 15,
    forks: 4,
    status: 'Completed',
    statusColor: '#22c55e',
    rarity: 'Rare',
    xp: 200,
    techStack: ['D3.js', 'React', 'Node.js', 'MongoDB'],
    contributors: 2,
    aiAnalysis: {
      score: 82,
      summary: 'Feature-rich dashboard with smooth visualizations. Good use of D3.js with React.',
      strengths: ['Beautiful charts', 'Real-time updates', 'CSV/PDF export'],
      improvements: ['Add dark mode', 'Optimize large datasets', 'Add keyboard shortcuts'],
    },
  },
]

const FILTERS = ['All Quests', 'Active', 'Completed'] as const
const SORT_OPTIONS = ['Stars', 'XP', 'Name'] as const

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6', Python: '#3572A5', JavaScript: '#f1e05a', Go: '#00ADD8',
  Rust: '#dea584', HTML: '#e34c26', CSS: '#563d7c', Java: '#b07219', Ruby: '#701516',
  Shell: '#89e051', Unknown: '#94a3b8',
}

function repoToQuest(repo: { name: string; description: string; language: string; stars: number; forks: number; status: string; rarity: string; xp: number }): Quest {
  return {
    name: repo.name,
    description: repo.description,
    language: repo.language,
    langColor: LANG_COLORS[repo.language] || '#94a3b8',
    stars: repo.stars,
    forks: repo.forks,
    status: (repo.status === 'Active' ? 'Active' : 'Completed') as Status,
    statusColor: repo.status === 'Active' ? '#f0c040' : '#22c55e',
    rarity: (['Common', 'Rare', 'Epic', 'Legendary'].includes(repo.rarity) ? repo.rarity : 'Common') as Rarity,
    xp: repo.xp,
    techStack: [repo.language].filter(Boolean),
    contributors: 1,
    aiAnalysis: {
      score: 0,
      summary: 'Click Analyze Quest to generate AI analysis.',
      strengths: [],
      improvements: [],
    },
  }
}

export default function QuestLog() {
  const [activeFilter, setActiveFilter] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<typeof SORT_OPTIONS[number]>('Stars')
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [quests, setQuests] = useState<Quest[]>(QUESTS)

  useEffect(() => {
    api.getRepos().then((data) => {
      if (data?.repos && data.repos.length > 0) {
        setQuests(data.repos.map(repoToQuest))
      }
    })
  }, [])

  const handleFilterChange = useCallback((index: number) => {
    setIsLoading(true)
    setActiveFilter(index)
    setTimeout(() => setIsLoading(false), 200)
  }, [])

  const filteredQuests = useMemo(() => {
    let result = [...quests]

    // Filter by status
    if (activeFilter === 1) result = result.filter((q) => q.status === 'Active')
    if (activeFilter === 2) result = result.filter((q) => q.status === 'Completed')

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (q) =>
          q.name.toLowerCase().includes(query) ||
          q.language.toLowerCase().includes(query) ||
          q.techStack.some((t) => t.toLowerCase().includes(query))
      )
    }

    // Sort
    if (sortBy === 'Stars') result.sort((a, b) => b.stars - a.stars)
    if (sortBy === 'XP') result.sort((a, b) => b.xp - a.xp)
    if (sortBy === 'Name') result.sort((a, b) => a.name.localeCompare(b.name))

    return result
  }, [activeFilter, searchQuery, sortBy, quests])

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Quest Log"
        subtitle="Your GitHub adventures and conquests"
        gradient="linear-gradient(135deg, #3b82f6, #60a5fa, #2563eb)"
        glowColor="rgba(59, 130, 246, 0.25)"
      />

      {/* Controls */}
      <motion.div variants={item} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filters */}
        <div className="flex gap-2">
          {FILTERS.map((filter, i) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(i)}
              className={`relative rounded-lg border px-4 py-1.5 font-heading text-xs tracking-wider transition-all duration-200 ${
                activeFilter === i
                  ? 'border-accent-blue/40 bg-accent-blue/10 text-accent-blue'
                  : 'border-border-subtle/40 bg-transparent text-text-muted hover:border-border-subtle hover:text-text-secondary'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search + Sort */}
        <div className="flex gap-2">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search quests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 rounded-lg border border-border-subtle/40 bg-bg-card/20 pl-8 pr-3 text-xs text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent-blue/40"
            />
          </div>

          <div className="relative flex items-center">
            <SortAsc className="absolute left-2.5 h-3.5 w-3.5 text-text-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof SORT_OPTIONS[number])}
              className="h-8 appearance-none rounded-lg border border-border-subtle/40 bg-bg-card/20 pl-8 pr-6 text-xs text-text-secondary outline-none transition-colors focus:border-accent-blue/40"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Quest cards */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={`${activeFilter}-${searchQuery}-${sortBy}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
            {filteredQuests.length === 0 ? (
              <motion.div variants={item} className="py-12 text-center">
                <p className="text-sm text-text-muted">No quests found matching your search.</p>
              </motion.div>
            ) : (
              filteredQuests.map((quest) => (
                <motion.div
                  key={quest.name}
                  variants={item}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-border-subtle/40 bg-bg-card/30 p-5 backdrop-blur-sm transition-colors duration-200 hover:bg-bg-card-hover/30"
                  whileHover={{ x: 4, transition: { duration: 0.15 } }}
                  onClick={() => setSelectedQuest(quest)}
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
                      <div className="mb-1 flex flex-wrap items-center gap-2">
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
                        <span
                          className="rounded-full px-2 py-0.5 text-[9px] font-medium tracking-wider uppercase"
                          style={{
                            color: RARITY_COLORS[quest.rarity],
                            backgroundColor: `${RARITY_COLORS[quest.rarity]}15`,
                            border: `1px solid ${RARITY_COLORS[quest.rarity]}25`,
                          }}
                        >
                          {quest.rarity}
                        </span>
                      </div>
                      <p className="mb-3 text-xs text-text-muted">{quest.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
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
                        <span className="flex items-center gap-1 text-accent-gold">
                          <Zap className="h-3 w-3" /> +{quest.xp} XP
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedQuest(quest) }}
                      className="flex items-center gap-1.5 self-start rounded-lg border border-accent-purple/30 bg-accent-purple/5 px-3 py-1.5 text-[10px] font-medium tracking-wider text-accent-purple uppercase transition-all hover:border-accent-purple/50 hover:bg-accent-purple/10"
                    >
                      <Wand2 className="h-3 w-3" />
                      Analyze Quest
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <Modal
        open={!!selectedQuest}
        onClose={() => setSelectedQuest(null)}
        title={selectedQuest?.name}
        accentColor={selectedQuest ? RARITY_COLORS[selectedQuest.rarity] : undefined}
      >
        {selectedQuest && (
          <div className="space-y-4">
            {/* Rarity + XP */}
            <div className="flex items-center gap-3">
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wider uppercase"
                style={{
                  color: RARITY_COLORS[selectedQuest.rarity],
                  backgroundColor: `${RARITY_COLORS[selectedQuest.rarity]}15`,
                  border: `1px solid ${RARITY_COLORS[selectedQuest.rarity]}25`,
                }}
              >
                {selectedQuest.rarity}
              </span>
              <span className="flex items-center gap-1 text-xs text-accent-gold">
                <Zap className="h-3 w-3" /> +{selectedQuest.xp} XP
              </span>
            </div>

            <p className="text-xs leading-relaxed text-text-secondary">{selectedQuest.description}</p>

            {/* Tech Stack */}
            <div>
              <p className="mb-2 text-[10px] tracking-wider text-text-muted uppercase">Tech Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedQuest.techStack.map((tech) => (
                  <span key={tech} className="rounded-md border border-accent-blue/20 bg-accent-blue/5 px-2 py-0.5 text-[10px] text-accent-blue">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Analysis */}
            <div className="rounded-lg border border-accent-purple/20 bg-accent-purple/5 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-accent-purple" />
                <span className="font-heading text-xs tracking-wider text-accent-purple uppercase">AI Quest Analysis</span>
              </div>

              {/* Score */}
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent-purple/40 font-heading text-lg text-accent-purple">
                  {selectedQuest.aiAnalysis.score}
                </div>
                <p className="flex-1 text-xs text-text-secondary">{selectedQuest.aiAnalysis.summary}</p>
              </div>

              {/* Strengths */}
              <div className="mb-2">
                <p className="mb-1 text-[10px] tracking-wider text-text-muted uppercase">Strengths</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedQuest.aiAnalysis.strengths.map((s) => (
                    <span key={s} className="rounded-md border border-accent-green/20 bg-accent-green/5 px-2 py-0.5 text-[10px] text-accent-green">{s}</span>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              <div>
                <p className="mb-1 text-[10px] tracking-wider text-text-muted uppercase">Suggested Improvements</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedQuest.aiAnalysis.improvements.map((s) => (
                    <span key={s} className="rounded-md border border-accent-gold/20 bg-accent-gold/5 px-2 py-0.5 text-[10px] text-accent-gold">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <Circle className="h-2.5 w-2.5 fill-current" style={{ color: selectedQuest.langColor }} />
                {selectedQuest.language}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" /> {selectedQuest.stars}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="h-3 w-3" /> {selectedQuest.forks}
              </span>
              <span>{selectedQuest.contributors} contributor{selectedQuest.contributors > 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
