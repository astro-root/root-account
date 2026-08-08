'use server'

import { createClient } from '@/lib/supabase/server'

export interface SendMagicLinkResult {
  ok: boolean
  message: string
}

export async function sendMagicLink(formData: FormData): Promise<SendMagicLinkResult> {
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
