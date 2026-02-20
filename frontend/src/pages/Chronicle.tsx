import { useRef, useState, useMemo } from 'react'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import GlassCard from '../components/ui/GlassCard'
import AnimatedCounter from '../components/ui/AnimatedCounter'
import { api, type TimelineEntry as TEntry } from '../services/api'
import { useAPI } from '../hooks/useAPI'

// ─── Fallback Data ──────────────────────────────────────────────────────
const FALLBACK_ENTRIES: TEntry[] = [
  { id: 'exp-senai', category: 'experience', year: '2025', yearEnd: null, title: 'Residente em Inteligência Artificial', place: 'SENAI/SC', description: 'Residência em IA aplicada: Machine Learning, Deep Learning, Computer Vision, IA Generativa, Otimização e IA Embarcada.', skills: ['Python', 'Machine Learning', 'Deep Learning', 'Computer Vision', 'Generative AI', 'FastAPI'], color: '#f0c040', icon: 'brain' },
  { id: 'exp-paradigma-n2', category: 'experience', year: '2024', yearEnd: '2025', title: 'Analista de Suporte N2', place: 'ParadigmaBS', description: 'Suporte nível 2: T-SQL, triggers, procedures, integração XML/SOAP, correção de bugs.', skills: ['T-SQL', 'XML', 'SOAP', 'Bug Fixing'], color: '#8b5cf6', icon: 'terminal' },
  { id: 'exp-paradigma-n1', category: 'experience', year: '2022', yearEnd: '2024', title: 'Analista de Suporte', place: 'ParadigmaBS', description: 'Análise de chamados técnicos, consultas SQL, pull requests, suporte ao cliente.', skills: ['T-SQL', 'XML', 'SQL'], color: '#8b5cf6', icon: 'headset' },
  { id: 'exp-paradigma-intern', category: 'experience', year: '2022', yearEnd: null, title: 'Estagiário', place: 'ParadigmaBS', description: 'Estágio em suporte técnico: diagnósticos, consultas SQL, correção de bugs.', skills: ['T-SQL', 'SQL'], color: '#3b82f6', icon: 'code' },
  { id: 'exp-softplan-fin', category: 'experience', year: '2020', yearEnd: '2021', title: 'Assistente Financeiro', place: 'Softplan', description: 'Operações financeiras e controle administrativo em empresa de tecnologia.', skills: ['Finance'], color: '#3b82f6', icon: 'briefcase' },
  { id: 'exp-softplan-apprentice', category: 'experience', year: '2018', yearEnd: '2020', title: 'Jovem Aprendiz', place: 'Softplan', description: 'Programa de aprendizagem com exposição a processos corporativos.', skills: ['Teamwork'], color: '#22c55e', icon: 'seedling' },
  { id: 'edu-senai', category: 'education', year: '2025', yearEnd: '2026', title: 'Pós-graduação em IA Aplicada', place: 'SENAI/SC', description: 'Especialização em IA aplicada à indústria.', skills: ['AI', 'Deep Learning', 'MLOps'], color: '#f0c040', icon: 'graduation' },
  { id: 'edu-estacio', category: 'education', year: '2020', yearEnd: '2024', title: 'Bacharel em Sistemas de Informação', place: 'Estácio de Sá — Florianópolis', description: 'Bacharelado com ênfase em desenvolvimento de software e banco de dados.', skills: ['Software Engineering', 'Databases'], color: '#22c55e', icon: 'book' },
  { id: 'award-actinspace', category: 'awards', year: '2026', yearEnd: null, title: 'Hackathon ActInSpace — 1º Lugar', place: 'Representando o Brasil na França', description: 'Primeiro lugar no hackathon internacional com solução de tecnologia espacial.', skills: ['Innovation', 'Space Tech', 'Pitch'], color: '#f0c040', icon: 'trophy' },
  { id: 'award-akcit', category: 'awards', year: '2025', yearEnd: null, title: 'Hackathon AKCIT — 2º Lugar', place: 'Projeto com IA Generativa', description: 'Segundo lugar com projeto de IA Generativa.', skills: ['Generative AI', 'Hackathon'], color: '#8b5cf6', icon: 'medal' },
  { id: 'cert-mobile', category: 'certifications', year: '2023', yearEnd: null, title: 'Programação para Dispositivos Móveis', place: 'Certificação Profissional', description: 'Desenvolvimento de aplicações móveis.', skills: ['Mobile Development'], color: '#3b82f6', icon: 'smartphone' },
  { id: 'cert-web', category: 'certifications', year: '2023', yearEnd: null, title: 'Programação para Internet', place: 'Certificação Profissional', description: 'Desenvolvimento web front-end e back-end.', skills: ['Web Development'], color: '#3b82f6', icon: 'globe' },
  { id: 'cert-governance', category: 'certifications', year: '2022', yearEnd: null, title: 'Implantação de Governança de T.I.', place: 'Certificação Profissional', description: 'Frameworks de governança em TI.', skills: ['IT Governance'], color: '#8b5cf6', icon: 'shield' },
  { id: 'cert-git', category: 'certifications', year: '2022', yearEnd: null, title: 'O Básico de Git e GitHub', place: 'Certificação Profissional', description: 'Controle de versão com Git e GitHub.', skills: ['Git', 'GitHub'], color: '#22c55e', icon: 'git' },
  { id: 'cert-bigdata', category: 'certifications', year: '2023', yearEnd: null, title: 'Soluções de Big Data Analytics', place: 'Certificação Profissional', description: 'Soluções analíticas com Big Data.', skills: ['Big Data', 'Analytics'], color: '#22c55e', icon: 'database' },
]

