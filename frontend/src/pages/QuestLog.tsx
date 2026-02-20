import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Star, GitFork, Wand2, Circle, Search, SortAsc, Zap,
  LayoutGrid, List, X, ExternalLink, ChevronDown, ChevronUp,
  AlertTriangle, FileCode, Shield, BookOpen, TestTube, Boxes,
  Loader2,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import GlassCard from '../components/ui/GlassCard'
import AnimatedCounter from '../components/ui/AnimatedCounter'
import { api, type RepoData, type ReposResponse } from '../services/api'
import { useAPI } from '../hooks/useAPI'

/* ═══════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════ */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

/* ═══════════════════════════════════════════
   TYPES & CONSTANTS
   ═══════════════════════════════════════════ */
type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary'
type Status = 'Active' | 'Completed'
type SortOption = 'Stars' | 'XP' | 'Name' | 'Updated'
type ViewMode = 'grid' | 'list'

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
  htmlUrl: string
  homepage?: string
  topics?: string[]
  updatedAt?: string
  size?: number
  openIssues?: number
  hasPages?: boolean
  owner: string
  aiAnalysis: {
    score: number
    summary: string
    strengths: string[]
    improvements: string[]
    metrics?: Record<string, number>
  }
}

const RARITY_COLORS: Record<Rarity, string> = {
  Common: '#94a3b8',
  Rare: '#3b82f6',
  Epic: '#8b5cf6',
  Legendary: '#f0c040',
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6', Python: '#3572A5', JavaScript: '#f1e05a', Go: '#00ADD8',
  Rust: '#dea584', HTML: '#e34c26', CSS: '#563d7c', Java: '#b07219', Ruby: '#701516',
  Shell: '#89e051', Unknown: '#94a3b8', C: '#555555', 'C++': '#f34b7d', 'C#': '#178600',
  PHP: '#4F5D95', Swift: '#F05138', Kotlin: '#A97BFF', Dart: '#00B4AB',
}

const SORT_OPTIONS: SortOption[] = ['Stars', 'XP', 'Name', 'Updated']
const RARITIES: Rarity[] = ['Common', 'Rare', 'Epic', 'Legendary']

/* ═══════════════════════════════════════════
   FALLBACK DATA
   ═══════════════════════════════════════════ */
const FALLBACK_REPOS: ReposResponse = {
  repos: [
    { name: 'DevQuest', description: 'Gamified career intelligence platform with RPG mechanics, 3D backgrounds, and interactive skill trees.', language: 'TypeScript', stars: 42, forks: 5, status: 'Active', rarity: 'Epic', xp: 320, html_url: 'https://github.com/HiRenan/DevQuest', updated_at: '2024-11-15', homepage: '', topics: ['react', 'typescript', 'fastapi', 'gamification'], created_at: '2024-06-01', size: 2400, open_issues_count: 3, has_pages: false, owner: 'HiRenan' },
    { name: 'ML-Pipeline', description: 'End-to-end ML pipeline with FastAPI serving, data validation, and auto-scaling inference.', language: 'Python', stars: 28, forks: 8, status: 'Completed', rarity: 'Epic', xp: 280, html_url: 'https://github.com/HiRenan/ML-Pipeline', updated_at: '2024-08-20', homepage: '', topics: ['python', 'machine-learning', 'fastapi'], created_at: '2024-01-15', size: 1800, open_issues_count: 0, has_pages: false, owner: 'HiRenan' },
    { name: 'React-Dashboard', description: 'Analytics dashboard with interactive charts, real-time data, and customizable widgets.', language: 'TypeScript', stars: 15, forks: 3, status: 'Completed', rarity: 'Rare', xp: 200, html_url: 'https://github.com/HiRenan/React-Dashboard', updated_at: '2024-06-10', homepage: '', topics: ['react', 'dashboard', 'charts'], created_at: '2024-02-10', size: 1200, open_issues_count: 1, has_pages: false, owner: 'HiRenan' },
    { name: 'Chat-API', description: 'Real-time chat backend with WebSockets, presence indicators, and message history.', language: 'JavaScript', stars: 8, forks: 2, status: 'Completed', rarity: 'Rare', xp: 180, html_url: 'https://github.com/HiRenan/Chat-API', updated_at: '2024-03-15', homepage: '', topics: ['nodejs', 'websockets', 'api'], created_at: '2023-11-01', size: 800, open_issues_count: 0, has_pages: false, owner: 'HiRenan' },
    { name: 'Portfolio-v1', description: 'First portfolio website with responsive design and smooth animations.', language: 'HTML', stars: 3, forks: 1, status: 'Completed', rarity: 'Common', xp: 120, html_url: 'https://github.com/HiRenan/Portfolio-v1', updated_at: '2023-12-01', homepage: '', topics: ['html', 'css', 'portfolio'], created_at: '2023-06-15', size: 450, open_issues_count: 0, has_pages: true, owner: 'HiRenan' },
    { name: 'CLI-Tools', description: 'Collection of utility scripts for automation, file management, and developer productivity.', language: 'Python', stars: 5, forks: 0, status: 'Active', rarity: 'Rare', xp: 150, html_url: 'https://github.com/HiRenan/CLI-Tools', updated_at: '2024-10-05', homepage: '', topics: ['python', 'cli', 'automation'], created_at: '2024-04-20', size: 320, open_issues_count: 2, has_pages: false, owner: 'HiRenan' },
  ],
  source: 'fallback',
}

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */
function repoToQuest(repo: RepoData): Quest {
  const rarity = (RARITIES.includes(repo.rarity as Rarity) ? repo.rarity : 'Common') as Rarity
  const status: Status = repo.status === 'Active' ? 'Active' : 'Completed'
  return {
    name: repo.name,
    description: repo.description || 'No description',
    language: repo.language || 'Unknown',
    langColor: LANG_COLORS[repo.language] || '#94a3b8',
    stars: repo.stars,
    forks: repo.forks,
    status,
    statusColor: status === 'Active' ? '#f0c040' : '#22c55e',
    rarity,
    xp: repo.xp,
    techStack: repo.topics?.length ? repo.topics.slice(0, 5) : [repo.language].filter(Boolean),
    htmlUrl: repo.html_url,
    homepage: repo.homepage || undefined,
    topics: repo.topics,
    updatedAt: repo.updated_at,
    size: repo.size,
    openIssues: repo.open_issues_count,
    hasPages: repo.has_pages,
    owner: repo.owner || 'HiRenan',
    aiAnalysis: { score: 0, summary: '', strengths: [], improvements: [] },
  }
}

