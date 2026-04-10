import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'employer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const stripe_session_id = searchParams.get('session_id')

  if (!stripe_session_id) {
    return NextResponse.json({ error: 'session_id required' }, { status: 400 })
  }

  const stripe = getStripe()
  const stripeSession = await stripe.checkout.sessions.retrieve(stripe_session_id)

  if (stripeSession.payment_status !== 'paid') {
    return NextResponse.json({ ok: false, status: stripeSession.payment_status })
  }

  const job_id = stripeSession.metadata?.job_id
  if (!job_id) {
    return NextResponse.json({ error: 'No job_id in session metadata' }, { status: 400 })
  }

  // Verify the job belongs to this employer
  const job = await prisma.job.findUnique({ where: { id: job_id } })
  if (!job || job.employer_id !== session.userId) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  // Activate the job and record the payment (idempotent)
  await prisma.$transaction([
    prisma.job.update({
      where: { id: job_id },
      data: { is_active: true },
    }),
    prisma.payment.updateMany({
      where: { stripe_session_id },
      data: { status: 'paid' },
    }),
  ])

  return NextResponse.json({ ok: true, job_id })
}
