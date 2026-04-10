'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { useSearchParams } from 'next/navigation'

interface Job {
  id: string
  title: string
  company_name: string
  location: string
  type: string
  created_at: string
}

const TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  'contract': 'Contract',
  'remote': 'Remote',
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function JobsContent() {
  const searchParams = useSearchParams()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const justApplied = searchParams.get('applied') === '1'

  useEffect(() => {
    fetch('/api/jobs')
      .then((r) => r.json())
      .then((data) => {
        setJobs(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <>
        <Nav />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-slate-500 text-sm">Loading…</p>
        </main>
      </>
    )
  }

  return (
    <>
      <Nav />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {justApplied && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
            <p className="text-sm font-semibold text-green-800">Application submitted!</p>
            <p className="text-xs text-green-700 mt-0.5">The employer will be in touch if you&apos;re a good fit.</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-800">Browse Jobs</h1>
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-800">{jobs.length}</span> active role{jobs.length !== 1 ? 's' : ''}
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="theme-panel px-8 py-16 text-center">
            <p className="text-slate-500 text-sm">No active jobs right now. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block bg-white border border-slate-200 rounded-2xl px-6 py-5 hover:border-indigo-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                      {job.title}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">{job.company_name}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{timeAgo(new Date(job.created_at))}</span>
                </div>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                    {job.location}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium">
                    {TYPE_LABELS[job.type] ?? job.type}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

export default function JobsPage() {
  return (
    <Suspense fallback={<p className="p-8 text-slate-500 text-sm">Loading…</p>}>
      <JobsContent />
    </Suspense>
  )
}
