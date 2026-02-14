import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Palette, Server, Database, Lock, Crown, X, Sparkles } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

interface Skill {
  id: string
  name: string
  level: number
  maxLevel: number
  unlocked: boolean
  description: string
  projects: string[]
}

interface Branch {
  id: string
  name: string
  icon: typeof Palette
  color: string
  skills: Skill[]
}

const BRANCHES: Branch[] = [
  {
    id: 'frontend',
    name: 'Frontend Arcana',
    icon: Palette,
    color: '#8b5cf6',
    skills: [
      { id: 'react', name: 'React', level: 4, maxLevel: 5, unlocked: true, description: 'Component-based UI library with hooks, context, and state management patterns.', projects: ['DevQuest', 'Dashboard UI'] },
      { id: 'typescript', name: 'TypeScript', level: 4, maxLevel: 5, unlocked: true, description: 'Strongly typed JavaScript for safer, more maintainable code.', projects: ['DevQuest', 'ML Pipeline'] },
      { id: 'tailwind', name: 'Tailwind CSS', level: 3, maxLevel: 5, unlocked: true, description: 'Utility-first CSS framework for rapid UI development.', projects: ['DevQuest'] },
      { id: 'threejs', name: 'Three.js', level: 2, maxLevel: 5, unlocked: true, description: '3D graphics library for immersive web experiences.', projects: ['DevQuest'] },
      { id: 'nextjs', name: 'Next.js', level: 0, maxLevel: 5, unlocked: false, description: 'React framework for production — SSR, routing, and optimization.', projects: [] },
    ],
  },
  {
    id: 'backend',
    name: 'Backend Warfare',
    icon: Server,
    color: '#3b82f6',
    skills: [
      { id: 'python', name: 'Python', level: 4, maxLevel: 5, unlocked: true, description: 'Versatile language for backend, data science, and scripting.', projects: ['ML Pipeline', 'DevQuest API'] },
      { id: 'fastapi', name: 'FastAPI', level: 3, maxLevel: 5, unlocked: true, description: 'Modern, high-performance Python web framework with auto docs.', projects: ['DevQuest API'] },
      { id: 'nodejs', name: 'Node.js', level: 3, maxLevel: 5, unlocked: true, description: 'JavaScript runtime for server-side applications.', projects: ['Chat API'] },
      { id: 'sql', name: 'SQL', level: 3, maxLevel: 5, unlocked: true, description: 'Database querying and management across multiple engines.', projects: ['ML Pipeline', 'DevQuest'] },
      { id: 'docker', name: 'Docker', level: 0, maxLevel: 5, unlocked: false, description: 'Container orchestration for reproducible deployments.', projects: [] },
    ],
  },
  {
    id: 'data',
    name: 'Data Sorcery',
    icon: Database,
    color: '#22c55e',
    skills: [
      { id: 'pandas', name: 'Pandas', level: 3, maxLevel: 5, unlocked: true, description: 'Data manipulation and analysis library for Python.', projects: ['ML Pipeline'] },
      { id: 'postgresql', name: 'PostgreSQL', level: 3, maxLevel: 5, unlocked: true, description: 'Advanced open-source relational database system.', projects: ['ML Pipeline'] },
      { id: 'etl', name: 'ETL Pipelines', level: 2, maxLevel: 5, unlocked: true, description: 'Extract, Transform, Load workflows for data processing.', projects: ['ML Pipeline'] },
      { id: 'analytics', name: 'Analytics', level: 2, maxLevel: 5, unlocked: true, description: 'Data visualization and business intelligence insights.', projects: ['ML Pipeline'] },
      { id: 'ml', name: 'Machine Learning', level: 0, maxLevel: 5, unlocked: false, description: 'Predictive models and intelligent systems. Requires Level 18.', projects: [] },
    ],
  },
]

// SVG tree layout positions for desktop
const CENTER = { x: 400, y: 280 }
const BRANCH_ANGLES = [-90, 30, 150] // degrees - top, bottom-right, bottom-left
const NODE_SPACING = 70

function getNodePositions(branchIndex: number) {
  const angle = (BRANCH_ANGLES[branchIndex] * Math.PI) / 180
  return Array.from({ length: 5 }, (_, i) => ({
    x: CENTER.x + Math.cos(angle) * NODE_SPACING * (i + 1),
    y: CENTER.y + Math.sin(angle) * NODE_SPACING * (i + 1),
  }))
}

