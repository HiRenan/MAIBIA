import { motion } from 'motion/react'

interface PageHeaderProps {
  title: string
  subtitle: string
  gradient: string
  glowColor?: string
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function PageHeader({ title, subtitle, gradient, glowColor }: PageHeaderProps) {
  return (
    <motion.div variants={item} className="mb-10">
      <h1
        className="font-display text-3xl tracking-wide sm:text-4xl"
        style={{
          background: gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: glowColor ? `drop-shadow(0 0 16px ${glowColor})` : undefined,
        }}
      >
        {title}
      </h1>
      <p className="mt-2 font-body text-sm text-text-muted">{subtitle}</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-subtle/40 to-transparent" />
        <div className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: glowColor || '#f0c040' }} />
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-subtle/40 to-transparent" />
      </div>
    </motion.div>
  )
}
