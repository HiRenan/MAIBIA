import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'

interface BadgeProps {
  label: string
  icon?: LucideIcon
  color?: string
  size?: 'sm' | 'md'
  locked?: boolean
  animate?: boolean
}

export default function Badge({
  label,
  icon: Icon,
  color = '#f0c040',
  size = 'sm',
  locked = false,
  animate = true,
}: BadgeProps) {
  const sizeClasses = size === 'sm'
    ? 'px-2.5 py-1 text-[10px] gap-1.5'
    : 'px-3 py-1.5 text-xs gap-2'

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'

  return (
    <motion.span
      className={`inline-flex items-center rounded-lg border font-heading tracking-wider ${sizeClasses} ${
        locked
          ? 'border-border-subtle/30 bg-bg-card/20 text-text-muted'
          : ''
      }`}
      style={
        locked
          ? undefined
          : {
              color,
              borderColor: `${color}30`,
              backgroundColor: `${color}10`,
            }
      }
      initial={animate ? { scale: 0, opacity: 0 } : undefined}
      animate={animate ? { scale: 1, opacity: 1 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      whileHover={!locked ? { scale: 1.05 } : undefined}
    >
      {Icon && <Icon className={iconSize} />}
      {label}
    </motion.span>
  )
}
