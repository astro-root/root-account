import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { decodeEntitlements } from '@/lib/root-account/entitlements'
import type { PlanTier } from '@/lib/root-account/entitlements'

const PLAN_STYLE: Record<PlanTier, { badgeBg: string; badgeText: string; ring: string }> = {
  bachelor: { badgeBg: 'bg-neutral-100', badgeText: 'text-neutral-600', ring: 'border-neutral-300' },
  master: { badgeBg: 'bg-brand/10', badgeText: 'text-brand', ring: 'border-brand' },
  doctor: { badgeBg: 'bg-gold/10', badgeText: 'text-gold', ring: 'border-gold' },
}

const PLANS: {
  tier: PlanTier
  label: string
  price: string
  features: string[]
}[] = [
  { tier: 'bachelor', label: '学士', price: '無料', features: ['全サービスの基本機能'] },
  {
    tier: 'master',
    label: '修士',
    price: '¥300 / 月',
    features: ['学士の全機能', '広告非表示', '保存容量アップ', 'ベータ機能への参加'],
  },
  {
    tier: 'doctor',
    label: '博士',
    price: '¥500 / 月',
    features: ['修士の全機能', 'AI機能の利用', '先行アクセス'],
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Plan</p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-900">プランを管理する</h1>
        </div>
        <Link href="/profile" className="text-sm text-muted hover:text-neutral-900">
          ← 戻る
        </Link>
      </div>

      {subscription?.current_period_end && (
        <p className="mb-4 text-xs text-muted">
          次回更新日: {new Date(subscription.current_period_end).toLocaleDateString('ja-JP')}
          {subscription.cancel_at_period_end && '（更新日をもって解約予定）'}
        </p>
      )}

      <div className="space-y-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.tier === currentPlan
          const style = PLAN_STYLE[plan.tier]
          return (
            <div
              key={plan.tier}
              className={`rounded-lg border-2 p-4 ${
                isCurrent ? `${style.ring} bg-white` : 'border-line bg-surface'
              }`}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-neutral-900">
                  {plan.label}
                  <span className="ml-2 font-normal text-muted">{plan.price}</span>
                </span>
                {isCurrent && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.badgeBg} ${style.badgeText}`}>
                    現在のプラン
                  </span>
                )}
              </div>
              <ul className="mt-2 space-y-1 text-xs text-muted">
                {plan.features.map((f) => (
                  <li key={f}>・{f}</li>
                ))}
              </ul>

              {!isCurrent && plan.tier !== 'bachelor' && (
                <form action="/api/billing/checkout" method="post" className="mt-3">
                  <input type="hidden" name="plan" value={plan.tier} />
                  <button
                    type="submit"
                    className="rounded-md border border-line px-4 py-1.5 text-xs font-medium text-neutral-900 hover:bg-surface"
                  >
                    このプランにする
                  </button>
                </form>
              )}
            </div>
          )
        })}
      </div>

      {subscription?.stripe_customer_id && (
        <form action="/api/billing/portal" method="post" className="mt-8">
          <button
            type="submit"
            className="w-full rounded-md border border-line py-2.5 text-sm text-muted hover:bg-surface"
          >
            支払い方法・請求履歴を管理する
          </button>
        </form>
      )}
    </div>
  )
}
