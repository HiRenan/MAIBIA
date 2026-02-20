import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'

interface AnimatedCounterProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  separator?: string
  className?: string
}

export default function AnimatedCounter({
  value,
  duration = 1.5,
  prefix = '',
  suffix = '',
  separator = ',',
  className = '',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return

    let start = 0
    const startTime = performance.now()
    const durationMs = duration * 1000

    function animate(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(eased * value)

      if (current !== start) {
        start = current
        setDisplay(current)
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, value, duration])

  const formatted = separator
    ? display.toLocaleString('en-US')
    : String(display)

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  )
}
