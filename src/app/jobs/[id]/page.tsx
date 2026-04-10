'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import MarketingNav from '@/components/MarketingNav'
import { useSnackbar } from 'notistack'

interface Job {
  id: string
  title: string
  company_name: string
  company_website: string | null
  location: string
  type: string
  description: string
  apply_type: string
  apply_url: string | null
  created_at: string
}

interface UserInfo {
  role: 'employer' | 'job_seeker'
  email: string
}

const TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  'contract': 'Contract',
  'remote': 'Remote',
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const id = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [user, setUser] = useState<UserInfo | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [applying, setApplying] = useState(false)

  // Application form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [coverLetter, setCoverLetter] = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`/api/jobs/${id}`).then((r) => r.ok ? r.json() : null),
      fetch('/api/user/me').then((r) => r.ok ? r.json() : null),
    ]).then(([j, u]) => {
      setJob(j)
      setUser(u)
      setLoading(false)
    })
  }, [id])

  async function handleApply(e: FormEvent) {
    e.preventDefault()
    setApplying(true)

    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: id, name, email, resume_url: resumeUrl || undefined, cover_letter: coverLetter || undefined }),
    })

    setApplying(false)

    if (!res.ok) {
      const data = await res.json()
      enqueueSnackbar(data.error ?? 'Application failed', { variant: 'error' })
      return
    }

    enqueueSnackbar('Application submitted!', { variant: 'success' })
    router.push('/jobs?applied=1')
  }

  if (loading) {
    return (
      <>
        <Nav />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <p className="text-slate-500 text-sm">Loading…</p>
        </main>
      </>
    )
  }

  if (!job) {
    return (
      <>
        <Nav />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <p className="text-slate-500 text-sm">Job not found.</p>
          <Link href="/jobs" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">← Back to jobs</Link>
        </main>
      </>
    )
  }

  const NavComponent = user ? Nav : MarketingNav

  return (
    <>
      <NavComponent />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link href={user ? '/jobs' : '/'} className="text-sm text-indigo-600 hover:underline mb-6 inline-block">
          ← Back to jobs
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 mb-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
            </div>
            <div className="flex items-center gap-2 text-slate-600 text-sm mb-4">
              {job.company_website ? (
                <a
                  href={job.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-indigo-600 hover:underline"
                >
                  {job.company_name}
                </a>
              ) : (
                <span className="font-medium">{job.company_name}</span>
              )}
              <span className="text-slate-300">·</span>
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                {job.location}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium">
                {TYPE_LABELS[job.type] ?? job.type}
              </span>
            </div>
          </div>

          <hr className="border-slate-100 mb-6" />

          {/* Description */}
          <div className="prose prose-slate prose-sm max-w-none">
            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</div>
          </div>
        </div>

        {/* Apply section */}
        {user?.role === 'job_seeker' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8">
            {job.apply_type === 'external' && job.apply_url ? (
              <div className="text-center">
                <h2 className="text-lg font-bold text-slate-800 mb-2">Ready to apply?</h2>
                <p className="text-slate-500 text-sm mb-5">This job uses an external application system.</p>
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="theme-button-primary"
                >
                  Apply on company site →
                </a>
              </div>
            ) : showForm ? (
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-5">Apply for this role</h2>
                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="theme-input"
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="theme-input"
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Resume URL <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      className="theme-input"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Cover letter <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={5}
                      className="theme-input resize-none"
                      placeholder="Tell them why you're a great fit…"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={applying}
                      className="theme-button-primary flex-1 disabled:opacity-60"
                    >
                      {applying ? 'Submitting…' : 'Submit application'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="theme-button-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-lg font-bold text-slate-800 mb-2">Interested in this role?</h2>
                <p className="text-slate-500 text-sm mb-5">Submit your application directly through Live AI Jobs.</p>
                <button onClick={() => setShowForm(true)} className="theme-button-primary">
                  Apply now
                </button>
              </div>
            )}
          </div>
        )}

        {!user && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Want to apply?</h2>
            <p className="text-slate-500 text-sm mb-5">Create a free account to apply to this role.</p>
            <Link href="/signup?role=job_seeker" className="theme-button-primary">
              Sign up to apply
            </Link>
          </div>
        )}
      </main>
    </>
  )
}
