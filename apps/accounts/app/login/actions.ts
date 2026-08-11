'use server'

import { createClient } from '@/lib/supabase/server'

export interface ActionResult {
  ok: boolean
  message: string
  redirectTo?: string
}

export async function sendMagicLink(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim()
  const returnTo = String(formData.get('return_to') ?? '')

  if (!email || !email.includes('@')) {
    return { ok: false, message: 'メールアドレスの形式を確認してください' }
  }

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_ACCOUNTS_URL ?? 'http://localhost:3000'
  const confirmUrl = new URL('/auth/confirm', siteUrl)
  if (returnTo) confirmUrl.searchParams.set('return_to', returnTo)

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: confirmUrl.toString() },
  })

  if (error) {
    return { ok: false, message: '送信に失敗しました。時間をおいて再度お試しください' }
  }

  return { ok: true, message: `${email} 宛に研究員証発行用のリンクを送りました` }
}

/**
 * ユーザーID または メールアドレス + パスワードでログインする。
 * ユーザーIDが渡された場合は、public.email_for_login経由でメールアドレスに解決してから
 * signInWithPasswordを呼ぶ(Supabase Authはemailでしかログインできないため)。
 */
export async function loginWithPassword(formData: FormData): Promise<ActionResult> {
  const identifier = String(formData.get('identifier') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const returnTo = String(formData.get('return_to') ?? '')

  if (!identifier || !password) {
    return { ok: false, message: 'ユーザーID(またはメールアドレス)とパスワードを入力してください' }
  }

  const supabase = await createClient()

  const { data: email, error: lookupError } = await supabase.rpc('email_for_login', {
    identifier,
  })

  if (lookupError || !email) {
    return { ok: false, message: 'ユーザーIDまたはメールアドレスが見つかりません' }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { ok: false, message: 'ユーザーID/メールアドレスまたはパスワードが違います' }
  }

  return { ok: true, message: 'ログインしました', redirectTo: returnTo || '/profile' }
}

