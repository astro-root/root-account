import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const returnTo = searchParams.get('return_to')

  if (tokenHash && type === 'email') {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type: 'email',
      token_hash: tokenHash,
    })

    if (!error) {
      // return_toが指定されていれば、リクエスト元サービスへ戻す（サブドメイン間はCookie共有済み）
      return NextResponse.redirect(returnTo || `${origin}/profile`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirm_failed`)
}
