import { NextRequest, NextResponse } from 'next/server'
import { importJobs } from '@/lib/job-sources'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // seconds

export async function GET(req: NextRequest) {
  // Protect with a shared secret so only authorized callers can trigger
  const authHeader = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET

  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }

  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await importJobs()
    return NextResponse.json({
      ok: true,
      added: result.added,
      total: result.total,
      ran_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[cron/fetch-jobs]', err)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
