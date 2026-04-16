import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const productId = session.metadata?.productId

      if (userId && productId) {
        // Determine plan type from product ID
        let plan = 'free'
        if (productId.includes('pro')) {
          plan = 'pro'
        } else if (productId.includes('business')) {
          plan = 'business'
        }

        // Update user's plan in the database using Drizzle
        await db.update(profiles)
          .set({
            plan: plan as any,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            updatedAt: new Date(),
          })
          .where(eq(profiles.id, userId))
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      // Find user by Stripe customer ID
      const profile = await db.query.profiles.findFirst({
        where: eq(profiles.stripeCustomerId, customerId),
      })

      if (profile) {
        // Update subscription status
        const status = subscription.status
        const isActive = status === 'active' || status === 'trialing'

        if (!isActive) {
          // Downgrade to free if subscription is not active
          await db.update(profiles)
            .set({ plan: 'free', updatedAt: new Date() })
            .where(eq(profiles.id, profile.id))
        }
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      // Find user by Stripe customer ID and downgrade to free
      const profile = await db.query.profiles.findFirst({
        where: eq(profiles.stripeCustomerId, customerId),
      })

      if (profile) {
        await db.update(profiles)
          .set({
            plan: 'free',
            stripeSubscriptionId: null,
            updatedAt: new Date(),
          })
          .where(eq(profiles.id, profile.id))
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
