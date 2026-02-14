import { motion } from 'motion/react'
import { Sparkles, Send, User } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const MESSAGES = [
  {
    role: 'oracle',
    text: 'Greetings, adventurer. I am the Oracle of DevQuest. Ask me about your career path, skills to develop, or how to level up your profile.',
  },
  {
    role: 'user',
    text: 'How can I improve my developer profile?',
  },
  {
    role: 'oracle',
    text: 'I sense great potential in your skill tree. Focus on deepening your backend expertise — it will unlock the Full-Stack Paladin class. Also, contributing to 2-3 more open source projects would earn you the "Community Champion" badge.',
  },
]

const SUGGESTIONS = [
  'How can I improve?',
  'What skills should I learn?',
  'Analyze my profile',
]

export default function Oracle() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col">
      {/* Header */}
      <motion.div variants={item} className="mb-8">
        <div className="flex items-center gap-3">
          <h1
            className="font-display text-3xl tracking-wide sm:text-4xl"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #a78bfa, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 16px rgba(139, 92, 246, 0.3))',
            }}
          >
            The Oracle
          </h1>
          <Sparkles
            className="h-5 w-5 text-accent-purple"
            style={{ animation: 'ember-float 2s ease-in-out infinite' }}
          />
        </div>
        <p className="mt-2 font-body text-sm text-text-muted">
          Your AI career advisor — powered by ancient wisdom
        </p>
      </motion.div>

      {/* Chat area */}
      <motion.div
        variants={item}
        className="mb-4 flex-1 rounded-xl border border-border-subtle/30 bg-bg-card/20 p-5 backdrop-blur-sm"
        style={{
          background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.03) 0%, rgba(26, 26, 62, 0.3) 100%)',
        }}
      >
        <div className="space-y-4">
          {MESSAGES.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.2, duration: 0.4 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  msg.role === 'oracle'
                    ? 'bg-accent-purple/15 text-accent-purple'
                    : 'bg-accent-blue/15 text-accent-blue'
                }`}
              >
                {msg.role === 'oracle' ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                  msg.role === 'oracle'
                    ? 'rounded-tl-sm border border-accent-purple/15 bg-accent-purple/5 text-text-secondary'
                    : 'rounded-tr-sm border border-accent-blue/15 bg-accent-blue/5 text-text-secondary'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Suggestions */}
      <motion.div variants={item} className="mb-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            className="rounded-lg border border-accent-purple/20 bg-accent-purple/5 px-3 py-1.5 text-[11px] text-accent-purple/80 transition-all hover:border-accent-purple/40 hover:bg-accent-purple/10 hover:text-accent-purple"
          >
            {suggestion}
          </button>
        ))}
      </motion.div>

      {/* Input */}
      <motion.div
        variants={item}
        className="flex items-center gap-3 rounded-xl border border-border-subtle/40 bg-bg-card/30 p-3 backdrop-blur-sm transition-colors focus-within:border-accent-purple/30"
      >
        <input
          type="text"
          placeholder="Ask the Oracle a question..."
          className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
          readOnly
        />
        <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-purple/15 text-accent-purple transition-colors hover:bg-accent-purple/25">
          <Send className="h-4 w-4" />
        </button>
      </motion.div>
    </motion.div>
  )
}
