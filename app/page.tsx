'use client'

import { useState } from 'react'
import { FiUpload, FiX, FiRefreshCw, FiMapPin, FiBriefcase, FiClock, FiCheckCircle, FiAlertCircle, FiTrendingUp, FiFileText, FiTarget, FiAward } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { callAIAgent, type AIAgentResponse } from '@/lib/aiAgent'
import type {
  AppState,
  UserPreferences,
  UploadedResume,
  JobMatchResponse,
  JobMatch
} from '@/lib/types'

// Constants
const MANAGER_AGENT_ID = '6986efcb95535c4535914074'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

// Demo data for testing UI when API is unavailable
const DEMO_DATA: JobMatchResponse = {
  top_10_jobs: [
    {
      job_id: '1',
      title: 'Senior React Developer',
      company: 'Tech Mahindra',
      location: 'Bangalore, India',
      matching_score: 92,
      match_reasons: ['5+ years React experience', 'Node.js expertise', 'Remote work preference'],
      full_description: 'We are seeking a Senior React Developer to join our growing team. You will work on cutting-edge web applications using React, TypeScript, and Node.js. Must have strong experience in modern frontend development.',
      score_breakdown: { skills: 95, experience: 90, location: 88, industry: 92, education: 90, job_type: 95 },
      apply_link: 'https://example.com/apply'
    },
    {
      job_id: '2',
      title: 'Full Stack Engineer',
      company: 'Infosys',
      location: 'Pune, India',
      matching_score: 88,
      match_reasons: ['Full stack experience', 'JavaScript proficiency', 'IT industry background'],
      full_description: 'Join our team as a Full Stack Engineer working with modern web technologies including React, Node.js, and cloud platforms. Great opportunity for career growth.',
      score_breakdown: { skills: 90, experience: 85, location: 85, industry: 90, education: 88, job_type: 90 },
      apply_link: 'https://example.com/apply'
    },
    {
      job_id: '3',
      title: 'Software Development Engineer',
      company: 'Wipro',
      location: 'Hyderabad, India',
      matching_score: 85,
      match_reasons: ['Strong coding skills', 'CS degree', 'Agile experience'],
      full_description: 'Looking for SDE to develop scalable applications using React, Python, and microservices architecture. Work on innovative projects.',
      score_breakdown: { skills: 88, experience: 82, location: 80, industry: 88, education: 90, job_type: 85 },
      apply_link: 'https://example.com/apply'
    },
    {
      job_id: '4',
      title: 'Frontend Developer',
      company: 'TCS',
      location: 'Mumbai, India',
      matching_score: 83,
      match_reasons: ['React expertise', 'UI/UX skills', 'Mumbai location match'],
      full_description: 'Frontend Developer position focused on building responsive web applications. Experience with React and modern CSS frameworks required.',
      score_breakdown: { skills: 85, experience: 80, location: 90, industry: 82, education: 85, job_type: 80 },
      apply_link: 'https://example.com/apply'
    },
    {
      job_id: '5',
      title: 'JavaScript Developer',
      company: 'HCL Technologies',
      location: 'Chennai, India',
      matching_score: 80,
      match_reasons: ['JavaScript mastery', 'Team collaboration', 'Full-time role'],
      full_description: 'Seeking JavaScript Developer with strong foundation in modern frameworks. Will work on client-facing applications.',
      score_breakdown: { skills: 82, experience: 78, location: 75, industry: 85, education: 80, job_type: 85 },
      apply_link: 'https://example.com/apply'
    },
    {
      job_id: '6',
      title: 'Web Developer',
      company: 'Cognizant',
      location: 'Bangalore, India',
      matching_score: 78,
      match_reasons: ['Web development skills', 'Bangalore preferred', 'IT sector experience'],
      full_description: 'Web Developer role focusing on creating dynamic web applications. Knowledge of React, Node.js, and databases preferred.',
      score_breakdown: { skills: 80, experience: 75, location: 88, industry: 78, education: 75, job_type: 72 },
      apply_link: 'https://example.com/apply'
    },
    {
      job_id: '7',
      title: 'UI Engineer',
      company: 'Accenture',
      location: 'Delhi NCR, India',
      matching_score: 75,
      match_reasons: ['UI development', 'Component libraries', 'Design systems'],
      full_description: 'UI Engineer to build reusable component libraries and design systems. Strong React and CSS skills required.',
      score_breakdown: { skills: 78, experience: 72, location: 70, industry: 80, education: 75, job_type: 75 },
      apply_link: 'https://example.com/apply'
    },
    {
      job_id: '8',
      title: 'React Native Developer',
      company: 'Capgemini',
      location: 'Pune, India',
      matching_score: 72,
      match_reasons: ['React knowledge transferable', 'Mobile interest', 'Hybrid role'],
      full_description: 'React Native Developer for mobile app development. React web experience is a plus. Work on cross-platform applications.',
      score_breakdown: { skills: 75, experience: 70, location: 85, industry: 70, education: 68, job_type: 65 },
      apply_link: 'https://example.com/apply'
    },
    {
      job_id: '9',
      title: 'Frontend Architect',
      company: 'IBM India',
      location: 'Bangalore, India',
      matching_score: 70,
      match_reasons: ['Senior role potential', 'Architecture skills', 'Remote option'],
      full_description: 'Frontend Architect position for experienced developers. Lead technical decisions and mentor junior developers.',
      score_breakdown: { skills: 72, experience: 85, location: 88, industry: 65, education: 68, job_type: 70 },
      apply_link: 'https://example.com/apply'
    },
    {
      job_id: '10',
      title: 'Software Engineer - Frontend',
      company: 'Amazon India',
      location: 'Hyderabad, India',
      matching_score: 68,
      match_reasons: ['Tech giant opportunity', 'Frontend specialization', 'Career growth'],
      full_description: 'Software Engineer focused on frontend development at Amazon. Build customer-facing features at scale.',
      score_breakdown: { skills: 70, experience: 65, location: 80, industry: 70, education: 72, job_type: 62 },
      apply_link: 'https://example.com/apply'
    }
  ],
  resume_recommendations: {
    missing_skills: ['TypeScript', 'AWS/Cloud', 'Docker/Kubernetes', 'System Design'],
    keywords_to_add: ['Microservices', 'CI/CD', 'Agile/Scrum', 'RESTful APIs'],
    format_tips: ['Add quantifiable achievements', 'Include project impact metrics', 'Highlight leadership roles'],
    achievement_suggestions: ['Led team of X developers', 'Improved performance by X%', 'Reduced deployment time by X hours']
  },
  match_summary: 'Found 10 excellent matches based on your profile. Top matches are in IT/Tech industry with strong React and full-stack roles.'
}

