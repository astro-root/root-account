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
        <h1 className="text-2xl font-semibold text-neutral-900">アカウント設定</h1>
        <Link href="/profile" className="text-sm text-muted hover:text-neutral-900">
          ← 研究員証に戻る
        </Link>
      </div>

      <div className="mb-6 rounded-lg border border-line bg-white p-5">
        <h2 className="mb-3 text-base font-semibold text-neutral-900">アイコン</h2>
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
