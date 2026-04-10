'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'

interface Application {
  id: string
  name: string
  email: string
  resume_url: string | null
  cover_letter: string | null
  created_at: string
  job: {
    id: string
    title: string
    company_name: string
    location: string
    type: string
  }
}

const TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  'contract': 'Contract',
  'remote': 'Remote',
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/applications')
      .then((r) => r.json())
      .then((data) => {
        setApplications(Array.isArray(data) ? data : [])
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-800">My Applications</h1>
          <Link href="/jobs" className="theme-button-primary text-sm px-4 py-2">
            Browse more jobs
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="theme-panel px-8 py-16 text-center">
            <p className="text-slate-500 text-sm mb-4">You haven&apos;t applied to any jobs yet.</p>
            <Link href="/jobs" className="theme-button-primary text-sm">
              Browse jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white border border-slate-200 rounded-2xl px-6 py-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <Link
                      href={`/jobs/${app.job.id}`}
                      className="font-semibold text-slate-900 hover:text-indigo-700 transition-colors"
                    >
                      {app.job.title}
                    </Link>
                    <p className="text-sm text-slate-500 mt-0.5">{app.job.company_name}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {new Date(app.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                    {app.job.location}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium">
                    {TYPE_LABELS[app.job.type] ?? app.job.type}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-medium">
                    Applied
                  </span>
                </div>

                {app.cover_letter && (
                  <p className="text-xs text-slate-500 line-clamp-2 italic">
                    &ldquo;{app.cover_letter}&rdquo;
                  </p>
                )}

                {app.resume_url && (
                  <a
                    href={app.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:underline mt-2 inline-block"
                  >
                    View resume →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
