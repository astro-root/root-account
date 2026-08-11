import { createClient } from '@/lib/supabase/server'
import { decodeEntitlements } from '@/lib/root-account/entitlements'
import { PlanSeal } from '@/components/PlanSeal'
import type { PlanTier } from '@/lib/root-account/entitlements'

const PLANS: {
  tier: PlanTier
  price: string
  features: string[]
}[] = [
  { tier: 'bachelor', price: '無料', features: ['全サービスの基本機能', '研究ポイント獲得'] },
  {
    tier: 'master',
    price: '¥300 / 月',
    features: ['学士の全機能', '広告非表示', '保存容量アップ', 'ベータ機能への参加'],
  },
  {
    tier: 'doctor',
    price: '¥500 / 月',
    features: ['修士の全機能', 'AI機能の利用', '先行アクセス', '博士バッジの表示'],
  },
]

export default async function BillingPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const entitlements = decodeEntitlements(session!.access_token)
  const currentPlan = entitlements?.plan ?? 'bachelor'

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id, current_period_end, cancel_at_period_end')
    .eq('user_id', session!.user.id)
    .single()

  return (
    <div>
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass/70">Plan</p>
        <h1 className="mt-2 font-display text-2xl text-ink-text">プランを管理する</h1>
        {subscription?.current_period_end && (
          <p className="mt-2 text-xs text-ink-muted">
            次回更新日:{' '}
            {new Date(subscription.current_period_end).toLocaleDateString('ja-JP')}
            {subscription.cancel_at_period_end && '（更新日をもって解約予定）'}
          </p>
        )}
      </header>

      <div className="space-y-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.tier === currentPlan
          return (
            <div
              key={plan.tier}
              className={`flex items-start gap-4 rounded-lg border p-5 ${
                isCurrent ? 'border-brass bg-brass/5' : 'border-ink-border bg-ink-surface'
              }`}
            >
              <PlanSeal plan={plan.tier} size="sm" />
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-sm text-ink-text">{plan.price}</span>
                  {isCurrent && (
                    <span className="rounded-full bg-sage/15 px-2 py-0.5 text-xs text-sage">
                      現在のプラン
                    </span>
                  )}
                </div>
                <ul className="mt-2 space-y-1 text-xs text-ink-muted">
                  {plan.features.map((f) => (
                    <li key={f}>・{f}</li>
                  ))}
                </ul>

                {!isCurrent && plan.tier !== 'bachelor' && (
                  <form action="/api/billing/checkout" method="post" className="mt-3">
                    <input type="hidden" name="plan" value={plan.tier} />
                    <button
                      type="submit"
                      className="rounded-md border border-brass px-4 py-1.5 text-xs text-brass hover:bg-brass/10"
                    >
                      このプランにする
                    </button>
                  </form>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {subscription?.stripe_customer_id && (
        <form action="/api/billing/portal" method="post" className="mt-8">
          <button
            type="submit"
            className="w-full rounded-md border border-ink-border py-3 text-sm text-ink-muted hover:border-ink-muted"
          >
            支払い方法・請求履歴を管理する
          </button>
        </form>
      )}
    </div>
  )
}
