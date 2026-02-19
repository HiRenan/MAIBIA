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
  id: number
  filename: string
  size: number
  score: number
  sections: CVAnalysisSection[]
  strengths: string[]
  weaknesses: string[]
  tips: string[]
  created_at: string
}

export interface CVAnalysesResponse {
  analyses: CVAnalysisResponse[]
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

export interface TimelineEntry {
  id: string
  category: 'experience' | 'education' | 'awards' | 'certifications'
  year: string
  yearEnd: string | null
  title: string
  place: string
  description: string
  skills: string[]
  color: string
  icon: string
}

export interface TimelineResponse {
  entries: TimelineEntry[]
}

export interface BlogPostData {
  id: number
  title: string
  content: string
  category: 'update' | 'project' | 'achievement' | 'thought'
  tags: string
  color: string
  pinned: boolean
  created_at: string
  updated_at: string
}

export interface BlogPostsResponse {
  posts: BlogPostData[]
  total: number
}

export interface BlogPostCreate {
  title: string
  content: string
  category?: string
  tags?: string
  color?: string
  pinned?: boolean
}

export interface OracleMessage {
  id: number
  role: string
  text: string
  created_at: string
}

export interface OracleHistoryResponse {
  messages: OracleMessage[]
  total: number
  has_more: boolean
}

export interface OracleStatsResponse {
  messages_sent: number
  wisdom_score: number
  topics_explored: number
  oracle_level: number
}

export interface OracleWeeklySummaryResponse {
  summary: string
  xp_gained: number
  quests_completed: number
  skills_practiced: string[]
  achievement_progress: string
  oracle_tip: string
  total_messages: number
}

// API functions
export const api = {
  // Gamification
  getProfile: () => fetchAPI<ProfileResponse>('/gamification/profile'),
  getSkills: () => fetchAPI<SkillsResponse>('/gamification/skills'),
  getAchievements: () => fetchAPI<AchievementsResponse>('/gamification/achievements'),
  getWeeklySummary: () => fetchAPI<{ summary: string }>('/gamification/weekly-summary'),
  getTimeline: () => fetchAPI<TimelineResponse>('/gamification/timeline'),

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
  getCVAnalyses: () => fetchAPI<CVAnalysesResponse>('/cv/analyses'),

  // Oracle
  chat: (message: string) =>
    fetchAPI<ChatResponse>('/oracle/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  getOracleHistory: (limit = 50, offset = 0) =>
    fetchAPI<OracleHistoryResponse>(`/oracle/history?limit=${limit}&offset=${offset}`),
  getOracleStats: () => fetchAPI<OracleStatsResponse>('/oracle/stats'),
  getOracleWeeklySummary: () => fetchAPI<OracleWeeklySummaryResponse>('/oracle/weekly-summary'),

  // Blog
  getBlogPosts: () => fetchAPI<BlogPostsResponse>('/blog/posts'),
  getBlogPost: (id: number) => fetchAPI<BlogPostData>(`/blog/posts/${id}`),
  createBlogPost: (data: BlogPostCreate) =>
    fetchAPI<BlogPostData>('/blog/posts', { method: 'POST', body: JSON.stringify(data) }),
  updateBlogPost: (id: number, data: BlogPostCreate) =>
    fetchAPI<BlogPostData>(`/blog/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBlogPost: (id: number) =>
    fetchAPI<{ success: boolean }>(`/blog/posts/${id}`, { method: 'DELETE' }),
}
