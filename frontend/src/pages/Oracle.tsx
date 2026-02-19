import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Sparkles, Send, User, MessageCircle, Brain, Compass, Flame,
  Scroll, BookOpen, Zap, ChevronRight, Star, TrendingUp,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import GlassCard from '../components/ui/GlassCard'
import AnimatedCounter from '../components/ui/AnimatedCounter'
import {
  api,
  type OracleHistoryResponse,
  type OracleStatsResponse,
  type OracleWeeklySummaryResponse,
} from '../services/api'
import { useAPI } from '../hooks/useAPI'

/* ═══════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════ */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

/* ═══════════════════════════════════════════
   TYPES & CONSTANTS
   ═══════════════════════════════════════════ */
interface ChatMsg {
  id?: number
  role: 'oracle' | 'user'
  text: string
  created_at?: string
}

const SUGGESTIONS = [
  { text: 'How can I improve?', icon: TrendingUp },
  { text: 'Analyze my skills', icon: Zap },
  { text: 'Career advice', icon: Compass },
  { text: 'Profile overview', icon: User },
  { text: 'What should I learn?', icon: BookOpen },
  { text: 'My strengths', icon: Flame },
]

const ORACLE_TOPICS = [
  { label: 'Skill Progression', desc: 'Level up your tech abilities' },
  { label: 'Career Path', desc: 'Navigate your developer journey' },
  { label: 'Project Ideas', desc: 'New quests to embark on' },
  { label: 'GitHub Strategy', desc: 'Boost your open-source presence' },
  { label: 'Stat Analysis', desc: 'STR, INT, DEX, WIS breakdown' },
  { label: 'Weekly Focus', desc: 'Actionable goals for this week' },
]

/* ═══════════════════════════════════════════
   FALLBACK DATA
   ═══════════════════════════════════════════ */
const FALLBACK_STATS: OracleStatsResponse = {
  messages_sent: 0, wisdom_score: 70, topics_explored: 0, oracle_level: 1,
}

const FALLBACK_HISTORY: OracleHistoryResponse = {
  messages: [], total: 0, has_more: false,
}

const FALLBACK_WEEKLY: OracleWeeklySummaryResponse = {
  summary: 'Begin your journey by consulting the Oracle. Your wisdom grows with every question asked.',
  xp_gained: 0, quests_completed: 0, skills_practiced: [],
  achievement_progress: 'No data yet', oracle_tip: 'Ask the Oracle about your skills to get started.',
  total_messages: 0,
}

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════ */
function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-purple/15 text-accent-purple">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1.5 rounded-xl rounded-tl-sm border border-accent-purple/15 bg-accent-purple/5 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-accent-purple/60"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  )
}

function TypewriterMessage({ text, onComplete }: { text: string; onComplete: () => void }) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
        onComplete()
      }
    }, 15)
    return () => clearInterval(interval)
  }, [text, onComplete])

  return (
    <>
      {displayed}
      <motion.span
        className="ml-0.5 inline-block h-3.5 w-[2px] bg-accent-purple/70"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />
    </>
  )
}

function MessageBubble({
  msg, isAnimating, onAnimComplete,
}: {
  msg: ChatMsg
  isAnimating: boolean
  onAnimComplete: () => void
}) {
  const isOracle = msg.role === 'oracle'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isOracle ? '' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isOracle ? 'bg-accent-purple/15 text-accent-purple' : 'bg-accent-blue/15 text-accent-blue'
        }`}
      >
        {isOracle ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
          isOracle
            ? 'rounded-tl-sm border border-accent-purple/15 bg-accent-purple/5 text-text-secondary'
            : 'rounded-tr-sm border border-accent-blue/15 bg-accent-blue/5 text-text-secondary'
        }`}
      >
        {isOracle && isAnimating ? (
          <TypewriterMessage text={msg.text} onComplete={onAnimComplete} />
        ) : (
          msg.text
        )}
      </div>
    </motion.div>
  )
}

