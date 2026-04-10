import { SourcedJobData } from './types'

const AI_KEYWORDS = [
  'ai',
  'machine learning',
  'ml engineer',
  'deep learning',
  'llm',
  'nlp',
  'neural',
  'artificial intelligence',
  'language model',
  'generative',
  'mlops',
  'computer vision',
]

interface RemotiveJob {
  id: number
  url: string
  title: string
  company_name: string
  candidate_required_location: string
  job_type: string
  publication_date: string
  description: string
  tags: string[]
}

interface RemotiveResponse {
  jobs: RemotiveJob[]
}

function isAiRelated(job: RemotiveJob): boolean {
  const text = `${job.title} ${(job.tags ?? []).join(' ')}`.toLowerCase()
  return AI_KEYWORDS.some((kw) => text.includes(kw))
}

export async function fetchRemotiveJobs(): Promise<SourcedJobData[]> {
  try {
    const res = await fetch(
      'https://remotive.com/api/remote-jobs?category=software-dev&limit=100',
      {
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(10_000),
      }
    )

    if (!res.ok) {
      console.warn(`[remotive] HTTP ${res.status}`)
      return []
    }

    const data: RemotiveResponse = await res.json()

    return data.jobs
      .filter(isAiRelated)
      .map((job) => ({
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || 'Remote',
        is_remote: true, // all Remotive jobs are remote
        url: job.url,
        source: 'Remotive',
        description: job.description?.replace(/<[^>]*>/g, '').slice(0, 2000) || undefined,
        posted_at: job.publication_date ? new Date(job.publication_date) : undefined,
      }))
  } catch (err) {
    console.warn('[remotive] fetch failed:', err)
    return []
  }
}
