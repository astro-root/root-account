import { NextResponse, type NextRequest } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', session.user.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    return NextResponse.redirect(new URL('/billing', request.url))
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_ACCOUNTS_URL}/billing`,
  })

  return NextResponse.redirect(portalSession.url, { status: 303 })
}
