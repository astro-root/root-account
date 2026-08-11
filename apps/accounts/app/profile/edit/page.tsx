import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AvatarUploader } from './avatar-uploader'
import { ProfileForm, EmailForm, PasswordForm } from './edit-forms'

export default async function ProfileEditPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, bio, avatar_url')
    .eq('id', session!.user.id)
    .single()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink-text">アカウント設定</h1>
        <Link href="/profile" className="text-sm text-ink-muted hover:text-ink-text">
          ← 研究員証に戻る
        </Link>
      </div>

      <div className="mb-6 rounded-lg border border-ink-border bg-ink-surface p-5">
        <h2 className="mb-3 font-display text-lg text-ink-text">アイコン</h2>
        <AvatarUploader userId={session!.user.id} initialUrl={profile?.avatar_url ?? null} />
      </div>

      <div className="space-y-4">
        <ProfileForm
          initialUsername={profile?.username ?? ''}
          initialDisplayName={profile?.display_name ?? ''}
          initialBio={profile?.bio ?? ''}
        />
        <EmailForm currentEmail={session!.user.email ?? ''} />
        <PasswordForm />
      </div>
    </div>
  )
}
