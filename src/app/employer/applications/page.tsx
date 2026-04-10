'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { useSearchParams } from 'next/navigation'

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
  }
}

interface Job {
  id: string
  title: string
  is_active: boolean
}

function ApplicationsContent() {
  const searchParams = useSearchParams()
  const jobIdFilter = searchParams.get('job_id')
  const [applications, setApplications] = useState<Application[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const url = jobIdFilter
      ? `/api/employer/applications?job_id=${jobIdFilter}`
      : '/api/employer/applications'

    Promise.all([
      fetch(url).then((r) => r.json()),
      fetch('/api/employer/jobs').then((r) => r.json()),
    ]).then(([apps, j]) => {
      setApplications(Array.isArray(apps) ? apps : [])
      setJobs(Array.isArray(j) ? j : [])
      setLoading(false)
    })
  }, [jobIdFilter])

  const filteredJob = jobs.find((j) => j.id === jobIdFilter)

  if (loading) {
    return (
      <>
        <Nav />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <p className="text-slate-500 text-sm">Loading…</p>
        </main>
      </>
    )
  }

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Applications</h1>
            {filteredJob && (
              <p className="text-sm text-slate-500 mt-0.5">Filtered by: {filteredJob.title}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {jobIdFilter && (
              <Link href="/employer/applications" className="text-sm text-indigo-600 hover:underline">
                Show all
              </Link>
            )}
            <select
              value={jobIdFilter ?? ''}
              onChange={(e) => {
                const val = e.target.value
                window.location.href = val
                  ? `/employer/applications?job_id=${val}`
                  : '/employer/applications'
              }}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-600 bg-white"
            >
              <option value="">All jobs</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="theme-panel px-8 py-16 text-center">
            <p className="text-slate-500 text-sm">No applications yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div
                  className="px-6 py-4 flex items-start justify-between gap-4 cursor-pointer"
                  onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700 shrink-0">
                        {app.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{app.name}</p>
                        <p className="text-xs text-slate-500">{app.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-500">{app.job.title}</p>
                    <p className="text-xs text-slate-400">{new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-slate-400 text-sm">{expanded === app.id ? '▲' : '▼'}</span>
                </div>

                {expanded === app.id && (
                  <div className="px-6 pb-5 border-t border-slate-50">
                    <div className="pt-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide w-20">Email</span>
                        <a href={`mailto:${app.email}`} className="text-sm text-indigo-600 hover:underline">
                          {app.email}
                        </a>
                      </div>

                      {app.resume_url && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide w-20">Resume</span>
                          <a
                            href={app.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:underline"
                          >
                            View resume →
                          </a>
                        </div>
                      )}

                      {app.cover_letter && (
                        <div>
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-2">Cover letter</span>
                          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl px-4 py-3 whitespace-pre-wrap">
                            {app.cover_letter}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

export default function EmployerApplicationsPage() {
  return (
    <Suspense fallback={<p className="p-8 text-slate-500 text-sm">Loading…</p>}>
      <ApplicationsContent />
    </Suspense>
  )
}
