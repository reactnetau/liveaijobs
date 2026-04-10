'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface UserInfo {
  role: 'employer' | 'job_seeker'
  email: string
}

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/user/me')
      .then((r) => r.ok ? r.json() : null)
      .then(setUser)
      .catch(() => {})
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const employerLinks = [
    { href: '/employer/dashboard', label: 'Dashboard' },
    { href: '/employer/jobs', label: 'My Jobs' },
    { href: '/employer/applications', label: 'Applications' },
  ]

  const seekerLinks = [
    { href: '/jobs', label: 'Browse Jobs' },
    { href: '/applications', label: 'My Applications' },
  ]

  const links = user?.role === 'employer' ? employerLinks : seekerLinks

  return (
    <nav className="border-b border-white/50 bg-white/70 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-slate-800 text-sm tracking-tight">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/30">
            AI
          </span>
          Live AI Jobs
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-2xl text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? 'bg-[rgba(224,231,255,0.75)] text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="ml-3 flex items-center gap-2">
            <span className="text-xs text-slate-400 px-2">
              {user?.role === 'employer' ? 'Employer' : 'Job Seeker'}
            </span>
            <button
              onClick={logout}
              className="px-3 py-2 rounded-2xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="md:hidden inline-flex items-center justify-center rounded-2xl border border-white/60 bg-white/80 px-3 py-2 text-slate-700 shadow-sm hover:bg-white transition-colors"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          <div className="flex flex-col gap-1.5">
            <span className={`block h-0.5 w-5 bg-current transition-transform ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-5 bg-current transition-opacity ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`block h-0.5 w-5 bg-current transition-transform ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </div>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/50 bg-white/88 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? 'bg-[rgba(224,231,255,0.75)] text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-slate-100 my-1" />
            <button
              onClick={logout}
              className="w-full px-4 py-3 rounded-2xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-colors text-left"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
