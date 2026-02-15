import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Swords,
  GitBranch,
  ScrollText,
  BookOpen,
  Castle,
  Sparkles,
  Menu,
  X,
  Shield,
} from 'lucide-react'

const NAV_ITEMS = [
  { path: '/', label: 'Hero', icon: Swords, subtitle: 'Home Base' },
  { path: '/skills', label: 'Skill Tree', icon: GitBranch, subtitle: 'Abilities' },
  { path: '/quests', label: 'Quest Log', icon: ScrollText, subtitle: 'Projects' },
  { path: '/chronicle', label: 'Chronicle', icon: BookOpen, subtitle: 'Timeline' },
  { path: '/guild', label: 'Guild Hall', icon: Castle, subtitle: 'Resume' },
  { path: '/oracle', label: 'Oracle', icon: Sparkles, subtitle: 'AI Advisor' },
]

function OrnamentalDivider() {
  return (
    <div className="relative flex items-center justify-center py-3 px-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent-gold-dim/40 to-transparent" />
      <div className="mx-3 flex gap-1">
        <div className="h-1 w-1 rotate-45 bg-accent-gold-dim/50" />
        <div className="h-1.5 w-1.5 rotate-45 bg-accent-gold/60" />
        <div className="h-1 w-1 rotate-45 bg-accent-gold-dim/50" />
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent-gold-dim/40 to-transparent" />
    </div>
  )
}

