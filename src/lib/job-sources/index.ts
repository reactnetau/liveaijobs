import { prisma } from '@/lib/prisma'
import { fetchRemotiveJobs } from './remotive'
import { MOCK_JOBS } from './mock'
import { SourcedJobData } from './types'

export type { SourcedJobData }

const AI_KEYWORDS = [
  'ai',
  'machine learning',
  'ml',
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

function isAiRelated(job: SourcedJobData): boolean {
  const text = `${job.title} ${job.description ?? ''}`.toLowerCase()
  return AI_KEYWORDS.some((kw) => text.includes(kw))
}

async function fetchJobsFromSources(): Promise<SourcedJobData[]> {
  const [remotive] = await Promise.allSettled([fetchRemotiveJobs()])

  const live = remotive.status === 'fulfilled' ? remotive.value : []

  console.log(`[job-sources] live=${live.length} mock=${MOCK_JOBS.length}`)

  // Combine: real data first, then mock as fallback/supplement
  const all = [...live, ...MOCK_JOBS]

  // Deduplicate by URL within this batch
  const seen = new Set<string>()
  return all.filter((j) => {
    if (seen.has(j.url)) return false
    seen.add(j.url)
    return isAiRelated(j)
  })
}

export async function importJobs(): Promise<{ added: number; total: number }> {
  const jobs = await fetchJobsFromSources()

  let added = 0

  for (const job of jobs) {
    try {
      await prisma.scrapedJob.upsert({
        where: { url: job.url },
        update: {}, // don't overwrite existing records
        create: {
          title: job.title,
          company: job.company,
          location: job.location,
          is_remote: job.is_remote,
          url: job.url,
          source: job.source,
          description: job.description ?? null,
          posted_at: job.posted_at ?? null,
        },
      })
      added++
    } catch {
      // silently skip duplicates or constraint violations
    }
  }

  const total = await prisma.scrapedJob.count()
  console.log(`[job-sources] added=${added} total=${total}`)
  return { added, total }
}
