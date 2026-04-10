'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { useSearchParams } from 'next/navigation'
import { useSnackbar } from 'notistack'

interface Job {
  id: string
  title: string
  company_name: string
  location: string
  type: string
  is_active: boolean
  created_at: string
  _count: { applications: number }
}

const TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  'contract': 'Contract',
  'remote': 'Remote',
}

function EmployerJobsContent() {
  const searchParams = useSearchParams()
  const { enqueueSnackbar } = useSnackbar()
  const paymentSuccess = searchParams.get('payment') === 'success'
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [payingJobId, setPayingJobId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/employer/jobs')
      .then((r) => r.json())
      .then((data) => {
        setJobs(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [])

  async function activateJob(jobId: string) {
    setPayingJobId(jobId)
    const res = await fetch('/api/payments/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId }),
    })
    setPayingJobId(null)

    if (!res.ok) {
      const data = await res.json()
      enqueueSnackbar(data.error ?? 'Failed to start payment', { variant: 'error' })
      return
    }

    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

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
        {paymentSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
            <p className="text-sm font-semibold text-green-800">Payment successful — your job is now live!</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-800">My Jobs</h1>
          <Link href="/employer/jobs/new" className="theme-button-primary text-sm px-4 py-2">
            + Post a job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="theme-panel px-8 py-16 text-center">
            <p className="text-slate-500 text-sm mb-4">You haven&apos;t posted any jobs yet.</p>
            <Link href="/employer/jobs/new" className="theme-button-primary text-sm">
              Post your first job
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white border border-slate-200 rounded-2xl px-6 py-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-semibold text-slate-900 truncate">{job.title}</h2>
                      <span
                        className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          job.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {job.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{job.company_name}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                    {job.location}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium">
                    {TYPE_LABELS[job.type] ?? job.type}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {job.is_active ? (
                    <Link
                      href={`/employer/applications?job_id=${job.id}`}
                      className="text-sm text-indigo-600 hover:underline font-medium"
                    >
                      {job._count.applications} application{job._count.applications !== 1 ? 's' : ''} →
                    </Link>
                  ) : (
                    <button
                      onClick={() => activateJob(job.id)}
                      disabled={payingJobId === job.id}
                      className="theme-button-primary text-sm px-4 py-2 disabled:opacity-60"
                    >
                      {payingJobId === job.id ? 'Redirecting…' : 'Pay $99 to activate'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

export default function EmployerJobsPage() {
  return (
    <Suspense fallback={<p className="p-8 text-slate-500 text-sm">Loading…</p>}>
      <EmployerJobsContent />
    </Suspense>
  )
}