function formatSize(kb: number): string {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`
  return `${kb} KB`
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

/* ═══════════════════════════════════════════
   CUSTOM SVG STAT ICONS
   ═══════════════════════════════════════════ */
function StatIconQuests({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16v16H4z" />
      <path d="M4 9h16" />
      <path d="M9 4v16" />
      <circle cx="6.5" cy="6.5" r="0.8" fill={color} />
      <path d="M12 13l1.5 1.5 3-3" />
    </svg>
  )
}

function StatIconStars({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill={color}>
      <path d="M12 2l2.9 6.3L22 9.2l-5 5.2L18.2 22 12 18.3 5.8 22 7 14.4l-5-5.2 7.1-.9L12 2z" opacity="0.9" />
      <circle cx="12" cy="12" r="2.5" fill="rgba(10,10,26,0.4)" />
    </svg>
  )
}

function StatIconXP({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill={color}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" opacity="0.9" />
    </svg>
  )
}

function StatIconBest({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill={color}>
      <path d="M5 3l2 6H3l4 5-1.5 7L12 17l6.5 4L17 14l4-5h-4l2-6H5z" opacity="0.85" />
      <circle cx="12" cy="11" r="3" fill="rgba(10,10,26,0.4)" />
      <circle cx="12" cy="11" r="1.5" fill={color} opacity="0.6" />
    </svg>
  )
}

/* ═══════════════════════════════════════════
   LANGUAGE ICONS (for fallback preview)
   ═══════════════════════════════════════════ */
function IconTypeScript({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M1 1h22v22H1V1zm10.5 10.5H8.8v8.2H6.9v-8.2H4.2V9.9h7.3v1.6zm1.7 1.4c0-1 .8-1.6 2.3-1.8l1.6-.2v-.4c0-.6-.4-.9-1.1-.9-.7 0-1.1.3-1.2.8h-1.7c.1-1.3 1.1-2.2 3-2.2 1.8 0 2.8.9 2.8 2.3v4.7h-1.7v-1h-.1c-.4.7-1.1 1.1-2 1.1-1.3 0-2.1-.8-2.1-2l.2-.4zm3.9-.5v-.5l-1.4.2c-.7.1-1.1.4-1.1.9s.4.8 1 .8c.9 0 1.5-.6 1.5-1.4z" />
    </svg>
  )
}

function IconPython({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M11.9 2c-1.5 0-2.9.3-3.9.8-2.9 1.4-2.7 3.4-2.7 3.4v2.5h5.5v.8H4.6S2 9.2 2 12.6s2.3 3.3 2.3 3.3h1.4V13s-.1-2.3 2.3-2.3h4c0 0 2.2 0 2.2-2.1V4.8S14.5 2 11.9 2zm-2.2 1.6c.4 0 .7.3.7.8s-.3.8-.7.8-.7-.3-.7-.8.3-.8.7-.8z" />
      <path d="M12.1 22c1.5 0 2.9-.3 3.9-.8 2.9-1.4 2.7-3.4 2.7-3.4v-2.5h-5.5v-.8h6.2s2.6.3 2.6-3.1-2.3-3.3-2.3-3.3h-1.4V11s.1 2.3-2.3 2.3h-4s-2.2 0-2.2 2.1v3.8s-.3 2.8 2.3 2.8zm2.2-1.6c-.4 0-.7-.3-.7-.8s.3-.8.7-.8.7.3.7.8-.3.8-.7.8z" />
    </svg>
  )
}

function IconJavaScript({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M2 2h20v20H2V2zm10.7 16.5c0 1.7-.9 2.5-2.3 2.5-1.2 0-1.9-.6-2.3-1.4l1.3-.8c.2.5.5.8 1 .8s.9-.3.9-1v-5.4h1.4v5.3zm4 2.5c-1.4 0-2.4-.7-2.8-1.6l1.3-.7c.3.5.8.9 1.5.9.6 0 1-.3 1-.8 0-.5-.4-.7-1.1-1l-.4-.2c-1.1-.5-1.8-1.1-1.8-2.3 0-1.2.9-2.1 2.3-2.1 1 0 1.7.3 2.2 1.2l-1.2.8c-.3-.5-.5-.7-1-.7-.5 0-.7.3-.7.6 0 .5.3.7.9.9l.4.2c1.3.6 2 1.1 2 2.4 0 1.4-1.1 2.4-2.6 2.4z" />
    </svg>
  )
}

function IconFallback({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M12 2l2.2 4.7 5 .7-3.6 3.7.9 5.1L12 13.9l-4.5 2.3.9-5.1-3.6-3.7 5-.7L12 2z" opacity="0.6" />
    </svg>
  )
}

const LANGUAGE_ICONS: Record<string, typeof IconTypeScript> = {
  TypeScript: IconTypeScript,
  Python: IconPython,
  JavaScript: IconJavaScript,
}

/* ═══════════════════════════════════════════
   STATS BAR
   ═══════════════════════════════════════════ */
function QuestStatsBar({ quests }: { quests: Quest[] }) {
  const stats = useMemo(() => {
    const totalStars = quests.reduce((s, q) => s + q.stars, 0)
    const totalXP = quests.reduce((s, q) => s + q.xp, 0)
    const activeCount = quests.filter(q => q.status === 'Active').length
    const bestQuest = quests.length > 0
      ? quests.reduce((best, q) => q.stars > best.stars ? q : best, quests[0])
      : null
    return { totalStars, totalXP, activeCount, total: quests.length, bestQuest }
  }, [quests])

  const cards = [
    { label: 'Active Quests', value: stats.activeCount, suffix: ` / ${stats.total}`, color: '#f0c040', iconEl: StatIconQuests },
    { label: 'Total Stars', value: stats.totalStars, suffix: '', color: '#3b82f6', iconEl: StatIconStars },
    { label: 'XP Earned', value: stats.totalXP, suffix: '', color: '#8b5cf6', iconEl: StatIconXP },
    { label: 'Best Quest', value: 0, display: stats.bestQuest?.name.replace(/-/g, ' ') ?? '—', color: '#22c55e', iconEl: StatIconBest },
  ]

  return (
    <motion.div variants={item} className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => {
        const IconEl = c.iconEl
        return (
          <GlassCard
            key={c.label}
            accentColor={`${c.color}30`}
            hover={false}
            corners
            className="p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-text-muted">{c.label}</p>
                {c.display ? (
                  <p className="mt-1 truncate font-heading text-base tracking-wide lg:text-lg" style={{ color: c.color }}>
                    {c.display}
                  </p>
                ) : (
                  <p className="mt-1 font-heading text-lg tracking-wide text-text-primary">
                    <AnimatedCounter value={c.value} suffix={c.suffix} separator="" />
                  </p>
                )}
              </div>
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${c.color}12`, border: `1px solid ${c.color}20` }}
              >
                <IconEl color={c.color} />
              </div>
            </div>
          </GlassCard>
        )
      })}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   QUEST FILTERS
   ═══════════════════════════════════════════ */
