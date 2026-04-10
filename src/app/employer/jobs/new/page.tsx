'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { useSnackbar } from 'notistack'

export default function NewJobPage() {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  const [title, setTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('full-time')
  const [description, setDescription] = useState('')
  const [applyType, setApplyType] = useState('internal')
  const [applyUrl, setApplyUrl] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/employer/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        company_name: companyName,
        company_website: companyWebsite || undefined,
        location,
        type,
        description,
        apply_type: applyType,
        apply_url: applyUrl || undefined,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      enqueueSnackbar(data.error ?? 'Failed to create job', { variant: 'error' })
      return
    }

    enqueueSnackbar('Job created! Pay to activate it.', { variant: 'success' })
    router.push('/employer/jobs')
  }

  return (
    <>
      <Nav />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/employer/jobs" className="text-sm text-indigo-600 hover:underline mb-6 inline-block">
          ← Back to jobs
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Post a job</h1>
          <p className="text-sm text-slate-500 mb-8">
            Your job will be reviewed and activated after a $99 payment. It will stay live for 30 days.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="theme-input"
                  placeholder="Senior ML Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="theme-input"
                  placeholder="Acme AI"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company website</label>
                <input
                  type="url"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  className="theme-input"
                  placeholder="https://acmeai.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="theme-input"
                  placeholder="Remote / San Francisco, CA"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job type <span className="text-red-400">*</span></label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="theme-input"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job description <span className="text-red-400">*</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={10}
                className="theme-input resize-none"
                placeholder="Describe the role, responsibilities, requirements, compensation..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">How do candidates apply? <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setApplyType('internal')}
                  className={`px-4 py-3 rounded-2xl text-sm font-medium border transition-all ${
                    applyType === 'internal'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  Via Live AI Jobs
                </button>
                <button
                  type="button"
                  onClick={() => setApplyType('external')}
                  className={`px-4 py-3 rounded-2xl text-sm font-medium border transition-all ${
                    applyType === 'external'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  External link
                </button>
              </div>

              {applyType === 'external' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">External apply URL <span className="text-red-400">*</span></label>
                  <input
                    type="url"
                    value={applyUrl}
                    onChange={(e) => setApplyUrl(e.target.value)}
                    required={applyType === 'external'}
                    className="theme-input"
                    placeholder="https://careers.acmeai.com/apply"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="theme-button-primary flex-1 disabled:opacity-60"
              >
                {loading ? 'Creating job…' : 'Create job'}
              </button>
              <Link href="/employer/jobs" className="theme-button-secondary">
                Cancel
              </Link>
            </div>

            <p className="text-xs text-slate-400 text-center">
              After creating the job, you&apos;ll be prompted to pay $99 to activate it.
            </p>
          </form>
        </div>
      </main>
    </>
  )
}
