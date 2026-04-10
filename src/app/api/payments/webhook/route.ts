import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripe = getStripe()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const stripeSession = event.data.object
    const job_id = stripeSession.metadata?.job_id

    if (job_id) {
      await prisma.$transaction([
        prisma.job.update({
          where: { id: job_id },
          data: { is_active: true },
        }),
        prisma.payment.updateMany({
          where: { stripe_session_id: stripeSession.id },
          data: { status: 'paid' },
        }),
      ])
    }
  }

  return NextResponse.json({ received: true })
}
