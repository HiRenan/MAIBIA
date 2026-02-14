import { motion } from 'motion/react'
import { Palette, Server, Database, Lock } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const CATEGORIES = [
  {
    name: 'Frontend Arcana',
    icon: Palette,
    color: '#8b5cf6',
    level: 78,
    skills: ['React', 'TypeScript', 'Tailwind', 'Three.js'],
  },
  {
    name: 'Backend Warfare',
    icon: Server,
    color: '#3b82f6',
    level: 65,
    skills: ['Python', 'FastAPI', 'Node.js', 'SQL'],
  },
  {
    name: 'Data Sorcery',
    icon: Database,
    color: '#22c55e',
    level: 52,
    skills: ['Pandas', 'PostgreSQL', 'ETL', 'Analytics'],
  },
]

function SkillNode({ unlocked, color, delay }: { unlocked: boolean; color: string; delay: number }) {
  return (
    <motion.div
      className="relative flex h-8 w-8 items-center justify-center"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.3, type: 'spring', stiffness: 300 }}
    >
      <div
        className="h-4 w-4 rounded-full border-2"
        style={{
          borderColor: unlocked ? color : 'rgba(42, 42, 90, 0.8)',
          backgroundColor: unlocked ? `${color}20` : 'transparent',
          boxShadow: unlocked ? `0 0 8px ${color}40` : 'none',
        }}
      />
      {!unlocked && <Lock className="absolute h-2 w-2 text-text-muted" />}
    </motion.div>
  )
}

export default function SkillTree() {
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="mb-10">
        <h1
          className="font-display text-3xl tracking-wide sm:text-4xl"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #a78bfa, #6d3fd4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 16px rgba(139, 92, 246, 0.25))',
          }}
        >
          Skill Tree
        </h1>
        <p className="mt-2 font-body text-sm text-text-muted">
          Unlock more abilities as you level up
        </p>
      </motion.div>

      {/* Category cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat, ci) => {
          const Icon = cat.icon
          return (
            <motion.div
              key={cat.name}
              variants={item}
              className="group relative overflow-hidden rounded-xl border border-border-subtle/40 bg-bg-card/30 p-6 backdrop-blur-sm"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              style={{ boxShadow: `0 4px 24px -8px ${cat.color}20` }}
            >
              {/* Top glow line */}
              <div
                className="absolute top-0 right-4 left-4 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${cat.color}30, transparent)` }}
              />

              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${cat.color}15`, border: `1px solid ${cat.color}25` }}
                >
                  <Icon className="h-5 w-5" style={{ color: cat.color }} />
                </div>
                <div>
                  <h3 className="font-heading text-sm tracking-wide text-text-primary">{cat.name}</h3>
                  <p className="text-xs text-text-muted">{cat.skills.length} skills unlocked</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="mb-1 flex justify-between text-[10px] text-text-muted">
                  <span className="uppercase tracking-wider">Mastery</span>
                  <span>{cat.level}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-primary">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${cat.color}80, ${cat.color})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.level}%` }}
                    transition={{ duration: 1, delay: 0.4 + ci * 0.15, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Skill tags */}
              <div className="flex flex-wrap gap-1.5">
                {cat.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md border px-2 py-0.5 text-[10px] tracking-wide text-text-secondary"
                    style={{ borderColor: `${cat.color}20`, backgroundColor: `${cat.color}08` }}
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Skill nodes preview */}
              <div className="mt-5 flex items-center justify-center gap-1">
                {[true, true, true, true, false, false].map((unlocked, i) => (
                  <div key={i} className="flex items-center">
                    <SkillNode unlocked={unlocked} color={cat.color} delay={0.6 + ci * 0.15 + i * 0.05} />
                    {i < 5 && (
                      <div
                        className="h-px w-3"
                        style={{ backgroundColor: unlocked ? `${cat.color}40` : 'rgba(42, 42, 90, 0.4)' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
