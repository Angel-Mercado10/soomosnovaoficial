import 'server-only'
import Stripe from 'stripe'

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY no está configurada')
  }

  return new Stripe(secretKey, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: '2025-03-31.basil' as any,
  })
}
