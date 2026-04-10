import Link from 'next/link'

export default function MarketingNav() {
  return (
    <nav className="border-b border-white/50 bg-white/70 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-slate-800 text-sm tracking-tight">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/30">
            AI
          </span>
          Live AI Jobs
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="px-3 py-2 rounded-2xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="theme-button-primary px-4 py-2 text-sm"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  )
}