function XPBar() {
  const [profileData, setProfileData] = useState({ level: 15, xp: 6450, xp_next_level: 10000 })

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || '/api') + '/gamification/profile')
      .then((r) => r.json())
      .then((d) => {
        if (d.level) setProfileData({ level: d.level, xp: d.xp, xp_next_level: d.xp_next_level })
      })
      .catch(() => {})
  }, [])

  const xp = (profileData.xp / profileData.xp_next_level) * 100

  return (
    <div className="px-4 pb-4">
      <div className="relative rounded-lg border border-border-subtle/50 bg-bg-secondary/80 p-3">
        {/* Corner ornaments */}
        <div className="absolute top-0 left-0 h-2 w-2 border-t border-l border-accent-gold/30" />
        <div className="absolute top-0 right-0 h-2 w-2 border-t border-r border-accent-gold/30" />
        <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-accent-gold/30" />
        <div className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-accent-gold/30" />

        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-accent-gold" />
            <span className="font-heading text-[11px] font-semibold tracking-wider text-accent-gold uppercase">
              Level {profileData.level}
            </span>
          </div>
          <span className="font-body text-[10px] text-text-muted">
            {profileData.xp.toLocaleString()} / {profileData.xp_next_level.toLocaleString()} XP
          </span>
        </div>
        <div className="relative h-1.5 overflow-hidden rounded-full bg-bg-primary">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #b8942e, #f0c040, #f5d060)',
              boxShadow: '0 0 8px rgba(240, 192, 64, 0.4)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${xp}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
          />
          {/* Shimmer overlay */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'border-shimmer 3s linear infinite',
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-bg-secondary/90 backdrop-blur-sm lg:hidden"
        aria-label="Toggle navigation"
      >
        {mobileOpen ? (
          <X className="h-5 w-5 text-accent-gold" />
        ) : (
          <Menu className="h-5 w-5 text-accent-gold" />
        )}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.nav
        className={`
          fixed top-0 left-0 z-40 flex h-screen w-64 flex-col
          border-r border-border-subtle/40
          bg-gradient-to-b from-bg-secondary via-bg-primary to-bg-secondary
          transition-transform duration-300 lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Right edge glow line */}
        <div
          className="absolute top-0 right-0 bottom-0 w-px"
          style={{
            background:
              'linear-gradient(to bottom, transparent, rgba(240, 192, 64, 0.15) 20%, rgba(139, 92, 246, 0.1) 50%, rgba(240, 192, 64, 0.15) 80%, transparent)',
          }}
        />

        {/* Logo section */}
        <div className="relative px-5 pt-6 pb-2">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Logo emblem */}
            <div className="relative flex h-10 w-10 items-center justify-center">
              <div
                className="absolute inset-0 rounded-lg rotate-45"
                style={{
                  background: 'linear-gradient(135deg, rgba(240, 192, 64, 0.15), rgba(139, 92, 246, 0.1))',
                  border: '1px solid rgba(240, 192, 64, 0.25)',
                }}
              />
              <Swords className="relative h-5 w-5 text-accent-gold" style={{ animation: 'rune-glow 4s ease-in-out infinite' }} />
            </div>
            <div>
              <h1
                className="font-display text-lg leading-tight tracking-wide text-accent-gold"
                style={{ animation: 'rune-glow 4s ease-in-out infinite' }}
              >
                DevQuest
              </h1>
              <p className="font-body text-[10px] font-light tracking-[0.2em] text-text-muted uppercase">
                Career Intelligence
              </p>
            </div>
          </motion.div>
        </div>

        <OrnamentalDivider />

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-1">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item, index) => {
              const Icon = item.icon
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path)

              return (
                <motion.li
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + index * 0.06 }}
                >
                  <NavLink
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200"
                  >
                    {/* Active indicator — glowing left border */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute top-1 bottom-1 left-0 w-[3px] rounded-full"
                        style={{
                          background: 'linear-gradient(to bottom, #f0c040, #b8942e)',
                          boxShadow: '0 0 8px rgba(240, 192, 64, 0.5), 0 0 16px rgba(240, 192, 64, 0.2)',
                        }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}

                    {/* Active background glow */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                          background:
                            'linear-gradient(90deg, rgba(240, 192, 64, 0.08), rgba(139, 92, 246, 0.03), transparent)',
                        }}
                      />
                    )}

                    {/* Icon */}
                    <motion.div
                      className={`relative flex h-9 w-9 items-center justify-center rounded-md transition-colors duration-200 ${
                        isActive
                          ? 'bg-accent-gold/10 text-accent-gold'
                          : 'bg-bg-card/40 text-text-muted group-hover:bg-bg-card group-hover:text-text-secondary'
                      }`}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2 : 1.5} />
                      {isActive && (
                        <div
                          className="absolute inset-0 rounded-md"
                          style={{
                            boxShadow: 'inset 0 0 8px rgba(240, 192, 64, 0.1)',
                          }}
                        />
                      )}
                    </motion.div>

                    {/* Label */}
                    <div className="relative flex flex-col">
                      <span
                        className={`font-heading text-[13px] tracking-wide transition-colors duration-200 ${
                          isActive ? 'text-accent-gold' : 'text-text-secondary group-hover:text-text-primary'
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="text-[10px] font-light text-text-muted">
                        {item.subtitle}
                      </span>
                    </div>

                    {/* Hover shimmer (non-active) */}
                    {!isActive && (
                      <div className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                        style={{
                          background:
                            'linear-gradient(90deg, rgba(226, 232, 240, 0.02), transparent)',
                        }}
                      />
                    )}
                  </NavLink>
                </motion.li>
              )
            })}
          </ul>
        </div>

        <OrnamentalDivider />

        {/* XP bar at bottom */}
        <XPBar />

        {/* Bottom ember decorations */}
        <div className="absolute bottom-20 left-4 h-1 w-1 rounded-full bg-accent-gold/40" style={{ animation: 'ember-float 3s ease-in-out infinite' }} />
        <div className="absolute bottom-24 left-8 h-0.5 w-0.5 rounded-full bg-accent-gold/30" style={{ animation: 'ember-float 4s ease-in-out infinite 1s' }} />
        <div className="absolute bottom-16 left-6 h-0.5 w-0.5 rounded-full bg-accent-purple/30" style={{ animation: 'ember-float 3.5s ease-in-out infinite 0.5s' }} />
      </motion.nav>
    </>
  )
}
