import { useRef, useState, useMemo, useCallback } from 'react'
import { motion, useInView, AnimatePresence } from 'motion/react'
import {
  Plus,
  Pin,
  Edit3,
  Trash2,
  ExternalLink,
  Calendar,
  Tag,
  FileText,
  Award,
  Lightbulb,
  Rocket,
  RefreshCw,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import GlassCard from '../components/ui/GlassCard'
import AnimatedCounter from '../components/ui/AnimatedCounter'
import Modal from '../components/ui/Modal'
import { api, type BlogPostData, type BlogPostCreate } from '../services/api'
import { useAPI } from '../hooks/useAPI'

// ─── Fallback Data ──────────────────────────────────────────────────────
const FALLBACK_POSTS: BlogPostData[] = [
  {
    id: 1,
    title: 'Won ActInSpace Hackathon — 1st Place!',
    content: '## Representing Brazil on the World Stage\n\nOur team competed in the **ActInSpace international hackathon** in France, tackling real challenges from the European Space Agency.\n\nWe developed an innovative solution combining satellite data with AI-powered analytics, and the judges awarded us **1st place** out of teams from over 20 countries.\n\n### Key Takeaways\n- Cross-cultural collaboration is a superpower\n- Space tech is more accessible than ever\n- 48-hour sprints teach you more than months of comfortable coding\n\nThis was a career-defining moment. Grateful for the team and the opportunity.',
    category: 'achievement',
    tags: 'hackathon,space-tech,innovation,france,1st-place',
    color: '#f0c040',
    pinned: true,
    created_at: '2026-01-20T10:00:00',
    updated_at: '2026-01-20T10:00:00',
  },
  {
    id: 2,
    title: 'Started AI Residency at SENAI/SC',
    content: '## A New Chapter Begins\n\nExcited to announce that I\'ve started my **AI Residency** at SENAI/SC, one of Brazil\'s premier technology institutions.\n\nThe program covers:\n- **Machine Learning** & Deep Learning fundamentals\n- **Computer Vision** applications for industry\n- **Generative AI** and LLM fine-tuning\n- **Embedded AI** for IoT devices\n- MLOps and production deployment\n\nLooking forward to bridging the gap between theoretical AI and real-world industrial applications.',
    category: 'update',
    tags: 'ai,machine-learning,senai,career,education',
    color: '#8b5cf6',
    pinned: false,
    created_at: '2025-03-15T09:00:00',
    updated_at: '2025-03-15T09:00:00',
  },
  {
    id: 3,
    title: 'DevQuest: Building My Career as an RPG',
    content: '## Why Gamify a Portfolio?\n\nTraditional portfolios are static and boring. I wanted something that tells a **story** — my story as a developer, gamified.\n\n**DevQuest** transforms my career into an RPG adventure:\n- **Skill Tree** with real technologies I\'ve mastered\n- **Quest Log** tracking GitHub projects as quests\n- **Chronicle** as an interactive timeline\n- **Oracle** — an AI advisor (mock, for now)\n\n### Tech Stack\n- React 19 + TypeScript + Vite\n- FastAPI + SQLModel + SQLite\n- Tailwind CSS v4 + Framer Motion\n- Three.js for particle effects\n\nBuilding this project taught me more about frontend architecture than any course ever could.',
    category: 'project',
    tags: 'devquest,react,fastapi,portfolio,typescript',
    color: '#3b82f6',
    pinned: false,
    created_at: '2025-06-10T14:00:00',
    updated_at: '2025-06-10T14:00:00',
  },
  {
    id: 4,
    title: '2nd Place at AKCIT Hackathon',
    content: '## 48 Hours of Pure Innovation\n\nOur team secured **2nd place** at the AKCIT Hackathon with a Generative AI solution for automated document analysis.\n\nWe built a pipeline that:\n1. Ingests unstructured documents\n2. Extracts key entities using NLP\n3. Generates structured summaries with an LLM\n4. Presents results in an interactive dashboard\n\n### Lessons Learned\n- Rapid prototyping > perfect architecture\n- Team communication is the real bottleneck\n- Demo polish matters as much as technical depth\n\nAlready looking forward to the next hackathon challenge!',
    category: 'achievement',
    tags: 'hackathon,generative-ai,nlp,2nd-place',
    color: '#22c55e',
    pinned: false,
    created_at: '2025-10-05T18:00:00',
    updated_at: '2025-10-05T18:00:00',
  },
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
type CategoryKey = 'all' | 'update' | 'project' | 'achievement' | 'thought'

const CATEGORIES: { key: CategoryKey; label: string; color: string; icon: typeof FileText }[] = [
  { key: 'all', label: 'All', color: '#e2e8f0', icon: FileText },
  { key: 'update', label: 'Updates', color: '#8b5cf6', icon: RefreshCw },
  { key: 'project', label: 'Projects', color: '#3b82f6', icon: Rocket },
  { key: 'achievement', label: 'Achievements', color: '#f0c040', icon: Award },
  { key: 'thought', label: 'Thoughts', color: '#22c55e', icon: Lightbulb },
]

const CATEGORY_COLORS: Record<string, string> = {
  update: '#8b5cf6',
  project: '#3b82f6',
  achievement: '#f0c040',
  thought: '#22c55e',
}

// ─── Social Links ───────────────────────────────────────────────────────
const SOCIAL_LINKS = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/renantfcarvalho/',
    color: '#0a66c2',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: 'GitHub',
    url: 'https://github.com/RenanTFC',
    color: '#e2e8f0',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: 'Dev.to',
    url: 'https://dev.to/renantfc',
    color: '#e2e8f0',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6v4.36h.58c.37 0 .65-.08.84-.23.2-.16.3-.46.3-.9v-2.1c0-.44-.1-.74-.3-.9zM0 0v24h24V0H0zm8.1 15.36H6.15v-6.72h1.95c.65 0 1.16.18 1.53.53.37.35.55.87.55 1.56v2.54c0 .69-.18 1.21-.55 1.56-.37.35-.88.53-1.53.53zm5.52-4.6h-1.8v1.5h1.08v1.08h-1.08v1.56h1.8v1.08h-2.88v-6.72h2.88v1.5zm5.04 3.24c0 .72-.17 1.25-.52 1.6-.35.34-.86.51-1.52.51-.66 0-1.17-.17-1.52-.51-.35-.35-.52-.88-.52-1.6v-4.92h1.08v4.8c0 .4.07.68.2.84.13.16.34.24.61.24s.48-.08.61-.24c.13-.16.2-.44.2-.84v-4.8h1.08v4.92h-.7z" />
      </svg>
    ),
  },
]

