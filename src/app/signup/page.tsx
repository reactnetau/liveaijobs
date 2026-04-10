'use client'

import { useState, FormEvent, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSnackbar } from 'notistack'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { enqueueSnackbar } = useSnackbar()

  const defaultRole = searchParams.get('role') === 'employer' ? 'employer' : 'job_seeker'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'employer' | 'job_seeker'>(defaultRole)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (password !== confirmPassword) {
      enqueueSnackbar('Passwords do not match', { variant: 'error' })
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      enqueueSnackbar(data.error ?? 'Signup failed', { variant: 'error' })
      return
    }

    if (role === 'employer') {
      router.push('/employer/dashboard')
    } else {
      router.push('/jobs')
    }
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden lg:block px-4">
          <p className="theme-kicker mb-5">Get started free</p>
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            The job board built for AI engineers.
          </h1>
          <p className="mt-5 max-w-lg text-base text-slate-600">
            Job seekers browse for free. Employers post a role for $99 and it goes live instantly after payment.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">✓</span>
              Free to browse and apply
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">✓</span>
              $99 flat fee per job posting
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">✓</span>
              View all applications in your dashboard
            </li>
          </ul>
        </div>

        <div className="theme-panel w-full max-w-md justify-self-center px-6 py-7 sm:px-8 sm:py-9">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Create account</h1>
          <p className="text-slate-500 text-sm mb-6">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 hover:underline">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="theme-label">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('job_seeker')}
                  className={`px-4 py-3 rounded-2xl text-sm font-medium border transition-all ${
                    role === 'job_seeker'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  Job Seeker
                </button>
                <button
                  type="button"
                  onClick={() => setRole('employer')}
                  className={`px-4 py-3 rounded-2xl text-sm font-medium border transition-all ${
                    role === 'employer'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  Employer
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="theme-input"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="theme-input"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="theme-input"
                placeholder="Re-enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="theme-button-primary w-full disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>

            <p className="text-xs text-slate-400 text-center">
              {role === 'employer'
                ? 'You\'ll pay $99 per job posting after creating your account.'
                : 'Free to browse and apply to jobs.'}
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-slate-500 text-sm">Loading…</p></div>}>
      <SignupForm />
    </Suspense>
  )
}
