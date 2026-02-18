import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Palette, Server, Database, Lock, Crown, X,
  type LucideIcon,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import GlassCard from '../components/ui/GlassCard'
import AnimatedCounter from '../components/ui/AnimatedCounter'
import { api, type SkillData, type BranchData, type SkillsResponse } from '../services/api'
import { useAPI } from '../hooks/useAPI'

/* ─── Animation Variants ─── */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

/* ─── Tier System ─── */
const TIER_NAMES = ['Locked', 'Novice', 'Apprentice', 'Adept', 'Expert', 'Master'] as const
const TIER_COLORS = ['#64748b', '#94a3b8', '#38bdf8', '#a78bfa', '#f59e0b', '#f0c040'] as const

function getSkillTier(level: number) {
  return { name: TIER_NAMES[level] ?? 'Locked', color: TIER_COLORS[level] ?? '#64748b' }
}

/* ─── Icon Maps ─── */
const BRANCH_ICONS: Record<string, LucideIcon> = {
  frontend: Palette,
  backend: Server,
  data: Database,
}

/* ─── Tech Logo SVG Components ─── */
function IconReact({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="-11.5 -10.23 23 20.46" className={className} style={style} fill="currentColor">
      <circle r="2.05" />
      <g stroke="currentColor" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  )
}

function IconTypeScript({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M1 1h22v22H1V1zm10.5 10.5H8.8v8.2H6.9v-8.2H4.2V9.9h7.3v1.6zm1.7 1.4c0-1 .8-1.6 2.3-1.8l1.6-.2v-.4c0-.6-.4-.9-1.1-.9-.7 0-1.1.3-1.2.8h-1.7c.1-1.3 1.1-2.2 3-2.2 1.8 0 2.8.9 2.8 2.3v4.7h-1.7v-1h-.1c-.4.7-1.1 1.1-2 1.1-1.3 0-2.1-.8-2.1-2l.2-.4zm3.9-.5v-.5l-1.4.2c-.7.1-1.1.4-1.1.9s.4.8 1 .8c.9 0 1.5-.6 1.5-1.4z" />
    </svg>
  )
}

function IconTailwind({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M12 6c-2.7 0-4.4 1.3-5.1 4 1-1.3 2.2-1.8 3.5-1.5.8.2 1.3.7 1.9 1.3 1 1 2.2 2.2 4.7 2.2 2.7 0 4.4-1.3 5.1-4-1 1.3-2.2 1.8-3.5 1.5-.8-.2-1.3-.7-1.9-1.3C15.7 7.2 14.5 6 12 6zM6.9 12C4.2 12 2.5 13.3 1.8 16c1-1.3 2.2-1.8 3.5-1.5.8.2 1.3.7 1.9 1.3 1 1 2.2 2.2 4.7 2.2 2.7 0 4.4-1.3 5.1-4-1 1.3-2.2 1.8-3.5 1.5-.8-.2-1.3-.7-1.9-1.3-1-1-2.2-2.2-4.7-2.2z" />
    </svg>
  )
}

function IconThreeJS({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M3 3l18 3.5L7.5 21 3 3zm4.5 3.2l7.8 1.5-5.2 8L7.5 6.2zm2 1.5l3.5.7-2.3 3.6-1.2-4.3z" />
    </svg>
  )
}

