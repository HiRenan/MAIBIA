import { motion, type HTMLMotionProps } from 'motion/react'
import { forwardRef, type ReactNode } from 'react'

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

interface GlassCardProps extends HTMLMotionProps<'div'> {
  accentColor?: string
  hover?: boolean
  corners?: boolean
  glow?: boolean
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ accentColor = 'rgba(240, 192, 64, 0.2)', hover = true, corners = true, glow = false, className = '', children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={`relative overflow-hidden rounded-xl border border-border-subtle/40 bg-bg-card/30 backdrop-blur-sm ${className}`}
        whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
        style={{
          boxShadow: glow ? `0 4px 24px -4px ${accentColor}` : undefined,
          ...((props.style as object) || {}),
        }}
        {...props}
      >
        {corners && <CornerBrackets color={accentColor} />}
        {children as ReactNode}
      </motion.div>
    )
  }
)

GlassCard.displayName = 'GlassCard'
export default GlassCard
export { CornerBrackets }
