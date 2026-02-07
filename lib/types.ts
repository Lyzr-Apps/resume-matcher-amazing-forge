/**
 * JobMatch India - Type Definitions
 *
 * TypeScript interfaces for job matching application
 */

export interface ScoreBreakdown {
  skills: number
  experience: number
  location: number
  industry: number
  education: number
  job_type: number
}

export interface JobMatch {
  job_id: string
  title: string
  company: string
  location: string
  matching_score: number // 0-100
  match_reasons: string[] // Top 3 reasons
  full_description: string
  score_breakdown: ScoreBreakdown
  apply_link: string
}

export interface ResumeRecommendations {
  missing_skills: string[]
  keywords_to_add: string[]
  format_tips: string[]
  achievement_suggestions: string[]
}

export interface JobMatchResponse {
  top_10_jobs: JobMatch[]
  resume_recommendations: ResumeRecommendations
  match_summary: string
}

export interface UserPreferences {
  locations: string[]
  industries: string[]
  job_types: string[]
}

export interface UploadedResume {
  file: File
  fileName: string
  fileSize: number
  fileType: string
}

export type ViewState = 'upload' | 'results'

export interface AppState {
  view: ViewState
  resume: UploadedResume | null
  preferences: UserPreferences
  results: JobMatchResponse | null
  loading: boolean
  error: string | null
  expandedJobId: string | null
}
