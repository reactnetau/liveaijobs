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

function DashboardContent() {
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

  const activeJobs = jobs.filter((j) => j.is_active)
  const pendingJobs = jobs.filter((j) => !j.is_active)
  const totalApplications = jobs.reduce((sum, j) => sum + j._count.applications, 0)

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
            <p className="text-xs text-green-700 mt-0.5">Job seekers can now find and apply to your listing.</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
          <Link href="/employer/jobs/new" className="theme-button-primary text-sm px-4 py-2">
            + Post a job
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
            <p className="text-xs text-slate-500 mb-1">Active jobs</p>
            <p className="text-2xl font-bold text-indigo-600">{activeJobs.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
            <p className="text-xs text-slate-500 mb-1">Pending payment</p>
            <p className="text-2xl font-bold text-amber-500">{pendingJobs.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
            <p className="text-xs text-slate-500 mb-1">Total applications</p>
            <p className="text-2xl font-bold text-slate-800">{totalApplications}</p>
          </div>
        </div>

        {/* Pending jobs */}
        {pendingJobs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Pending payment</h2>
            <div className="space-y-3">
              {pendingJobs.map((job) => (
                <div key={job.id} className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-800">{job.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{job.company_name} · {job.location}</p>
                  </div>
                  <button
                    onClick={() => activateJob(job.id)}
                    disabled={payingJobId === job.id}
                    className="shrink-0 theme-button-primary text-sm px-4 py-2 disabled:opacity-60"
                  >
                    {payingJobId === job.id ? 'Redirecting…' : 'Pay $99 to activate'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent jobs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">Active jobs</h2>
            <Link href="/employer/jobs" className="text-xs text-indigo-600 hover:underline">View all</Link>
          </div>

          {activeJobs.length === 0 ? (
            <div className="theme-panel px-8 py-12 text-center">
              <p className="text-slate-500 text-sm mb-4">No active jobs yet.</p>
              <Link href="/employer/jobs/new" className="theme-button-primary text-sm">
                Post your first job
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">Job title</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">Location</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">Applications</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">Posted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeJobs.slice(0, 5).map((job) => (
                      <tr key={job.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-4 py-3 font-medium">{job.title}</td>
                        <td className="px-4 py-3 text-slate-500">{job.location}</td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/employer/applications?job_id=${job.id}`}
                            className="text-indigo-600 hover:underline"
                          >
                            {job._count.applications}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(job.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

export default function EmployerDashboardPage() {
  return (
    <Suspense fallback={<p className="p-8 text-slate-500 text-sm">Loading…</p>}>
      <DashboardContent />
    </Suspense>
  )
}
