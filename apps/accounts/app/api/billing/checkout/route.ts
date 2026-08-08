import { NextResponse, type NextRequest } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Stripeダッシュボードで作成した価格IDに置き換える
const PRICE_ID: Record<string, string> = {
  master: process.env.STRIPE_PRICE_MASTER ?? '',
  doctor: process.env.STRIPE_PRICE_DOCTOR ?? '',
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const formData = await request.formData()
  const plan = String(formData.get('plan') ?? '')
  const priceId = PRICE_ID[plan]

  if (!priceId) {
    return NextResponse.json({ error: 'invalid plan' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', session.user.id)
    .single()

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: existing?.stripe_customer_id || undefined,
    customer_email: existing?.stripe_customer_id ? undefined : session.user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      // Webhookがどのroot_user_idを更新すべきか判定するために必須
      metadata: { root_user_id: session.user.id },
    },
    success_url: `${process.env.NEXT_PUBLIC_ACCOUNTS_URL}/billing?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_ACCOUNTS_URL}/billing?checkout=cancel`,
  })

  return NextResponse.redirect(checkoutSession.url!, { status: 303 })
}
