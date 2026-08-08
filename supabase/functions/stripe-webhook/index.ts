// Stripe Webhookを受け取り、public.subscriptionsテーブルを同期するEdge Function。
// Stripeの customer.subscription.* / checkout.session.completed イベントを購読する想定。
//
// デプロイ: supabase functions deploy stripe-webhook --no-verify-jwt
// (Stripeからの呼び出しなのでSupabaseのJWT検証は無効化し、代わりにStripe署名検証を行う)

import Stripe from 'npm:stripe@17'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
})
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Stripeの価格IDとplan_tierの対応表。Stripeダッシュボードで作成した価格IDに置き換える。
const PRICE_TO_PLAN: Record<string, 'master' | 'doctor'> = {
  price_XXXXXXXXXXXXmaster: 'master',
  price_XXXXXXXXXXXXdoctor: 'doctor',
}

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret)
  } catch (err) {
    console.error('signature verification failed', err)
    return new Response('invalid signature', { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription =
        event.type === 'checkout.session.completed'
          ? await stripe.subscriptions.retrieve(
              (event.data.object as Stripe.Checkout.Session).subscription as string
            )
          : (event.data.object as Stripe.Subscription)

      const rootUserId = subscription.metadata?.root_user_id
      if (!rootUserId) {
        console.error('subscription is missing root_user_id metadata', subscription.id)
        break
      }

      const priceId = subscription.items.data[0]?.price.id
      const plan = PRICE_TO_PLAN[priceId ?? ''] ?? 'bachelor'

      await supabaseAdmin
        .from('subscriptions')
        .update({
          plan,
          status: subscription.status,
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        })
        .eq('user_id', rootUserId)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const rootUserId = subscription.metadata?.root_user_id
      if (!rootUserId) break

      await supabaseAdmin
        .from('subscriptions')
        .update({ plan: 'bachelor', status: 'canceled' })
        .eq('user_id', rootUserId)
      break
    }

    default:
      // 未対応のイベントは無視
      break
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
