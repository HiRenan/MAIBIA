import { useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Upload, Wand2, Swords, Brain, Eye, Heart, FileText, Download,
  Trophy, Code, Flame, Shield, ChevronDown, Sparkles, ScrollText,
  CheckCircle, AlertTriangle, Lightbulb,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import GlassCard from '../components/ui/GlassCard'
import AnimatedCounter from '../components/ui/AnimatedCounter'
import {
  api,
  type ProfileResponse,
  type SkillsResponse,
  type AchievementsResponse,
  type CVAnalysisResponse,
  type CVAnalysesResponse,
} from '../services/api'
import { useAPI } from '../hooks/useAPI'
import { useGamification } from '../contexts/GamificationContext'

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
   CONSTANTS & ICON MAPS
   ═══════════════════════════════════════════ */
const STAT_META: Record<string, { name: string; color: string; icon: typeof Swords; desc: string }> = {
  strength:     { name: 'STR', color: '#ef4444', icon: Swords, desc: 'Problem Solving' },
  intelligence: { name: 'INT', color: '#8b5cf6', icon: Brain,  desc: 'Technical Knowledge' },
  dexterity:    { name: 'DEX', color: '#3b82f6', icon: Eye,    desc: 'Adaptability' },
  wisdom:       { name: 'WIS', color: '#22c55e', icon: Heart,  desc: 'Soft Skills' },
}

const TITLE_ICONS: Record<string, typeof Flame> = {
  flame: Flame, code: Code, shield: Shield, trophy: Trophy,
  bug: Flame, star: Sparkles, scroll: ScrollText, sword: Swords,
}

/* ═══════════════════════════════════════════
   FALLBACK DATA
   ═══════════════════════════════════════════ */
const FALLBACK_PROFILE: ProfileResponse = {
  name: 'Renan Carvalho', title: 'Full-Stack Mage', dev_class: 'Full-Stack Mage',
  level: 15, xp: 6450, xp_next_level: 10000, avatar_initials: 'RC',
  stats: {
    strength: { value: 72, label: 'Problem Solving' },
    intelligence: { value: 88, label: 'Technical Knowledge' },
    dexterity: { value: 65, label: 'Adaptability' },
    wisdom: { value: 70, label: 'Soft Skills' },
  },
}

const FALLBACK_ACHIEVEMENTS: AchievementsResponse = {
  achievements: [
    { name: 'Bug Hunter', description: 'Fixed 50+ bugs', icon: 'flame', category: 'general', color: '#ef4444', unlocked: true, unlock_date: '2024-06-15' },
    { name: 'Code Wizard', description: 'Mastered 3+ languages', icon: 'code', category: 'general', color: '#8b5cf6', unlocked: true, unlock_date: '2024-08-01' },
    { name: 'Shield Bearer', description: 'Zero critical bugs in production', icon: 'shield', category: 'general', color: '#3b82f6', unlocked: true, unlock_date: '2024-09-10' },
    { name: 'Quest Champion', description: 'Completed 10+ projects', icon: 'trophy', category: 'general', color: '#f0c040', unlocked: true, unlock_date: '2024-11-01' },
  ],
}

const FALLBACK_SKILLS: SkillsResponse = {
  branches: [
    { id: 'frontend', name: 'Frontend Arcana', color: '#8b5cf6', skills: [
      { id: 'react', name: 'React', level: 4, maxLevel: 5, unlocked: true, description: '', projects: [] },
      { id: 'typescript', name: 'TypeScript', level: 4, maxLevel: 5, unlocked: true, description: '', projects: [] },
      { id: 'tailwind', name: 'Tailwind CSS', level: 3, maxLevel: 5, unlocked: true, description: '', projects: [] },
    ]},
    { id: 'backend', name: 'Backend Warfare', color: '#3b82f6', skills: [
      { id: 'python', name: 'Python', level: 4, maxLevel: 5, unlocked: true, description: '', projects: [] },
      { id: 'fastapi', name: 'FastAPI', level: 3, maxLevel: 5, unlocked: true, description: '', projects: [] },
      { id: 'nodejs', name: 'Node.js', level: 3, maxLevel: 5, unlocked: true, description: '', projects: [] },
    ]},
    { id: 'data', name: 'Data Sorcery', color: '#22c55e', skills: [
      { id: 'pandas', name: 'Pandas', level: 3, maxLevel: 5, unlocked: true, description: '', projects: [] },
      { id: 'postgresql', name: 'PostgreSQL', level: 3, maxLevel: 5, unlocked: true, description: '', projects: [] },
    ]},
  ],
}

const FALLBACK_ANALYSES: CVAnalysesResponse = { analyses: [] }

/* ═══════════════════════════════════════════
   CUSTOM SVG STAT ICONS
   ═══════════════════════════════════════════ */
function StatIconPower({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill={color}>
      <path d="M12 2C7.6 2 4 5.6 4 10c0 3 1.7 5.7 4.2 7l-.2 1h8l-.2-1c2.5-1.3 4.2-4 4.2-7 0-4.4-3.6-8-8-8zm0 2.5c.7 0 1.2.2 1.2.2l-1.2 4-1.2-4s.5-.2 1.2-.2zM8.5 7l2.5 3-3.8.5L8.5 7zm7 0l1.3 3.5-3.8-.5L15.5 7zM12 12.5l2.2 2.5h-4.4l2.2-2.5z" opacity="0.9" />
      <path d="M10 20h4v2h-4z" opacity="0.5" />
    </svg>
  )
}

function StatIconCV({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
      <path d="M14 2v6h6" />
      <path d="M9 15l2 2 4-4" />
    </svg>
  )
}

function StatIconSkills({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill={color}>
      <path d="M12 2l2.4 5.2L20 8l-4 4.2L17 18l-5-2.8L7 18l1-5.8L4 8l5.6-.8L12 2z" />
      <circle cx="12" cy="11" r="2.5" fill="rgba(10,10,26,0.5)" />
    </svg>
  )
}

function StatIconTitles({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill={color}>
      <path d="M5 3l2 6H3l4 5-1.5 7L12 17l6.5 4L17 14l4-5h-4l2-6H5z" opacity="0.85" />
      <circle cx="12" cy="11" r="3" fill="rgba(10,10,26,0.4)" />
      <circle cx="12" cy="11" r="1.5" fill={color} opacity="0.6" />
    </svg>
  )
}

/* ═══════════════════════════════════════════
   SCORE RING COMPONENT
   ═══════════════════════════════════════════ */
function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const fillLength = (score / 100) * circumference

  const color = score >= 85 ? '#22c55e' : score >= 70 ? '#3b82f6' : score >= 55 ? '#f0c040' : '#ef4444'

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
        style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
      >
        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="var(--color-surface-dim)"
          strokeWidth={strokeWidth}
        />
        {/* Score arc */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - fillLength }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-heading text-2xl tracking-wide"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        >
          {score}
        </motion.span>
        <span className="text-[9px] tracking-[0.2em] text-text-muted uppercase">CV Score</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   RADAR CHART
   ═══════════════════════════════════════════ */
function RadarChart({ stats }: { stats: { name: string; value: number; color: string }[] }) {
  const size = 180
  const center = size / 2
  const maxR = 65
  const angles = stats.map((_, i) => (i * 2 * Math.PI) / stats.length - Math.PI / 2)

  const points = stats.map((stat, i) => {
    const r = (stat.value / 100) * maxR
    return { x: center + r * Math.cos(angles[i]), y: center + r * Math.sin(angles[i]) }
  })

  const polygon = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[180px]">
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <polygon
          key={scale}
          points={angles.map((a) => `${center + maxR * scale * Math.cos(a)},${center + maxR * scale * Math.sin(a)}`).join(' ')}
          fill="none" stroke="var(--color-surface-dim)" strokeWidth={0.5}
        />
      ))}
      {angles.map((a, i) => (
        <line key={i} x1={center} y1={center}
          x2={center + maxR * Math.cos(a)} y2={center + maxR * Math.sin(a)}
          stroke="var(--color-surface-dim)" strokeWidth={0.5}
        />
      ))}
      <motion.polygon
        points={polygon}
        fill="rgba(34, 197, 94, 0.15)" stroke="#22c55e" strokeWidth={1.5}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        style={{ transformOrigin: `${center}px ${center}px` }}
      />
      {points.map((p, i) => (
        <motion.circle key={i} cx={p.x} cy={p.y} r={3} fill={stats[i].color}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.7 + i * 0.1, type: 'spring' }}
        />
      ))}
      {stats.map((stat, i) => {
        const labelR = maxR + 16
        return (
          <text key={stat.name}
            x={center + labelR * Math.cos(angles[i])} y={center + labelR * Math.sin(angles[i])}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fontFamily="Cinzel, serif" fill={stat.color}
          >
            {stat.name}
          </text>
        )
      })}
    </svg>
  )
}

