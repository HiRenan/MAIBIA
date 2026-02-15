import { Suspense, lazy, useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import Navbar from './Navbar'

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']

const ParticleBackground = lazy(() => import('../3d/ParticleBackground'))

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [konamiActive, setKonamiActive] = useState(false)
  const [konamiIdx, setKonamiIdx] = useState(0)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === KONAMI[konamiIdx]) {
      const next = konamiIdx + 1
      if (next === KONAMI.length) {
        setKonamiActive((prev) => !prev)
        setKonamiIdx(0)
      } else {
        setKonamiIdx(next)
      }
    } else {
      setKonamiIdx(0)
    }
  }, [konamiIdx])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="relative min-h-screen">
      {/* Background gradient mesh */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(139, 92, 246, 0.06) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 20%, rgba(59, 130, 246, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse 50% 60% at 50% 90%, rgba(240, 192, 64, 0.03) 0%, transparent 50%),
            var(--color-bg-primary)
          `,
        }}
      />

      {/* 3D particle starfield */}
      <Suspense
        fallback={
          <div className="pointer-events-none fixed inset-0 flex items-center justify-center" style={{ zIndex: 0 }}>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold/20 border-t-accent-gold/60" />
          </div>
        }
      >
        <ParticleBackground />
      </Suspense>

      {/* Konami code easter egg */}
      <AnimatePresence>
        {konamiActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-50"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(240,192,64,0.12) 0%, transparent 70%)',
              mixBlendMode: 'screen',
            }}
          >
            <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-lg border border-accent-gold/30 bg-bg-card/80 px-4 py-2 backdrop-blur-sm">
              <p className="font-heading text-sm text-accent-gold animate-[gold-pulse_2s_ease-in-out_infinite]">
                Legendary Mode Activated!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Navbar />

      {/* Main content area */}
      <main className="min-h-screen lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