// ─── Animation Variants ─────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

// ─── Category Config ────────────────────────────────────────────────────
type CategoryKey = 'all' | 'experience' | 'education' | 'awards' | 'certifications'

const CATEGORIES: { key: CategoryKey; label: string; color: string }[] = [
  { key: 'all', label: 'All', color: '#e2e8f0' },
  { key: 'experience', label: 'Experience', color: '#8b5cf6' },
  { key: 'education', label: 'Education', color: '#22c55e' },
  { key: 'awards', label: 'Awards', color: '#f0c040' },
  { key: 'certifications', label: 'Certifications', color: '#3b82f6' },
]

// ─── SVG Icons ──────────────────────────────────────────────────────────

function IconYears({ color = '#f0c040' }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <path d="M12 7v5l3 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="1.5" fill={color} />
    </svg>
  )
}

function IconRoles({ color = '#8b5cf6' }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="7" width="18" height="13" rx="2" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <path d="M8 7V5a4 4 0 018 0v2" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="14" r="2" fill={color} />
    </svg>
  )
}

function IconAwards({ color = '#3b82f6' }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l2.4 4.8L20 7.6l-4 3.9.9 5.5L12 14.5 7.1 17l.9-5.5-4-3.9 5.6-.8L12 2z" stroke={color} strokeWidth="1.5" fill={`${color}20`} strokeLinejoin="round" />
      <path d="M8 21h8" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}

function IconCurrent({ color = '#22c55e' }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth="1.5" fill={`${color}20`} strokeLinejoin="round" />
    </svg>
  )
}

