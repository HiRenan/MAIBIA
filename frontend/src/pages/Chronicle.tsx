import { motion } from 'motion/react'
import { Briefcase, GraduationCap, Rocket, ThumbsUp, MessageCircle, Repeat2 } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const TIMELINE = [
  {
    year: '2024',
    title: 'Full-Stack Developer',
    place: 'Tech Company',
    description: 'Led development of microservices architecture serving 50k+ users',
    icon: Briefcase,
    color: '#f0c040',
  },
  {
    year: '2022',
    title: 'Computer Science Degree',
    place: 'University',
    description: 'Graduated with honors, focus on AI and distributed systems',
    icon: GraduationCap,
    color: '#8b5cf6',
  },
  {
    year: '2021',
    title: 'First Open Source Contribution',
    place: 'GitHub',
    description: 'Contributed to React ecosystem, started building in public',
    icon: Rocket,
    color: '#3b82f6',
  },
]

const LINKEDIN_POST = {
  author: 'Renan Carvalho',
  time: '2 weeks ago',
  content: 'Excited to share my latest project — a gamified career intelligence platform that transforms your developer journey into an RPG adventure...',
  likes: 142,
  comments: 23,
  reposts: 8,
}

export default function Chronicle() {
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="mb-10">
        <h1
          className="font-display text-3xl tracking-wide sm:text-4xl"
          style={{
            background: 'linear-gradient(135deg, #f0c040, #e8a820, #d4940a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 16px rgba(240, 192, 64, 0.2))',
          }}
        >
          Chronicle
        </h1>
        <p className="mt-2 font-body text-sm text-text-muted">
          Your journey through time
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Timeline */}
        <div className="lg:col-span-3">
          <div className="relative pl-8">
            {/* Vertical line */}
            <div className="absolute top-2 bottom-2 left-[11px] w-px bg-gradient-to-b from-accent-gold-dim/40 via-accent-purple/20 to-transparent" />

            {TIMELINE.map((entry, i) => {
              const Icon = entry.icon
              return (
                <motion.div
                  key={entry.year}
                  variants={item}
                  className="relative mb-8 last:mb-0"
                >
                  {/* Node */}
                  <div
                    className="absolute -left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full border"
                    style={{
                      borderColor: `${entry.color}50`,
                      backgroundColor: `${entry.color}15`,
                      boxShadow: `0 0 8px ${entry.color}25`,
                    }}
                  >
                    <Icon className="h-3 w-3" style={{ color: entry.color }} />
                  </div>

                  {/* Content */}
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
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* LinkedIn post */}
        <motion.div variants={item} className="lg:col-span-2">
          <p className="mb-3 font-heading text-xs tracking-wider text-text-muted uppercase">
            Latest from LinkedIn
          </p>
          <div className="rounded-xl border border-border-subtle/30 bg-bg-card/25 p-5 backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-blue/15 font-heading text-sm text-accent-blue">
                RC
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{LINKEDIN_POST.author}</p>
                <p className="text-[10px] text-text-muted">{LINKEDIN_POST.time}</p>
              </div>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-text-secondary">
              {LINKEDIN_POST.content}
            </p>
            <div className="flex items-center gap-5 border-t border-border-subtle/30 pt-3 text-[11px] text-text-muted">
              <span className="flex items-center gap-1.5">
                <ThumbsUp className="h-3 w-3" /> {LINKEDIN_POST.likes}
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle className="h-3 w-3" /> {LINKEDIN_POST.comments}
              </span>
              <span className="flex items-center gap-1.5">
                <Repeat2 className="h-3 w-3" /> {LINKEDIN_POST.reposts}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
