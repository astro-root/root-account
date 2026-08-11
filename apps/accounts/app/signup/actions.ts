'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '../login/actions'

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/

export async function signUp(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim()
  const username = String(formData.get('username') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!email || !email.includes('@')) {
    return { ok: false, message: 'メールアドレスの形式を確認してください' }
  }
  if (!USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      message: 'ユーザーIDは半角英数字とアンダースコアのみ、3〜20文字で入力してください',
    }
  }
  if (password.length < 8) {
    return { ok: false, message: 'パスワードは8文字以上で入力してください' }
  }

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_ACCOUNTS_URL ?? 'http://localhost:3000'

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, display_name: username },
      emailRedirectTo: `${siteUrl}/auth/confirm`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { ok: false, message: 'このメールアドレスは既に登録されています' }
    }
    return { ok: false, message: '登録に失敗しました。ユーザーIDが既に使われている可能性があります' }
  }

  return {
    ok: true,
    message: `${email} 宛に確認メールを送りました。メール内のリンクを開いて登録を完了してください`,
  }
}
