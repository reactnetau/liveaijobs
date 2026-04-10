import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStripe, JOB_POSTING_PRICE_CENTS } from '@/lib/stripe'
import { getAppUrl } from '@/lib/app-url'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'employer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
  }

  const { job_id } = await req.json()
  if (!job_id) {
    return NextResponse.json({ error: 'job_id required' }, { status: 400 })
  }

  const job = await prisma.job.findUnique({ where: { id: job_id } })
  if (!job || job.employer_id !== session.userId) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  if (job.is_active) {
    return NextResponse.json({ error: 'Job is already active' }, { status: 400 })
  }

  const stripe = getStripe()
  const appUrl = getAppUrl()

  const stripeSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: session.email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: JOB_POSTING_PRICE_CENTS,
          product_data: {
            name: `Job Posting: ${job.title}`,
            description: `${job.company_name} — ${job.location}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { job_id: job.id },
    success_url: `${appUrl}/employer/jobs?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/employer/jobs`,
  })

  await prisma.payment.create({
    data: {
      job_id: job.id,
      stripe_session_id: stripeSession.id,
      amount: JOB_POSTING_PRICE_CENTS,
      status: 'pending',
    },
  })

  return NextResponse.json({ url: stripeSession.url })
}