function QuestFilters({
  quests, statusFilter, setStatusFilter, rarityFilter, setRarityFilter,
  languageFilters, setLanguageFilters, searchQuery, setSearchQuery,
  sortBy, setSortBy, sortDirection, setSortDirection, viewMode, setViewMode,
}: {
  quests: Quest[]
  statusFilter: 'all' | Status
  setStatusFilter: (v: 'all' | Status) => void
  rarityFilter: Rarity | null
  setRarityFilter: (v: Rarity | null) => void
  languageFilters: string[]
  setLanguageFilters: (v: string[]) => void
  searchQuery: string
  setSearchQuery: (v: string) => void
  sortBy: SortOption
  setSortBy: (v: SortOption) => void
  sortDirection: 'asc' | 'desc'
  setSortDirection: (v: 'asc' | 'desc') => void
  viewMode: ViewMode
  setViewMode: (v: ViewMode) => void
}) {
  const languages = useMemo(() => {
    const langs = [...new Set(quests.map(q => q.language))].filter(l => l !== 'Unknown')
    return langs.sort()
  }, [quests])

  const toggleLanguage = useCallback((lang: string) => {
    setLanguageFilters(
      languageFilters.includes(lang)
        ? languageFilters.filter(l => l !== lang)
        : [...languageFilters, lang]
    )
  }, [languageFilters, setLanguageFilters])

  return (
    <motion.div variants={item} className="mb-6 space-y-3">
      {/* Row 1: Status + Rarity + View Toggle */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status filters */}
        {(['all', 'Active', 'Completed'] as const).map((f) => {
          const isActive = statusFilter === f
          return (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`rounded-full border px-3.5 py-1.5 font-heading text-[11px] tracking-wider transition-all ${
                isActive
                  ? 'border-accent-blue/40 bg-accent-blue/10 text-accent-blue'
                  : 'border-border-subtle/30 text-text-muted hover:border-border-subtle/60 hover:text-text-secondary'
              }`}
            >
              {f === 'all' ? 'All Quests' : f}
            </button>
          )
        })}

        <div className="mx-1 hidden h-5 w-px bg-border-subtle/30 sm:block" />

        {/* Rarity filters */}
        <div className="flex gap-1.5">
          {RARITIES.map((r) => {
            const isActive = rarityFilter === r
            return (
              <button
                key={r}
                onClick={() => setRarityFilter(isActive ? null : r)}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] tracking-wider transition-all ${
                  isActive
                    ? 'bg-opacity-15 border-opacity-40'
                    : 'border-border-subtle/20 text-text-muted hover:border-border-subtle/50'
                }`}
                style={isActive ? {
                  color: RARITY_COLORS[r],
                  borderColor: `${RARITY_COLORS[r]}50`,
                  backgroundColor: `${RARITY_COLORS[r]}12`,
                } : undefined}
              >
                <Circle className="h-2 w-2 fill-current" style={{ color: RARITY_COLORS[r] }} />
                <span className="hidden sm:inline">{r}</span>
              </button>
            )
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* View Toggle */}
        <div className="flex rounded-lg border border-border-subtle/30 p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-md p-1.5 transition-all ${viewMode === 'grid' ? 'bg-accent-blue/15 text-accent-blue' : 'text-text-muted hover:text-text-secondary'}`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-md p-1.5 transition-all ${viewMode === 'list' ? 'bg-accent-blue/15 text-accent-blue' : 'text-text-muted hover:text-text-secondary'}`}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Row 2: Language Chips */}
      {languages.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {languages.map((lang) => {
            const isActive = languageFilters.includes(lang)
            const c = LANG_COLORS[lang] || '#94a3b8'
            return (
              <button
                key={lang}
                onClick={() => toggleLanguage(lang)}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] tracking-wide transition-all ${
                  isActive
                    ? ''
                    : 'border-border-subtle/20 text-text-muted hover:border-border-subtle/40'
                }`}
                style={isActive ? {
                  color: c,
                  borderColor: `${c}40`,
                  backgroundColor: `${c}10`,
                } : undefined}
              >
                <Circle className="h-1.5 w-1.5 fill-current" style={{ color: c }} />
                {lang}
              </button>
            )
          })}
        </div>
      )}

      {/* Row 3: Search + Sort */}
      <div className="flex gap-2">
        <div className="relative flex flex-1 items-center">
          <Search className="absolute left-3 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search quests, languages, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-border-subtle/30 bg-bg-card/20 pl-9 pr-3 text-xs text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent-blue/40 focus:bg-bg-card/30"
          />
        </div>

        <div className="relative flex items-center">
          <SortAsc className="absolute left-2.5 h-3.5 w-3.5 text-text-muted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-9 appearance-none rounded-lg border border-border-subtle/30 bg-bg-card/20 pl-8 pr-8 text-xs text-text-secondary outline-none transition-colors focus:border-accent-blue/40"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border-subtle/30 bg-bg-card/20 text-text-muted transition-colors hover:border-border-subtle/50 hover:text-text-secondary"
          title={sortDirection === 'desc' ? 'Descending' : 'Ascending'}
        >
          {sortDirection === 'desc' ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   PROJECT PREVIEW
   ═══════════════════════════════════════════ */
function LangIconRender({ language, langColor, className }: { language: string; langColor: string; className: string }) {
  const Icon = LANGUAGE_ICONS[language] || IconFallback
  return <Icon className={className} style={{ color: langColor }} />
}

function ProjectPreview({ quest, compact }: { quest: Quest; compact?: boolean }) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const previewUrl = `https://opengraph.githubassets.com/1/${quest.owner}/${quest.name}`
  const h = compact ? 'h-24' : 'h-40'

  return (
    <div className={`relative ${h} overflow-hidden rounded-t-xl bg-bg-card/50`}>
      {/* Skeleton while loading */}
      {!imgLoaded && !imgError && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-bg-card/80 to-bg-secondary/60">
          <div className="flex h-full items-center justify-center">
            <LangIconRender language={quest.language} langColor={quest.langColor} className="h-10 w-10 opacity-15" />
          </div>
        </div>
      )}

      {!imgError ? (
        <img
          src={previewUrl}
          alt={`${quest.name} preview`}
          className={`h-full w-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        /* Fallback preview */
        <div
          className="flex h-full items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${quest.langColor}10, ${RARITY_COLORS[quest.rarity]}08, rgba(10,10,26,0.6))`,
          }}
        >
          <div className="text-center">
            <LangIconRender language={quest.language} langColor={quest.langColor} className="mx-auto h-10 w-10 opacity-25" />
            <p className="mt-2 text-[10px] tracking-wider text-text-muted">{quest.language}</p>
          </div>
        </div>
      )}

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg-card/95 to-transparent" />

      {/* Rarity badge */}
      {!compact && (
        <div className="absolute top-2.5 right-2.5">
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase backdrop-blur-sm"
            style={{
              color: RARITY_COLORS[quest.rarity],
              backgroundColor: `${RARITY_COLORS[quest.rarity]}20`,
              border: `1px solid ${RARITY_COLORS[quest.rarity]}30`,
            }}
          >
            {quest.rarity}
          </span>
        </div>
      )}

      {/* Live demo link */}
      {quest.homepage && !compact && (
        <a
          href={quest.homepage}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-[9px] text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-2.5 w-2.5" /> Live
        </a>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   RARITY STYLES
   ═══════════════════════════════════════════ */
function getRarityCardStyle(rarity: Rarity): React.CSSProperties {
  switch (rarity) {
    case 'Legendary':
      return {
        borderColor: `${RARITY_COLORS.Legendary}35`,
        boxShadow: `0 0 20px ${RARITY_COLORS.Legendary}12, inset 0 1px 0 ${RARITY_COLORS.Legendary}10`,
      }
    case 'Epic':
      return {
        borderColor: `${RARITY_COLORS.Epic}25`,
        boxShadow: `0 0 16px ${RARITY_COLORS.Epic}10, inset 0 1px 0 ${RARITY_COLORS.Epic}08`,
      }
    case 'Rare':
      return {
        borderColor: `${RARITY_COLORS.Rare}20`,
        boxShadow: `0 0 12px ${RARITY_COLORS.Rare}08, inset 0 1px 0 ${RARITY_COLORS.Rare}06`,
      }
    default:
      return {}
  }
}

function getRarityHover(rarity: Rarity) {
  switch (rarity) {
    case 'Legendary':
      return { y: -6, boxShadow: `0 8px 32px -4px ${RARITY_COLORS.Legendary}20`, transition: { duration: 0.2 } }
    case 'Epic':
      return { y: -4, boxShadow: `0 6px 24px -4px ${RARITY_COLORS.Epic}18`, transition: { duration: 0.2 } }
    case 'Rare':
      return { y: -3, boxShadow: `0 4px 20px -4px ${RARITY_COLORS.Rare}15`, transition: { duration: 0.2 } }
    default:
      return { y: -2, transition: { duration: 0.2 } }
  }
}

/* ═══════════════════════════════════════════
   QUEST CARD — GRID MODE
   ═══════════════════════════════════════════ */
function QuestCardGrid({ quest, isFeatured, onSelect }: {
  quest: Quest; isFeatured: boolean; onSelect: () => void
}) {
  return (
    <motion.div
      layout
      layoutId={quest.name}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      whileHover={getRarityHover(quest.rarity)}
      onClick={onSelect}
      className={`group relative cursor-pointer overflow-hidden rounded-xl border border-border-subtle/40 bg-bg-card/30 backdrop-blur-sm transition-colors ${
        isFeatured ? 'md:col-span-2' : ''
      }`}
      style={getRarityCardStyle(quest.rarity)}
    >
      {/* Legendary shimmer overlay */}
      {quest.rarity === 'Legendary' && (
        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-xl"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(240,192,64,0.06) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'border-shimmer 4s linear infinite',
          }}
        />
      )}

      {/* Preview image */}
      <ProjectPreview quest={quest} />

      {/* Body */}
      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <Circle className="h-2.5 w-2.5 shrink-0 fill-current" style={{ color: quest.langColor }} />
              <span className="text-[10px] text-text-muted">{quest.language}</span>
              <span
                className="rounded-full px-1.5 py-0.5 text-[8px] tracking-wider uppercase"
                style={{
                  color: quest.statusColor,
                  backgroundColor: `${quest.statusColor}12`,
                  border: `1px solid ${quest.statusColor}20`,
                }}
              >
                {quest.status}
              </span>
            </div>
            <h3 className="truncate font-heading text-sm tracking-wide text-text-primary">
              {quest.name.replace(/-/g, ' ')}
            </h3>
          </div>
          <span className="shrink-0 font-heading text-xs text-accent-gold">
            +{quest.xp}
          </span>
        </div>

        {/* Description */}
        <p className="mb-3 line-clamp-2 text-[11px] leading-relaxed text-text-muted">
          {quest.description}
        </p>

        {/* Tech Stack Chips */}
        {quest.techStack.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {quest.techStack.slice(0, isFeatured ? 5 : 3).map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-border-subtle/20 bg-bg-primary/40 px-1.5 py-0.5 text-[9px] text-text-muted"
              >
                {tech}
              </span>
            ))}
            {quest.techStack.length > (isFeatured ? 5 : 3) && (
              <span className="px-1 text-[9px] text-text-muted">
                +{quest.techStack.length - (isFeatured ? 5 : 3)}
              </span>
            )}
          </div>
        )}

        {/* Footer Stats */}
        <div className="flex items-center gap-3 text-[10px] text-text-muted">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" /> {quest.stars}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="h-3 w-3" /> {quest.forks}
          </span>
          <span className="flex items-center gap-1 text-accent-gold">
            <Zap className="h-3 w-3" /> {quest.xp} XP
          </span>
          {quest.updatedAt && (
            <span className="ml-auto text-[9px] opacity-60">
              {formatDate(quest.updatedAt)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   QUEST CARD — LIST MODE
   ═══════════════════════════════════════════ */
function QuestCardList({ quest, onSelect }: { quest: Quest; onSelect: () => void }) {
  return (
    <motion.div
      layout
      layoutId={quest.name}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.25 }}
      whileHover={{ x: 4, transition: { duration: 0.15 } }}
      onClick={onSelect}
      className="group relative flex cursor-pointer gap-3 overflow-hidden rounded-xl border border-border-subtle/40 bg-bg-card/30 p-3 backdrop-blur-sm transition-colors hover:bg-bg-card-hover/30"
      style={getRarityCardStyle(quest.rarity)}
    >
      {/* Mini thumbnail */}
      <div className="hidden w-28 shrink-0 overflow-hidden rounded-lg sm:block">
        <ProjectPreview quest={quest} compact />
      </div>

      {/* Left status accent */}
      <div
        className="absolute top-2 bottom-2 left-0 w-[2px] rounded-full sm:hidden"
        style={{ backgroundColor: quest.statusColor, boxShadow: `0 0 6px ${quest.statusColor}50` }}
      />

      {/* Content */}
      <div className="min-w-0 flex-1 pl-2 sm:pl-0">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <Circle className="h-2 w-2 shrink-0 fill-current" style={{ color: quest.langColor }} />
          <span className="text-[10px] text-text-muted">{quest.language}</span>
          <h3 className="truncate font-heading text-sm tracking-wide text-text-primary">
            {quest.name.replace(/-/g, ' ')}
          </h3>
          <span
            className="rounded-full px-1.5 py-0.5 text-[8px] tracking-wider uppercase"
            style={{
              color: quest.statusColor,
              backgroundColor: `${quest.statusColor}12`,
              border: `1px solid ${quest.statusColor}20`,
            }}
          >
            {quest.status}
          </span>
          <span
            className="rounded-full px-1.5 py-0.5 text-[8px] tracking-wider uppercase"
            style={{
              color: RARITY_COLORS[quest.rarity],
              backgroundColor: `${RARITY_COLORS[quest.rarity]}12`,
              border: `1px solid ${RARITY_COLORS[quest.rarity]}20`,
            }}
          >
            {quest.rarity}
          </span>
        </div>
        <p className="mb-2 line-clamp-1 text-[11px] text-text-muted">{quest.description}</p>
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-text-muted">
          <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {quest.stars}</span>
          <span className="flex items-center gap-1"><GitFork className="h-3 w-3" /> {quest.forks}</span>
          <span className="flex items-center gap-1 text-accent-gold"><Zap className="h-3 w-3" /> +{quest.xp} XP</span>
          {quest.techStack.slice(0, 3).map((t) => (
            <span key={t} className="rounded border border-border-subtle/20 bg-bg-primary/30 px-1.5 py-0.5 text-[9px]">{t}</span>
          ))}
        </div>
      </div>

      {/* Arrow hint */}
      <div className="flex items-center text-text-muted/40 transition-colors group-hover:text-text-muted">
        <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   LANGUAGE BREAKDOWN BAR
   ═══════════════════════════════════════════ */
function LanguageBar({ languages }: { languages: Record<string, number> }) {
  const entries = useMemo(() => {
    const total = Object.values(languages).reduce((s, v) => s + v, 0)
    if (total === 0) return []
    return Object.entries(languages)
      .sort(([, a], [, b]) => b - a)
      .map(([lang, bytes]) => ({
        name: lang,
        pct: Math.round((bytes / total) * 100),
        color: LANG_COLORS[lang] || '#94a3b8',
      }))
  }, [languages])

  if (entries.length === 0) return null

  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-widest text-text-muted">Language Breakdown</p>
      <div className="flex h-2 overflow-hidden rounded-full bg-bg-primary/40">
        {entries.map((e) => (
          <motion.div
            key={e.name}
            className="h-full"
            style={{ backgroundColor: e.color }}
            initial={{ width: 0 }}
            animate={{ width: `${e.pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-3 text-[10px] text-text-muted">
        {entries.slice(0, 5).map((e) => (
          <span key={e.name} className="flex items-center gap-1">
            <Circle className="h-2 w-2 fill-current" style={{ color: e.color }} />
            {e.name} {e.pct}%
          </span>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   SCORE GAUGE (SVG Arc)
   ═══════════════════════════════════════════ */
function ScoreGauge({ score }: { score: number }) {
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const progress = score / 100
  const gaugeColor = score >= 90 ? '#22c55e' : score >= 75 ? '#3b82f6' : score >= 60 ? '#f0c040' : '#ef4444'

  return (
    <div className="relative flex shrink-0 items-center justify-center">
      <svg width={96} height={96} viewBox="0 0 96 96">
        {/* Background circle */}
        <circle cx={48} cy={48} r={radius} fill="none" stroke="rgba(42,42,90,0.25)" strokeWidth={5} />
        {/* Progress arc */}
        <motion.circle
          cx={48} cy={48} r={radius}
          fill="none"
          stroke={gaugeColor}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${circumference * progress} ${circumference * (1 - progress)}`}
          strokeDashoffset={circumference * 0.25}
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${circumference * progress} ${circumference * (1 - progress)}` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${gaugeColor}40)` }}
        />
        {/* Score number */}
        <text x={48} y={44} textAnchor="middle" fontSize="20" fontWeight="bold" fill={gaugeColor} fontFamily="Cinzel, serif">
          {score}
        </text>
        <text x={48} y={58} textAnchor="middle" fontSize="7" fill="rgba(148,163,184,0.7)" fontFamily="Raleway, sans-serif" letterSpacing="1.5">
          AI SCORE
        </text>
      </svg>
    </div>
  )
}

/* ═══════════════════════════════════════════
   METRICS BARS
   ═══════════════════════════════════════════ */
const METRIC_LABELS: Record<string, { label: string; icon: typeof FileCode }> = {
  code_quality: { label: 'Code Quality', icon: FileCode },
  documentation: { label: 'Documentation', icon: BookOpen },
  testing: { label: 'Testing', icon: TestTube },
  architecture: { label: 'Architecture', icon: Boxes },
  security: { label: 'Security', icon: Shield },
}

function MetricsBars({ metrics }: { metrics: Record<string, number> }) {
  return (
    <div className="space-y-2.5">
      <p className="text-[10px] uppercase tracking-widest text-text-muted">AI Metrics</p>
      {Object.entries(metrics).map(([key, value], i) => {
        const color = value >= 80 ? '#22c55e' : value >= 60 ? '#3b82f6' : '#f0c040'
        const meta = METRIC_LABELS[key]
        const Icon = meta?.icon || AlertTriangle
        return (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between text-[10px] text-text-muted">
              <span className="flex items-center gap-1.5">
                <Icon className="h-3 w-3" style={{ color: `${color}80` }} />
                {meta?.label || key}
              </span>
              <span style={{ color }}>{value}</span>
            </div>
            <div className="h-1.5 rounded-full bg-bg-primary/50">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}30` }}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════
   AI ANALYSIS PANEL
   ═══════════════════════════════════════════ */
function AIAnalysisPanel({ quest, onAnalyze, analyzing }: {
  quest: Quest; onAnalyze: () => void; analyzing: boolean
}) {
  const hasAnalysis = quest.aiAnalysis.score > 0

  return (
    <div className="rounded-lg border border-accent-purple/20 bg-accent-purple/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Wand2 className="h-4 w-4 text-accent-purple" />
        <span className="font-heading text-xs uppercase tracking-wider text-accent-purple">AI Quest Analysis</span>
      </div>

      {hasAnalysis ? (
        <div className="space-y-4">
          {/* Score + Summary */}
          <div className="flex gap-4">
            <ScoreGauge score={quest.aiAnalysis.score} />
            <div className="flex-1">
              <p className="text-[11px] leading-relaxed text-text-secondary">{quest.aiAnalysis.summary}</p>
            </div>
          </div>

          {/* Metrics */}
          {quest.aiAnalysis.metrics && Object.keys(quest.aiAnalysis.metrics).length > 0 && (
            <MetricsBars metrics={quest.aiAnalysis.metrics} />
          )}

          {/* Strengths */}
          {quest.aiAnalysis.strengths.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] uppercase tracking-widest text-text-muted">Strengths</p>
              <div className="flex flex-wrap gap-1.5">
                {quest.aiAnalysis.strengths.map((s) => (
                  <span key={s} className="rounded-md border border-accent-green/20 bg-accent-green/5 px-2 py-0.5 text-[10px] text-accent-green">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Improvements */}
          {quest.aiAnalysis.improvements.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] uppercase tracking-widest text-text-muted">Improvements</p>
              <div className="flex flex-wrap gap-1.5">
                {quest.aiAnalysis.improvements.map((s) => (
                  <span key={s} className="rounded-md border border-accent-gold/20 bg-accent-gold/5 px-2 py-0.5 text-[10px] text-accent-gold">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-4 text-center">
          <Wand2 className="mx-auto mb-2 h-8 w-8 text-accent-purple/25" />
          <p className="mb-3 text-[11px] text-text-muted">No analysis yet. Let the Oracle examine this quest.</p>
          <button
            onClick={onAnalyze}
            disabled={analyzing}
            className="inline-flex items-center gap-2 rounded-lg border border-accent-purple/30 bg-accent-purple/10 px-4 py-2 text-[11px] font-medium tracking-wider text-accent-purple uppercase transition-all hover:bg-accent-purple/20 disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Wand2 className="h-3 w-3" />
                Analyze Quest
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   QUEST DETAIL PANEL
   ═══════════════════════════════════════════ */
function QuestDetailPanel({ quest, onClose, onAnalyze, analyzing, languageBreakdown }: {
  quest: Quest
  onClose: () => void
  onAnalyze: () => void
  analyzing: boolean
  languageBreakdown: Record<string, number> | null
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="w-full shrink-0 overflow-y-auto rounded-xl border border-border-subtle/40 bg-bg-card/50 backdrop-blur-md lg:w-[380px]"
      style={{ boxShadow: `0 0 30px ${RARITY_COLORS[quest.rarity]}10, inset 0 1px 0 ${RARITY_COLORS[quest.rarity]}08`, maxHeight: 'calc(100vh - 200px)' }}
    >
      {/* Preview */}
      <div className="relative">
        <ProjectPreview quest={quest} />
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4 p-5">
        {/* Name + Badges */}
        <div>
          <h3 className="mb-2 font-heading text-base tracking-wide text-text-primary">
            {quest.name.replace(/-/g, ' ')}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-medium tracking-wider uppercase"
              style={{
                color: quest.statusColor,
                backgroundColor: `${quest.statusColor}12`,
                border: `1px solid ${quest.statusColor}20`,
              }}
            >
              {quest.status}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-medium tracking-wider uppercase"
              style={{
                color: RARITY_COLORS[quest.rarity],
                backgroundColor: `${RARITY_COLORS[quest.rarity]}12`,
                border: `1px solid ${RARITY_COLORS[quest.rarity]}20`,
              }}
            >
              {quest.rarity}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-accent-gold">
              <Zap className="h-3 w-3" /> +{quest.xp} XP
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] leading-relaxed text-text-secondary">{quest.description}</p>

        {/* Tech Stack */}
        {quest.techStack.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-widest text-text-muted">Tech Stack</p>
            <div className="flex flex-wrap gap-1.5">
              {quest.techStack.map((tech) => (
                <span key={tech} className="rounded-md border border-accent-blue/20 bg-accent-blue/5 px-2 py-0.5 text-[10px] text-accent-blue">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quest Metrics */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Stars', value: String(quest.stars), icon: Star },
            { label: 'Forks', value: String(quest.forks), icon: GitFork },
            { label: 'Issues', value: String(quest.openIssues ?? 0), icon: AlertTriangle },
            { label: 'Size', value: quest.size ? formatSize(quest.size) : '—', icon: FileCode },
          ].map((m) => {
            const MIcon = m.icon
            return (
              <div key={m.label} className="flex items-center gap-2 rounded-lg border border-border-subtle/20 bg-bg-primary/30 px-3 py-2">
                <MIcon className="h-3 w-3 text-text-muted" />
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-text-muted">{m.label}</p>
                  <p className="text-xs text-text-primary">{m.value}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Language Breakdown */}
        {languageBreakdown && <LanguageBar languages={languageBreakdown} />}

        {/* AI Analysis */}
        <AIAnalysisPanel quest={quest} onAnalyze={onAnalyze} analyzing={analyzing} />

        {/* Action buttons */}
        <div className="flex gap-2">
          {!quest.aiAnalysis.score && (
            <button
              onClick={onAnalyze}
              disabled={analyzing}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-accent-purple/30 bg-accent-purple/10 py-2.5 text-[11px] font-medium tracking-wider text-accent-purple uppercase transition-all hover:bg-accent-purple/20 disabled:opacity-50"
            >
              {analyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
              {analyzing ? 'Analyzing...' : 'Analyze'}
            </button>
          )}
          <a
            href={quest.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border-subtle/30 bg-bg-primary/30 py-2.5 text-[11px] font-medium tracking-wider text-text-secondary uppercase transition-all hover:bg-bg-primary/50 hover:text-text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3" />
            GitHub
          </a>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   MOBILE QUEST LIST
   ═══════════════════════════════════════════ */
function MobileQuestCard({ quest, isExpanded, onToggle, onAnalyze, analyzing, languageBreakdown }: {
  quest: Quest
  isExpanded: boolean
  onToggle: () => void
  onAnalyze: () => void
  analyzing: boolean
  languageBreakdown: Record<string, number> | null
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border border-border-subtle/40 bg-bg-card/30 backdrop-blur-sm"
      style={getRarityCardStyle(quest.rarity)}
    >
      {/* Collapsed card */}
      <div className="flex cursor-pointer gap-3 p-3" onClick={onToggle}>
        <div
          className="mt-1 h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: quest.statusColor, boxShadow: `0 0 4px ${quest.statusColor}50` }}
        />
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-2">
            <h3 className="truncate font-heading text-sm tracking-wide text-text-primary">
              {quest.name.replace(/-/g, ' ')}
            </h3>
            <span
              className="shrink-0 rounded-full px-1.5 py-0.5 text-[8px] tracking-wider uppercase"
              style={{
                color: RARITY_COLORS[quest.rarity],
                backgroundColor: `${RARITY_COLORS[quest.rarity]}12`,
                border: `1px solid ${RARITY_COLORS[quest.rarity]}20`,
              }}
            >
              {quest.rarity}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-text-muted">
            <span className="flex items-center gap-1">
              <Circle className="h-2 w-2 fill-current" style={{ color: quest.langColor }} />
              {quest.language}
            </span>
            <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {quest.stars}</span>
            <span className="flex items-center gap-1 text-accent-gold"><Zap className="h-3 w-3" /> +{quest.xp}</span>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-border-subtle/20 px-3 pt-3 pb-4">
              <ProjectPreview quest={quest} />
              <p className="text-[11px] leading-relaxed text-text-muted">{quest.description}</p>

              {/* Tech chips */}
              <div className="flex flex-wrap gap-1">
                {quest.techStack.map((t) => (
                  <span key={t} className="rounded-md border border-accent-blue/15 bg-accent-blue/5 px-1.5 py-0.5 text-[9px] text-accent-blue">{t}</span>
                ))}
              </div>

              {/* Metrics row */}
              <div className="flex gap-3 text-[10px] text-text-muted">
                <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {quest.stars}</span>
                <span className="flex items-center gap-1"><GitFork className="h-3 w-3" /> {quest.forks}</span>
                {quest.openIssues !== undefined && (
                  <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {quest.openIssues}</span>
                )}
                {quest.size && <span className="flex items-center gap-1"><FileCode className="h-3 w-3" /> {formatSize(quest.size)}</span>}
              </div>

              {/* Language bar */}
              {languageBreakdown && <LanguageBar languages={languageBreakdown} />}

              {/* AI Analysis */}
              <AIAnalysisPanel quest={quest} onAnalyze={onAnalyze} analyzing={analyzing} />

              {/* Actions */}
              <div className="flex gap-2">
                <a
                  href={quest.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border-subtle/30 bg-bg-primary/30 py-2 text-[10px] tracking-wider text-text-secondary uppercase"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" /> GitHub
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function QuestLog() {
  /* ─── Data ─── */
  const { data: reposData } = useAPI(api.getRepos, FALLBACK_REPOS)
  const quests = useMemo(() => reposData.repos.map(repoToQuest), [reposData])

  /* ─── Filters ─── */
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all')
  const [rarityFilter, setRarityFilter] = useState<Rarity | null>(null)
  const [languageFilters, setLanguageFilters] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('Stars')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  /* ─── UI ─── */
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null)
  const [analyzingQuest, setAnalyzingQuest] = useState<string | null>(null)
  const [languageBreakdowns, setLanguageBreakdowns] = useState<Record<string, Record<string, number>>>({})
  const [questsState, setQuestsState] = useState<Record<string, Quest['aiAnalysis']>>({})

  /* ─── Filtered & sorted ─── */
  const filteredQuests = useMemo(() => {
    let result = [...quests]

    // Apply AI analysis state
    result = result.map(q => {
      const analysis = questsState[q.name]
      return analysis ? { ...q, aiAnalysis: analysis } : q
    })

    if (statusFilter !== 'all') result = result.filter(q => q.status === statusFilter)
    if (rarityFilter) result = result.filter(q => q.rarity === rarityFilter)
    if (languageFilters.length > 0) result = result.filter(q => languageFilters.includes(q.language))

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(q =>
        q.name.toLowerCase().includes(query) ||
        q.description.toLowerCase().includes(query) ||
        q.language.toLowerCase().includes(query) ||
        q.techStack.some(t => t.toLowerCase().includes(query))
      )
    }

    const dir = sortDirection === 'desc' ? -1 : 1
    switch (sortBy) {
      case 'Stars': result.sort((a, b) => (a.stars - b.stars) * dir); break
      case 'XP': result.sort((a, b) => (a.xp - b.xp) * dir); break
      case 'Name': result.sort((a, b) => a.name.localeCompare(b.name) * dir); break
      case 'Updated': result.sort((a, b) => ((a.updatedAt || '').localeCompare(b.updatedAt || '')) * dir); break
    }

    return result
  }, [quests, statusFilter, rarityFilter, languageFilters, searchQuery, sortBy, sortDirection, questsState])

  /* ─── Lazy load language breakdown ─── */
  const loadLanguageBreakdown = useCallback(async (quest: Quest) => {
    if (languageBreakdowns[quest.name]) return
    const detail = await api.getRepoDetail(quest.owner, quest.name)
    if (detail && typeof detail === 'object' && 'languages_breakdown' in detail) {
      setLanguageBreakdowns(prev => ({ ...prev, [quest.name]: detail.languages_breakdown as Record<string, number> }))
    }
  }, [languageBreakdowns])

  /* ─── Analyze quest ─── */
  const handleAnalyze = useCallback(async (quest: Quest) => {
    setAnalyzingQuest(quest.name)
    const result = await api.analyzeRepo(quest.owner, quest.name)
    if (result) {
      setQuestsState(prev => ({
        ...prev,
        [quest.name]: {
          score: result.score,
          summary: result.summary,
          strengths: result.strengths,
          improvements: result.improvements,
          metrics: result.metrics,
        },
      }))
    }
    setAnalyzingQuest(null)
  }, [])

  /* ─── Select quest (desktop) ─── */
  const handleSelectQuest = useCallback((quest: Quest) => {
    if (selectedQuest?.name === quest.name) {
      setSelectedQuest(null)
    } else {
      setSelectedQuest(quest)
      loadLanguageBreakdown(quest)
    }
  }, [selectedQuest, loadLanguageBreakdown])

  /* ─── Toggle mobile expand ─── */
  const handleMobileToggle = useCallback((quest: Quest) => {
    if (expandedMobile === quest.name) {
      setExpandedMobile(null)
    } else {
      setExpandedMobile(quest.name)
      loadLanguageBreakdown(quest)
    }
  }, [expandedMobile, loadLanguageBreakdown])

  /* ─── Apply analysis to selected quest ─── */
  const currentSelectedQuest = useMemo(() => {
    if (!selectedQuest) return null
    const analysis = questsState[selectedQuest.name]
    return analysis ? { ...selectedQuest, aiAnalysis: analysis } : selectedQuest
  }, [selectedQuest, questsState])

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Quest Log"
        subtitle="Your GitHub adventures and conquered projects"
        gradient="linear-gradient(135deg, #3b82f6, #60a5fa, #2563eb)"
        glowColor="rgba(59, 130, 246, 0.25)"
      />

      {/* Stats Bar */}
      <QuestStatsBar quests={quests} />

      {/* Filters */}
      <QuestFilters
        quests={quests}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        rarityFilter={rarityFilter} setRarityFilter={setRarityFilter}
        languageFilters={languageFilters} setLanguageFilters={setLanguageFilters}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        sortBy={sortBy} setSortBy={setSortBy}
        sortDirection={sortDirection} setSortDirection={setSortDirection}
        viewMode={viewMode} setViewMode={setViewMode}
      />

      {/* ─── Desktop Layout ─── */}
      <motion.div variants={item} className="hidden md:block">
        <div className="flex gap-6">
          {/* Card Grid / List */}
          <div className="min-w-0 flex-1">
            {filteredQuests.length === 0 ? (
              <div className="py-16 text-center">
                <Search className="mx-auto mb-3 h-8 w-8 text-text-muted/30" />
                <p className="text-sm text-text-muted">No quests found matching your filters.</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <AnimatePresence mode="popLayout">
                  {filteredQuests.map((quest, i) => (
                    <QuestCardGrid
                      key={quest.name}
                      quest={questsState[quest.name] ? { ...quest, aiAnalysis: questsState[quest.name] } : quest}
                      isFeatured={i === 0 && filteredQuests.length > 2}
                      onSelect={() => handleSelectQuest(quest)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                  {filteredQuests.map((quest) => (
                    <QuestCardList
                      key={quest.name}
                      quest={questsState[quest.name] ? { ...quest, aiAnalysis: questsState[quest.name] } : quest}
                      onSelect={() => handleSelectQuest(quest)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Detail Side Panel */}
          <AnimatePresence>
            {currentSelectedQuest && (
              <QuestDetailPanel
                quest={currentSelectedQuest}
                onClose={() => setSelectedQuest(null)}
                onAnalyze={() => handleAnalyze(currentSelectedQuest)}
                analyzing={analyzingQuest === currentSelectedQuest.name}
                languageBreakdown={languageBreakdowns[currentSelectedQuest.name] || null}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ─── Mobile Layout ─── */}
      <div className="flex flex-col gap-3 md:hidden">
        {filteredQuests.length === 0 ? (
          <div className="py-12 text-center">
            <Search className="mx-auto mb-3 h-8 w-8 text-text-muted/30" />
            <p className="text-sm text-text-muted">No quests found.</p>
          </div>
        ) : (
          filteredQuests.map((quest) => {
            const q = questsState[quest.name] ? { ...quest, aiAnalysis: questsState[quest.name] } : quest
            return (
              <MobileQuestCard
                key={quest.name}
                quest={q}
                isExpanded={expandedMobile === quest.name}
                onToggle={() => handleMobileToggle(quest)}
                onAnalyze={() => handleAnalyze(q)}
                analyzing={analyzingQuest === quest.name}
                languageBreakdown={languageBreakdowns[quest.name] || null}
              />
            )
          })
        )}
      </div>
    </motion.div>
  )
}