function IconNextJS({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.5 14.5V7.8l7.2 9.8a8.1 8.1 0 0 1-3.7 1h-.2l-3.3-4.5v2.4h-1.5V7.5h1.5v9zm7.3.2L11.5 8v-.5h1.5v7.4l4.1 5.5a8 8 0 0 1-3.3-2.2l5-1.5z" />
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

function IconFastAPI({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-.8 4h3.5l-4.2 7.5h2.8L9 20.5l.2-.3 5.2-8.2h-3l3.1-6z" />
    </svg>
  )
}

function IconNodeJS({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M12 1.8L3.2 6.9v10.2l8.8 5.1 8.8-5.1V6.9L12 1.8zm0 2.3l6.5 3.8v3.3l-3.5 2v3.8L12 18.8l-3-1.8v-3.8l-3.5-2V7.9L12 4.1zm0 3.4L9.5 9.2l2.5 1.5 2.5-1.5L12 7.5z" />
    </svg>
  )
}

function IconSQL({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <ellipse cx="12" cy="6" rx="8" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function IconDocker({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M13 3.5h2v2h-2zm-2.5 0h2v2h-2zM8 3.5h2v2H8zM5.5 6h2v2h-2zM8 6h2v2H8zm2.5 0h2v2h-2zM13 6h2v2h-2zm2.5 0h2v2h-2zM8 8.5h2v2H8zm2.5 0h2v2h-2zM13 8.5h2v2h-2zm8 1c-.5-.3-1.6-.4-2.5-.2-.2-1.2-.9-2.2-1.7-2.7l-.3-.2-.2.3c-.5.7-.6 1.8-.5 2.7.1.5.3 1 .7 1.5-.3.2-.7.4-1 .5-.7.2-1.4.3-2.1.3H1.6l-.1.6c-.1 1.3.1 2.6.6 3.9.6 1.4 1.5 2.4 2.7 3 1.4.7 3.6 1.1 6.1.1 1.5-.6 2.9-1.5 4-2.8 1.5-1.8 2.3-4.1 2.6-5.7h.2c.9 0 1.5-.4 2.1-.8l.3-.2-.2-.3z" />
    </svg>
  )
}

function IconPandas({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <rect x="6" y="2" width="3" height="5.5" rx="0.5" />
      <rect x="6" y="9" width="3" height="6" rx="0.5" />
      <rect x="6" y="16.5" width="3" height="5.5" rx="0.5" />
      <rect x="10.5" y="6" width="3" height="3" rx="0.5" />
      <rect x="15" y="3.5" width="3" height="5.5" rx="0.5" />
      <rect x="15" y="10.5" width="3" height="6" rx="0.5" />
      <rect x="15" y="18" width="3" height="4" rx="0.5" />
    </svg>
  )
}

function IconPostgreSQL({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M17.1 3.3c-1-.4-2-.6-3.1-.6-1.5 0-2.8.4-3.7 1.2-.5-.2-1.2-.3-1.9-.3-1.3 0-2.4.4-3 1.2C4.2 6 3.8 8 4 10.2c.1 1.2.4 2.5.8 3.8.6 2 1.4 3.5 2.3 4.3.5.4 1 .6 1.4.6.3 0 .5-.1.7-.3.4-.4.5-1 .3-2.1 1 .5 2.1.7 3.2.7h.3c-.2.5-.3 1-.3 1.5 0 .7.2 1.3.5 1.7.4.5 1 .7 1.6.7.5 0 1-.1 1.5-.4 1.2-.6 2-1.9 2.2-3.5.1-.6.1-1.3.1-1.8.8-.5 1.5-1.2 2-2.1.7-1.3 1-2.8.9-4.4-.2-2.4-1.3-4.5-4.1-5.6z" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="10" cy="8.5" r="1" />
      <circle cx="14.5" cy="8" r="1" />
    </svg>
  )
}

function IconETL({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="4" cy="7" r="2.5" />
      <circle cx="4" cy="17" r="2.5" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      <circle cx="20" cy="12" r="2.5" />
      <path d="M6.5 7h3.5l-.5 3M6.5 17h3l.5-3M14.5 12h3" />
    </svg>
  )
}

function IconAnalytics({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <rect x="3" y="14" width="3.5" height="7" rx="0.8" opacity="0.5" />
      <rect x="8" y="10" width="3.5" height="11" rx="0.8" opacity="0.7" />
      <rect x="13" y="6" width="3.5" height="15" rx="0.8" opacity="0.85" />
      <rect x="18" y="3" width="3.5" height="18" rx="0.8" />
    </svg>
  )
}

function IconML({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="12" cy="5" r="2" />
      <circle cx="6" cy="12" r="2" />
      <circle cx="18" cy="12" r="2" />
      <circle cx="8" cy="19" r="2" />
      <circle cx="16" cy="19" r="2" />
      <line x1="12" y1="7" x2="6" y2="10" />
      <line x1="12" y1="7" x2="18" y2="10" />
      <line x1="6" y1="14" x2="8" y2="17" />
      <line x1="18" y1="14" x2="16" y2="17" />
      <line x1="8" y1="12" x2="16" y2="12" opacity="0.4" />
      <line x1="10" y1="19" x2="14" y2="19" opacity="0.4" />
    </svg>
  )
}

function IconFallback({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" opacity="0.8" />
    </svg>
  )
}

type SkillIconComponent = typeof IconReact

const SKILL_ICONS: Record<string, SkillIconComponent> = {
  react: IconReact,
  typescript: IconTypeScript,
  tailwind: IconTailwind,
  threejs: IconThreeJS,
  nextjs: IconNextJS,
  python: IconPython,
  fastapi: IconFastAPI,
  nodejs: IconNodeJS,
  sql: IconSQL,
  docker: IconDocker,
  pandas: IconPandas,
  postgresql: IconPostgreSQL,
  etl: IconETL,
  analytics: IconAnalytics,
  ml: IconML,
}

/* ─── Branch Interface (extends API BranchData with icon) ─── */
interface Branch extends BranchData {
  icon: LucideIcon
}

/* ─── Fallback Data ─── */
const FALLBACK_SKILLS: SkillsResponse = {
  branches: [
    {
      id: 'frontend',
      name: 'Frontend Arcana',
      color: '#8b5cf6',
      skills: [
        { id: 'react', name: 'React', level: 4, maxLevel: 5, unlocked: true, description: 'Component-based UI library with hooks, context, and state management patterns.', projects: ['DevQuest', 'Dashboard UI'] },
        { id: 'typescript', name: 'TypeScript', level: 4, maxLevel: 5, unlocked: true, description: 'Strongly typed JavaScript for safer, more maintainable code.', projects: ['DevQuest', 'ML Pipeline'] },
        { id: 'tailwind', name: 'Tailwind CSS', level: 3, maxLevel: 5, unlocked: true, description: 'Utility-first CSS framework for rapid UI development.', projects: ['DevQuest'] },
        { id: 'threejs', name: 'Three.js', level: 2, maxLevel: 5, unlocked: true, description: '3D graphics library for immersive web experiences.', projects: ['DevQuest'] },
        { id: 'nextjs', name: 'Next.js', level: 0, maxLevel: 5, unlocked: false, description: 'React framework for production — SSR, routing, and optimization.', projects: [] },
      ],
    },
    {
      id: 'backend',
      name: 'Backend Warfare',
      color: '#3b82f6',
      skills: [
        { id: 'python', name: 'Python', level: 4, maxLevel: 5, unlocked: true, description: 'Versatile language for backend, data science, and scripting.', projects: ['ML Pipeline', 'DevQuest API'] },
        { id: 'fastapi', name: 'FastAPI', level: 3, maxLevel: 5, unlocked: true, description: 'Modern, high-performance Python web framework with auto docs.', projects: ['DevQuest API'] },
        { id: 'nodejs', name: 'Node.js', level: 3, maxLevel: 5, unlocked: true, description: 'JavaScript runtime for server-side applications.', projects: ['Chat API'] },
        { id: 'sql', name: 'SQL', level: 3, maxLevel: 5, unlocked: true, description: 'Database querying and management across multiple engines.', projects: ['ML Pipeline', 'DevQuest'] },
        { id: 'docker', name: 'Docker', level: 0, maxLevel: 5, unlocked: false, description: 'Container orchestration for reproducible deployments.', projects: [] },
      ],
    },
    {
      id: 'data',
      name: 'Data Sorcery',
      color: '#22c55e',
      skills: [
        { id: 'pandas', name: 'Pandas', level: 3, maxLevel: 5, unlocked: true, description: 'Data manipulation and analysis library for Python.', projects: ['ML Pipeline'] },
        { id: 'postgresql', name: 'PostgreSQL', level: 3, maxLevel: 5, unlocked: true, description: 'Advanced open-source relational database system.', projects: ['ML Pipeline'] },
        { id: 'etl', name: 'ETL Pipelines', level: 2, maxLevel: 5, unlocked: true, description: 'Extract, Transform, Load workflows for data processing.', projects: ['ML Pipeline'] },
        { id: 'analytics', name: 'Analytics', level: 2, maxLevel: 5, unlocked: true, description: 'Data visualization and business intelligence insights.', projects: ['ML Pipeline'] },
        { id: 'ml', name: 'Machine Learning', level: 0, maxLevel: 5, unlocked: false, description: 'Predictive models and intelligent systems. Requires Level 18.', projects: [] },
      ],
    },
  ],
}

/* ─── SVG Layout Config ─── */
const CENTER_Y = 290
const BRANCH_ANGLES = [-90, 30, 150]
const NODE_SPACING = 72

function getNodePositions(branchIndex: number) {
  const angle = (BRANCH_ANGLES[branchIndex] * Math.PI) / 180
  return Array.from({ length: 5 }, (_, i) => ({
    x: Math.cos(angle) * NODE_SPACING * (i + 1),
    y: CENTER_Y + Math.sin(angle) * NODE_SPACING * (i + 1),
  }))
}

/* ─── Helpers ─── */
function computeStats(branches: Branch[]) {
  const totalSkills = branches.reduce((s, b) => s + b.skills.length, 0)
  const unlockedSkills = branches.reduce((s, b) => s + b.skills.filter((sk) => sk.unlocked).length, 0)
  const totalLevels = branches.reduce((s, b) => s + b.skills.reduce((a, sk) => a + sk.level, 0), 0)
  const maxLevels = branches.reduce((s, b) => s + b.skills.reduce((a, sk) => a + sk.maxLevel, 0), 0)
  const powerScore = maxLevels > 0 ? Math.round((totalLevels / maxLevels) * 100) : 0

  let bestBranch = { name: '', score: 0, color: '' }
  for (const b of branches) {
    const score = b.skills.reduce((a, sk) => a + sk.level, 0)
    if (score > bestBranch.score) bestBranch = { name: b.name, score, color: b.color }
  }

  return { totalSkills, unlockedSkills, totalLevels, maxLevels, powerScore, bestBranch }
}

/* ─── Stat Card Icons (RPG-themed) ─── */
function StatIconUnlocked({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M12 3v12" />
      <path d="M9 12l3 3 3-3" />
      <circle cx="7" cy="8" r="1" fill={color} />
      <circle cx="17" cy="8" r="1" fill={color} />
      <circle cx="7" cy="16" r="1" fill={color} />
      <circle cx="17" cy="16" r="1" fill={color} />
    </svg>
  )
}

function StatIconPower({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill={color}>
      <path d="M12 2C7.6 2 4 5.6 4 10c0 3 1.7 5.7 4.2 7l-.2 1h8l-.2-1c2.5-1.3 4.2-4 4.2-7 0-4.4-3.6-8-8-8zm0 2.5c.7 0 1.2.2 1.2.2l-1.2 4-1.2-4s.5-.2 1.2-.2zM8.5 7l2.5 3-3.8.5L8.5 7zm7 0l1.3 3.5-3.8-.5L15.5 7zM12 12.5l2.2 2.5h-4.4l2.2-2.5z" opacity="0.9" />
      <path d="M10 20h4v2h-4z" opacity="0.5" />
    </svg>
  )
}

function StatIconPoints({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill={color}>
      <path d="M12 2l2.4 5.2L20 8l-4 4.2L17 18l-5-2.8L7 18l1-5.8L4 8l5.6-.8L12 2z" />
      <circle cx="12" cy="11" r="2.5" fill="rgba(10,10,26,0.5)" />
    </svg>
  )
}

function StatIconStrongest({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill={color}>
      <path d="M5 3l2 6H3l4 5-1.5 7L12 17l6.5 4L17 14l4-5h-4l2-6H5z" opacity="0.85" />
      <circle cx="12" cy="11" r="3" fill="rgba(10,10,26,0.4)" />
      <circle cx="12" cy="11" r="1.5" fill={color} opacity="0.6" />
    </svg>
  )
}

/* ─── Stats Bar ─── */
function StatsBar({ branches }: { branches: Branch[] }) {
  const s = useMemo(() => computeStats(branches), [branches])

  const cards = [
    { label: 'Skills Unlocked', value: s.unlockedSkills, suffix: ` / ${s.totalSkills}`, color: '#f0c040', iconEl: StatIconUnlocked },
    { label: 'Power Score', value: s.powerScore, suffix: '%', color: '#8b5cf6', iconEl: StatIconPower },
    { label: 'Skill Points', value: s.totalLevels, suffix: ` / ${s.maxLevels}`, color: '#3b82f6', iconEl: StatIconPoints },
    { label: 'Strongest', value: 0, display: s.bestBranch.name.split(' ')[0], color: s.bestBranch.color || '#22c55e', iconEl: StatIconStrongest },
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
                  <p className="mt-1 font-heading text-lg tracking-wide" style={{ color: c.color }}>
                    {c.display}
                  </p>
                ) : (
                  <p className="mt-1 font-heading text-lg tracking-wide text-text-primary">
                    <AnimatedCounter value={c.value} suffix={c.suffix} separator="" className="" />
                  </p>
                )}
              </div>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
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

/* ─── Branch Filters ─── */
function BranchFilters({ branches, activeBranch, onFilter }: {
  branches: Branch[]; activeBranch: string | null; onFilter: (id: string | null) => void
}) {
  return (
    <motion.div variants={item} className="mb-5 flex flex-wrap items-center justify-center gap-2">
      <button
        onClick={() => onFilter(null)}
        className={`rounded-full border px-3.5 py-1.5 font-heading text-[11px] tracking-wider transition-all ${
          !activeBranch
            ? 'border-accent-gold/40 bg-accent-gold/10 text-accent-gold'
            : 'border-border-subtle/30 text-text-muted hover:border-border-subtle/60 hover:text-text-secondary'
        }`}
      >
        All Branches
      </button>
      {branches.map((b) => {
        const Icon = b.icon
        const isActive = activeBranch === b.id
        return (
          <button
            key={b.id}
            onClick={() => onFilter(isActive ? null : b.id)}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-heading text-[11px] tracking-wider transition-all ${
              isActive
                ? 'text-white'
                : 'border-border-subtle/30 text-text-muted hover:border-border-subtle/60 hover:text-text-secondary'
            }`}
            style={isActive ? {
              borderColor: `${b.color}50`,
              backgroundColor: `${b.color}18`,
              color: b.color,
            } : undefined}
          >
            <Icon className="h-3 w-3" />
            {b.name}
          </button>
        )
      })}
    </motion.div>
  )
}

/* ─── Connection Particle ─── */
function ConnectionParticle({ x1, y1, x2, y2, color, delay }: {
  x1: number; y1: number; x2: number; y2: number; color: string; delay: number
}) {
  return (
    <motion.circle
      r={2}
      fill={color}
      initial={{ cx: x1, cy: y1, opacity: 0 }}
      animate={{
        cx: [x1, x2],
        cy: [y1, y2],
        opacity: [0, 0.8, 0.8, 0],
      }}
      transition={{ duration: 2.5, delay, repeat: Infinity, ease: 'linear', repeatDelay: 0.5 }}
      style={{ filter: `drop-shadow(0 0 4px ${color})` }}
    />
  )
}

/* ─── Animated Line ─── */
function AnimatedLine({ x1, y1, x2, y2, color, unlocked, delay, highlighted }: {
  x1: number; y1: number; x2: number; y2: number
  color: string; unlocked: boolean; delay: number; highlighted: boolean
}) {
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

  return (
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={unlocked ? color : 'rgba(42, 42, 90, 0.4)'}
      strokeWidth={highlighted ? 3 : unlocked ? 2 : 1}
      strokeDasharray={length}
      initial={{ strokeDashoffset: length }}
      animate={{
        strokeDashoffset: 0,
        strokeWidth: highlighted ? 3 : unlocked ? 2 : 1,
        opacity: highlighted ? 1 : unlocked ? 0.8 : 0.3,
      }}
      transition={{ strokeDashoffset: { duration: 0.6, delay, ease: 'easeOut' }, strokeWidth: { duration: 0.2 }, opacity: { duration: 0.2 } }}
      style={{ filter: highlighted ? `drop-shadow(0 0 8px ${color}80)` : unlocked ? `drop-shadow(0 0 4px ${color}30)` : 'none' }}
    />
  )
}

/* ─── Tree Node ─── */
function TreeNode({ x, y, skill, color, delay, onClick, isSelected, isHovered, onHover, branchId }: {
  x: number; y: number; skill: SkillData; color: string
  delay: number; onClick: () => void; isSelected: boolean; isHovered: boolean
  onHover: (id: string | null) => void; branchId: string
}) {
  const radius = skill.unlocked ? 20 : 15
  const SkillIcon = SKILL_ICONS[skill.id] || IconFallback
  const tier = getSkillTier(skill.level)

  // Progress arc
  const arcRadius = radius + 5
  const circumference = 2 * Math.PI * arcRadius
  const progress = skill.unlocked ? skill.level / skill.maxLevel : 0
  const dashArray = `${circumference * progress} ${circumference * (1 - progress)}`

  return (
    <motion.g
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      onMouseEnter={() => onHover(`${branchId}:${skill.id}`)}
      onMouseLeave={() => onHover(null)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.3, type: 'spring', stiffness: 300 }}
    >
      {/* Outer glow ring for unlocked */}
      {skill.unlocked && (
        <motion.circle
          cx={x} cy={y} r={radius + 10}
          fill="none"
          stroke={color}
          strokeWidth={0.5}
          opacity={0.15}
          animate={{
            r: [radius + 10, radius + 14, radius + 10],
            opacity: [0.15, 0.06, 0.15],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Progress arc */}
      {skill.unlocked && (
        <motion.circle
          cx={x} cy={y} r={arcRadius}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={dashArray}
          strokeDashoffset={circumference * 0.25}
          opacity={0.7}
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: dashArray }}
          transition={{ duration: 0.8, delay: delay + 0.3, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 3px ${color}50)` }}
        />
      )}

      {/* Background circle */}
      <motion.circle
        cx={x} cy={y} r={radius}
        fill={skill.unlocked ? `${color}15` : 'rgba(18, 18, 42, 0.7)'}
        stroke={isSelected ? '#fff' : skill.unlocked ? color : 'rgba(42, 42, 90, 0.6)'}
        strokeWidth={isSelected ? 2.5 : skill.unlocked ? 1.5 : 1}
        animate={{
          r: isHovered ? radius + 3 : radius,
          filter: isHovered && skill.unlocked ? `drop-shadow(0 0 12px ${color}70)` : skill.unlocked ? `drop-shadow(0 0 6px ${color}40)` : 'none',
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Icon via foreignObject */}
      <foreignObject x={x - 10} y={y - 10} width={20} height={20}>
        <div
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...{ xmlns: 'http://www.w3.org/1999/xhtml' } as any}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
        >
          {skill.unlocked ? (
            <SkillIcon style={{ width: 14, height: 14, color }} />
          ) : (
            <Lock style={{ width: 12, height: 12, color: '#64748b' }} />
          )}
        </div>
      </foreignObject>

      {/* Label */}
      <text
        x={x}
        y={y + radius + 16}
        textAnchor="middle"
        fontSize="9.5"
        fontFamily="Cinzel, serif"
        fill={skill.unlocked ? '#e2e8f0' : '#64748b'}
        letterSpacing="0.5"
      >
        {skill.name}
      </text>

      {/* Tier label below name */}
      {skill.unlocked && (
        <text
          x={x}
          y={y + radius + 27}
          textAnchor="middle"
          fontSize="7.5"
          fontFamily="Raleway, sans-serif"
          fill={tier.color}
          opacity={0.7}
        >
          {tier.name}
        </text>
      )}

      {/* Hover tooltip */}
      {isHovered && skill.unlocked && (
        <motion.g initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
          <rect
            x={x - 38} y={y - radius - 32}
            width={76} height={20}
            rx={6}
            fill="rgba(10, 10, 26, 0.92)"
            stroke={`${color}40`}
            strokeWidth={1}
          />
          <text
            x={x} y={y - radius - 19}
            textAnchor="middle"
            fontSize="8.5"
            fontFamily="Raleway, sans-serif"
            fill={color}
          >
            Lv.{skill.level} {tier.name}
          </text>
        </motion.g>
      )}
    </motion.g>
  )
}

/* ─── Center Node ─── */
function CenterNode({ cx, powerScore }: { cx: number; powerScore: number }) {
  const centerR = 32
  const arcR = centerR + 5
  const circ = 2 * Math.PI * arcR
  const dash = `${circ * (powerScore / 100)} ${circ * (1 - powerScore / 100)}`

  return (
    <motion.g
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
    >
      {/* Outermost glow */}
      <motion.circle
        cx={cx} cy={CENTER_Y} r={centerR + 16}
        fill="none"
        stroke="#f0c040"
        strokeWidth={0.5}
        opacity={0.1}
        animate={{
          r: [centerR + 16, centerR + 22, centerR + 16],
          opacity: [0.1, 0.04, 0.1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Power score arc */}
      <motion.circle
        cx={cx} cy={CENTER_Y} r={arcR}
        fill="none"
        stroke="#f0c040"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={dash}
        strokeDashoffset={circ * 0.25}
        initial={{ strokeDasharray: `0 ${circ}` }}
        animate={{ strokeDasharray: dash }}
        transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
        style={{ filter: 'drop-shadow(0 0 6px rgba(240, 192, 64, 0.4))' }}
      />

      {/* Main circle */}
      <circle
        cx={cx} cy={CENTER_Y} r={centerR}
        fill="rgba(240, 192, 64, 0.08)"
        stroke="#f0c040"
        strokeWidth={2}
        style={{ filter: 'drop-shadow(0 0 12px rgba(240, 192, 64, 0.25))' }}
      />

      {/* Inner ring */}
      <circle
        cx={cx} cy={CENTER_Y} r={centerR - 6}
        fill="none"
        stroke="rgba(240, 192, 64, 0.15)"
        strokeWidth={0.5}
      />

      {/* Power score */}
      <text x={cx} y={CENTER_Y - 6} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#f0c040" fontFamily="Cinzel, serif">
        {powerScore}
      </text>

      {/* Label */}
      <text x={cx} y={CENTER_Y + 6} textAnchor="middle" fontSize="6.5" fill="rgba(240, 192, 64, 0.6)" fontFamily="Raleway, sans-serif" letterSpacing="1.5">
        POWER
      </text>

      {/* Class title below */}
      <text x={cx} y={CENTER_Y + centerR + 16} textAnchor="middle" fontSize="10" fill="#f0c040" fontFamily="Cinzel, serif" letterSpacing="1">
        Full-Stack Mage
      </text>
    </motion.g>
  )
}

/* ─── Detail Panel ─── */
function DetailPanel({ skill, branch, onClose }: { skill: SkillData; branch: Branch; onClose: () => void }) {
  const tier = getSkillTier(skill.level)
  const nextTier = skill.level < skill.maxLevel ? getSkillTier(skill.level + 1) : null
  const xpPerLevel = 50
  const skillXP = skill.level * xpPerLevel
  const maxXP = skill.maxLevel * xpPerLevel
  const SkillIcon = SKILL_ICONS[skill.id] || IconFallback

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="rounded-xl border border-border-subtle/40 bg-bg-card/50 p-5 backdrop-blur-md"
      style={{ boxShadow: `0 0 30px ${branch.color}12, inset 0 1px 0 ${branch.color}10` }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${branch.color}12`, border: `1px solid ${branch.color}25` }}
          >
            <SkillIcon className="h-5 w-5" style={{ color: branch.color }} />
          </div>
          <div>
            <h3 className="font-heading text-sm tracking-wide text-text-primary">{skill.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-text-muted">{branch.name}</span>
              {skill.unlocked && (
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wider"
                  style={{ backgroundColor: `${tier.color}18`, color: tier.color, border: `1px solid ${tier.color}30` }}
                >
                  {tier.name}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-bg-card hover:text-text-primary"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Segmented level bar */}
      <div className="mb-4">
        <div className="mb-1.5 flex justify-between text-[10px] text-text-muted">
          <span className="uppercase tracking-widest">Level</span>
          <span style={{ color: branch.color }}>{skill.level} / {skill.maxLevel}</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: skill.maxLevel }).map((_, i) => (
            <motion.div
              key={i}
              className="h-2 flex-1 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              style={{
                backgroundColor: i < skill.level ? branch.color : `${branch.color}15`,
                boxShadow: i < skill.level ? `0 0 6px ${branch.color}40` : 'none',
                transformOrigin: 'left',
              }}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[9px]">
          {Array.from({ length: skill.maxLevel }).map((_, i) => (
            <span key={i} className="flex-1 text-center" style={{ color: i < skill.level ? `${branch.color}90` : '#2a2a5a' }}>
              {TIER_NAMES[i + 1]?.slice(0, 3)}
            </span>
          ))}
        </div>
      </div>

      {/* XP Contribution */}
      {skill.unlocked && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-border-subtle/20 bg-bg-primary/40 px-3 py-2">
          <span className="text-[10px] uppercase tracking-widest text-text-muted">XP Contribution</span>
          <span className="font-heading text-xs" style={{ color: branch.color }}>
            <AnimatedCounter value={skillXP} separator="" /> / {maxXP} XP
          </span>
        </div>
      )}

      {/* Description */}
      <p className="mb-4 text-xs leading-relaxed text-text-secondary">{skill.description}</p>

      {/* Related Projects */}
      {skill.projects.length > 0 && (
        <div className="mb-4">
          <p className="mb-1.5 text-[10px] uppercase tracking-widest text-text-muted">Related Quests</p>
          <div className="flex flex-wrap gap-1.5">
            {skill.projects.map((p) => (
              <span
                key={p}
                className="rounded-md border px-2 py-0.5 text-[10px] text-text-secondary transition-colors hover:text-text-primary"
                style={{ borderColor: `${branch.color}20`, backgroundColor: `${branch.color}06` }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Next tier / Locked indicator */}
      {!skill.unlocked ? (
        <div className="flex items-center gap-2 rounded-lg border border-accent-gold/20 bg-accent-gold/5 px-3 py-2">
          <Lock className="h-3 w-3 text-accent-gold" />
          <span className="text-[10px] text-accent-gold">Requires higher level to unlock</span>
        </div>
      ) : nextTier ? (
        <div
          className="flex items-center gap-2 rounded-lg border px-3 py-2"
          style={{ borderColor: `${nextTier.color}20`, backgroundColor: `${nextTier.color}06` }}
        >
          <Crown className="h-3 w-3" style={{ color: nextTier.color }} />
          <span className="text-[10px]" style={{ color: nextTier.color }}>
            Next: {nextTier.name} — {skill.maxLevel - skill.level} level{skill.maxLevel - skill.level > 1 ? 's' : ''} remaining
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-accent-gold/25 bg-accent-gold/8 px-3 py-2">
          <Crown className="h-3 w-3 text-accent-gold" />
          <span className="text-[10px] font-semibold text-accent-gold">Mastery Achieved</span>
        </div>
      )}
    </motion.div>
  )
}

/* ─── Mobile Skill List ─── */
function MobileSkillList({ branches, selectedSkill, onSelect, activeBranch }: {
  branches: Branch[]
  selectedSkill: { branchId: string; skillId: string } | null
  onSelect: (branchId: string, skillId: string) => void
  activeBranch: string | null
}) {
  const [expandedLocal, setExpandedLocal] = useState<string | null>(null)
  const expanded = activeBranch ?? expandedLocal
  const setExpanded = (id: string | null) => setExpandedLocal(id)

  const filteredBranches = activeBranch ? branches.filter((b) => b.id === activeBranch) : branches

  return (
    <div className="space-y-4 lg:hidden">
      {filteredBranches.map((branch) => {
        const Icon = branch.icon
        const isExpanded = expanded === branch.id
        const unlockedCount = branch.skills.filter((s) => s.unlocked).length
        const totalLevel = branch.skills.reduce((s, sk) => s + sk.level, 0)
        const maxLevel = branch.skills.reduce((s, sk) => s + sk.maxLevel, 0)

        return (
          <motion.div key={branch.id} variants={item}>
            <button
              onClick={() => setExpanded(isExpanded ? null : branch.id)}
              className="flex w-full items-center justify-between rounded-xl border border-border-subtle/40 bg-bg-card/30 p-4 text-left backdrop-blur-sm transition-colors hover:bg-bg-card-hover/30"
              style={{ boxShadow: `0 2px 16px -4px ${branch.color}15` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${branch.color}12`, border: `1px solid ${branch.color}20` }}
                >
                  <Icon className="h-5 w-5" style={{ color: branch.color }} />
                </div>
                <div>
                  <h3 className="font-heading text-sm tracking-wide text-text-primary">{branch.name}</h3>
                  <div className="mt-0.5 flex items-center gap-3 text-[10px] text-text-muted">
                    <span>{unlockedCount}/{branch.skills.length} unlocked</span>
                    <span style={{ color: branch.color }}>{totalLevel}/{maxLevel} pts</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Mini progress */}
                <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-bg-primary sm:block">
                  <div className="h-full rounded-full" style={{ width: `${(totalLevel / maxLevel) * 100}%`, backgroundColor: branch.color }} />
                </div>
                <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} className="text-text-muted text-xs">
                  &#9660;
                </motion.span>
              </div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 space-y-2 pl-2">
                    {branch.skills.map((skill) => {
                      const isSelected = selectedSkill?.branchId === branch.id && selectedSkill?.skillId === skill.id
                      const tier = getSkillTier(skill.level)
                      const SIcon = SKILL_ICONS[skill.id] || IconFallback
                      return (
                        <motion.button
                          key={skill.id}
                          onClick={() => onSelect(branch.id, skill.id)}
                          className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                            isSelected
                              ? 'border-white/20 bg-bg-card/50'
                              : 'border-border-subtle/20 bg-bg-card/15 hover:bg-bg-card/30'
                          }`}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                        >
                          <div
                            className="flex h-7 w-7 items-center justify-center rounded-md"
                            style={{
                              backgroundColor: skill.unlocked ? `${branch.color}12` : 'rgba(26, 26, 62, 0.4)',
                              border: `1px solid ${skill.unlocked ? `${branch.color}25` : 'rgba(42, 42, 90, 0.4)'}`,
                            }}
                          >
                            {skill.unlocked ? (
                              <SIcon className="h-3.5 w-3.5" style={{ color: branch.color }} />
                            ) : (
                              <Lock className="h-3 w-3 text-text-muted" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs ${skill.unlocked ? 'text-text-primary' : 'text-text-muted'}`}>
                                {skill.name}
                              </span>
                              {skill.unlocked && (
                                <span
                                  className="rounded-full px-1.5 py-px text-[8px] tracking-wider"
                                  style={{ backgroundColor: `${tier.color}15`, color: tier.color }}
                                >
                                  {tier.name}
                                </span>
                              )}
                            </div>
                            {skill.unlocked && (
                              <div className="mt-1 flex gap-0.5">
                                {Array.from({ length: skill.maxLevel }).map((_, i) => (
                                  <div
                                    key={i}
                                    className="h-1 flex-1 rounded-full"
                                    style={{
                                      backgroundColor: i < skill.level ? branch.color : `${branch.color}15`,
                                      maxWidth: 24,
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>

                  {/* Mobile detail panel */}
                  <AnimatePresence>
                    {selectedSkill?.branchId === branch.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2 overflow-hidden pl-2"
                      >
                        <DetailPanel
                          skill={branch.skills.find((s) => s.id === selectedSkill.skillId)!}
                          branch={branch}
                          onClose={() => onSelect('', '')}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function SkillTree() {
  const { data: skillsData } = useAPI(api.getSkills, FALLBACK_SKILLS)
  const [selectedSkill, setSelectedSkill] = useState<{ branchId: string; skillId: string } | null>(null)
  const [activeBranch, setActiveBranch] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [svgSize, setSvgSize] = useState({ width: 800, height: 580 })

  const branches: Branch[] = useMemo(
    () => skillsData.branches.map((b) => ({ ...b, icon: BRANCH_ICONS[b.id] || Database })),
    [skillsData],
  )

  const stats = useMemo(() => computeStats(branches), [branches])

  useEffect(() => {
    function resize() {
      if (svgRef.current?.parentElement) {
        const w = svgRef.current.parentElement.clientWidth
        setSvgSize({ width: Math.max(w, 600), height: 580 })
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const cx = svgSize.width / 2

  function handleSelect(branchId: string, skillId: string) {
    if (selectedSkill?.branchId === branchId && selectedSkill?.skillId === skillId) {
      setSelectedSkill(null)
    } else if (branchId && skillId) {
      setSelectedSkill({ branchId, skillId })
    } else {
      setSelectedSkill(null)
    }
  }

  const hoveredBranchId = hoveredNode?.split(':')[0] ?? null
  const selectedBranch = selectedSkill ? branches.find((b) => b.id === selectedSkill.branchId) : null
  const selectedSkillData = selectedBranch?.skills.find((s) => s.id === selectedSkill?.skillId)

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Skill Tree"
        subtitle="Unlock abilities and master your craft as you level up"
        gradient="linear-gradient(135deg, #8b5cf6, #a78bfa, #6d3fd4)"
        glowColor="rgba(139, 92, 246, 0.25)"
      />

      {/* Stats summary */}
      <StatsBar branches={branches} />

      {/* Branch filters */}
      <BranchFilters branches={branches} activeBranch={activeBranch} onFilter={setActiveBranch} />

      {/* Desktop SVG tree */}
      <motion.div variants={item} className="hidden lg:block">
        <div className="grid gap-6" style={{ gridTemplateColumns: selectedSkill ? '1fr 300px' : '1fr' }}>
          <div className="relative rounded-xl border border-border-subtle/20 bg-bg-card/8 p-4 backdrop-blur-sm">
            {/* Decorative corner runes */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-3 top-3 h-5 w-5 border-l border-t border-accent-gold/10" />
              <div className="absolute right-3 top-3 h-5 w-5 border-r border-t border-accent-gold/10" />
              <div className="absolute bottom-3 left-3 h-5 w-5 border-b border-l border-accent-gold/10" />
              <div className="absolute bottom-3 right-3 h-5 w-5 border-b border-r border-accent-gold/10" />
            </div>

            <svg
              ref={svgRef}
              viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
              className="w-full"
              style={{ minHeight: 500 }}
            >
              {/* Radial grid lines (decorative) */}
              {[80, 160, 240, 320].map((r) => (
                <circle
                  key={r}
                  cx={cx} cy={CENTER_Y} r={r}
                  fill="none"
                  stroke="rgba(42, 42, 90, 0.08)"
                  strokeWidth={0.5}
                  strokeDasharray="4 8"
                />
              ))}

              {/* Connection lines */}
              {branches.map((branch, bi) => {
                const positions = getNodePositions(bi).map((p) => ({
                  x: p.x + cx,
                  y: p.y,
                }))
                const isFaded = activeBranch !== null && activeBranch !== branch.id
                const isHighlighted = hoveredBranchId === branch.id

                return (
                  <motion.g
                    key={`lines-${branch.id}`}
                    animate={{ opacity: isFaded ? 0.12 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Center to first node */}
                    <AnimatedLine
                      x1={cx} y1={CENTER_Y}
                      x2={positions[0].x} y2={positions[0].y}
                      color={branch.color}
                      unlocked={branch.skills[0].unlocked}
                      delay={0.3 + bi * 0.1}
                      highlighted={isHighlighted}
                    />
                    {/* Particle on first connection */}
                    {branch.skills[0].unlocked && (
                      <ConnectionParticle
                        x1={cx} y1={CENTER_Y}
                        x2={positions[0].x} y2={positions[0].y}
                        color={branch.color}
                        delay={bi * 0.8}
                      />
                    )}

                    {/* Node to node */}
                    {positions.slice(0, -1).map((pos, i) => (
                      <g key={i}>
                        <AnimatedLine
                          x1={pos.x} y1={pos.y}
                          x2={positions[i + 1].x} y2={positions[i + 1].y}
                          color={branch.color}
                          unlocked={branch.skills[i + 1].unlocked}
                          delay={0.4 + bi * 0.1 + i * 0.08}
                          highlighted={isHighlighted}
                        />
                        {branch.skills[i + 1].unlocked && (
                          <ConnectionParticle
                            x1={pos.x} y1={pos.y}
                            x2={positions[i + 1].x} y2={positions[i + 1].y}
                            color={branch.color}
                            delay={bi * 0.8 + (i + 1) * 0.6}
                          />
                        )}
                      </g>
                    ))}
                  </motion.g>
                )
              })}

              {/* Center node */}
              <CenterNode cx={cx} powerScore={stats.powerScore} />

              {/* Branch nodes */}
              {branches.map((branch, bi) => {
                const positions = getNodePositions(bi).map((p) => ({
                  x: p.x + cx,
                  y: p.y,
                }))
                const isFaded = activeBranch !== null && activeBranch !== branch.id

                return (
                  <motion.g
                    key={`nodes-${branch.id}`}
                    animate={{ opacity: isFaded ? 0.12 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {branch.skills.map((skill, si) => (
                      <TreeNode
                        key={skill.id}
                        x={positions[si].x}
                        y={positions[si].y}
                        skill={skill}
                        color={branch.color}
                        delay={0.5 + bi * 0.1 + si * 0.08}
                        onClick={() => handleSelect(branch.id, skill.id)}
                        isSelected={selectedSkill?.branchId === branch.id && selectedSkill?.skillId === skill.id}
                        isHovered={hoveredNode === `${branch.id}:${skill.id}`}
                        onHover={setHoveredNode}
                        branchId={branch.id}
                      />
                    ))}
                  </motion.g>
                )
              })}

              {/* Branch labels */}
              {branches.map((branch, bi) => {
                const positions = getNodePositions(bi).map((p) => ({
                  x: p.x + cx,
                  y: p.y,
                }))
                const last = positions[positions.length - 1]
                const labelOffset = bi === 0 ? -36 : 36
                const isFaded = activeBranch !== null && activeBranch !== branch.id

                return (
                  <motion.g
                    key={`label-${branch.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isFaded ? 0.1 : 1 }}
                    transition={{ delay: 1 + bi * 0.15, duration: 0.3 }}
                  >
                    <text
                      x={last.x}
                      y={last.y + labelOffset}
                      textAnchor="middle"
                      fontSize="11"
                      fontFamily="Cinzel, serif"
                      fill={branch.color}
                      letterSpacing="1.5"
                    >
                      {branch.name}
                    </text>
                    {/* Branch progress */}
                    <text
                      x={last.x}
                      y={last.y + labelOffset + 14}
                      textAnchor="middle"
                      fontSize="8"
                      fontFamily="Raleway, sans-serif"
                      fill={`${branch.color}80`}
                    >
                      {branch.skills.reduce((s, sk) => s + sk.level, 0)} / {branch.skills.reduce((s, sk) => s + sk.maxLevel, 0)} pts
                    </text>
                  </motion.g>
                )
              })}
            </svg>

            {/* Legend */}
            <div className="mt-2 flex items-center justify-center gap-6 text-[10px] text-text-muted">
              <span className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full border border-accent-purple bg-accent-purple/20" />
                Unlocked
              </span>
              <span className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full border border-border-subtle bg-transparent" />
                Locked
              </span>
              <span className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ border: '2px solid #f0c040', borderTopColor: 'transparent' }}
                />
                Progress Arc
              </span>
              <span className="flex items-center gap-1.5">
                <Crown className="h-3 w-3 text-accent-gold" />
                Class Center
              </span>
            </div>
          </div>

          {/* Side detail panel */}
          <AnimatePresence>
            {selectedSkill && selectedBranch && selectedSkillData && (
              <DetailPanel
                skill={selectedSkillData}
                branch={selectedBranch}
                onClose={() => setSelectedSkill(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Mobile collapsible list */}
      <MobileSkillList
        branches={branches}
        selectedSkill={selectedSkill}
        onSelect={handleSelect}
        activeBranch={activeBranch}
      />
    </motion.div>
  )
}
