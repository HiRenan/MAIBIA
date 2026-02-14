import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { Shield, Zap, Crown, ChevronRight, Trophy, Code, GitBranch, Star } from 'lucide-react'
import AnimatedCounter from '../components/ui/AnimatedCounter'
import GlassCard from '../components/ui/GlassCard'

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
  { label: 'Level', value: 15, display: '15', icon: Shield, accent: 'accent-gold', glow: 'rgba(240, 192, 64, 0.15)', link: '/skills' },
  { label: 'Total XP', value: 6450, display: '6,450', icon: Zap, accent: 'accent-purple', glow: 'rgba(139, 92, 246, 0.15)', link: '/quests' },
  { label: 'Class', value: 0, display: 'Full-Stack Mage', icon: Crown, accent: 'accent-blue', glow: 'rgba(59, 130, 246, 0.15)', link: '/guild' },
]

const BADGES = [
  { label: 'First Commit', icon: GitBranch, color: '#22c55e' },
  { label: 'Polyglot', icon: Code, color: '#3b82f6' },
  { label: 'Star Collector', icon: Star, color: '#f0c040' },
  { label: 'Quest Master', icon: Trophy, color: '#8b5cf6' },
]

function useTypewriter(text: string, speed = 60, delay = 800) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    let i = 0
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1))
          i++
        } else {
          clearInterval(interval)
        }
      }, speed)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timeout)
  }, [text, speed, delay])

  return displayed
}

export default function Hero() {
  const navigate = useNavigate()
  const subtitle = useTypewriter('Full-Stack Mage  \u2022  Level 15', 50, 600)

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

      {/* Avatar with glowing border */}
      <motion.div
        variants={item}
        className="relative mb-6"
      >
        <div className="avatar-glow-ring relative flex h-24 w-24 items-center justify-center rounded-full sm:h-28 sm:w-28">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-bg-secondary font-display text-2xl text-accent-gold sm:h-24 sm:w-24 sm:text-3xl">
            RC
          </div>
        </div>
        {/* Pulse ring */}
        <div className="absolute inset-0 animate-ping rounded-full border border-accent-gold/20" style={{ animationDuration: '3s' }} />
      </motion.div>

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

      {/* Typing subtitle */}
      <motion.p
        variants={item}
        className="mt-3 h-7 font-heading text-base tracking-widest text-text-secondary sm:text-lg"
      >
        {subtitle}
        <span className="ml-0.5 inline-block w-[2px] animate-pulse bg-accent-gold/60" style={{ height: '1em' }} />
      </motion.p>

      {/* Ornamental divider */}
      <motion.div variants={item} className="my-8 flex items-center gap-3">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-accent-gold-dim/40" />
        <div className="h-1.5 w-1.5 rotate-45 bg-accent-gold/50" />
        <div className="h-2 w-2 rotate-45 border border-accent-gold/40" />
        <div className="h-1.5 w-1.5 rotate-45 bg-accent-gold/50" />
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent-gold-dim/40" />
      </motion.div>

      {/* Stat cards — clickable, with animated counters */}
      <motion.div variants={item} className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <GlassCard
              key={stat.label}
              accentColor={stat.glow.replace('0.15', '0.35')}
              glow
              className="cursor-pointer p-5"
              onClick={() => navigate(stat.link)}
              style={{ boxShadow: `0 4px 24px -4px ${stat.glow}` }}
            >
              <Icon className={`mb-3 h-6 w-6 text-${stat.accent}`} strokeWidth={1.5} />
              <p className="font-body text-xs tracking-wider text-text-muted uppercase">{stat.label}</p>
              {stat.value > 0 ? (
                <AnimatedCounter
                  value={stat.value}
                  duration={1.8}
                  separator=","
                  className={`mt-1 block font-heading text-xl text-${stat.accent}`}
                />
              ) : (
                <p className={`mt-1 font-heading text-xl text-${stat.accent}`}>{stat.display}</p>
              )}
            </GlassCard>
          )
        })}
      </motion.div>

      {/* Achievement badges */}
      <motion.div variants={item} className="mt-6 flex flex-wrap justify-center gap-2">
        {BADGES.map((badge, i) => {
          const Icon = badge.icon
          return (
            <motion.div
              key={badge.label}
              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-heading text-[10px] tracking-wider"
              style={{
                color: badge.color,
                borderColor: `${badge.color}30`,
                backgroundColor: `${badge.color}08`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.2 + i * 0.1, type: 'spring', stiffness: 400, damping: 15 }}
              whileHover={{ scale: 1.08 }}
            >
              <Icon className="h-3 w-3" />
              {badge.label}
            </motion.div>
          )
        })}
      </motion.div>

      {/* XP Bar */}
      <motion.div variants={item} className="mt-8 w-full max-w-md">
        <div className="mb-2 flex justify-between text-xs text-text-muted">
          <span className="font-heading tracking-wider uppercase">Experience</span>
          <span>
            <AnimatedCounter value={6450} duration={1.4} separator="," /> / 10,000 XP
          </span>
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
        onClick={() => navigate('/quests')}
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
