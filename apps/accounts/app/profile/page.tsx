import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { decodeEntitlements } from '@/lib/root-account/entitlements'
import { LogoutButton } from '@/components/LogoutButton'

const PLAN_LABEL: Record<string, string> = {
  bachelor: '学士',
  master: '修士',
  doctor: '博士',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username, avatar_url')
    .eq('id', session!.user.id)
    .single()

  const entitlements = decodeEntitlements(session!.access_token)
  const plan = entitlements?.plan ?? 'bachelor'

  return (
    <div>
      <header className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-line bg-brand/10 text-lg font-semibold text-brand">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              (profile?.display_name ?? profile?.username ?? session!.user.email ?? '?')
                .charAt(0)
                .toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">
              {profile?.display_name ?? 'ラボの研究員'}
            </h1>
            <p className="text-sm text-muted">
              {profile?.username ? `@${profile.username}` : session!.user.email}
            </p>
          </div>
        </div>
        <LogoutButton />
      </header>

      <div className="mb-6 flex items-center justify-between rounded-lg border border-line p-4">
        <span className="text-sm text-muted">現在のプラン</span>
        <span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-medium text-brand">
          {PLAN_LABEL[plan] ?? plan}
        </span>
      </div>

      <Link
        href="/profile/edit"
        className="mb-3 block w-full rounded-md border border-line py-2.5 text-center text-sm font-medium text-neutral-900 transition hover:bg-surface"
      >
        プロフィールを編集する
      </Link>

      <Link
        href="/billing"
        className="block w-full rounded-md bg-accent py-2.5 text-center text-sm font-medium text-white transition hover:bg-neutral-800"
      >
        プランを管理する
      </Link>
    </div>
  )
}
