import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import MarketingNav from '@/components/MarketingNav'
import { SourcedJobsTeaser } from '@/components/SourcedJobsTeaser'

export const dynamic = 'force-dynamic'

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

export default async function HomePage() {
  let jobs: { id: string; title: string; company_name: string; location: string; type: string; created_at: Date }[] = []
  let totalJobs = 0

  try {
    ;[jobs, totalJobs] = await Promise.all([
      prisma.job.findMany({
        where: { is_active: true },
        orderBy: { created_at: 'desc' },
        take: 6,
        select: {
          id: true,
          title: true,
          company_name: true,
          location: true,
          type: true,
          created_at: true,
        },
      }),
      prisma.job.count({ where: { is_active: true } }),
    ])
  } catch {
    // DB unavailable — render page without job listings
  }

  return (
    <div className="min-h-screen">
      <MarketingNav />

      {/* ── Hero ── */}
      <section className="relative pt-20 pb-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="theme-kicker mb-6 mx-auto w-fit">
            AI Engineering Jobs
          </span>
          <h1 className="mt-4 text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-[1.08]">
            Find your next<br className="hidden sm:block" />{' '}
            <span className="text-indigo-600">AI engineering</span> role
          </h1>
          <p className="mt-6 text-xl text-slate-500 max-w-xl mx-auto leading-relaxed">
            Curated jobs in machine learning, LLMs, and AI startups. Browse roles from teams building the future of AI.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/jobs" className="theme-button-primary w-full sm:w-auto px-8 py-3.5 text-base">
              Browse Jobs
            </Link>
            <Link href="/employer/jobs/new" className="theme-button-secondary w-full sm:w-auto px-8 py-3.5 text-base">
              Post a Job — $99
            </Link>
          </div>
          {totalJobs > 0 && (
            <p className="mt-6 text-sm text-slate-400">
              {totalJobs} active role{totalJobs !== 1 ? 's' : ''} right now
            </p>
          )}
        </div>
      </section>

      {/* ── Job Listings Preview ── */}
      <section className="py-16 px-4 bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-800">Latest roles</h2>
            <Link href="/jobs" className="text-sm text-indigo-600 hover:underline font-medium">
              View all jobs →
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm">New roles coming soon. Check back shortly.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-5 bg-white hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm">
                      {job.company_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                        {job.title}
                      </p>
                      <p className="text-sm text-slate-500 truncate">{job.company_name} · {job.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium">
                      {TYPE_LABELS[job.type] ?? job.type}
                    </span>
                    <span className="text-xs text-slate-400 w-16 text-right">{timeAgo(new Date(job.created_at))}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all jobs →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Sourced Jobs Teaser ── */}
      <SourcedJobsTeaser />

      {/* ── For Job Seekers ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="theme-kicker mb-3 mx-auto w-fit">For engineers</p>
            <h2 className="text-3xl font-bold text-slate-900">Built for AI engineers</h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">
              Every listing is hand-reviewed. No noise — just real roles at companies building with AI.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <FeatureCard
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
              }
              title="AI-focused only"
              description="No generic software jobs. Every role is ML, LLMs, AI infrastructure, or AI product engineering."
            />
            <FeatureCard
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              }
              title="Quality listings"
              description="Employers pay to post. That means real jobs from real teams — no ghost listings or spam."
            />
            <FeatureCard
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              }
              title="Simple to apply"
              description="Apply directly through the platform or via the company's site. No recruiter middlemen."
            />
          </div>

          <div className="mt-12 text-center">
            <Link href="/jobs" className="theme-button-primary px-8 py-3.5 text-base">
              Browse jobs — it&apos;s free
            </Link>
          </div>
        </div>
      </section>

      {/* ── For Employers ── */}
      <section className="py-20 px-4 bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] bg-indigo-500/20 text-indigo-300 mb-6">
                For employers
              </p>
              <h2 className="text-3xl font-bold text-white leading-snug">
                Hire top AI engineers
              </h2>
              <p className="mt-4 text-slate-400 text-base leading-relaxed">
                Reach a focused audience of ML engineers, LLM developers, and AI researchers actively looking for new roles.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  'Flat $99 — no subscriptions, no recruiter fees',
                  'Your listing goes live within minutes of payment',
                  'Applications land directly in your dashboard',
                  'Set external or internal applications',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-300 text-sm">
                    <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link href="/employer/jobs/new" className="inline-flex items-center justify-center rounded-2xl px-8 py-3.5 text-base font-semibold text-slate-900 bg-white hover:bg-slate-50 transition-colors shadow-md">
                  Post a job — $99
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">New applicant</p>
                  <span className="text-xs text-slate-500">just now</span>
                </div>
                {[
                  { name: 'Alex Chen', role: 'Senior ML Engineer', tag: 'ML' },
                  { name: 'Jordan Park', role: 'LLM Infrastructure Lead', tag: 'LLM' },
                  { name: 'Sam Rivera', role: 'AI Research Engineer', tag: 'Research' },
                ].map((applicant) => (
                  <div key={applicant.name} className="flex items-center gap-3 bg-slate-700/50 rounded-xl px-4 py-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-bold shrink-0">
                      {applicant.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{applicant.name}</p>
                      <p className="text-slate-400 text-xs truncate">{applicant.role}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-medium shrink-0">
                      {applicant.tag}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-700">
                  <p className="text-xs text-slate-500 text-center">Applications managed in your dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900">Ready to get started?</h2>
          <p className="mt-4 text-slate-500">
            Job seekers browse free. Employers post for $99.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/jobs" className="theme-button-primary w-full sm:w-auto px-8 py-3.5 text-base">
              Browse jobs free
            </Link>
            <Link href="/employer/jobs/new" className="theme-button-secondary w-full sm:w-auto px-8 py-3.5 text-base">
              Post a job — $99
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 py-10 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold">
              AI
            </span>
            <span className="text-sm font-semibold text-slate-700">Live AI Jobs</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <Link href="/jobs" className="hover:text-slate-600 transition-colors">Browse jobs</Link>
            <Link href="/employer/jobs/new" className="hover:text-slate-600 transition-colors">Post a job</Link>
            <Link href="/login" className="hover:text-slate-600 transition-colors">Sign in</Link>
          </div>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Live AI Jobs</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-6 py-6">
      <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  )
}
