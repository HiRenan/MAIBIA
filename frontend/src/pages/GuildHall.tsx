import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Upload, Wand2, Swords, Brain, Eye, Heart, FileText, Download, Trophy, Code, Flame, Shield } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import GlassCard from '../components/ui/GlassCard'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const STATS_RPG = [
  { name: 'STR', label: 'Strength', value: 72, color: '#ef4444', icon: Swords, desc: 'Problem Solving' },
  { name: 'INT', label: 'Intelligence', value: 88, color: '#8b5cf6', icon: Brain, desc: 'Technical Knowledge' },
  { name: 'DEX', label: 'Dexterity', value: 65, color: '#3b82f6', icon: Eye, desc: 'Adaptability' },
  { name: 'WIS', label: 'Wisdom', value: 70, color: '#22c55e', icon: Heart, desc: 'Soft Skills' },
]

const EQUIPMENT = [
  { category: 'Languages', items: ['TypeScript', 'Python', 'Go', 'Rust', 'SQL'], color: '#3b82f6' },
  { category: 'Frameworks', items: ['React', 'FastAPI', 'Node.js', 'Three.js', 'Tailwind'], color: '#8b5cf6' },
  { category: 'Tools', items: ['Git', 'Docker', 'VS Code', 'Figma', 'PostgreSQL'], color: '#22c55e' },
]

const TITLES = [
  { label: 'Bug Hunter', icon: Flame, color: '#ef4444' },
  { label: 'Code Wizard', icon: Code, color: '#8b5cf6' },
  { label: 'Shield Bearer', icon: Shield, color: '#3b82f6' },
  { label: 'Quest Champion', icon: Trophy, color: '#f0c040' },
]

const MOCK_ANALYSIS = {
  score: 85,
  sections: [
    { name: 'Formatting', score: 90, feedback: 'Clean layout with consistent spacing. ATS-friendly format.' },
    { name: 'Keywords', score: 78, feedback: 'Good technical keywords. Add more industry-specific terms.' },
    { name: 'Experience', score: 88, feedback: 'Strong action verbs and quantified achievements.' },
    { name: 'Skills', score: 82, feedback: 'Comprehensive skill list. Consider grouping by proficiency.' },
  ],
}

// SVG Radar chart component
function RadarChart({ stats }: { stats: typeof STATS_RPG }) {
  const size = 180
  const center = size / 2
  const maxR = 65
  const angles = stats.map((_, i) => (i * 2 * Math.PI) / stats.length - Math.PI / 2)

  const points = stats.map((stat, i) => {
    const r = (stat.value / 100) * maxR
    return {
      x: center + r * Math.cos(angles[i]),
      y: center + r * Math.sin(angles[i]),
    }
  })

  const polygon = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[180px]">
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <polygon
          key={scale}
          points={angles.map((a) => `${center + maxR * scale * Math.cos(a)},${center + maxR * scale * Math.sin(a)}`).join(' ')}
          fill="none"
          stroke="rgba(42, 42, 90, 0.4)"
          strokeWidth={0.5}
        />
      ))}

      {/* Axis lines */}
      {angles.map((a, i) => (
        <line
          key={i}
          x1={center} y1={center}
          x2={center + maxR * Math.cos(a)}
          y2={center + maxR * Math.sin(a)}
          stroke="rgba(42, 42, 90, 0.3)"
          strokeWidth={0.5}
        />
      ))}

      {/* Data polygon */}
      <motion.polygon
        points={polygon}
        fill="rgba(34, 197, 94, 0.15)"
        stroke="#22c55e"
        strokeWidth={1.5}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        style={{ transformOrigin: `${center}px ${center}px` }}
      />

      {/* Data points */}
      {points.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x} cy={p.y} r={3}
          fill={stats[i].color}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7 + i * 0.1, type: 'spring' }}
        />
      ))}

      {/* Labels */}
      {stats.map((stat, i) => {
        const labelR = maxR + 16
        return (
          <text
            key={stat.name}
            x={center + labelR * Math.cos(angles[i])}
            y={center + labelR * Math.sin(angles[i])}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fontFamily="Cinzel, serif"
            fill={stat.color}
          >
            {stat.name}
          </text>
        )
      })}
    </svg>
  )
}

