import { createBrowserRootAccountClient } from '@rootlab/account-sdk'

export function createClient() {
  return createBrowserRootAccountClient({
    url: process.env.NEXT_PUBLIC_ROOT_ACCOUNT_URL!,
    anonKey: process.env.NEXT_PUBLIC_ROOT_ACCOUNT_ANON_KEY!,
    cookieDomain: process.env.NEXT_PUBLIC_ROOT_ACCOUNT_COOKIE_DOMAIN!,
  })
}
