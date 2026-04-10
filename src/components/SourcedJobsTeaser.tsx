import Link from 'next/link'
import { prisma } from '@/lib/prisma'

function freshnessLabel(posted_at: Date | null, created_at: Date): string {
  const date = posted_at ?? created_at
  const hours = (Date.now() - date.getTime()) / 3_600_000
  if (hours < 24) return 'New'
  if (hours < 48) return 'Posted today'
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const SOURCE_COLORS: Record<string, string> = {
  'Remotive': 'bg-violet-50 text-violet-700',
  'Greenhouse': 'bg-green-50 text-green-700',
  'Lever': 'bg-amber-50 text-amber-700',
  'Company Site': 'bg-sky-50 text-sky-700',
}

export async function SourcedJobsTeaser() {
  let jobs: {
    id: string
    title: string
    company: string
    location: string
    is_remote: boolean
    url: string
    source: string
    posted_at: Date | null
    created_at: Date
  }[] = []

  let total = 0

  try {
    ;[jobs, total] = await Promise.all([
      prisma.scrapedJob.findMany({
        orderBy: { posted_at: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          is_remote: true,
          url: true,
          source: true,
          posted_at: true,
          created_at: true,
        },
      }),
      prisma.scrapedJob.count(),
    ])
  } catch {
    // DB not available during build — render nothing
    return null
  }

  if (total === 0) return null

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Live feed</p>
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Jobs sourced from the internet
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {total} AI roles aggregated from Remotive, Greenhouse, Lever &amp; company sites
            </p>
          </div>
          <Link
            href="/sourced-jobs"
            className="shrink-0 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            Browse all {total} →
          </Link>
        </div>

        {/* Job rows */}
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
          {jobs.map((job) => {
            const freshLabel = freshnessLabel(job.posted_at, job.created_at)
            const isNew = freshLabel === 'New'

            return (
              <a
                key={job.id}
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 px-6 py-4 bg-white hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm">
                    {job.company.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors truncate text-sm">
                        {job.title}
                      </p>
                      {isNew && (
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {job.company}
                      <span className="mx-1.5 text-slate-300">·</span>
                      {job.is_remote ? <span className="text-indigo-600 font-medium">Remote</span> : job.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${SOURCE_COLORS[job.source] ?? 'bg-slate-100 text-slate-500'}`}>
                    {job.source}
                  </span>
                  <span className="text-xs text-slate-400 w-16 text-right">{freshLabel}</span>
                  <svg className="h-3.5 w-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </div>
              </a>
            )
          })}
        </div>

        <div className="mt-5 text-center">
          <Link
            href="/sourced-jobs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            View all {total} sourced jobs →
          </Link>
        </div>
      </div>
    </section>
  )
}