function StatCard({ icon: Icon, label, value, color, suffix }: {
  icon: typeof MessageCircle; label: string; value: number; color: string; suffix?: string
}) {
  return (
    <GlassCard accentColor={`${color}33`} hover corners className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}15` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <div className="text-right">
          <div className="font-display text-xl tracking-tight text-text-primary">
            <AnimatedCounter value={value} duration={1.2} />{suffix}
          </div>
        </div>
      </div>
      <p className="font-heading mt-2 text-[10px] tracking-[0.2em] text-text-muted uppercase">{label}</p>
    </GlassCard>
  )
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function Oracle() {
  /* ── API data ── */
  const { data: stats, loading: statsLoading } = useAPI<OracleStatsResponse>(
    () => api.getOracleStats(), FALLBACK_STATS,
  )
  const { data: history } = useAPI<OracleHistoryResponse>(
    () => api.getOracleHistory(100, 0), FALLBACK_HISTORY,
  )
  const { data: weekly } = useAPI<OracleWeeklySummaryResponse>(
    () => api.getOracleWeeklySummary(), FALLBACK_WEEKLY,
  )

  /* ── Local state ── */
  const [pendingMessages, setPendingMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [animatingIndex, setAnimatingIndex] = useState(-1)
  const [localStats, setLocalStats] = useState<OracleStatsResponse | null>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  /* ── Derive messages: API history + session messages ── */
  const historyMessages = useMemo<ChatMsg[]>(
    () => history.messages.map((m) => ({ id: m.id, role: m.role as 'oracle' | 'user', text: m.text, created_at: m.created_at })),
    [history],
  )
  const messages = useMemo(() => [...historyMessages, ...pendingMessages], [historyMessages, pendingMessages])
  const showSuggestions = messages.filter((m) => m.role === 'user').length === 0

  /* ── Scroll to bottom ── */
  const scrollToBottom = useCallback(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, isTyping, scrollToBottom])

  /* ── Effective stats (API or local optimistic) ── */
  const effectiveStats = useMemo(() => localStats || stats, [localStats, stats])

  /* ── Send message ── */
  const handleSend = useCallback((text: string) => {
    if (!text.trim() || isTyping) return

    const userMsg: ChatMsg = { role: 'user', text: text.trim() }
    setPendingMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    api.chat(text.trim()).then((result) => {
      const addResponse = (response: string) => {
        const oracleMsg: ChatMsg = { role: 'oracle', text: response }
        setIsTyping(false)
        setPendingMessages((prev) => {
          setAnimatingIndex(historyMessages.length + prev.length)
          return [...prev, oracleMsg]
        })
        // Optimistically update stats
        setLocalStats((prev) => {
          const base = prev || stats
          return { ...base, messages_sent: base.messages_sent + 1 }
        })
      }

      if (result?.text) {
        setTimeout(() => addResponse(result.text), 400 + Math.random() * 400)
      } else {
        setTimeout(() => addResponse(
          'The ancient runes are unclear. Try asking about your skills, career, or technologies.',
        ), 800 + Math.random() * 500)
      }
    })
  }, [isTyping, stats, historyMessages.length])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(input)
    }
  }, [input, handleSend])

  /* ── Render ── */
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-8">
      {/* ── Page Header ── */}
      <PageHeader
        title="The Oracle"
        subtitle="Your AI career advisor — ancient wisdom for modern developers"
        gradient="linear-gradient(135deg, #8b5cf6, #a78bfa, #c084fc)"
        glowColor="rgba(139, 92, 246, 0.3)"
      />

      {/* ── Stats Bar ── */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={MessageCircle} label="Messages Sent" value={effectiveStats.messages_sent} color="#8b5cf6" />
        <StatCard icon={Brain} label="Wisdom Score" value={effectiveStats.wisdom_score} color="#22c55e" />
        <StatCard icon={Compass} label="Topics Explored" value={effectiveStats.topics_explored} color="#3b82f6" />
        <StatCard icon={Star} label="Oracle Level" value={effectiveStats.oracle_level} color="#f0c040" />
      </motion.div>

      {/* ── Main Layout ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ── Left: Chat Interface ── */}
        <motion.div variants={item} className="flex flex-col">
          <GlassCard
            accentColor="rgba(139, 92, 246, 0.15)"
            hover={false}
            corners
            className="flex flex-col"
            style={{ height: 'calc(100vh - 22rem)', minHeight: '420px' }}
          >
            {/* Chat header */}
            <div className="flex items-center gap-2 border-b border-border-subtle/20 px-5 py-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-purple/15">
                <Sparkles className="h-3 w-3 text-accent-purple" />
              </div>
              <span className="font-heading text-[10px] tracking-[0.3em] text-text-muted uppercase">
                Oracle Chamber
              </span>
              {!statsLoading && (
                <span className="ml-auto text-[10px] text-text-muted">
                  Lv.{effectiveStats.oracle_level} — {effectiveStats.messages_sent} messages
                </span>
              )}
            </div>

            {/* Messages area */}
            <div
              ref={chatRef}
              className="flex-1 space-y-4 overflow-y-auto p-5"
              style={{
                background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.02) 0%, rgba(26, 26, 62, 0.15) 100%)',
              }}
            >
              {messages.length === 0 && !isTyping && (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Scroll className="mx-auto mb-3 h-8 w-8 text-accent-purple/30" />
                    <p className="text-xs text-text-muted">The Oracle awaits your questions...</p>
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <MessageBubble
                  key={msg.id || `msg-${i}`}
                  msg={msg}
                  isAnimating={i === animatingIndex}
                  onAnimComplete={() => setAnimatingIndex(-1)}
                />
              ))}

              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <TypingIndicator />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Suggestion chips */}
            <AnimatePresence>
              {showSuggestions && messages.filter((m) => m.role === 'user').length === 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-border-subtle/20 px-5 py-3"
                >
                  <p className="mb-2 text-[10px] text-text-muted uppercase tracking-widest">Suggested</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map(({ text: s, icon: SIcon }) => (
                      <motion.button
                        key={s}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSend(s)}
                        className="flex items-center gap-1.5 rounded-lg border border-accent-purple/20 bg-accent-purple/5 px-3 py-1.5 text-[11px] text-accent-purple/80 transition-colors hover:border-accent-purple/40 hover:bg-accent-purple/10 hover:text-accent-purple"
                      >
                        <SIcon className="h-3 w-3" />
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input bar */}
            <div className="border-t border-border-subtle/20 p-3">
              <div className="flex items-center gap-3 rounded-xl border border-border-subtle/30 bg-bg-primary/30 px-4 py-2.5 transition-colors focus-within:border-accent-purple/30">
                <input
                  type="text"
                  placeholder="Ask the Oracle a question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping}
                  className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted disabled:opacity-50"
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || isTyping}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-purple/15 text-accent-purple transition-all hover:bg-accent-purple/25 disabled:opacity-30"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* ── Right: Sidebar ── */}
        <motion.div variants={item} className="space-y-4">
          {/* Weekly Summary */}
          <GlassCard accentColor="rgba(139, 92, 246, 0.15)" hover={false} corners className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Scroll className="h-4 w-4 text-accent-purple" />
              <h3 className="font-heading text-[10px] tracking-[0.3em] text-text-muted uppercase">
                Weekly Scroll
              </h3>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-text-secondary">
              {weekly.summary}
            </p>

            {/* XP & Quests row */}
            <div className="mb-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-accent-gold/15 bg-accent-gold/5 px-3 py-2 text-center">
                <p className="font-display text-lg text-accent-gold">
                  +<AnimatedCounter value={weekly.xp_gained} duration={1} />
                </p>
                <p className="text-[9px] text-text-muted uppercase tracking-wider">XP Gained</p>
              </div>
              <div className="rounded-lg border border-accent-green/15 bg-accent-green/5 px-3 py-2 text-center">
                <p className="font-display text-lg text-accent-green">
                  <AnimatedCounter value={weekly.quests_completed} duration={0.8} />
                </p>
                <p className="text-[9px] text-text-muted uppercase tracking-wider">Quests Done</p>
              </div>
            </div>

            {/* Skills practiced */}
            {weekly.skills_practiced.length > 0 && (
              <div className="mb-3">
                <p className="mb-1.5 text-[9px] text-text-muted uppercase tracking-wider">Skills Practiced</p>
                <div className="flex flex-wrap gap-1.5">
                  {weekly.skills_practiced.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md border border-accent-purple/20 bg-accent-purple/5 px-2 py-0.5 text-[10px] text-accent-purple/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Achievement progress */}
            <div className="mb-3 rounded-lg border border-border-subtle/20 bg-bg-primary/20 px-3 py-2">
              <p className="text-[9px] text-text-muted uppercase tracking-wider">Achievement Progress</p>
              <p className="mt-0.5 text-xs text-text-secondary">{weekly.achievement_progress}</p>
            </div>

            {/* Oracle tip */}
            <div className="rounded-lg border border-accent-gold/15 bg-accent-gold/5 px-3 py-2.5">
              <div className="mb-1 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-accent-gold" />
                <p className="text-[9px] font-semibold text-accent-gold uppercase tracking-wider">Oracle Tip</p>
              </div>
              <p className="text-[11px] leading-relaxed text-text-secondary">{weekly.oracle_tip}</p>
            </div>
          </GlassCard>

          {/* Oracle Knowledge */}
          <GlassCard accentColor="rgba(59, 130, 246, 0.15)" hover={false} corners className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-accent-blue" />
              <h3 className="font-heading text-[10px] tracking-[0.3em] text-text-muted uppercase">
                Oracle Knowledge
              </h3>
            </div>
            <div className="space-y-2">
              {ORACLE_TOPICS.map((topic) => (
                <button
                  key={topic.label}
                  onClick={() => handleSend(`Tell me about my ${topic.label.toLowerCase()}`)}
                  disabled={isTyping}
                  className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-accent-blue/5 disabled:opacity-50"
                >
                  <ChevronRight className="h-3 w-3 text-accent-blue/40 transition-transform group-hover:translate-x-0.5 group-hover:text-accent-blue/70" />
                  <div>
                    <p className="text-[11px] font-medium text-text-primary">{topic.label}</p>
                    <p className="text-[9px] text-text-muted">{topic.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  )
}
