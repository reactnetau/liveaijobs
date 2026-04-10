'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import MarketingNav from '@/components/MarketingNav'

interface SourcedJob {
  id: string
  title: string
  company: string
  location: string
  is_remote: boolean
  url: string
  source: string
  posted_at: string | null
  created_at: string
}

interface ApiResponse {
  jobs: SourcedJob[]
  total: number
  page: number
  pages: number
  limit: number
}

// ── Freshness helpers ──────────────────────────────────────────────────────────

function freshnessLabel(posted_at: string | null, created_at: string): string {
  const date = posted_at ? new Date(posted_at) : new Date(created_at)
  const hours = (Date.now() - date.getTime()) / 3_600_000

  if (hours < 24) return 'New'
  if (hours < 48) return 'Posted today'
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

function freshnessColor(posted_at: string | null, created_at: string): string {
  const date = posted_at ? new Date(posted_at) : new Date(created_at)
  const hours = (Date.now() - date.getTime()) / 3_600_000

  if (hours < 24)
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  if (hours < 48)
    return 'bg-blue-50 text-blue-700 border border-blue-200'
  return 'bg-slate-100 text-slate-500 border border-transparent'
}

// ── Source badge colors ────────────────────────────────────────────────────────

const SOURCE_COLORS: Record<string, string> = {
  'Remotive': 'bg-violet-50 text-violet-700',
  'Greenhouse': 'bg-green-50 text-green-700',
  'Lever': 'bg-amber-50 text-amber-700',
  'Company Site': 'bg-sky-50 text-sky-700',
  'Mock': 'bg-slate-100 text-slate-500',
}

function sourceBadgeColor(source: string): string {
  return SOURCE_COLORS[source] ?? 'bg-slate-100 text-slate-500'
}

// ── Job card ──────────────────────────────────────────────────────────────────

function JobCard({ job }: { job: SourcedJob }) {
  const freshLabel = freshnessLabel(job.posted_at, job.created_at)
  const freshColor = freshnessColor(job.posted_at, job.created_at)
  const isNew = freshLabel === 'New'

  return (
    <a
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white border border-slate-200 rounded-2xl px-6 py-5 hover:border-indigo-200 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Company initial avatar */}
        <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm">
          {job.company.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors leading-tight">
              {job.title}
            </h3>
            {isNew && (
              <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md ${freshColor}`}>
                New
              </span>
            )}
          </div>

          {/* Company + location */}
          <p className="text-sm text-slate-500">
            {job.company}
            <span className="mx-1.5 text-slate-300">·</span>
            {job.is_remote ? (
              <span className="text-indigo-600 font-medium">Remote</span>
            ) : (
              job.location
            )}
          </p>

          {/* Badges row */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {job.is_remote && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium">
                Remote
              </span>
            )}
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${sourceBadgeColor(job.source)}`}>
              From {job.source}
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${freshColor}`}>
              {freshLabel}
            </span>
          </div>
        </div>

        {/* External link icon */}
        <svg
          className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0 mt-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </div>
    </a>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function JobSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl px-6 py-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="hidden sm:block h-10 w-10 rounded-xl bg-slate-100 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-64 bg-slate-100 rounded-lg" />
          <div className="h-3 w-40 bg-slate-100 rounded-lg" />
          <div className="flex gap-2 mt-3">
            <div className="h-6 w-16 bg-slate-100 rounded-lg" />
            <div className="h-6 w-24 bg-slate-100 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SourcedJobsPage() {
  const [jobs, setJobs] = useState<SourcedJob[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchJobs = useCallback(async (p: number, q: string, remote: boolean) => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(p),
      limit: '20',
      ...(remote ? { remote: 'true' } : {}),
      ...(q ? { q } : {}),
    })
    try {
      const res = await fetch(`/api/sourced-jobs?${params}`)
      const data: ApiResponse = await res.json()
      setJobs(data.jobs)
      setTotal(data.total)
      setPages(data.pages)
      setPage(data.page)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchJobs(1, '', false)
  }, [fetchJobs])

  // Debounced search
  function handleSearch(val: string) {
    setSearch(val)
    if (searchRef.current) clearTimeout(searchRef.current)
    searchRef.current = setTimeout(() => {
      setPage(1)
      fetchJobs(1, val, remoteOnly)
    }, 300)
  }

  function handleRemoteToggle() {
    const next = !remoteOnly
    setRemoteOnly(next)
    setPage(1)
    fetchJobs(1, search, next)
  }

  function handlePage(p: number) {
    setPage(p)
    fetchJobs(p, search, remoteOnly)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen">
      <MarketingNav />

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
            ← Back to home
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <span className="theme-kicker">Live feed</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Jobs sourced from the internet
          </h1>
          <p className="text-slate-500 max-w-xl">
            AI engineering roles automatically aggregated from job boards and company career pages.
            Updated every 8 hours. Click any role to apply on the original site.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by title, company, location…"
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>

          {/* Remote toggle */}
          <button
            onClick={handleRemoteToggle}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium border transition-all shrink-0 ${
              remoteOnly
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:text-indigo-700'
            }`}
          >
            <span
              className={`h-4 w-4 rounded-full border-2 inline-flex items-center justify-center shrink-0 ${
                remoteOnly ? 'border-white' : 'border-slate-300'
              }`}
            >
              {remoteOnly && <span className="h-2 w-2 rounded-full bg-white inline-block" />}
            </span>
            Remote only
          </button>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-slate-500 mb-5">
            {total === 0 ? (
              'No jobs found'
            ) : (
              <>
                <span className="font-semibold text-slate-700">{total}</span> job{total !== 1 ? 's' : ''} found
                {search && <> for &ldquo;<span className="text-indigo-600">{search}</span>&rdquo;</>}
                {remoteOnly && <> · Remote only</>}
              </>
            )}
          </p>
        )}

        {/* Job list */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <JobSkeleton key={i} />)
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm mb-2">No jobs match your filters.</p>
              <button
                onClick={() => { setSearch(''); setRemoteOnly(false); fetchJobs(1, '', false) }}
                className="text-sm text-indigo-600 hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </div>

        {/* Pagination */}
        {!loading && pages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-1">
            <button
              onClick={() => handlePage(page - 1)}
              disabled={page === 1}
              className="px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ← Prev
            </button>

            {Array.from({ length: Math.min(7, pages) }, (_, i) => {
              // Show pages around current page
              let p: number
              if (pages <= 7) {
                p = i + 1
              } else if (page <= 4) {
                p = i + 1
              } else if (page >= pages - 3) {
                p = pages - 6 + i
              } else {
                p = page - 3 + i
              }
              return (
                <button
                  key={p}
                  onClick={() => handlePage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition ${
                    p === page
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              )
            })}

            <button
              onClick={() => handlePage(page + 1)}
              disabled={page === pages}
              className="px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        )}

        {/* Footer note */}
        <p className="mt-12 text-xs text-slate-400 text-center">
          Jobs are automatically sourced from public job boards and company career pages.
          Click any listing to apply directly on the original site.
        </p>
      </main>
    </div>
  )
}
