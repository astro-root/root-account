import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_ROOT_ACCOUNT_URL!,
    process.env.NEXT_PUBLIC_ROOT_ACCOUNT_ANON_KEY!,
    {
      cookieOptions: {
        domain: process.env.ROOT_ACCOUNT_COOKIE_DOMAIN,
        path: '/',
        sameSite: 'lax',
        secure: true,
      },
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Componentから呼ばれた場合はcookie書き込み不可。
            // middlewareでセッションのrefreshを行うので無視してよい。
          }
        },
      },
    }
  )
}
