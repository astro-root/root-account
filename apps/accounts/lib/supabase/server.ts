import { cookies } from 'next/headers'
import { createServerRootAccountClient } from '@rootlab/account-sdk'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerRootAccountClient(
    {
      url: process.env.NEXT_PUBLIC_ROOT_ACCOUNT_URL!,
      anonKey: process.env.NEXT_PUBLIC_ROOT_ACCOUNT_ANON_KEY!,
      cookieDomain: process.env.ROOT_ACCOUNT_COOKIE_DOMAIN!,
    },
    {
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
    }
  )
}
