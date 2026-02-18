/**
 * Typed API client for DevQuest backend.
 * All functions return null on failure for graceful degradation.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const resp = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
    if (!resp.ok) return null
    return resp.json()
  } catch {
    return null
  }
}

// Response types
export interface ProfileResponse {
  name: string
  title: string
  dev_class: string
  level: number
  xp: number
  xp_next_level: number
  avatar_initials: string
  stats: Record<string, { value: number; label: string }>
}

export interface SkillData {
  id: string
  name: string
  level: number
  maxLevel: number
  unlocked: boolean
  description: string
  projects: string[]
}

export interface BranchData {
  id: string
  name: string
  color: string
  skills: SkillData[]
}

export interface SkillsResponse {
  branches: BranchData[]
}

export interface AchievementData {
  name: string
  description: string
  icon: string
  category: string
  color: string
  unlocked: boolean
  unlock_date: string | null
}

export interface AchievementsResponse {
  achievements: AchievementData[]
}

export interface RepoData {
  name: string
  description: string
  language: string
  stars: number
  forks: number
  status: string
  rarity: string
  xp: number
  html_url: string
  updated_at: string
  homepage?: string
  topics?: string[]
  created_at?: string
  size?: number
  open_issues_count?: number
  has_pages?: boolean
  owner?: string
}

export interface ReposResponse {
  repos: RepoData[]
  source: string
}

export interface ChatResponse {
  role: string
  text: string
}

export interface CVAnalysisSection {
  name: string
  score: number
  feedback: string
}

export interface CVAnalysisResponse {
  filename: string
  size: number
  score: number
  sections: CVAnalysisSection[]
}

export interface AnalyzeRepoResponse {
  repo: string
  score: number
  strengths: string[]
  improvements: string[]
  summary: string
  metrics?: Record<string, number>
  category_tags?: string[]
}

export interface QuestStatsResponse {
  total_repos: number
  total_stars: number
  total_xp: number
  languages: string[]
  active_quests: number
  completed_quests: number
}

// API functions
export const api = {
  // Gamification
  getProfile: () => fetchAPI<ProfileResponse>('/gamification/profile'),
  getSkills: () => fetchAPI<SkillsResponse>('/gamification/skills'),
  getAchievements: () => fetchAPI<AchievementsResponse>('/gamification/achievements'),
  getWeeklySummary: () => fetchAPI<{ summary: string }>('/gamification/weekly-summary'),

  // GitHub
  getRepos: () => fetchAPI<ReposResponse>('/github/repos'),
  getRepoDetail: (owner: string, repo: string) =>
    fetchAPI<Record<string, unknown>>(`/github/repos/${owner}/${repo}`),
  analyzeRepo: (owner: string, repo: string) =>
    fetchAPI<AnalyzeRepoResponse>(`/github/repos/${owner}/${repo}/analyze`, { method: 'POST' }),
  getGitHubProfile: () => fetchAPI<Record<string, unknown>>('/github/profile'),
  getQuestStats: () => fetchAPI<QuestStatsResponse>('/github/quest-stats'),

  // CV
  uploadCV: async (file: File): Promise<CVAnalysisResponse | null> => {
    try {
      const form = new FormData()
      form.append('file', file)
      const resp = await fetch(`${API_BASE}/cv/upload`, { method: 'POST', body: form })
      if (!resp.ok) return null
      return resp.json()
    } catch {
      return null
    }
  },
  getAnalysis: () => fetchAPI<CVAnalysisResponse>('/cv/analysis'),

  // Oracle
  chat: (message: string) =>
    fetchAPI<ChatResponse>('/oracle/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
}