/* ═══════════════════════════════════════════
   STATS BAR
   ═══════════════════════════════════════════ */
function GuildStatsBar({ profile, latestScore, skillCount, titleCount }: {
  profile: ProfileResponse; latestScore: number | null; skillCount: number; titleCount: number
}) {
  const powerLevel = useMemo(() => {
    const vals = Object.values(profile.stats).map(s => s.value)
    return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
  }, [profile])

  const cards = [
    { label: 'Power Level', value: powerLevel, suffix: '', color: '#f0c040', iconEl: StatIconPower },
    { label: 'CV Score', value: latestScore ?? 0, display: latestScore != null ? undefined : '--', suffix: '', color: '#22c55e', iconEl: StatIconCV },
    { label: 'Skills Mastered', value: skillCount, suffix: '', color: '#8b5cf6', iconEl: StatIconSkills },
    { label: 'Titles Earned', value: titleCount, suffix: '', color: '#3b82f6', iconEl: StatIconTitles },
  ]

  return (
    <motion.div variants={item} className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => {
        const IconEl = c.iconEl
        return (
          <GlassCard key={c.label} accentColor={`${c.color}30`} hover={false} corners className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-text-muted">{c.label}</p>
                {c.display ? (
                  <p className="mt-1 font-heading text-lg tracking-wide" style={{ color: c.color }}>{c.display}</p>
                ) : (
                  <p className="mt-1 font-heading text-lg tracking-wide text-text-primary">
                    <AnimatedCounter value={c.value} separator="" />
                  </p>
                )}
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
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
   HELPERS
   ═══════════════════════════════════════════ */
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return iso }
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

function generateRPGCV(
  profile: ProfileResponse,
  skills: SkillsResponse,
  achievements: AchievementsResponse,
): string {
  const divider = '═══════════════════════════════════════'
  const lines: string[] = []

  lines.push(divider)
  lines.push(`   ${profile.name}`)
  lines.push(`   ${profile.title} — Level ${profile.level}`)
  lines.push(divider)
  lines.push('')
  lines.push('--- ATTRIBUTES ---')

  const statDescs: Record<string, string> = {
    strength: 'Problem Solving', intelligence: 'Technical Knowledge',
    dexterity: 'Adaptability', wisdom: 'Soft Skills',
  }
  for (const [key, s] of Object.entries(profile.stats)) {
    const abbr = key.slice(0, 3).toUpperCase()
    lines.push(`  ${abbr}: ${s.value}/100 (${statDescs[key] || s.label})`)
  }

  lines.push('')
  lines.push('--- EQUIPMENT (Skills) ---')
  for (const branch of skills.branches) {
    lines.push(`  [${branch.name}]`)
    for (const sk of branch.skills.filter(s => s.unlocked)) {
      lines.push(`    ${sk.name} - Lv.${sk.level}/${sk.maxLevel}`)
    }
  }

  const unlockedTitles = achievements.achievements.filter(a => a.unlocked)
  if (unlockedTitles.length > 0) {
    lines.push('')
    lines.push('--- EARNED TITLES ---')
    for (const t of unlockedTitles) {
      lines.push(`  * ${t.name} — ${t.description}`)
    }
  }

  lines.push('')
  lines.push('Generated by DevQuest RPG Engine')
  lines.push('')

  return lines.join('\n')
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function GuildHall() {
  const { showXPGain } = useGamification()

  /* ─── API data ─── */
  const { data: profile } = useAPI(() => api.getProfile(), FALLBACK_PROFILE)
  const { data: achievementsData } = useAPI(() => api.getAchievements(), FALLBACK_ACHIEVEMENTS)
  const { data: skillsData } = useAPI(() => api.getSkills(), FALLBACK_SKILLS)
  const { data: analysesData, loading: analysesLoading } = useAPI(() => api.getCVAnalyses(), FALLBACK_ANALYSES)

  /* ─── Local state ─── */
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState<CVAnalysisResponse | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [analyses, setAnalyses] = useState<CVAnalysisResponse[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ─── Derived data ─── */
  const allAnalyses = useMemo(() => {
    const combined = [...analyses]
    if (analysesData.analyses) {
      for (const a of analysesData.analyses) {
        if (!combined.some(c => c.id === a.id)) combined.push(a)
      }
    }
    return combined.sort((a, b) => b.id - a.id)
  }, [analyses, analysesData])

  const latestScore = currentAnalysis?.score ?? (allAnalyses.length > 0 ? allAnalyses[0].score : null)

  const unlockedSkillCount = useMemo(
    () => skillsData.branches.reduce((s, b) => s + b.skills.filter(sk => sk.unlocked).length, 0),
    [skillsData],
  )

  const unlockedTitles = useMemo(
    () => achievementsData.achievements.filter(a => a.unlocked),
    [achievementsData],
  )

  const radarStats = useMemo(() => {
    return Object.entries(profile.stats).map(([key, s]) => ({
      name: STAT_META[key]?.name ?? key.slice(0, 3).toUpperCase(),
      value: s.value,
      color: STAT_META[key]?.color ?? '#94a3b8',
    }))
  }, [profile])

  /* ─── Handlers ─── */
  const handleFile = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) return
    setCurrentFile(file)
    setCurrentAnalysis(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleAnalyze = useCallback(async () => {
    if (!currentFile) return
    setIsAnalyzing(true)
    const result = await api.uploadCV(currentFile)
    setIsAnalyzing(false)
    if (result) {
      setCurrentAnalysis(result)
      setAnalyses(prev => [result, ...prev])
      if (result.gamification) showXPGain(result.gamification)
    }
  }, [currentFile, showXPGain])

  const handleDownload = useCallback(() => {
    const text = generateRPGCV(profile, skillsData, achievementsData)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${profile.name.replace(/\s+/g, '-')}-RPG-CV.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [profile, skillsData, achievementsData])

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Guild Hall"
        subtitle="Your character sheet and credentials"
        gradient="linear-gradient(135deg, #22c55e, #4ade80, #16a34a)"
        glowColor="rgba(34, 197, 94, 0.2)"
      />

      {/* Stats Bar */}
      <GuildStatsBar
        profile={profile}
        latestScore={latestScore}
        skillCount={unlockedSkillCount}
        titleCount={unlockedTitles.length}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* ═══ LEFT COLUMN ═══ */}
        <div className="space-y-6">
          {/* Character Sheet */}
          <GlassCard variants={item} accentColor="rgba(34, 197, 94, 0.25)" className="p-6">
            <p className="mb-4 font-heading text-[10px] tracking-[0.3em] text-text-muted uppercase">
              Character Sheet
            </p>

            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent-gold/10 font-display text-xl text-accent-gold">
                {profile.avatar_initials}
              </div>
              <div>
                <h3 className="font-heading text-lg tracking-wide text-text-primary">{profile.name}</h3>
                <p className="text-xs text-accent-gold">{profile.title} &bull; Level {profile.level}</p>
              </div>
            </div>

            {/* XP Bar */}
            <div className="mb-5">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] tracking-wider text-text-muted uppercase">Experience</span>
                <span className="text-[10px] text-text-muted">
                  {profile.xp.toLocaleString()} / {profile.xp_next_level.toLocaleString()} XP
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-bg-primary">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #f0c04060, #f0c040)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(profile.xp / profile.xp_next_level) * 100}%` }}
                  transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Radar Chart */}
            <RadarChart stats={radarStats} />

            {/* Stat Bars */}
            <div className="mt-4 space-y-3">
              {Object.entries(profile.stats).map(([key, s], i) => {
                const meta = STAT_META[key]
                if (!meta) return null
                const Icon = meta.icon
                return (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                        <span className="font-heading text-xs tracking-wider" style={{ color: meta.color }}>
                          {meta.name}
                        </span>
                        <span className="text-[10px] text-text-muted">{meta.desc}</span>
                      </div>
                      <span className="text-xs font-medium text-text-secondary">{s.value}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-bg-primary">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${meta.color}60, ${meta.color})` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${s.value}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </GlassCard>

          {/* Earned Titles */}
          <motion.div variants={item}>
            <p className="mb-3 font-heading text-[10px] tracking-[0.3em] text-text-muted uppercase">
              Earned Titles
            </p>
            <div className="flex flex-wrap gap-2">
              {unlockedTitles.map((title, i) => {
                const Icon = TITLE_ICONS[title.icon] ?? Trophy
                return (
                  <motion.div
                    key={title.name}
                    className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-heading text-[10px] tracking-wider"
                    style={{
                      color: title.color,
                      borderColor: `${title.color}30`,
                      backgroundColor: `${title.color}08`,
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1, type: 'spring', stiffness: 300 }}
                    whileHover={{ scale: 1.05 }}
                    title={title.description}
                  >
                    <Icon className="h-3 w-3" />
                    {title.name}
                  </motion.div>
                )
              })}
              {unlockedTitles.length === 0 && (
                <p className="text-[10px] text-text-muted italic">No titles earned yet</p>
              )}
            </div>
          </motion.div>

          {/* Equipment Slots */}
          <motion.div variants={item}>
            <p className="mb-3 font-heading text-[10px] tracking-[0.3em] text-text-muted uppercase">
              Equipment Slots
            </p>
            <div className="space-y-3">
              {skillsData.branches.map((branch) => (
                <div key={branch.id}>
                  <p className="mb-1.5 text-[10px] tracking-wider uppercase" style={{ color: branch.color }}>
                    {branch.name}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {branch.skills.filter(s => s.unlocked).map((sk) => (
                      <span
                        key={sk.id}
                        className="rounded-md border px-2 py-0.5 text-[10px] tracking-wide text-text-secondary"
                        style={{ borderColor: `${branch.color}20`, backgroundColor: `${branch.color}08` }}
                      >
                        {sk.name}
                        <span className="ml-1 opacity-50">Lv.{sk.level}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="space-y-6">
          {/* Upload Zone */}
          <motion.div
            variants={item}
            className={`group cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
              isDragOver
                ? 'border-accent-green/50 bg-accent-green/10'
                : currentFile
                  ? 'border-accent-green/30 bg-bg-card/25'
                  : 'border-border-subtle/50 bg-bg-card/15 hover:border-accent-green/30 hover:bg-bg-card/25'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />

            {currentFile ? (
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-8 w-8 text-accent-green" />
                <p className="font-heading text-sm tracking-wide text-accent-green">{currentFile.name}</p>
                <p className="text-[10px] text-text-muted">{formatFileSize(currentFile.size)} &bull; Click to change</p>
              </div>
            ) : (
              <>
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-green/10 transition-colors group-hover:bg-accent-green/15">
                  <Upload className="h-5 w-5 text-accent-green" />
                </div>
                <p className="font-heading text-sm tracking-wide text-text-secondary">
                  Drop your CV scroll here
                </p>
                <p className="mt-1 text-[10px] text-text-muted">PDF, DOC up to 5MB</p>
              </>
            )}
          </motion.div>

          {/* Analyze Button */}
          <motion.button
            variants={item}
            onClick={handleAnalyze}
            disabled={!currentFile || isAnalyzing}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent-green/30 bg-accent-green/5 px-6 py-3 font-heading text-sm tracking-widest text-accent-green uppercase backdrop-blur-sm transition-all duration-200 hover:border-accent-green/50 hover:bg-accent-green/10 disabled:cursor-not-allowed disabled:opacity-40"
            whileHover={currentFile && !isAnalyzing ? { scale: 1.02 } : undefined}
            whileTap={currentFile && !isAnalyzing ? { scale: 0.98 } : undefined}
          >
            {isAnalyzing ? (
              <>
                <motion.div
                  className="h-4 w-4 rounded-full border-2 border-accent-green/30 border-t-accent-green"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
                Analyzing Scroll...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Analyze Character Sheet
              </>
            )}
          </motion.button>

          {/* Analysis Panel */}
          <AnimatePresence>
            {currentAnalysis && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-accent-purple/20 bg-accent-purple/5 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-accent-purple" />
                    <span className="font-heading text-xs tracking-wider text-accent-purple uppercase">
                      CV Analysis Results
                    </span>
                  </div>

                  {/* Score Ring */}
                  <div className="mb-5">
                    <ScoreRing score={currentAnalysis.score} />
                  </div>

                  {/* Section Breakdown */}
                  <div className="mb-5 space-y-3">
                    <p className="text-[10px] tracking-wider text-text-muted uppercase">Section Breakdown</p>
                    {currentAnalysis.sections.map((section, i) => {
                      const barColor = section.score >= 85 ? '#22c55e' : section.score >= 70 ? '#3b82f6' : '#f0c040'
                      return (
                        <motion.div
                          key={section.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs text-text-primary">{section.name}</span>
                            <span className="text-xs font-medium" style={{ color: barColor }}>{section.score}%</span>
                          </div>
                          <div className="mb-1 h-1 overflow-hidden rounded-full bg-bg-primary">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: barColor }}
                              initial={{ width: 0 }}
                              animate={{ width: `${section.score}%` }}
                              transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                            />
                          </div>
                          <p className="text-[10px] text-text-muted">{section.feedback}</p>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Strengths */}
                  {currentAnalysis.strengths.length > 0 && (
                    <div className="mb-4">
                      <div className="mb-2 flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                        <span className="text-[10px] tracking-wider text-green-400 uppercase">Strengths</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {currentAnalysis.strengths.map((s, i) => (
                          <motion.span
                            key={i}
                            className="rounded-md border border-green-500/20 bg-green-500/8 px-2 py-1 text-[10px] leading-tight text-green-300"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 + i * 0.08 }}
                          >
                            {s}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {currentAnalysis.weaknesses.length > 0 && (
                    <div className="mb-4">
                      <div className="mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-[10px] tracking-wider text-amber-400 uppercase">Weaknesses</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {currentAnalysis.weaknesses.map((w, i) => (
                          <motion.span
                            key={i}
                            className="rounded-md border border-amber-500/20 bg-amber-500/8 px-2 py-1 text-[10px] leading-tight text-amber-300"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7 + i * 0.08 }}
                          >
                            {w}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pro Tips */}
                  {currentAnalysis.tips.length > 0 && (
                    <div>
                      <div className="mb-2 flex items-center gap-1.5">
                        <Lightbulb className="h-3.5 w-3.5 text-accent-gold" />
                        <span className="text-[10px] tracking-wider text-accent-gold uppercase">Pro Tips</span>
                      </div>
                      <div className="space-y-1.5">
                        {currentAnalysis.tips.map((tip, i) => (
                          <motion.div
                            key={i}
                            className="flex gap-2 text-[10px] leading-relaxed text-text-secondary"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + i * 0.1 }}
                          >
                            <span className="shrink-0 font-heading text-accent-gold">{i + 1}.</span>
                            <span>{tip}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analysis History */}
          {!analysesLoading && allAnalyses.length > 0 && (
            <motion.div variants={item}>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="mb-2 flex w-full items-center justify-between text-left"
              >
                <p className="font-heading text-[10px] tracking-[0.3em] text-text-muted uppercase">
                  Analysis History ({allAnalyses.length})
                </p>
                <motion.div
                  animate={{ rotate: showHistory ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-text-muted" />
                </motion.div>
              </button>

              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2">
                      {allAnalyses.map((a) => {
                        const scoreColor = a.score >= 85 ? '#22c55e' : a.score >= 70 ? '#3b82f6' : a.score >= 55 ? '#f0c040' : '#ef4444'
                        return (
                          <div
                            key={a.id}
                            className="flex items-center justify-between rounded-lg border border-border-subtle/20 bg-bg-card/20 px-3 py-2"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                              <span className="truncate text-xs text-text-secondary">{a.filename}</span>
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                              <span className="text-[10px] text-text-muted">{formatDate(a.created_at)}</span>
                              <span className="font-heading text-sm" style={{ color: scoreColor }}>{a.score}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Download RPG CV */}
          <motion.button
            variants={item}
            onClick={handleDownload}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-subtle/30 bg-bg-card/20 px-6 py-3 font-heading text-xs tracking-widest text-text-muted uppercase transition-all hover:border-accent-gold/30 hover:text-accent-gold"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="h-4 w-4" />
            Download RPG CV
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
