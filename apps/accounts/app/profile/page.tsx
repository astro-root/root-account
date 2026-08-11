import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { decodeEntitlements } from '@/lib/root-account/entitlements'
import { PlanSeal } from '@/components/PlanSeal'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, research_points, bio')
    .eq('id', session!.user.id)
    .single()

  const { data: badges } = await supabase
    .from('user_badges')
    .select('badge_code, awarded_by, badges(name, icon)')
    .eq('user_id', session!.user.id)

  const entitlements = decodeEntitlements(session!.access_token)
  const plan = entitlements?.plan ?? 'bachelor'

  return (
    <div>
      <header className="mb-8 flex items-start justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass/70">
            Researcher ID
          </p>
          <h1 className="mt-2 font-display text-2xl text-ink-text">
            {profile?.display_name ?? 'ラボの研究員'}
          </h1>
          <p className="mt-1 font-mono text-sm text-ink-muted">{session!.user.email}</p>
        </div>
        <PlanSeal plan={plan} />
      </header>

      <section className="mb-6 rounded-lg border border-ink-border bg-ink-surface p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-muted">研究ポイント</span>
          <span className="font-mono text-2xl text-brass">
            {profile?.research_points ?? 0}
            <span className="ml-1 text-xs text-ink-muted">pt</span>
          </span>
        </div>
      </section>

      <section className="mb-6 rounded-lg border border-ink-border bg-ink-surface p-5">
        <h2 className="mb-3 text-sm text-ink-muted">獲得バッジ</h2>
        {badges && badges.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {badges.map((b: any) => (
              <li
                key={b.badge_code}
                className="rounded-full border border-ink-border bg-ink-surface2 px-3 py-1 text-xs text-ink-text"
              >
                {b.badges?.name ?? b.badge_code}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">
            各サービスで課題をこなすと、ここにバッジが並びます。
          </p>
        )}
      </section>

      <Link
        href="/billing"
        className="block w-full rounded-md border border-brass bg-brass/10 py-3 text-center font-medium text-brass transition hover:bg-brass/20"
      >
        プランを管理する
      </Link>
    </div>
  )
}
