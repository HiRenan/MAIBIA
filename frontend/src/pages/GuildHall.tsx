import { motion } from 'motion/react'
import { Upload, Wand2, Swords, Brain, Eye, Heart } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const STATS_RPG = [
  { name: 'STR', label: 'Strength', value: 72, color: '#ef4444', icon: Swords, desc: 'Problem Solving' },
  { name: 'INT', label: 'Intelligence', value: 88, color: '#8b5cf6', icon: Brain, desc: 'Technical Knowledge' },
  { name: 'DEX', label: 'Dexterity', value: 65, color: '#3b82f6', icon: Eye, desc: 'Adaptability' },
  { name: 'WIS', label: 'Wisdom', value: 70, color: '#22c55e', icon: Heart, desc: 'Soft Skills' },
]

export default function GuildHall() {
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="mb-10">
        <h1
          className="font-display text-3xl tracking-wide sm:text-4xl"
          style={{
            background: 'linear-gradient(135deg, #22c55e, #4ade80, #16a34a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 16px rgba(34, 197, 94, 0.2))',
          }}
        >
          Guild Hall
        </h1>
        <p className="mt-2 font-body text-sm text-text-muted">
          Your character sheet and credentials
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Character sheet */}
        <motion.div
          variants={item}
          className="relative rounded-xl border border-border-subtle/40 bg-bg-card/30 p-6 backdrop-blur-sm"
        >
          {/* Corner ornaments */}
          <div className="absolute top-0 left-0 h-4 w-4 border-t-[1.5px] border-l-[1.5px] border-accent-green/25" />
          <div className="absolute top-0 right-0 h-4 w-4 border-t-[1.5px] border-r-[1.5px] border-accent-green/25" />
          <div className="absolute bottom-0 left-0 h-4 w-4 border-b-[1.5px] border-l-[1.5px] border-accent-green/25" />
          <div className="absolute bottom-0 right-0 h-4 w-4 border-b-[1.5px] border-r-[1.5px] border-accent-green/25" />

          <p className="mb-4 font-heading text-[10px] tracking-[0.3em] text-text-muted uppercase">
            Character Sheet
          </p>

          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent-gold/10 font-display text-xl text-accent-gold">
              RC
            </div>
            <div>
              <h3 className="font-heading text-lg tracking-wide text-text-primary">Renan Carvalho</h3>
              <p className="text-xs text-accent-gold">Full-Stack Mage • Level 15</p>
            </div>
          </div>

          {/* Stats bars */}
          <div className="space-y-4">
            {STATS_RPG.map((stat, i) => {
              const Icon = stat.icon
              return (
                <div key={stat.name}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5" style={{ color: stat.color }} />
                      <span className="font-heading text-xs tracking-wider" style={{ color: stat.color }}>
                        {stat.name}
                      </span>
                      <span className="text-[10px] text-text-muted">— {stat.desc}</span>
                    </div>
                    <span className="text-xs font-medium text-text-secondary">{stat.value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-bg-primary">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${stat.color}60, ${stat.color})` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.value}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Upload zone */}
          <motion.div
            variants={item}
            className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-subtle/50 bg-bg-card/15 p-8 text-center transition-colors duration-200 hover:border-accent-green/30 hover:bg-bg-card/25"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-green/10 transition-colors group-hover:bg-accent-green/15">
              <Upload className="h-5 w-5 text-accent-green" />
            </div>
            <p className="font-heading text-sm tracking-wide text-text-secondary">
              Drop your CV scroll here
            </p>
            <p className="mt-1 text-[10px] text-text-muted">PDF, DOC up to 5MB</p>
          </motion.div>

          {/* Analyze button */}
          <motion.button
            variants={item}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent-green/30 bg-accent-green/5 px-6 py-3 font-heading text-sm tracking-widest text-accent-green uppercase backdrop-blur-sm transition-all duration-200 hover:border-accent-green/50 hover:bg-accent-green/10"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Wand2 className="h-4 w-4" />
            Analyze Character Sheet
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