function AnimatedLine({ x1, y1, x2, y2, color, unlocked, delay }: {
  x1: number; y1: number; x2: number; y2: number
  color: string; unlocked: boolean; delay: number
}) {
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

  return (
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={unlocked ? color : 'rgba(42, 42, 90, 0.5)'}
      strokeWidth={unlocked ? 2 : 1}
      strokeDasharray={length}
      initial={{ strokeDashoffset: length }}
      animate={{ strokeDashoffset: 0 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      style={{ filter: unlocked ? `drop-shadow(0 0 4px ${color}40)` : 'none' }}
    />
  )
}

function TreeNode({ x, y, skill, color, delay, onClick, isSelected }: {
  x: number; y: number; skill: Skill; color: string
  delay: number; onClick: () => void; isSelected: boolean
}) {
  const radius = skill.unlocked ? 18 : 14

  return (
    <motion.g
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.3, type: 'spring', stiffness: 300 }}
    >
      {/* Glow ring for unlocked */}
      {skill.unlocked && (
        <motion.circle
          cx={x} cy={y} r={radius + 4}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={0.3}
          animate={{ r: [radius + 4, radius + 8, radius + 4], opacity: [0.3, 0.15, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Main circle */}
      <circle
        cx={x} cy={y} r={radius}
        fill={skill.unlocked ? `${color}20` : 'rgba(26, 26, 62, 0.6)'}
        stroke={isSelected ? '#fff' : skill.unlocked ? color : 'rgba(42, 42, 90, 0.8)'}
        strokeWidth={isSelected ? 2.5 : skill.unlocked ? 2 : 1}
        style={{ filter: skill.unlocked ? `drop-shadow(0 0 6px ${color}50)` : 'none' }}
      />

      {/* Level dots inside */}
      {skill.unlocked && Array.from({ length: skill.maxLevel }).map((_, i) => {
        const dotAngle = ((i / skill.maxLevel) * 2 * Math.PI) - Math.PI / 2
        const dotR = 8
        return (
          <circle
            key={i}
            cx={x + Math.cos(dotAngle) * dotR}
            cy={y + Math.sin(dotAngle) * dotR}
            r={2}
            fill={i < skill.level ? color : `${color}30`}
          />
        )
      })}

      {/* Lock icon for locked nodes */}
      {!skill.unlocked && (
        <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#64748b">
          &#x1F512;
        </text>
      )}

      {/* Label */}
      <text
        x={x}
        y={y + radius + 14}
        textAnchor="middle"
        fontSize="10"
        fontFamily="Cinzel, serif"
        fill={skill.unlocked ? '#e2e8f0' : '#64748b'}
        letterSpacing="0.5"
      >
        {skill.name}
      </text>
    </motion.g>
  )
}

// Detail panel component
function DetailPanel({ skill, branch, onClose }: { skill: Skill; branch: Branch; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="rounded-xl border border-border-subtle/40 bg-bg-card/50 p-5 backdrop-blur-md"
      style={{ boxShadow: `0 0 30px ${branch.color}15` }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${branch.color}15`, border: `1px solid ${branch.color}30` }}
          >
            <Sparkles className="h-4 w-4" style={{ color: branch.color }} />
          </div>
          <div>
            <h3 className="font-heading text-sm tracking-wide text-text-primary">{skill.name}</h3>
            <p className="text-[10px] text-text-muted">{branch.name}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-bg-card hover:text-text-primary"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Level bar */}
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-[10px] text-text-muted">
          <span className="uppercase tracking-wider">Level</span>
          <span>{skill.level} / {skill.maxLevel}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-bg-primary">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${branch.color}80, ${branch.color})` }}
            initial={{ width: 0 }}
            animate={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      <p className="mb-3 text-xs leading-relaxed text-text-secondary">{skill.description}</p>

      {skill.projects.length > 0 && (
        <div>
          <p className="mb-1.5 text-[10px] tracking-wider text-text-muted uppercase">Related Projects</p>
          <div className="flex flex-wrap gap-1.5">
            {skill.projects.map((p) => (
              <span
                key={p}
                className="rounded-md border px-2 py-0.5 text-[10px] text-text-secondary"
                style={{ borderColor: `${branch.color}25`, backgroundColor: `${branch.color}08` }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {!skill.unlocked && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-accent-gold/20 bg-accent-gold/5 px-3 py-2">
          <Lock className="h-3 w-3 text-accent-gold" />
          <span className="text-[10px] text-accent-gold">Requires higher level to unlock</span>
        </div>
      )}
    </motion.div>
  )
}

// Mobile collapsed view
function MobileSkillList({ branches, selectedSkill, onSelect }: {
  branches: Branch[]
  selectedSkill: { branchId: string; skillId: string } | null
  onSelect: (branchId: string, skillId: string) => void
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-4 lg:hidden">
      {branches.map((branch) => {
        const Icon = branch.icon
        const isExpanded = expanded === branch.id
        const unlockedCount = branch.skills.filter((s) => s.unlocked).length

        return (
          <motion.div key={branch.id} variants={item}>
            <button
              onClick={() => setExpanded(isExpanded ? null : branch.id)}
              className="flex w-full items-center justify-between rounded-xl border border-border-subtle/40 bg-bg-card/30 p-4 text-left backdrop-blur-sm transition-colors hover:bg-bg-card-hover/30"
              style={{ boxShadow: `0 2px 12px -4px ${branch.color}20` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${branch.color}15`, border: `1px solid ${branch.color}25` }}
                >
                  <Icon className="h-5 w-5" style={{ color: branch.color }} />
                </div>
                <div>
                  <h3 className="font-heading text-sm tracking-wide text-text-primary">{branch.name}</h3>
                  <p className="text-[10px] text-text-muted">{unlockedCount}/{branch.skills.length} unlocked</p>
                </div>
              </div>
              <motion.span
                animate={{ rotate: isExpanded ? 180 : 0 }}
                className="text-text-muted"
              >
                &#9660;
              </motion.span>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 space-y-2 pl-2">
                    {branch.skills.map((skill) => {
                      const isSelected = selectedSkill?.branchId === branch.id && selectedSkill?.skillId === skill.id
                      return (
                        <motion.button
                          key={skill.id}
                          onClick={() => onSelect(branch.id, skill.id)}
                          className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                            isSelected
                              ? 'border-white/20 bg-bg-card/50'
                              : 'border-border-subtle/20 bg-bg-card/15 hover:bg-bg-card/30'
                          }`}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                        >
                          <div
                            className="h-3 w-3 rounded-full border-2"
                            style={{
                              borderColor: skill.unlocked ? branch.color : 'rgba(42, 42, 90, 0.8)',
                              backgroundColor: skill.unlocked ? `${branch.color}30` : 'transparent',
                              boxShadow: skill.unlocked ? `0 0 6px ${branch.color}40` : 'none',
                            }}
                          />
                          <div className="flex-1">
                            <span className={`text-xs ${skill.unlocked ? 'text-text-primary' : 'text-text-muted'}`}>
                              {skill.name}
                            </span>
                            {skill.unlocked && (
                              <div className="mt-1 flex gap-0.5">
                                {Array.from({ length: skill.maxLevel }).map((_, i) => (
                                  <div
                                    key={i}
                                    className="h-1 w-4 rounded-full"
                                    style={{ backgroundColor: i < skill.level ? branch.color : `${branch.color}20` }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          {!skill.unlocked && <Lock className="h-3 w-3 text-text-muted" />}
                        </motion.button>
                      )
                    })}
                  </div>

                  {/* Detail panel for mobile */}
                  <AnimatePresence>
                    {selectedSkill?.branchId === branch.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2 overflow-hidden pl-2"
                      >
                        <DetailPanel
                          skill={branch.skills.find((s) => s.id === selectedSkill.skillId)!}
                          branch={branch}
                          onClose={() => onSelect('', '')}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}

export default function SkillTree() {
  const [selectedSkill, setSelectedSkill] = useState<{ branchId: string; skillId: string } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [svgSize, setSvgSize] = useState({ width: 800, height: 560 })

  useEffect(() => {
    function resize() {
      if (svgRef.current?.parentElement) {
        const w = svgRef.current.parentElement.clientWidth
        setSvgSize({ width: Math.max(w, 600), height: 560 })
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const cx = svgSize.width / 2

  function handleSelect(branchId: string, skillId: string) {
    if (selectedSkill?.branchId === branchId && selectedSkill?.skillId === skillId) {
      setSelectedSkill(null)
    } else if (branchId && skillId) {
      setSelectedSkill({ branchId, skillId })
    } else {
      setSelectedSkill(null)
    }
  }

  const selectedBranch = selectedSkill ? BRANCHES.find((b) => b.id === selectedSkill.branchId) : null
  const selectedSkillData = selectedBranch?.skills.find((s) => s.id === selectedSkill?.skillId)

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Skill Tree"
        subtitle="Unlock more abilities as you level up"
        gradient="linear-gradient(135deg, #8b5cf6, #a78bfa, #6d3fd4)"
        glowColor="rgba(139, 92, 246, 0.25)"
      />

      {/* Desktop SVG tree */}
      <motion.div variants={item} className="hidden lg:block">
        <div className="grid gap-6" style={{ gridTemplateColumns: selectedSkill ? '1fr 300px' : '1fr' }}>
          <div className="relative rounded-xl border border-border-subtle/20 bg-bg-card/10 p-4 backdrop-blur-sm">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
              className="w-full"
              style={{ minHeight: 500 }}
            >
              {/* Connection lines */}
              {BRANCHES.map((branch, bi) => {
                const positions = getNodePositions(bi).map((p) => ({
                  x: p.x + (cx - CENTER.x),
                  y: p.y,
                }))

                return (
                  <g key={`lines-${branch.id}`}>
                    {/* Center to first node */}
                    <AnimatedLine
                      x1={cx} y1={CENTER.y}
                      x2={positions[0].x} y2={positions[0].y}
                      color={branch.color}
                      unlocked={branch.skills[0].unlocked}
                      delay={0.3 + bi * 0.1}
                    />
                    {/* Node to node */}
                    {positions.slice(0, -1).map((pos, i) => (
                      <AnimatedLine
                        key={i}
                        x1={pos.x} y1={pos.y}
                        x2={positions[i + 1].x} y2={positions[i + 1].y}
                        color={branch.color}
                        unlocked={branch.skills[i + 1].unlocked}
                        delay={0.4 + bi * 0.1 + i * 0.08}
                      />
                    ))}
                  </g>
                )
              })}

              {/* Center node */}
              <motion.g
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              >
                <circle
                  cx={cx} cy={CENTER.y} r={28}
                  fill="rgba(240, 192, 64, 0.1)"
                  stroke="#f0c040"
                  strokeWidth={2}
                  style={{ filter: 'drop-shadow(0 0 12px rgba(240, 192, 64, 0.3))' }}
                />
                <motion.circle
                  cx={cx} cy={CENTER.y} r={34}
                  fill="none"
                  stroke="#f0c040"
                  strokeWidth={1}
                  opacity={0.2}
                  animate={{ r: [34, 40, 34], opacity: [0.2, 0.08, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <text x={cx} y={CENTER.y - 4} textAnchor="middle" fontSize="10" fill="#f0c040" fontFamily="Cinzel, serif">
                  Full-Stack
                </text>
                <text x={cx} y={CENTER.y + 8} textAnchor="middle" fontSize="10" fill="#f0c040" fontFamily="Cinzel, serif">
                  Mage
                </text>
              </motion.g>

              {/* Branch nodes */}
              {BRANCHES.map((branch, bi) => {
                const positions = getNodePositions(bi).map((p) => ({
                  x: p.x + (cx - CENTER.x),
                  y: p.y,
                }))

                return (
                  <g key={`nodes-${branch.id}`}>
                    {branch.skills.map((skill, si) => (
                      <TreeNode
                        key={skill.id}
                        x={positions[si].x}
                        y={positions[si].y}
                        skill={skill}
                        color={branch.color}
                        delay={0.5 + bi * 0.1 + si * 0.08}
                        onClick={() => handleSelect(branch.id, skill.id)}
                        isSelected={selectedSkill?.branchId === branch.id && selectedSkill?.skillId === skill.id}
                      />
                    ))}
                  </g>
                )
              })}

              {/* Branch labels */}
              {BRANCHES.map((branch, bi) => {
                const positions = getNodePositions(bi).map((p) => ({
                  x: p.x + (cx - CENTER.x),
                  y: p.y,
                }))
                const last = positions[positions.length - 1]
                const Icon = branch.icon
                const labelY = bi === 0 ? last.y - 30 : last.y + 30

                return (
                  <motion.g
                    key={`label-${branch.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 + bi * 0.15 }}
                  >
                    <text
                      x={last.x}
                      y={labelY}
                      textAnchor="middle"
                      fontSize="11"
                      fontFamily="Cinzel, serif"
                      fill={branch.color}
                      letterSpacing="1"
                    >
                      {branch.name}
                    </text>
                  </motion.g>
                )
              })}
            </svg>

            {/* Legend */}
            <div className="mt-2 flex items-center justify-center gap-6 text-[10px] text-text-muted">
              <span className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full border border-accent-purple bg-accent-purple/20" />
                Unlocked
              </span>
              <span className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full border border-border-subtle bg-transparent" />
                Locked
              </span>
              <span className="flex items-center gap-1.5">
                <Crown className="h-3 w-3 text-accent-gold" />
                Class Center
              </span>
            </div>
          </div>

          {/* Side detail panel */}
          <AnimatePresence>
            {selectedSkill && selectedBranch && selectedSkillData && (
              <DetailPanel
                skill={selectedSkillData}
                branch={selectedBranch}
                onClose={() => setSelectedSkill(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Mobile collapsible list */}
      <MobileSkillList
        branches={BRANCHES}
        selectedSkill={selectedSkill}
        onSelect={handleSelect}
      />
    </motion.div>
  )
}