export default function GuildHall() {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) return
    setUploadedFile(file.name)
    setShowAnalysis(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleAnalyze = useCallback(() => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      setShowAnalysis(true)
    }, 1500)
  }, [])

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Guild Hall"
        subtitle="Your character sheet and credentials"
        gradient="linear-gradient(135deg, #22c55e, #4ade80, #16a34a)"
        glowColor="rgba(34, 197, 94, 0.2)"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Character sheet */}
        <div className="space-y-6">
          <GlassCard variants={item} accentColor="rgba(34, 197, 94, 0.25)" className="p-6">
            <p className="mb-4 font-heading text-[10px] tracking-[0.3em] text-text-muted uppercase">
              Character Sheet
            </p>

            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent-gold/10 font-display text-xl text-accent-gold">
                RC
              </div>
              <div>
                <h3 className="font-heading text-lg tracking-wide text-text-primary">Renan Carvalho</h3>
                <p className="text-xs text-accent-gold">Full-Stack Mage &bull; Level 15</p>
              </div>
            </div>

            {/* Radar chart */}
            <RadarChart stats={STATS_RPG} />

            {/* Stats bars */}
            <div className="mt-4 space-y-3">
              {STATS_RPG.map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div key={stat.name}>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" style={{ color: stat.color }} />
                        <span className="font-heading text-xs tracking-wider" style={{ color: stat.color }}>
                          {stat.name}
                        </span>
                        <span className="text-[10px] text-text-muted">{stat.desc}</span>
                      </div>
                      <span className="text-xs font-medium text-text-secondary">{stat.value}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-bg-primary">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${stat.color}60, ${stat.color})` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.value}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </GlassCard>

          {/* Titles / Achievements */}
          <motion.div variants={item}>
            <p className="mb-3 font-heading text-[10px] tracking-[0.3em] text-text-muted uppercase">
              Earned Titles
            </p>
            <div className="flex flex-wrap gap-2">
              {TITLES.map((title, i) => {
                const Icon = title.icon
                return (
                  <motion.div
                    key={title.label}
                    className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-heading text-[10px] tracking-wider"
                    style={{
                      color: title.color,
                      borderColor: `${title.color}30`,
                      backgroundColor: `${title.color}08`,
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1, type: 'spring', stiffness: 300 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Icon className="h-3 w-3" />
                    {title.label}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Upload zone */}
          <motion.div
            variants={item}
            className={`group cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
              isDragOver
                ? 'border-accent-green/50 bg-accent-green/10'
                : uploadedFile
                  ? 'border-accent-green/30 bg-bg-card/25'
                  : 'border-border-subtle/50 bg-bg-card/15 hover:border-accent-green/30 hover:bg-bg-card/25'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />

            {uploadedFile ? (
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-8 w-8 text-accent-green" />
                <p className="font-heading text-sm tracking-wide text-accent-green">{uploadedFile}</p>
                <p className="text-[10px] text-text-muted">Click to change file</p>
              </div>
            ) : (
              <>
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-green/10 transition-colors group-hover:bg-accent-green/15">
                  <Upload className="h-5 w-5 text-accent-green" />
                </div>
                <p className="font-heading text-sm tracking-wide text-text-secondary">
                  Drop your CV scroll here
                </p>
                <p className="mt-1 text-[10px] text-text-muted">PDF, DOC up to 5MB</p>
              </>
            )}
          </motion.div>

          {/* Analyze button */}
          <motion.button
            variants={item}
            onClick={handleAnalyze}
            disabled={!uploadedFile || isAnalyzing}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent-green/30 bg-accent-green/5 px-6 py-3 font-heading text-sm tracking-widest text-accent-green uppercase backdrop-blur-sm transition-all duration-200 hover:border-accent-green/50 hover:bg-accent-green/10 disabled:cursor-not-allowed disabled:opacity-40"
            whileHover={uploadedFile ? { scale: 1.02 } : undefined}
            whileTap={uploadedFile ? { scale: 0.98 } : undefined}
          >
            {isAnalyzing ? (
              <>
                <motion.div
                  className="h-4 w-4 rounded-full border-2 border-accent-green/30 border-t-accent-green"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
                Analyzing Scroll...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Analyze Character Sheet
              </>
            )}
          </motion.button>

          {/* Analysis results */}
          <AnimatePresence>
            {showAnalysis && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-accent-purple/20 bg-accent-purple/5 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-accent-purple" />
                    <span className="font-heading text-xs tracking-wider text-accent-purple uppercase">
                      CV Analysis Results
                    </span>
                  </div>

                  {/* Overall score */}
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent-green/40">
                      <motion.span
                        className="font-heading text-xl text-accent-green"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {MOCK_ANALYSIS.score}
                      </motion.span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">Great CV!</p>
                      <p className="text-[10px] text-text-muted">Above average for Full-Stack roles</p>
                    </div>
                  </div>

                  {/* Section scores */}
                  <div className="space-y-3">
                    {MOCK_ANALYSIS.sections.map((section, i) => (
                      <motion.div
                        key={section.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs text-text-primary">{section.name}</span>
                          <span className="text-xs font-medium text-accent-green">{section.score}%</span>
                        </div>
                        <div className="mb-1 h-1 overflow-hidden rounded-full bg-bg-primary">
                          <motion.div
                            className="h-full rounded-full bg-accent-green"
                            initial={{ width: 0 }}
                            animate={{ width: `${section.score}%` }}
                            transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                          />
                        </div>
                        <p className="text-[10px] text-text-muted">{section.feedback}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Equipment slots */}
          <motion.div variants={item}>
            <p className="mb-3 font-heading text-[10px] tracking-[0.3em] text-text-muted uppercase">
              Equipment Slots
            </p>
            <div className="space-y-3">
              {EQUIPMENT.map((eq) => (
                <div key={eq.category}>
                  <p className="mb-1.5 text-[10px] tracking-wider uppercase" style={{ color: eq.color }}>
                    {eq.category}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {eq.items.map((eqItem) => (
                      <span
                        key={eqItem}
                        className="rounded-md border px-2 py-0.5 text-[10px] tracking-wide text-text-secondary"
                        style={{ borderColor: `${eq.color}20`, backgroundColor: `${eq.color}08` }}
                      >
                        {eqItem}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Download button */}
          <motion.button
            variants={item}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-subtle/30 bg-bg-card/20 px-6 py-3 font-heading text-xs tracking-widest text-text-muted uppercase transition-all hover:border-accent-gold/30 hover:text-accent-gold"
          >
            <Download className="h-4 w-4" />
            Download RPG CV
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
