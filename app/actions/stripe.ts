'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { stripe } from '@/lib/stripe'
import { PRODUCTS } from '@/lib/products'
import { eq } from 'drizzle-orm'

export async function startCheckoutSession(productId: string) {
  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  const session = await auth()
  const user = session?.user

  if (!user?.id || !user.email) {
    throw new Error('User not authenticated')
  }

  const stripeSession = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    customer_email: user.email,
    metadata: {
      userId: user.id,
      productId: product.id,
    },
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.priceInCents,
          recurring: product.mode === 'subscription' ? {
            interval: (product.interval as any) || 'month',
          } : undefined,
        },
        quantity: 1,
      },
    ],
    mode: product.mode as any,
  })

  return stripeSession.client_secret
}

export async function createPortalSession() {
  const session = await auth()
  const user = session?.user

  if (!user?.id) {
    throw new Error('User not authenticated')
  }

  // Get user's Stripe customer ID from profile using Drizzle
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
    columns: {
      stripeCustomerId: true,
    }
  })

  if (!profile?.stripeCustomerId) {
    throw new Error('No subscription found')
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: profile.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/billing`,
  })

  return portalSession.url
}
