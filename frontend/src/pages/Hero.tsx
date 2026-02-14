import { motion } from 'motion/react'
import { Shield, Zap, Crown, ChevronRight } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const STATS = [
  { label: 'Level', value: '15', icon: Shield, accent: 'accent-gold', glow: 'rgba(240, 192, 64, 0.15)' },
  { label: 'Total XP', value: '6,450', icon: Zap, accent: 'accent-purple', glow: 'rgba(139, 92, 246, 0.15)' },
  { label: 'Class', value: 'Full-Stack Mage', icon: Crown, accent: 'accent-blue', glow: 'rgba(59, 130, 246, 0.15)' },
]

function CornerBrackets({ color = 'rgba(240, 192, 64, 0.2)' }: { color?: string }) {
  const style = { borderColor: color }
  return (
    <>
      <div className="absolute top-0 left-0 h-3 w-3 border-t-[1.5px] border-l-[1.5px]" style={style} />
      <div className="absolute top-0 right-0 h-3 w-3 border-t-[1.5px] border-r-[1.5px]" style={style} />
      <div className="absolute bottom-0 left-0 h-3 w-3 border-b-[1.5px] border-l-[1.5px]" style={style} />
      <div className="absolute bottom-0 right-0 h-3 w-3 border-b-[1.5px] border-r-[1.5px]" style={style} />
    </>
  )
}

export default function Hero() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex min-h-[80vh] flex-col items-center justify-center text-center"
    >
      {/* Greeting */}
      <motion.p
        variants={item}
        className="mb-3 font-body text-sm tracking-[0.3em] text-text-muted uppercase"
      >
        Welcome, Adventurer
      </motion.p>

      {/* Main title */}
      <motion.h1
        variants={item}
        className="font-display text-4xl leading-tight tracking-wide sm:text-5xl lg:text-6xl"
        style={{
          background: 'linear-gradient(135deg, #f0c040 0%, #e8a820 40%, #f5d060 70%, #b8942e 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 20px rgba(240, 192, 64, 0.2))',
        }}
      >
        Renan Carvalho
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        variants={item}
        className="mt-3 font-heading text-base tracking-widest text-text-secondary sm:text-lg"
      >
        Full-Stack Mage&ensp;•&ensp;Level 15
      </motion.p>

      {/* Ornamental divider */}
      <motion.div variants={item} className="my-8 flex items-center gap-3">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-accent-gold-dim/40" />
        <div className="h-1.5 w-1.5 rotate-45 bg-accent-gold/50" />
        <div className="h-2 w-2 rotate-45 border border-accent-gold/40" />
        <div className="h-1.5 w-1.5 rotate-45 bg-accent-gold/50" />
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent-gold-dim/40" />
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={item} className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              className="group relative rounded-xl border border-border-subtle/50 bg-bg-card/40 p-5 backdrop-blur-sm"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              style={{ boxShadow: `0 4px 24px -4px ${stat.glow}` }}
            >
              <CornerBrackets color={stat.glow.replace('0.15', '0.35')} />
              <Icon className={`mb-3 h-6 w-6 text-${stat.accent}`} strokeWidth={1.5} />
              <p className="font-body text-xs tracking-wider text-text-muted uppercase">{stat.label}</p>
              <p className={`mt-1 font-heading text-xl text-${stat.accent}`}>{stat.value}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* XP Bar */}
      <motion.div variants={item} className="mt-8 w-full max-w-md">
        <div className="mb-2 flex justify-between text-xs text-text-muted">
          <span className="font-heading tracking-wider uppercase">Experience</span>
          <span>6,450 / 10,000 XP</span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-bg-secondary">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #b8942e, #f0c040, #f5d060)',
              boxShadow: '0 0 12px rgba(240, 192, 64, 0.4)',
            }}
            initial={{ width: 0 }}
            animate={{ width: '64.5%' }}
            transition={{ duration: 1.4, ease: 'easeOut', delay: 0.8 }}
          />
        </div>
      </motion.div>

      {/* CTA */}
      <motion.button
        variants={item}
        className="group relative mt-10 flex items-center gap-2 rounded-xl border border-accent-gold-dim/40 bg-accent-gold/5 px-8 py-3 font-heading text-sm tracking-widest text-accent-gold uppercase backdrop-blur-sm transition-all duration-300 hover:border-accent-gold/60 hover:bg-accent-gold/10"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        style={{ boxShadow: '0 0 20px rgba(240, 192, 64, 0.08)' }}
      >
        Begin Your Quest
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </motion.button>
    </motion.div>
  )
}
