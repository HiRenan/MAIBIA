import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, Send, User } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { api } from '../services/api'

interface Message {
  role: 'oracle' | 'user'
  text: string
}

// Keyword-based mock responses
const RESPONSES: Record<string, string> = {
  improve: 'I sense great potential in your skill tree. Focus on deepening your backend expertise — it will unlock the Full-Stack Paladin class. Contributing to 2-3 more open source projects would earn you the "Community Champion" badge.',
  skill: 'Your Frontend Arcana is strong at Level 78. To reach mastery, I recommend exploring Next.js and server-side rendering. For Backend Warfare, consider learning Docker — it will unlock container orchestration abilities.',
  learn: 'The ancient scrolls suggest these paths: 1) Machine Learning fundamentals for the Data Sorcery branch, 2) Cloud Architecture (AWS/GCP) for deployment mastery, 3) System Design patterns to unlock the Architect class.',
  profile: 'Your developer profile radiates a combined power level of 6,450 XP. You are classified as a Full-Stack Mage, Level 15. Your strongest attributes are INT (88) and STR (72). The weakest area is DEX (65) — focus on adaptability and new frameworks.',
  project: 'Your most impressive quest is DevQuest Portfolio (Legendary rarity, 92/100 score). To boost your quest log further, consider starting a project that combines AI with your existing React skills — perhaps an intelligent code review tool.',
  career: 'The stars align for a Senior Developer path. Your diverse skill set across frontend, backend, and data puts you in a strong position. Consider specializing in one area while maintaining breadth. Technical leadership roles await at Level 20.',
  github: 'Your GitHub presence shows 6 active repositories with 177 combined stars. To increase visibility: 1) Write detailed READMEs, 2) Add live demos, 3) Contribute to trending repositories in your tech stack.',
  react: 'React is one of your strongest abilities at Level 4/5. To reach mastery: explore React Server Components, master advanced hooks patterns, and build a complex state management solution without external libraries.',
  python: 'Your Python mastery is at Level 4/5 — impressive! Consider diving into async Python with asyncio, explore FastAPI middleware patterns, and contribute to the Python ecosystem with a published package.',
  hello: 'Greetings, brave adventurer! I am the Oracle of DevQuest, keeper of ancient coding wisdom. Ask me about your skills, career path, projects, or how to level up your developer profile.',
  help: 'I can advise you on: your skill progression, career path recommendations, project ideas, GitHub profile optimization, specific technologies (React, Python, etc.), and your overall developer level assessment. What interests you?',
}

const DEFAULT_RESPONSE = 'The ancient runes are unclear on this matter. Try asking about your skills, career path, projects, or specific technologies like React and Python. I can also analyze your profile and suggest improvements.'

function getOracleResponse(input: string): string {
  const lower = input.toLowerCase()
  for (const [keyword, response] of Object.entries(RESPONSES)) {
    if (lower.includes(keyword)) return response
  }
  return DEFAULT_RESPONSE
}

const INITIAL_MESSAGE: Message = {
  role: 'oracle',
  text: 'Greetings, adventurer. I am the Oracle of DevQuest. Ask me about your career path, skills to develop, or how to level up your profile.',
}

const SUGGESTIONS = [
  'How can I improve?',
  'What skills should I learn?',
  'Analyze my profile',
  'Tell me about my career path',
]

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

  return <>{displayed}</>
}

export default function Oracle() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [animatingIndex, setAnimatingIndex] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const chatRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  const handleSend = useCallback((text: string) => {
    if (!text.trim() || isTyping) return

    const userMsg: Message = { role: 'user', text: text.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setShowSuggestions(false)
    setIsTyping(true)

    // Try API first, fall back to local responses
    const addResponse = (response: string) => {
      const oracleMsg: Message = { role: 'oracle', text: response }
      setIsTyping(false)
      setMessages((prev) => {
        setAnimatingIndex(prev.length)
        return [...prev, oracleMsg]
      })
    }

    api.chat(text).then((result) => {
      if (result?.text) {
        setTimeout(() => addResponse(result.text), 400 + Math.random() * 400)
      } else {
        setTimeout(() => addResponse(getOracleResponse(text)), 800 + Math.random() * 700)
      }
    })
  }, [isTyping])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(input)
    }
  }, [input, handleSend])

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
      }}
      initial="hidden"
      animate="show"
      className="flex h-[calc(100vh-6rem)] flex-col lg:h-[calc(100vh-5rem)]"
    >
      {/* Header */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
        className="mb-4"
      >
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
        <p className="mt-1 font-body text-sm text-text-muted">
          Your AI career advisor — powered by ancient wisdom
        </p>
      </motion.div>

      {/* Chat area */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
        ref={chatRef}
        className="mb-4 min-h-0 flex-1 overflow-y-auto rounded-xl border border-border-subtle/30 bg-bg-card/20 p-5 backdrop-blur-sm"
        style={{
          background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.03) 0%, rgba(26, 26, 62, 0.3) 100%)',
        }}
      >
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
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
                {msg.role === 'oracle' && i === animatingIndex ? (
                  <TypewriterMessage
                    text={msg.text}
                    onComplete={() => setAnimatingIndex(-1)}
                  />
                ) : (
                  msg.text
                )}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
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
      </motion.div>

      {/* Suggestions */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 flex flex-wrap gap-2"
          >
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSend(suggestion)}
                className="rounded-lg border border-accent-purple/20 bg-accent-purple/5 px-3 py-1.5 text-[11px] text-accent-purple/80 transition-all hover:border-accent-purple/40 hover:bg-accent-purple/10 hover:text-accent-purple"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
        className="flex items-center gap-3 rounded-xl border border-border-subtle/40 bg-bg-card/30 p-3 backdrop-blur-sm transition-colors focus-within:border-accent-purple/30"
      >
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
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-purple/15 text-accent-purple transition-colors hover:bg-accent-purple/25 disabled:opacity-30"
        >
          <Send className="h-4 w-4" />
        </button>
      </motion.div>
    </motion.div>
  )
}
