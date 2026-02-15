import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'motion/react'
import { Briefcase, GraduationCap, Rocket, Code, Award, Lightbulb, ThumbsUp, MessageCircle, Repeat2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import PageHeader from '../components/ui/PageHeader'
import AnimatedCounter from '../components/ui/AnimatedCounter'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}
const TIMELINE = [
  {
    year: '2025',
    title: 'AI & Generative Systems',
    place: 'Postgraduate Program',
    description: 'Exploring AI-assisted development, prompt engineering, and building intelligent systems with modern frameworks.',
    icon: Lightbulb,
    color: '#f0c040',
  },
  {
    year: '2024',
    title: 'Full-Stack Developer',
    place: 'Tech Company',
    description: 'Led development of microservices architecture serving 50k+ users. Implemented CI/CD pipelines and performance monitoring.',
    icon: Briefcase,
    color: '#8b5cf6',
  },
  {
    year: '2023',
    title: 'Open Source Maintainer',
    place: 'GitHub',
    description: 'Maintained multiple open source packages with 200+ stars combined. Built developer tools used by hundreds of devs.',
    icon: Code,
    color: '#3b82f6',
  },
  {
    year: '2022',
    title: 'Computer Science Degree',
    place: 'University',
    description: 'Graduated with honors, focus on AI and distributed systems. Published research on data pipeline optimization.',
    icon: GraduationCap,
    color: '#22c55e',
  },
  {
    year: '2021',
    title: 'First Open Source Contribution',
    place: 'GitHub',
    description: 'Contributed to React ecosystem, started building in public. First PR merged into a major project.',
    icon: Rocket,
    color: '#ef4444',
  },
  {
    year: '2020',
    title: 'Hackathon Winner',
    place: 'Tech Conference',
    description: 'Won first place building a real-time collaborative coding platform in 48 hours.',
    icon: Award,
    color: '#f0c040',
  },
]

const LINKEDIN_POSTS = [
  {
    id: 1,
    author: 'Renan Carvalho',
    time: '2 weeks ago',
    content: 'Excited to share my latest project — a gamified career intelligence platform that transforms your developer journey into an RPG adventure! Built with React, Three.js, and FastAPI.',
    likes: 142,
    comments: 23,
    reposts: 8,
  },
  {
    id: 2,
    author: 'Renan Carvalho',
    time: '1 month ago',
    content: 'Just shipped a major update to our ML pipeline engine — 3x faster data processing with the new streaming architecture. The power of async Python never ceases to amaze me.',
    likes: 89,
    comments: 15,
    reposts: 5,
  },
  {
    id: 3,
    author: 'Renan Carvalho',
    time: '2 months ago',
    content: 'Reflecting on my journey from writing my first "Hello World" to leading a dev team. The best advice I can give: build projects that excite you, and never stop learning.',
    likes: 234,
    comments: 41,
    reposts: 12,
  },
]