// ─── Entry Icon Resolver ────────────────────────────────────────────────
function EntryIcon({ icon, color, size = 16 }: { icon: string; color: string; size?: number }) {
  const s = size
  const sw = 1.5
  switch (icon) {
    case 'brain':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M12 2a7 7 0 017 7c0 2.5-1.3 4.7-3.2 6L12 22l-3.8-7C6.3 13.7 5 11.5 5 9a7 7 0 017-7z" stroke={color} strokeWidth={sw} fill={`${color}15`} />
          <circle cx="12" cy="9" r="2.5" stroke={color} strokeWidth={sw} />
        </svg>
      )
    case 'terminal':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth={sw} />
          <path d="M7 9l3 3-3 3M13 15h4" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      )
    case 'headset':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M4 13a8 8 0 0116 0" stroke={color} strokeWidth={sw} />
          <rect x="2" y="13" width="4" height="6" rx="1" stroke={color} strokeWidth={sw} fill={`${color}15`} />
          <rect x="18" y="13" width="4" height="6" rx="1" stroke={color} strokeWidth={sw} fill={`${color}15`} />
        </svg>
      )
    case 'code':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'briefcase':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="7" width="20" height="14" rx="2" stroke={color} strokeWidth={sw} />
          <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke={color} strokeWidth={sw} />
        </svg>
      )
    case 'seedling':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M12 22V12M12 12c0-4 3-7 7-7-1 4-3 7-7 7zM12 12c0-4-3-7-7-7 1 4 3 7 7 7z" stroke={color} strokeWidth={sw} strokeLinecap="round" fill={`${color}10`} />
        </svg>
      )
    case 'graduation':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M2 10l10-5 10 5-10 5-10-5z" stroke={color} strokeWidth={sw} fill={`${color}15`} />
          <path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5" stroke={color} strokeWidth={sw} />
        </svg>
      )
    case 'book':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={color} strokeWidth={sw} />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={color} strokeWidth={sw} />
        </svg>
      )
    case 'trophy':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M6 9H3a1 1 0 01-1-1V5h4M18 9h3a1 1 0 001-1V5h-4" stroke={color} strokeWidth={sw} />
          <path d="M6 4h12v6a6 6 0 01-12 0V4z" stroke={color} strokeWidth={sw} fill={`${color}15`} />
          <path d="M12 16v3M8 21h8" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      )
    case 'medal':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="14" r="6" stroke={color} strokeWidth={sw} fill={`${color}15`} />
          <path d="M8 4l4 6 4-6" stroke={color} strokeWidth={sw} strokeLinecap="round" />
          <path d="M12 11v3M10 13h4" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      )
    case 'smartphone':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect x="5" y="2" width="14" height="20" rx="3" stroke={color} strokeWidth={sw} />
          <line x1="10" y1="18" x2="14" y2="18" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      )
    case 'globe':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={sw} />
          <path d="M3 12h18M12 3a15 15 0 014 9 15 15 0 01-4 9 15 15 0 01-4-9 15 15 0 014-9z" stroke={color} strokeWidth={sw} />
        </svg>
      )
    case 'shield':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M12 3l8 4v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7l8-4z" stroke={color} strokeWidth={sw} fill={`${color}10`} />
          <path d="M9 12l2 2 4-4" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'git':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke={color} strokeWidth={sw} />
          <circle cx="6" cy="6" r="2" stroke={color} strokeWidth={sw} fill={`${color}15`} />
          <circle cx="18" cy="18" r="2" stroke={color} strokeWidth={sw} fill={`${color}15`} />
          <path d="M7.5 7.5l3 3M13.5 13.5l3 3" stroke={color} strokeWidth={sw} />
        </svg>
      )
    case 'database':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <ellipse cx="12" cy="5" rx="8" ry="3" stroke={color} strokeWidth={sw} />
          <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" stroke={color} strokeWidth={sw} />
          <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" stroke={color} strokeWidth={sw} />
        </svg>
      )
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4" stroke={color} strokeWidth={sw} fill={`${color}20`} />
        </svg>
      )
  }
}

// ─── Duration Calculator ────────────────────────────────────────────────
function calcDuration(year: string, yearEnd: string | null): string {
  const start = parseInt(year, 10)
  const end = yearEnd ? parseInt(yearEnd, 10) : new Date().getFullYear()
  const diff = end - start
  if (diff === 0) return year
  return `${diff}y`
}

// ─── Stats Bar ──────────────────────────────────────────────────────────

