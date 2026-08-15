'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface EditResult {
  ok: boolean
  message: string
}

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/

export async function updateProfile(formData: FormData): Promise<EditResult> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return { ok: false, message: 'ログインが必要です' }

  const username = String(formData.get('username') ?? '').trim().toLowerCase()
  const displayName = String(formData.get('display_name') ?? '').trim()
  const bio = String(formData.get('bio') ?? '').trim()

  if (!USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      message: 'ユーザーIDは半角英数字とアンダースコアのみ、3〜20文字で入力してください',
    }
  }
  if (!displayName) {
    return { ok: false, message: '表示名を入力してください' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ username, display_name: displayName, bio: bio || null })
    .eq('id', session.user.id)

  if (error) {
    if (error.code === '23505') {
      return { ok: false, message: 'そのユーザーIDは既に使われています' }
    }
    return { ok: false, message: '更新に失敗しました' }
  }

  revalidatePath('/profile')
  return { ok: true, message: '保存しました' }
}

export async function updateAvatarUrl(url: string): Promise<EditResult> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return { ok: false, message: 'ログインが必要です' }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: url })
    .eq('id', session.user.id)

  if (error) return { ok: false, message: 'アバターの更新に失敗しました' }

  revalidatePath('/profile')
  return { ok: true, message: 'アバターを更新しました' }
}

export async function changeEmail(formData: FormData): Promise<EditResult> {
  const newEmail = String(formData.get('email') ?? '').trim()
  if (!newEmail || !newEmail.includes('@')) {
    return { ok: false, message: 'メールアドレスの形式を確認してください' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ email: newEmail })

  if (error) return { ok: false, message: '変更に失敗しました' }

  return {
    ok: true,
    message: `新しいメールアドレス(${newEmail})宛に確認メールを送りました。リンクを開くと変更が完了します`,
  }
}

export async function changePassword(formData: FormData): Promise<EditResult> {
  const password = String(formData.get('password') ?? '')
  const passwordConfirm = String(formData.get('password_confirm') ?? '')

  if (password.length < 8) {
    return { ok: false, message: 'パスワードは8文字以上で入力してください' }
  }
  if (password !== passwordConfirm) {
    return { ok: false, message: '確認用パスワードが一致しません' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { ok: false, message: '変更に失敗しました' }

  return { ok: true, message: 'パスワードを変更しました' }
}