function TimelineEntry({ entry, index }: { entry: typeof TIMELINE[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const Icon = entry.icon
  const isLeft = index % 2 === 0

  return (
    <motion.div
      ref={ref}
      className="relative mb-12 last:mb-0"
      initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
    >
      {/* Desktop: alternating layout */}
      <div className={`hidden md:grid md:grid-cols-[1fr_40px_1fr] md:gap-4`}>
        {/* Left content or spacer */}
        {isLeft ? (
          <div className="flex justify-end">
            <div className="max-w-sm rounded-xl border border-border-subtle/30 bg-bg-card/25 p-4 backdrop-blur-sm">
              <span
                className="mb-1 inline-block rounded-md px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase"
                style={{ color: entry.color, backgroundColor: `${entry.color}12` }}
              >
                {entry.year}
              </span>
              <h3 className="font-heading text-sm tracking-wide text-text-primary">{entry.title}</h3>
              <p className="text-xs text-text-muted">{entry.place}</p>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">{entry.description}</p>
            </div>
          </div>
        ) : (
          <div />
        )}

        {/* Center node */}
        <div className="flex justify-center">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full border"
            style={{
              borderColor: `${entry.color}50`,
              backgroundColor: `${entry.color}15`,
              boxShadow: `0 0 10px ${entry.color}30`,
            }}
          >
            <Icon className="h-3.5 w-3.5" style={{ color: entry.color }} />
          </div>
        </div>

        {/* Right content or spacer */}
        {!isLeft ? (
          <div>
            <div className="max-w-sm rounded-xl border border-border-subtle/30 bg-bg-card/25 p-4 backdrop-blur-sm">
              <span
                className="mb-1 inline-block rounded-md px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase"
                style={{ color: entry.color, backgroundColor: `${entry.color}12` }}
              >
                {entry.year}
              </span>
              <h3 className="font-heading text-sm tracking-wide text-text-primary">{entry.title}</h3>
              <p className="text-xs text-text-muted">{entry.place}</p>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">{entry.description}</p>
            </div>
          </div>
        ) : (
          <div />
        )}
      </div>

      {/* Mobile: simple left-aligned */}
      <div className="pl-10 md:hidden">
        <div
          className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border"
          style={{
            borderColor: `${entry.color}50`,
            backgroundColor: `${entry.color}15`,
            boxShadow: `0 0 8px ${entry.color}25`,
          }}
        >
          <Icon className="h-3 w-3" style={{ color: entry.color }} />
        </div>
        <div className="rounded-xl border border-border-subtle/30 bg-bg-card/25 p-4 backdrop-blur-sm">
          <span
            className="mb-1 inline-block rounded-md px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase"
            style={{ color: entry.color, backgroundColor: `${entry.color}12` }}
          >
            {entry.year}
          </span>
          <h3 className="font-heading text-sm tracking-wide text-text-primary">{entry.title}</h3>
          <p className="text-xs text-text-muted">{entry.place}</p>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">{entry.description}</p>
        </div>
      </div>
    </motion.div>
  )
}

function LinkedInCarousel() {
  const [current, setCurrent] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="font-heading text-xs tracking-wider text-text-muted uppercase">
          Latest from LinkedIn
        </p>
        <div className="flex gap-1.5">
          <button
            onClick={() => setCurrent((p) => Math.max(0, p - 1))}
            disabled={current === 0}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-border-subtle/40 text-text-muted transition-colors hover:bg-bg-card disabled:opacity-30"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
          <button
            onClick={() => setCurrent((p) => Math.min(LINKEDIN_POSTS.length - 1, p + 1))}
            disabled={current === LINKEDIN_POSTS.length - 1}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-border-subtle/40 text-text-muted transition-colors hover:bg-bg-card disabled:opacity-30"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <motion.div
          className="flex gap-4"
          animate={{ x: `-${current * 100}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {LINKEDIN_POSTS.map((post) => (
            <div
              key={post.id}
              className="w-full shrink-0 rounded-xl border border-border-subtle/30 bg-bg-card/25 p-5 backdrop-blur-sm"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-blue/15 font-heading text-sm text-accent-blue">
                  RC
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{post.author}</p>
                  <p className="text-[10px] text-text-muted">{post.time}</p>
                </div>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-text-secondary">{post.content}</p>
              <div className="flex items-center gap-5 border-t border-border-subtle/30 pt-3 text-[11px] text-text-muted">
                <span className="flex items-center gap-1.5">
                  <ThumbsUp className="h-3 w-3" />
                  {isInView ? <AnimatedCounter value={post.likes} duration={1.2} /> : 0}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="h-3 w-3" />
                  {isInView ? <AnimatedCounter value={post.comments} duration={1.2} /> : 0}
                </span>
                <span className="flex items-center gap-1.5">
                  <Repeat2 className="h-3 w-3" />
                  {isInView ? <AnimatedCounter value={post.reposts} duration={1.2} /> : 0}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Dots */}
      <div className="mt-3 flex justify-center gap-1.5">
        {LINKEDIN_POSTS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? 'w-4 bg-accent-blue' : 'w-1.5 bg-border-subtle/50'
            }`}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default function Chronicle() {
  const timelineRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start center', 'end center'],
  })
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Chronicle"
        subtitle="Your journey through time"
        gradient="linear-gradient(135deg, #f0c040, #e8a820, #d4940a)"
        glowColor="rgba(240, 192, 64, 0.2)"
      />

      <div className="grid gap-10 lg:grid-cols-5">
        {/* Timeline */}
        <div className="lg:col-span-3" ref={timelineRef}>
          <div className="relative">
            {/* Animated vertical line (desktop) */}
            <div className="absolute top-0 bottom-0 left-1/2 hidden -translate-x-1/2 md:block">
              <div className="h-full w-px bg-border-subtle/20" />
              <motion.div
                className="absolute top-0 left-0 w-px bg-gradient-to-b from-accent-gold-dim/60 via-accent-purple/40 to-accent-blue/40"
                style={{ height: lineHeight }}
              />
            </div>

            {/* Mobile vertical line */}
            <div className="absolute top-0 bottom-0 left-[13px] md:hidden">
              <div className="h-full w-px bg-border-subtle/20" />
              <motion.div
                className="absolute top-0 left-0 w-px bg-gradient-to-b from-accent-gold-dim/60 via-accent-purple/40 to-accent-blue/40"
                style={{ height: lineHeight }}
              />
            </div>

            {TIMELINE.map((entry, i) => (
              <TimelineEntry key={entry.year} entry={entry} index={i} />
            ))}
          </div>
        </div>

        {/* LinkedIn carousel */}
        <div className="lg:col-span-2">
          <LinkedInCarousel />
        </div>
      </div>
    </motion.div>
  )
}
