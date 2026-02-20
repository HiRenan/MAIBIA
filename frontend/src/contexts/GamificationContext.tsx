import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Zap, Trophy, Star, ChevronUp } from 'lucide-react'
import type { GamificationEvent, AchievementData } from '../services/api'

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */
interface Toast {
  id: number
  type: 'xp' | 'achievement' | 'levelup'
  xp?: number
  achievement?: AchievementData
  level?: number
}

interface GamificationContextType {
  showXPGain: (event: GamificationEvent) => void
  profileVersion: number
}

const GamificationContext = createContext<GamificationContextType>({
  showXPGain: () => {},
  profileVersion: 0,
})

// eslint-disable-next-line react-refresh/only-export-components
export const useGamification = () => useContext(GamificationContext)

/* ═══════════════════════════════════════════
   TOAST COMPONENTS
   ═══════════════════════════════════════════ */
function XPToast({ xp }: { xp: number }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: 'rgba(240, 192, 64, 0.15)' }}
      >
        <Zap className="h-4 w-4" style={{ color: '#f0c040' }} />
      </div>
      <div>
        <p className="font-display text-sm tracking-tight text-accent-gold">+{xp} XP</p>
        <p className="text-[10px] text-text-muted">Experience gained</p>
      </div>
    </div>
  )
}

function AchievementToast({ achievement }: { achievement: AchievementData }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${achievement.color}20` }}
      >
        <Trophy className="h-4 w-4" style={{ color: achievement.color }} />
      </div>
      <div>
        <p className="font-heading text-[10px] tracking-[0.2em] text-accent-gold uppercase">
          Achievement Unlocked
        </p>
        <p className="text-xs font-medium text-text-primary">{achievement.name}</p>
        <p className="text-[10px] text-text-muted">{achievement.description}</p>
      </div>
    </div>
  )
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2" style={{ maxWidth: 'min(320px, calc(100vw - 2rem))' }}>
      <AnimatePresence mode="popLayout">
        {toasts.slice(0, 3).map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="overflow-hidden rounded-xl border bg-bg-card/90 p-3 shadow-lg backdrop-blur-md"
            style={{
              borderColor: toast.type === 'achievement'
                ? `${toast.achievement?.color || '#8b5cf6'}40`
                : toast.type === 'levelup'
                  ? 'rgba(240, 192, 64, 0.4)'
                  : 'rgba(240, 192, 64, 0.25)',
              boxShadow: toast.type === 'levelup'
                ? '0 0 30px rgba(240, 192, 64, 0.2)'
                : toast.type === 'achievement'
                  ? `0 0 20px ${toast.achievement?.color || '#8b5cf6'}15`
                  : '0 4px 16px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Top glow line */}
            <div
              className="absolute top-0 right-3 left-3 h-px"
              style={{
                background: toast.type === 'achievement'
                  ? `linear-gradient(90deg, transparent, ${toast.achievement?.color || '#8b5cf6'}60, transparent)`
                  : 'linear-gradient(90deg, transparent, rgba(240, 192, 64, 0.5), transparent)',
              }}
            />

            {toast.type === 'xp' && <XPToast xp={toast.xp || 0} />}
            {toast.type === 'achievement' && toast.achievement && (
              <AchievementToast achievement={toast.achievement} />
            )}
            {toast.type === 'levelup' && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-gold/15">
                  <ChevronUp className="h-5 w-5 text-accent-gold" />
                </div>
                <div>
                  <p className="font-heading text-[10px] tracking-[0.2em] text-accent-gold uppercase">
                    Level Up!
                  </p>
                  <p className="font-display text-lg text-text-primary">Level {toast.level}</p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════════
   LEVEL-UP MODAL
   ═══════════════════════════════════════════ */
function LevelUpModal({ level, onClose }: { level: number | null; onClose: () => void }) {
  useEffect(() => {
    if (level !== null) {
      const timer = setTimeout(onClose, 5000)
      return () => clearTimeout(timer)
    }
  }, [level, onClose])

  return (
    <AnimatePresence>
      {level !== null && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            className="relative flex flex-col items-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Radial burst */}
            <motion.div
              className="absolute h-64 w-64 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(240, 192, 64, 0.3) 0%, transparent 70%)',
              }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Star icon */}
            <motion.div
              initial={{ rotate: -30, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Star className="mb-4 h-12 w-12 text-accent-gold" fill="currentColor" />
            </motion.div>

            {/* Title */}
            <motion.h2
              className="font-display text-4xl tracking-wide sm:text-5xl"
              style={{
                background: 'linear-gradient(135deg, #b8942e, #f0c040, #f5d060)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 20px rgba(240, 192, 64, 0.4))',
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Level Up!
            </motion.h2>

            {/* Level number */}
            <motion.p
              className="mt-2 font-display text-7xl text-accent-gold sm:text-8xl"
              style={{ filter: 'drop-shadow(0 0 30px rgba(240, 192, 64, 0.5))' }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            >
              {level}
            </motion.p>

            <motion.p
              className="mt-3 text-sm text-text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              New abilities await...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════
   PROVIDER
   ═══════════════════════════════════════════ */
export function GamificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [levelUpLevel, setLevelUpLevel] = useState<number | null>(null)
  const [profileVersion, setProfileVersion] = useState(0)

  const addToast = useCallback((toast: Toast, duration: number) => {
    setToasts((prev) => [...prev, toast])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toast.id)), duration)
  }, [])

  const showXPGain = useCallback((event: GamificationEvent) => {
    // XP toast
    addToast({ id: Date.now(), type: 'xp', xp: event.xp_gained }, 4000)

    // Achievement toasts (staggered)
    event.new_achievements.forEach((ach, i) => {
      setTimeout(() => {
        addToast(
          { id: Date.now() + i + 1, type: 'achievement', achievement: ach },
          6000,
        )
      }, (i + 1) * 800)
    })

    // Level-up modal
    if (event.leveled_up) {
      setTimeout(() => setLevelUpLevel(event.new_level), 500)
    }

    // Signal profile refetch
    setProfileVersion((v) => v + 1)
  }, [addToast])

  const closeLevelUp = useCallback(() => setLevelUpLevel(null), [])

  return (
    <GamificationContext.Provider value={{ showXPGain, profileVersion }}>
      {children}
      <ToastStack toasts={toasts} />
      <LevelUpModal level={levelUpLevel} onClose={closeLevelUp} />
    </GamificationContext.Provider>
  )
}
