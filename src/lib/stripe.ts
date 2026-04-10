import Stripe from 'stripe'

export const JOB_POSTING_PRICE_CENTS = 9900 // $99.00

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(key, { apiVersion: '2025-02-24.acacia' })
}