// ─── Simple Markdown Renderer ───────────────────────────────────────────
function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h4 class="font-heading text-sm text-text-primary mt-3 mb-1">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="font-heading text-base text-text-primary mt-4 mb-2">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-text-primary font-semibold">$1</strong>')
    .replace(/^\d+\.\s(.+)$/gm, '<li class="ml-4 list-decimal text-xs text-text-secondary leading-relaxed">$1</li>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-xs text-text-secondary leading-relaxed">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

// ─── SVG Icons ──────────────────────────────────────────────────────────
function IconPosts({ color = '#f0c040' }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <path d="M7 8h10M7 12h6M7 16h8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconPinned({ color = '#8b5cf6' }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7z" stroke={color} strokeWidth="1.5" fill={`${color}20`} strokeLinejoin="round" />
    </svg>
  )
}

function IconCategories({ color = '#3b82f6' }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="2" stroke={color} strokeWidth="1.5" fill={`${color}15`} />
      <rect x="13" y="3" width="8" height="8" rx="2" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <rect x="3" y="13" width="8" height="8" rx="2" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <rect x="13" y="13" width="8" height="8" rx="2" stroke={color} strokeWidth="1.5" fill={`${color}15`} />
    </svg>
  )
}

function IconLatest({ color = '#22c55e' }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <path d="M12 7v5l3 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Stats Bar ──────────────────────────────────────────────────────────

function TavernStatsBar({ posts }: { posts: BlogPostData[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  const totalPosts = posts.length
  const pinnedCount = posts.filter((p) => p.pinned).length
  const categories = new Set(posts.map((p) => p.category)).size
  const latestDate = posts.length > 0
    ? new Date(posts.reduce((a, b) => a.created_at > b.created_at ? a : b).created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'N/A'

  const stats = [
    { label: 'Total Posts', value: totalPosts, suffix: '', color: '#f0c040', IconComp: IconPosts },
    { label: 'Pinned', value: pinnedCount, suffix: '', color: '#8b5cf6', IconComp: IconPinned },
    { label: 'Categories', value: categories, suffix: '', color: '#3b82f6', IconComp: IconCategories },
    { label: 'Latest', value: 0, suffix: '', color: '#22c55e', IconComp: IconLatest, text: latestDate },
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
    <motion.div variants={itemVariants} className="mb-6 flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat.key
        const Icon = cat.icon
        return (
          <button
            key={cat.key}
            onClick={() => onChange(cat.key)}
            className="relative flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide transition-all duration-200"
            style={{
              borderColor: isActive ? `${cat.color}60` : 'rgba(42, 42, 90, 0.4)',
              backgroundColor: isActive ? `${cat.color}12` : 'transparent',
              color: isActive ? cat.color : '#94a3b8',
            }}
          >
            <Icon className="h-3 w-3" />
            {cat.label}
            {isActive && (
              <motion.div
                layoutId="tavern-filter-active"
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

// ─── Post Card ──────────────────────────────────────────────────────────

function PostCard({
  post,
  onEdit,
  onDelete,
}: {
  post: BlogPostData
  onEdit: (post: BlogPostData) => void
  onDelete: (post: BlogPostData) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const [expanded, setExpanded] = useState(false)

  const tags = post.tags ? post.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
  const date = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const catColor = CATEGORY_COLORS[post.category] || '#8b5cf6'

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      layout
    >
      <GlassCard
        accentColor={`${post.color}30`}
        hover={!expanded}
        corners={true}
        glow={post.pinned}
        className="p-5"
        style={{
          borderColor: post.pinned ? `${post.color}40` : undefined,
        }}
      >
        {/* Pin + Category + Date row */}
        <div className="mb-3 flex items-center gap-2">
          {post.pinned && (
            <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wider text-accent-gold uppercase">
              <Pin className="h-3 w-3" />
              Pinned
            </span>
          )}
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase"
            style={{ color: catColor, backgroundColor: `${catColor}12` }}
          >
            {post.category}
          </span>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-text-muted">
            <Calendar className="h-3 w-3" />
            {date}
          </span>
        </div>

        {/* Title */}
        <h3
          className="mb-2 cursor-pointer font-heading text-base tracking-wide text-text-primary transition-colors hover:text-accent-gold"
          onClick={() => setExpanded(!expanded)}
        >
          {post.title}
        </h3>

        {/* Content */}
        <div
          className={`text-xs leading-relaxed text-text-secondary ${!expanded ? 'line-clamp-3' : ''}`}
          onClick={() => !expanded && setExpanded(true)}
          style={{ cursor: !expanded ? 'pointer' : undefined }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(expanded ? post.content : post.content.slice(0, 200)) }}
        />

        {!expanded && post.content.length > 200 && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-1 text-[11px] font-medium text-accent-purple hover:text-accent-purple/80"
          >
            Read more...
          </button>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px]"
                style={{
                  color: `${post.color}cc`,
                  borderColor: `${post.color}25`,
                  backgroundColor: `${post.color}08`,
                }}
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 border-t border-border-subtle/30 pt-3">
          <button
            onClick={() => onEdit(post)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] text-text-muted transition-colors hover:bg-accent-purple/10 hover:text-accent-purple"
          >
            <Edit3 className="h-3 w-3" />
            Edit
          </button>
          <button
            onClick={() => onDelete(post)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
          {expanded && (
            <button
              onClick={() => setExpanded(false)}
              className="ml-auto text-[11px] text-text-muted hover:text-text-secondary"
            >
              Collapse
            </button>
          )}
        </div>
      </GlassCard>
    </motion.div>
  )
}

// ─── Social Links Panel ─────────────────────────────────────────────────

function SocialLinksPanel() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <p className="mb-4 font-heading text-xs tracking-wider text-text-muted uppercase">
        Social Links
      </p>
      <div className="space-y-2">
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-lg border border-border-subtle/30 bg-bg-card/20 px-4 py-3 transition-all duration-200 hover:border-border-subtle/50 hover:bg-bg-card/40"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200"
              style={{ backgroundColor: `${link.color}12`, color: link.color }}
            >
              {link.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">{link.name}</p>
              <p className="text-[10px] text-text-muted">View profile</p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-text-muted transition-colors group-hover:text-text-secondary" />
          </a>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Tag Cloud ──────────────────────────────────────────────────────────

function TagCloud({ posts }: { posts: BlogPostData[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

  const allTags = useMemo(() => {
    const map = new Map<string, number>()
    posts.forEach((p) => {
      if (p.tags) {
        p.tags.split(',').map((t) => t.trim()).filter(Boolean).forEach((t) => {
          map.set(t, (map.get(t) || 0) + 1)
        })
      }
    })
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [posts])

  const maxCount = Math.max(...allTags.map(([, c]) => c), 1)

  if (allTags.length === 0) return null

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <p className="mb-4 font-heading text-xs tracking-wider text-text-muted uppercase">
        Tag Cloud
      </p>
      <div className="flex flex-wrap gap-2">
        {allTags.map(([tag, count], i) => {
          const scale = 0.7 + (count / maxCount) * 0.3
          return (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="inline-flex items-center gap-1 rounded-md border border-accent-purple/20 bg-accent-purple/5 px-2 py-1"
              style={{ fontSize: `${scale * 0.75}rem`, color: '#a78bfa' }}
            >
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </motion.span>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Pinned Post Highlight ──────────────────────────────────────────────

function PinnedHighlight({ post }: { post: BlogPostData | undefined }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

  if (!post) return null

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <p className="mb-4 font-heading text-xs tracking-wider text-text-muted uppercase">
        Featured Scroll
      </p>
      <GlassCard
        accentColor={`${post.color}40`}
        hover={true}
        corners={true}
        glow={true}
        className="p-4"
      >
        <div className="mb-2 flex items-center gap-2">
          <Pin className="h-3.5 w-3.5 text-accent-gold" />
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase"
            style={{ color: post.color, backgroundColor: `${post.color}12` }}
          >
            {post.category}
          </span>
        </div>
        <h4 className="mb-2 font-heading text-sm tracking-wide text-text-primary">{post.title}</h4>
        <p className="line-clamp-4 text-xs leading-relaxed text-text-secondary">
          {post.content.replace(/[#*\-[\]]/g, '').slice(0, 150)}...
        </p>
        <p className="mt-2 text-[10px] text-text-muted">
          {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </GlassCard>
    </motion.div>
  )
}

// ─── Create/Edit Modal ──────────────────────────────────────────────────

function PostFormModal({
  open,
  onClose,
  onSave,
  initialData,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: BlogPostCreate) => void
  initialData?: BlogPostData | null
}) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [category, setCategory] = useState(initialData?.category ?? 'update')
  const [tags, setTags] = useState(initialData?.tags ?? '')
  const [pinned, setPinned] = useState(initialData?.pinned ?? false)
  const [showPreview, setShowPreview] = useState(false)

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return
    onSave({
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tags.trim(),
      color: CATEGORY_COLORS[category] || '#8b5cf6',
      pinned,
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit Post' : 'New Post'}
      accentColor={CATEGORY_COLORS[category] || '#8b5cf6'}
    >
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="mb-1 block text-[11px] font-medium tracking-wider text-text-muted uppercase">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Your post title..."
            className="w-full rounded-lg border border-border-subtle/40 bg-bg-primary/60 px-3 py-2 text-sm text-text-primary placeholder-text-muted/50 outline-none transition-colors focus:border-accent-purple/50"
          />
        </div>

        {/* Content */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-[11px] font-medium tracking-wider text-text-muted uppercase">
              Content (Markdown)
            </label>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-[10px] text-accent-purple hover:text-accent-purple/80"
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
          </div>
          {showPreview ? (
            <div
              className="min-h-[160px] rounded-lg border border-border-subtle/40 bg-bg-primary/60 p-3 text-xs leading-relaxed text-text-secondary"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post in markdown..."
              rows={8}
              className="w-full resize-y rounded-lg border border-border-subtle/40 bg-bg-primary/60 px-3 py-2 text-sm text-text-primary placeholder-text-muted/50 outline-none transition-colors focus:border-accent-purple/50"
            />
          )}
        </div>

        {/* Category */}
        <div>
          <label className="mb-1 block text-[11px] font-medium tracking-wider text-text-muted uppercase">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {(['update', 'project', 'achievement', 'thought'] as const).map((cat) => {
              const color = CATEGORY_COLORS[cat]
              const isSelected = category === cat
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className="rounded-full border px-3 py-1 text-xs font-medium capitalize transition-all"
                  style={{
                    borderColor: isSelected ? `${color}60` : 'rgba(42, 42, 90, 0.4)',
                    backgroundColor: isSelected ? `${color}15` : 'transparent',
                    color: isSelected ? color : '#94a3b8',
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1 block text-[11px] font-medium tracking-wider text-text-muted uppercase">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="react, typescript, ai..."
            className="w-full rounded-lg border border-border-subtle/40 bg-bg-primary/60 px-3 py-2 text-sm text-text-primary placeholder-text-muted/50 outline-none transition-colors focus:border-accent-purple/50"
          />
        </div>

        {/* Pinned toggle */}
        <label className="flex cursor-pointer items-center gap-3">
          <div
            className={`relative h-5 w-9 rounded-full transition-colors ${pinned ? 'bg-accent-gold/40' : 'bg-bg-primary'}`}
            onClick={() => setPinned(!pinned)}
          >
            <div
              className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${
                pinned ? 'left-[18px] bg-accent-gold' : 'left-0.5 bg-text-muted/40'
              }`}
            />
          </div>
          <span className="text-xs text-text-secondary">Pin this post</span>
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-border-subtle/40 px-4 py-2 text-xs text-text-muted transition-colors hover:bg-bg-card"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim()}
            className="rounded-lg px-4 py-2 text-xs font-medium text-white transition-all disabled:opacity-40"
            style={{
              background: `linear-gradient(135deg, ${CATEGORY_COLORS[category] || '#8b5cf6'}, ${CATEGORY_COLORS[category] || '#8b5cf6'}cc)`,
            }}
          >
            {initialData ? 'Save Changes' : 'Publish Post'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Delete Confirmation Modal ──────────────────────────────────────────

function DeleteConfirmModal({
  post,
  onClose,
  onConfirm,
}: {
  post: BlogPostData | null
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Modal
      open={!!post}
      onClose={onClose}
      title="Delete Post"
      accentColor="#ef4444"
    >
      <p className="mb-2 text-sm text-text-secondary">
        Are you sure you want to delete this post?
      </p>
      {post && (
        <p className="mb-6 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 font-heading text-sm text-text-primary">
          {post.title}
        </p>
      )}
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-lg border border-border-subtle/40 px-4 py-2 text-xs text-text-muted transition-colors hover:bg-bg-card"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="rounded-lg bg-red-500/80 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-red-500"
        >
          Delete
        </button>
      </div>
    </Modal>
  )
}

// ─── Main TavernBoard Page ──────────────────────────────────────────────

export default function TavernBoard() {
  const { data, loading } = useAPI(
    () => api.getBlogPosts(),
    { posts: FALLBACK_POSTS, total: FALLBACK_POSTS.length }
  )

  const [additions, setAdditions] = useState<BlogPostData[]>([])
  const [deletedIds, setDeletedIds] = useState<number[]>([])
  const [edits, setEdits] = useState<Record<number, BlogPostData>>({})
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPostData | null>(null)
  const [deletingPost, setDeletingPost] = useState<BlogPostData | null>(null)

  // Derive posts from API data + local mutations (no setState in effects)
  const posts = useMemo(() => {
    const base = data.posts
      .filter((p) => !deletedIds.includes(p.id))
      .map((p) => edits[p.id] || p)
    return [...additions, ...base]
  }, [data.posts, additions, deletedIds, edits])

  const filteredPosts = useMemo(() => {
    let result = posts
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory)
    }
    return [...result].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return b.created_at.localeCompare(a.created_at)
    })
  }, [posts, activeCategory])

  const pinnedPost = useMemo(() => posts.find((p) => p.pinned), [posts])

  const handleCreate = useCallback(async (formData: BlogPostCreate) => {
    const result = await api.createBlogPost(formData)
    const newPost: BlogPostData = result ?? {
      id: Date.now(),
      title: formData.title,
      content: formData.content,
      category: (formData.category || 'update') as BlogPostData['category'],
      tags: formData.tags || '',
      color: formData.color || '#8b5cf6',
      pinned: formData.pinned || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setAdditions((prev) => [newPost, ...prev])
    setCreateModalOpen(false)
  }, [])

  const handleEdit = useCallback(async (formData: BlogPostCreate) => {
    if (!editingPost) return
    const result = await api.updateBlogPost(editingPost.id, formData)
    const updated: BlogPostData = result ?? {
      ...editingPost,
      ...formData,
      category: (formData.category || editingPost.category) as BlogPostData['category'],
      color: formData.color || editingPost.color,
      updated_at: new Date().toISOString(),
    }
    // Update in edits map or in additions list
    setEdits((prev) => ({ ...prev, [editingPost.id]: updated }))
    setAdditions((prev) => prev.map((p) => (p.id === editingPost.id ? updated : p)))
    setEditingPost(null)
  }, [editingPost])

  const handleDelete = useCallback(async () => {
    if (!deletingPost) return
    await api.deleteBlogPost(deletingPost.id)
    setDeletedIds((prev) => [...prev, deletingPost.id])
    setAdditions((prev) => prev.filter((p) => p.id !== deletingPost.id))
    setDeletingPost(null)
  }, [deletingPost])

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <PageHeader
        title="Tavern Board"
        subtitle="Pin your stories, share your journey"
        gradient="linear-gradient(135deg, #8b5cf6, #a78bfa, #c4b5fd)"
        glowColor="rgba(139, 92, 246, 0.2)"
      />

      {/* Stats Bar */}
      <TavernStatsBar posts={posts} />

      {/* Category Filters + New Post button */}
      <motion.div variants={itemVariants} className="mb-6 flex flex-wrap items-center gap-3">
        <CategoryFilters active={activeCategory} onChange={setActiveCategory} />
        <button
          onClick={() => setCreateModalOpen(true)}
          className="ml-auto flex items-center gap-2 rounded-lg border border-accent-purple/40 bg-accent-purple/10 px-4 py-2 text-xs font-medium text-accent-purple transition-all hover:bg-accent-purple/20"
        >
          <Plus className="h-3.5 w-3.5" />
          New Post
        </button>
      </motion.div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Posts feed */}
        <div className="space-y-4 lg:col-span-3">
          {loading && posts.length === 0 && (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-accent-purple/30 border-t-accent-purple" />
              <p className="text-sm text-text-muted">Loading posts...</p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onEdit={setEditingPost}
                onDelete={setDeletingPost}
              />
            ))}
          </AnimatePresence>

          {filteredPosts.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center"
            >
              <FileText className="mx-auto mb-3 h-10 w-10 text-text-muted/30" />
              <p className="text-sm text-text-muted">No posts in this category yet.</p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="mt-3 text-xs text-accent-purple hover:text-accent-purple/80"
              >
                Write the first one
              </button>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8 lg:col-span-2">
          <SocialLinksPanel />
          <TagCloud posts={posts} />
          <PinnedHighlight post={pinnedPost} />
        </div>
      </div>

      {/* Modals */}
      {createModalOpen && (
        <PostFormModal
          key="create-modal"
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSave={handleCreate}
        />
      )}

      {editingPost && (
        <PostFormModal
          key={`edit-${editingPost.id}`}
          open={true}
          onClose={() => setEditingPost(null)}
          onSave={handleEdit}
          initialData={editingPost}
        />
      )}

      <DeleteConfirmModal
        post={deletingPost}
        onClose={() => setDeletingPost(null)}
        onConfirm={handleDelete}
      />
    </motion.div>
  )
}