const LOCATION_OPTIONS = [
  'Bangalore', 'Mumbai', 'Delhi NCR', 'Pune', 'Hyderabad', 'Chennai',
  'Kolkata', 'Ahmedabad', 'Jaipur', 'Kochi'
]

const INDUSTRY_OPTIONS = [
  'IT & Technology', 'Finance & Banking', 'Healthcare', 'Manufacturing',
  'E-commerce', 'Consulting', 'Education', 'Telecommunications'
]

const JOB_TYPE_OPTIONS = [
  'Full-time', 'Remote', 'Hybrid', 'Contract', 'Part-time'
]

export default function Home() {
  const [state, setState] = useState<AppState>({
    view: 'upload',
    resume: null,
    preferences: {
      locations: [],
      industries: [],
      job_types: []
    },
    results: null,
    loading: false,
    error: null,
    expandedJobId: null
  })

  const [dragActive, setDragActive] = useState(false)
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')

  // File Upload Handlers
  const handleFileUpload = (file: File) => {
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setState(prev => ({
        ...prev,
        error: 'Invalid file type. Please upload PDF or DOCX files only.'
      }))
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setState(prev => ({
        ...prev,
        error: 'File size exceeds 10MB limit.'
      }))
      return
    }

    const resume: UploadedResume = {
      file,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    }

    setState(prev => ({
      ...prev,
      resume,
      error: null
    }))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const removeResume = () => {
    setState(prev => ({
      ...prev,
      resume: null
    }))
  }

  // Preferences Handlers
  const togglePreference = (type: keyof UserPreferences, value: string) => {
    setState(prev => {
      const currentValues = prev.preferences[type]
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]

      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          [type]: newValues
        }
      }
    })
  }

  // Extract text from resume file
  const extractResumeText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        // Simple text extraction - in production, use proper PDF/DOCX parsers
        resolve(text || file.name)
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  // Find Matching Jobs
  const findMatchingJobs = async () => {
    if (!state.resume) return

    setState(prev => ({ ...prev, loading: true, error: null }))
    setLoadingMessage('Analyzing resume...')

    let result: AIAgentResponse | undefined

    try {
      // Extract resume text
      const resumeText = await extractResumeText(state.resume.file)

      setLoadingMessage('Searching jobs...')

      // Build prompt for manager agent
      const prompt = `
Please analyze this resume and find the top 10 matching jobs in India.

RESUME:
${resumeText}

PREFERENCES:
- Locations: ${state.preferences.locations.length > 0 ? state.preferences.locations.join(', ') : 'Any'}
- Industries: ${state.preferences.industries.length > 0 ? state.preferences.industries.join(', ') : 'Any'}
- Job Types: ${state.preferences.job_types.length > 0 ? state.preferences.job_types.join(', ') : 'Any'}

Please provide a detailed job matching analysis with:
1. Top 10 job matches with scores (0-100)
2. Match reasons for each job
3. Score breakdown (skills, experience, location, industry, education, job_type)
4. Resume improvement recommendations

Return the response in this JSON format:
{
  "top_10_jobs": [
    {
      "job_id": "unique_id",
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, India",
      "matching_score": 85,
      "match_reasons": ["Reason 1", "Reason 2", "Reason 3"],
      "full_description": "Full job description...",
      "score_breakdown": {
        "skills": 90,
        "experience": 85,
        "location": 80,
        "industry": 85,
        "education": 90,
        "job_type": 85
      },
      "apply_link": "https://example.com/apply"
    }
  ],
  "resume_recommendations": {
    "missing_skills": ["Skill 1", "Skill 2"],
    "keywords_to_add": ["Keyword 1", "Keyword 2"],
    "format_tips": ["Tip 1", "Tip 2"],
    "achievement_suggestions": ["Suggestion 1", "Suggestion 2"]
  },
  "match_summary": "Overall summary of matches..."
}
`

      setLoadingMessage('Calculating matches...')

      // Call manager agent
      result = await callAIAgent(prompt, MANAGER_AGENT_ID)

      console.log('Agent API Response:', result)

      // Don't throw error immediately - let the catch block handle it with demo data
      if (!result.success) {
        console.error('Agent call failed:', result.error)
        throw new Error(result.error || 'API request failed')
      }

      // Parse response - the agent response is in result.response.result
      let jobMatchData: JobMatchResponse

      // Check what we got back
      const agentResult = result.response?.result
      console.log('Agent Result:', agentResult)

      // If it's already an object with top_10_jobs, use it directly
      if (agentResult && typeof agentResult === 'object' && 'top_10_jobs' in agentResult) {
        jobMatchData = agentResult as JobMatchResponse
      } else {
        // Try to parse from various possible locations
        let textToParse = ''

        if (typeof agentResult === 'string') {
          textToParse = agentResult
        } else if (result.response?.message) {
          textToParse = result.response.message
        } else if (agentResult?.text) {
          textToParse = agentResult.text
        } else if (agentResult) {
          textToParse = JSON.stringify(agentResult)
        }

        console.log('Text to parse:', textToParse.substring(0, 500))

        try {
          // Try direct parse first
          jobMatchData = JSON.parse(textToParse)
        } catch {
          // Try to find JSON in text (handle markdown code blocks)
          const jsonMatch = textToParse.match(/```json\s*([\s\S]*?)\s*```/) ||
                           textToParse.match(/```\s*([\s\S]*?)\s*```/) ||
                           textToParse.match(/\{[\s\S]*"top_10_jobs"[\s\S]*\}/)

          if (jsonMatch) {
            try {
              jobMatchData = JSON.parse(jsonMatch[1] || jsonMatch[0])
            } catch (e2) {
              console.error('Failed to parse extracted JSON:', e2)
              throw new Error('Unable to parse job matching results. Please try again.')
            }
          } else {
            console.error('No JSON found in response')
            throw new Error('No valid job data received. Please try again.')
          }
        }
      }

      console.log('Parsed job data:', jobMatchData)

      setState(prev => ({
        ...prev,
        loading: false,
        results: jobMatchData,
        view: 'results',
        error: null
      }))

    } catch (error) {
      console.error('Error in findMatchingJobs:', error)
      console.error('Full error object:', { error, result })

      const errorMessage = error instanceof Error ? error.message : 'An error occurred while finding jobs'
      const resultError = result?.error || ''
      const resultDetails = result?.details || ''

      // Check if it's an API credit/availability error or any API error
      const isAPIError =
        errorMessage.toLowerCase().includes('429') ||
        errorMessage.toLowerCase().includes('credits') ||
        errorMessage.toLowerCase().includes('quota') ||
        errorMessage.toLowerCase().includes('exhausted') ||
        errorMessage.toLowerCase().includes('limit') ||
        errorMessage.toLowerCase().includes('api') ||
        resultError.toLowerCase().includes('429') ||
        resultError.toLowerCase().includes('credits') ||
        resultError.toLowerCase().includes('api') ||
        resultDetails.toLowerCase().includes('429') ||
        (result && !result.success)

      // Use demo data as fallback for any API-related errors
      if (isAPIError) {
        console.log('Using demo data due to API error:', errorMessage)
        setState(prev => ({
          ...prev,
          loading: false,
          results: DEMO_DATA,
          view: 'results',
          error: 'Showing demo data (API temporarily unavailable). Refill credits at https://studio.lyzr.ai for real job matching.'
        }))
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: `Error: ${errorMessage}. Please check the browser console for more details.`
        }))
      }
    }
  }

  // Reset to upload view
  const resetToUpload = () => {
    setState({
      view: 'upload',
      resume: null,
      preferences: {
        locations: [],
        industries: [],
        job_types: []
      },
      results: null,
      loading: false,
      error: null,
      expandedJobId: null
    })
  }

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-orange-100 text-orange-800 border-orange-300'
  }

  // Toggle job expansion
  const toggleJobExpansion = (jobId: string) => {
    setState(prev => ({
      ...prev,
      expandedJobId: prev.expandedJobId === jobId ? null : jobId
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                <FiBriefcase className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">JobMatch India</h1>
                <p className="text-sm text-gray-600">AI-Powered Job Matching Platform</p>
              </div>
            </div>
            {state.view === 'results' && (
              <Button onClick={resetToUpload} variant="outline" className="flex items-center gap-2">
                <FiRefreshCw className="text-sm" />
                New Search
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {state.view === 'upload' ? (
          // Upload View
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Error Alert */}
            {state.error && (
              <Alert variant="destructive">
                <FiAlertCircle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            {/* File Upload Zone */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Resume</CardTitle>
              </CardHeader>
              <CardContent>
                {!state.resume ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                      dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiUpload className="text-blue-600 text-2xl" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          Drop your resume here, or{' '}
                          <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline">
                            browse
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.docx"
                              onChange={handleFileInputChange}
                            />
                          </label>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Supports PDF and DOCX files (Max 10MB)
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FiFileText className="text-green-600 text-xl" />
                      <div>
                        <p className="font-medium text-gray-900">{state.resume.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {(state.resume.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={removeResume}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <FiX className="text-lg" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preferences Section */}
            <Card>
              <Collapsible open={preferencesOpen} onOpenChange={setPreferencesOpen}>
                <CardHeader>
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <CardTitle>Job Preferences (Optional)</CardTitle>
                    <FiTarget className="text-gray-400" />
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="space-y-6">
                    {/* Locations */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Preferred Locations
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {LOCATION_OPTIONS.map(location => (
                          <button
                            key={location}
                            onClick={() => togglePreference('locations', location)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                              state.preferences.locations.includes(location)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {location}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Industries */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Preferred Industries
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {INDUSTRY_OPTIONS.map(industry => (
                          <button
                            key={industry}
                            onClick={() => togglePreference('industries', industry)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                              state.preferences.industries.includes(industry)
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {industry}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Job Types */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Job Types
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {JOB_TYPE_OPTIONS.map(jobType => (
                          <button
                            key={jobType}
                            onClick={() => togglePreference('job_types', jobType)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                              state.preferences.job_types.includes(jobType)
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {jobType}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Find Jobs Button */}
            <div className="flex flex-col items-center space-y-4">
              <Button
                onClick={findMatchingJobs}
                disabled={!state.resume || state.loading}
                size="lg"
                className="w-full max-w-md bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold py-6 text-lg"
              >
                {state.loading ? (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{loadingMessage}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <FiBriefcase />
                    <span>Find Matching Jobs</span>
                  </div>
                )}
              </Button>
              {!state.resume && (
                <p className="text-sm text-gray-500">Please upload your resume to continue</p>
              )}
            </div>
          </div>
        ) : (
          // Results View
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Jobs List - 2/3 width */}
            <div className="lg:col-span-2 space-y-4">
              {/* Show error/warning if present */}
              {state.error && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <FiAlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">{state.error}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Top 10 Matches for {state.resume?.fileName}
                  </h2>
                  {state.results?.match_summary && (
                    <p className="text-sm text-gray-600 mt-1">{state.results.match_summary}</p>
                  )}
                </div>
              </div>

              {/* Job Cards */}
              {state.results?.top_10_jobs && state.results.top_10_jobs.length > 0 ? (
                state.results.top_10_jobs.map((job, index) => (
                  <Card key={job.job_id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Job Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-gray-500">
                                #{index + 1}
                              </span>
                              <Badge className={`${getScoreBadgeColor(job.matching_score)} border`}>
                                {job.matching_score}% Match
                              </Badge>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                            <p className="text-gray-700 font-medium mt-1">{job.company}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <FiMapPin className="text-xs" />
                                {job.location}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Match Reasons */}
                        {job.match_reasons && job.match_reasons.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {job.match_reasons.map((reason, idx) => (
                              <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <FiCheckCircle className="mr-1 text-xs" />
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Expand Button */}
                        <div className="pt-2 border-t border-gray-200">
                          <Button
                            onClick={() => toggleJobExpansion(job.job_id)}
                            variant="ghost"
                            className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            {state.expandedJobId === job.job_id ? 'Hide Details' : 'View Full Details'}
                          </Button>
                        </div>

                        {/* Expanded Content */}
                        {state.expandedJobId === job.job_id && (
                          <div className="space-y-4 pt-4 border-t border-gray-200 animate-in slide-in-from-top duration-300">
                            {/* Full Description */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Job Description</h4>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {job.full_description}
                              </p>
                            </div>

                            {/* Score Breakdown */}
                            {job.score_breakdown && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Score Breakdown</h4>
                                <div className="space-y-3">
                                  {Object.entries(job.score_breakdown).map(([key, value]) => (
                                    <div key={key}>
                                      <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700 capitalize">
                                          {key.replace('_', ' ')}
                                        </span>
                                        <span className="font-medium text-gray-900">{value}%</span>
                                      </div>
                                      <Progress value={value} className="h-2" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Apply Button */}
                            {job.apply_link && (
                              <Button
                                asChild
                                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                              >
                                <a href={job.apply_link} target="_blank" rel="noopener noreferrer">
                                  Apply Now
                                </a>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-gray-500">No job matches found. Please try again with different preferences.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recommendations Panel - 1/3 width */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">
                <Card>
                  <CardHeader className="bg-gradient-to-br from-blue-50 to-teal-50">
                    <CardTitle className="flex items-center gap-2">
                      <FiTrendingUp className="text-blue-600" />
                      Resume Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {state.results?.resume_recommendations && (
                      <>
                        {/* Missing Skills */}
                        {state.results.resume_recommendations.missing_skills.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                              <FiTarget className="text-orange-600" />
                              Missing Skills
                            </h4>
                            <ul className="space-y-1">
                              {state.results.resume_recommendations.missing_skills.map((skill, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-orange-600 mt-0.5">•</span>
                                  {skill}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Keywords to Add */}
                        {state.results.resume_recommendations.keywords_to_add.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                              <FiFileText className="text-blue-600" />
                              Keywords to Add
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {state.results.resume_recommendations.keywords_to_add.map((keyword, idx) => (
                                <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Format Tips */}
                        {state.results.resume_recommendations.format_tips.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                              <FiCheckCircle className="text-green-600" />
                              Format Tips
                            </h4>
                            <ul className="space-y-1">
                              {state.results.resume_recommendations.format_tips.map((tip, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-green-600 mt-0.5">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Achievement Suggestions */}
                        {state.results.resume_recommendations.achievement_suggestions.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                              <FiAward className="text-purple-600" />
                              Achievement Suggestions
                            </h4>
                            <ul className="space-y-1">
                              {state.results.resume_recommendations.achievement_suggestions.map((suggestion, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-purple-600 mt-0.5">•</span>
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