function ChronicleStatsBar({ entries }: { entries: TEntry[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  const yearsActive = new Date().getFullYear() - 2018
  const rolesCount = entries.filter((e) => e.category === 'experience').length
  const awardsCount = entries.filter((e) => e.category === 'awards').length
  const currentRole = entries.find((e) => e.id === 'exp-senai')?.title || 'AI Resident'

  const stats = [
    { label: 'Years Active', value: yearsActive, suffix: '+', color: '#f0c040', IconComp: IconYears },
    { label: 'Roles Held', value: rolesCount, suffix: '', color: '#8b5cf6', IconComp: IconRoles },
    { label: 'Awards Won', value: awardsCount, suffix: '', color: '#3b82f6', IconComp: IconAwards },
    { label: 'Current', value: 0, suffix: '', color: '#22c55e', IconComp: IconCurrent, text: currentRole },
  ]

  return (
    <motion.div ref={ref} variants={itemVariants} className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <GlassCard
          key={stat.label}
          accentColor={`${stat.color}30`}
          hover={true}
          corners={true}
          glow={false}
          className="p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <div className="mb-2 flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${stat.color}12` }}
              >
                <stat.IconComp color={stat.color} />
              </div>
              <span className="text-[10px] font-medium tracking-wider text-text-muted uppercase">
                {stat.label}
              </span>
            </div>
            {stat.text ? (
              <p className="truncate font-heading text-sm tracking-wide" style={{ color: stat.color }}>
                {stat.text}
              </p>
            ) : (
              <p className="font-heading text-xl tracking-wide" style={{ color: stat.color }}>
                {isInView ? (
                  <AnimatedCounter value={stat.value} duration={1.2} suffix={stat.suffix} />
                ) : (
                  0
                )}
              </p>
            )}
          </motion.div>
        </GlassCard>
      ))}
    </motion.div>
  )
}

// ─── Category Filters ───────────────────────────────────────────────────

function CategoryFilters({
  active,
  onChange,
}: {
  active: CategoryKey
  onChange: (key: CategoryKey) => void
}) {
  return (
    <motion.div variants={itemVariants} className="mb-8 flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat.key
        return (
          <button
            key={cat.key}
            onClick={() => onChange(cat.key)}
            className="relative flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide transition-all duration-200"
            style={{
              borderColor: isActive ? `${cat.color}60` : 'var(--color-surface-dim)',
              backgroundColor: isActive ? `${cat.color}12` : 'transparent',
              color: isActive ? cat.color : '#94a3b8',
            }}
          >
            {cat.key !== 'all' && (
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: cat.color,
                  boxShadow: isActive ? `0 0 6px ${cat.color}60` : 'none',
                }}
              />
            )}
            {cat.label}
            {isActive && (
              <motion.div
                layoutId="chronicle-filter-active"
                className="absolute inset-0 rounded-full border"
                style={{ borderColor: `${cat.color}40` }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </motion.div>
  )
}

// ─── Skills Cloud ───────────────────────────────────────────────────────

const SKILL_COLORS: Record<string, string> = {
  Python: '#f0c040',
  'Machine Learning': '#f0c040',
  'Deep Learning': '#f0c040',
  'Computer Vision': '#f0c040',
  'Generative AI': '#f0c040',
  AI: '#f0c040',
  MLOps: '#f0c040',
  FastAPI: '#8b5cf6',
  'T-SQL': '#8b5cf6',
  SQL: '#8b5cf6',
  XML: '#8b5cf6',
  SOAP: '#8b5cf6',
  'Bug Fixing': '#8b5cf6',
  Documentation: '#8b5cf6',
  'API Analysis': '#8b5cf6',
  'IT Governance': '#8b5cf6',
  ITIL: '#8b5cf6',
  React: '#3b82f6',
  TypeScript: '#3b82f6',
  'Web Development': '#3b82f6',
  'Mobile Development': '#3b82f6',
  Git: '#22c55e',
  GitHub: '#22c55e',
  'Big Data': '#22c55e',
  Analytics: '#22c55e',
  'Power BI': '#22c55e',
  'Software Engineering': '#22c55e',
  Databases: '#22c55e',
  Innovation: '#f0c040',
  'Space Tech': '#3b82f6',
  Pitch: '#f0c040',
  Hackathon: '#8b5cf6',
  'Rapid Prototyping': '#8b5cf6',
  Teamwork: '#22c55e',
  Finance: '#3b82f6',
  Administration: '#3b82f6',
  'Professional Development': '#22c55e',
  Diagnostics: '#8b5cf6',
  'Systems Analysis': '#22c55e',
}

function SkillsCloud({ entries }: { entries: TEntry[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

  const allSkills = useMemo(() => {
    const map = new Map<string, number>()
    entries.forEach((e) => {
      e.skills.forEach((s) => {
        map.set(s, (map.get(s) || 0) + 1)
      })
    })
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 24)
  }, [entries])

  const maxCount = Math.max(...allSkills.map(([, c]) => c), 1)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <p className="mb-4 font-heading text-xs tracking-wider text-text-muted uppercase">
        Skills Constellation
      </p>
      <div className="flex flex-wrap gap-2">
        {allSkills.map(([skill, count], i) => {
          const color = SKILL_COLORS[skill] || '#94a3b8'
          const scale = 0.7 + (count / maxCount) * 0.3
          return (
            <motion.span
              key={skill}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              className="inline-flex items-center gap-1 rounded-md border px-2 py-1"
              style={{
                borderColor: `${color}30`,
                backgroundColor: `${color}08`,
                fontSize: `${scale * 0.75}rem`,
                color: color,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              {skill}
            </motion.span>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Timeline Entry Card ────────────────────────────────────────────────

function TimelineCard({
  entry,
  index,
  isExpanded,
  onToggle,
}: {
  entry: TEntry
  index: number
  isExpanded: boolean
  onToggle: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const isLeft = index % 2 === 0
  const isCurrent = entry.id === 'exp-senai'
  const isAward = entry.category === 'awards'
  const duration = calcDuration(entry.year, entry.yearEnd)

  const categoryLabel =
    entry.category === 'experience'
      ? 'Experience'
      : entry.category === 'education'
        ? 'Education'
        : entry.category === 'awards'
          ? 'Award'
          : 'Certification'

  const cardContent = (
    <div
      className="group cursor-pointer rounded-xl border bg-bg-card/30 p-4 backdrop-blur-sm transition-all duration-200 hover:bg-bg-card-hover/40"
      onClick={onToggle}
      style={{
        borderColor: isCurrent
          ? `${entry.color}50`
          : isAward
            ? `${entry.color}35`
            : 'var(--color-surface-dim)',
        boxShadow: isCurrent
          ? `0 0 20px ${entry.color}15, inset 0 1px 0 ${entry.color}15`
          : isAward
            ? `0 0 12px ${entry.color}10`
            : 'none',
      }}
    >
      {/* Current role animated border */}
      {isCurrent && (
        <div
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background: `linear-gradient(90deg, transparent, ${entry.color}15, transparent)`,
            backgroundSize: '200% 100%',
            animation: 'border-shimmer 3s ease-in-out infinite',
          }}
        />
      )}

      {/* Header row: year + category + duration */}
      <div className="mb-2 flex items-center gap-2">
        <span
          className="inline-block rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
          style={{ color: entry.color, backgroundColor: `${entry.color}15` }}
        >
          {entry.yearEnd ? `${entry.year}–${entry.yearEnd}` : entry.year}
        </span>
        <span
          className="rounded px-1.5 py-0.5 text-[9px] tracking-wider uppercase"
          style={{ color: `${entry.color}cc`, backgroundColor: `${entry.color}08` }}
        >
          {categoryLabel}
        </span>
        {duration !== entry.year && (
          <span className="ml-auto text-[10px] text-text-muted">{duration}</span>
        )}
        {isCurrent && (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-medium" style={{ color: entry.color }}>
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: entry.color, animation: 'gold-pulse 2s ease-in-out infinite' }}
            />
            Now
          </span>
        )}
      </div>

      {/* Title + Place */}
      <h3 className="font-heading text-sm tracking-wide text-text-primary">{entry.title}</h3>
      <p className="text-xs text-text-muted">{entry.place}</p>

      {/* Description (truncated unless expanded) */}
      <p
        className={`mt-2 text-xs leading-relaxed text-text-secondary ${!isExpanded ? 'line-clamp-2' : ''}`}
      >
        {entry.description}
      </p>

      {/* Skills chips */}
      <AnimatePresence>
        {isExpanded && entry.skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-3 flex flex-wrap gap-1.5 overflow-hidden"
          >
            {entry.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-md px-2 py-0.5 text-[10px] font-medium"
                style={{
                  color: entry.color,
                  backgroundColor: `${entry.color}10`,
                  border: `1px solid ${entry.color}20`,
                }}
              >
                {skill}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand indicator */}
      <div className="mt-2 flex justify-end">
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-text-muted"
        >
          <ChevronDown className="h-3 w-3" />
        </motion.div>
      </div>
    </div>
  )

  return (
    <motion.div
      ref={ref}
      className="relative mb-10 last:mb-0"
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
    >
      {/* Desktop: alternating layout */}
      <div className="hidden md:grid md:grid-cols-[1fr_48px_1fr] md:gap-4">
        {isLeft ? (
          <div className="flex justify-end">{cardContent}</div>
        ) : (
          <div />
        )}

        {/* Center node */}
        <div className="flex justify-center">
          <div className="relative">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full border-2"
              style={{
                borderColor: `${entry.color}60`,
                backgroundColor: `${entry.color}10`,
                boxShadow: isCurrent
                  ? `0 0 16px ${entry.color}40, 0 0 32px ${entry.color}15`
                  : `0 0 8px ${entry.color}20`,
              }}
            >
              <EntryIcon icon={entry.icon} color={entry.color} size={18} />
            </div>
            {isCurrent && (
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: `2px solid ${entry.color}30`,
                  animation: 'gold-pulse 2s ease-in-out infinite',
                }}
              />
            )}
          </div>
        </div>

        {!isLeft ? (
          <div>{cardContent}</div>
        ) : (
          <div />
        )}
      </div>

      {/* Mobile: left-aligned */}
      <div className="pl-12 md:hidden">
        <div
          className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border-2"
          style={{
            borderColor: `${entry.color}60`,
            backgroundColor: `${entry.color}10`,
            boxShadow: isCurrent
              ? `0 0 12px ${entry.color}35`
              : `0 0 6px ${entry.color}15`,
          }}
        >
          <EntryIcon icon={entry.icon} color={entry.color} size={15} />
        </div>
        {cardContent}
      </div>
    </motion.div>
  )
}

// ─── Certifications Grid ────────────────────────────────────────────────

function CertificationsGrid({ entries }: { entries: TEntry[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })
  const certs = entries.filter((e) => e.category === 'certifications')

  if (certs.length === 0) return null

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="mt-8"
    >
      <p className="mb-4 font-heading text-xs tracking-wider text-text-muted uppercase">
        Certifications Earned
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {certs.map((cert, i) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="flex items-center gap-3 rounded-lg border border-border-subtle/30 bg-bg-card/20 px-3 py-2.5"
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${cert.color}12` }}
            >
              <EntryIcon icon={cert.icon} color={cert.color} size={16} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-text-primary">{cert.title}</p>
              <p className="text-[10px] text-text-muted">{cert.year}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Main Chronicle Page ────────────────────────────────────────────────

export default function Chronicle() {
  const { data } = useAPI(
    () => api.getTimeline(),
    { entries: FALLBACK_ENTRIES }
  )

  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const timelineRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start center', 'end center'],
  })
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  // Filter entries by category, exclude certs from timeline when showing all
  const filteredEntries = useMemo(() => {
    let entries = data.entries
    if (activeCategory !== 'all') {
      entries = entries.filter((e) => e.category === activeCategory)
    }
    // Sort by year descending
    return [...entries].sort((a, b) => parseInt(b.year, 10) - parseInt(a.year, 10))
  }, [data.entries, activeCategory])

  // Timeline entries (exclude certifications from main timeline unless filtered)
  const timelineEntries = useMemo(() => {
    if (activeCategory === 'certifications') return filteredEntries
    return filteredEntries.filter((e) => e.category !== 'certifications')
  }, [filteredEntries, activeCategory])

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <PageHeader
        title="Chronicle"
        subtitle="A real journey through code, career, and conquest"
        gradient="linear-gradient(135deg, #f0c040, #e8a820, #d4940a)"
        glowColor="rgba(240, 192, 64, 0.2)"
      />

      {/* Stats Bar */}
      <ChronicleStatsBar entries={data.entries} />

      {/* Category Filters */}
      <CategoryFilters active={activeCategory} onChange={setActiveCategory} />

      <div className="grid gap-6 md:gap-10 md:grid-cols-3 lg:grid-cols-5">
        {/* Timeline Column */}
        <div className="md:col-span-2 lg:col-span-3" ref={timelineRef}>
          <div className="relative">
            {/* Desktop: animated vertical progress line */}
            <div className="absolute top-0 bottom-0 left-1/2 hidden -translate-x-1/2 md:block">
              <div className="h-full w-px bg-border-subtle/20" />
              <motion.div
                className="absolute top-0 left-0 w-px"
                style={{
                  height: lineHeight,
                  background: 'linear-gradient(to bottom, #f0c040, #8b5cf6, #3b82f6, #22c55e)',
                }}
              />
            </div>

            {/* Mobile: vertical line */}
            <div className="absolute top-0 bottom-0 left-[17px] md:hidden">
              <div className="h-full w-px bg-border-subtle/20" />
              <motion.div
                className="absolute top-0 left-0 w-px"
                style={{
                  height: lineHeight,
                  background: 'linear-gradient(to bottom, #f0c040, #8b5cf6, #3b82f6, #22c55e)',
                }}
              />
            </div>

            {/* Timeline entries */}
            <AnimatePresence mode="popLayout">
              {timelineEntries.map((entry, i) => (
                <TimelineCard
                  key={entry.id}
                  entry={entry}
                  index={i}
                  isExpanded={expandedId === entry.id}
                  onToggle={() => handleToggle(entry.id)}
                />
              ))}
            </AnimatePresence>

            {/* No results */}
            {timelineEntries.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center"
              >
                <p className="text-sm text-text-muted">No entries in this category yet.</p>
              </motion.div>
            )}
          </div>

          {/* Certifications Grid (show when "all" or "certifications") */}
          {(activeCategory === 'all' || activeCategory === 'certifications') && (
            <CertificationsGrid entries={data.entries} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8 md:col-span-1 lg:col-span-2">
          {/* Skills Cloud */}
          <SkillsCloud entries={data.entries} />
        </div>
      </div>
    </motion.div>
  )
}
