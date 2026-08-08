import { createBrowserClient, createServerClient, type CookieMethodsServer } from '@supabase/ssr'

export interface RootAccountConfig {
  url: string
  anonKey: string
  /**
   * SSO用のCookieドメイン。サブドメイン間でセッションを共有するために
   * 必ず先頭にドット付きで指定する (例: ".astro-root.com")。
   * これを指定しないと、サービスごとにログインが分断されたままになる。
   */
  cookieDomain: string
}

/** クライアントコンポーネント用 */
export function createBrowserRootAccountClient(config: RootAccountConfig) {
  return createBrowserClient(config.url, config.anonKey, {
    cookieOptions: {
      domain: config.cookieDomain,
      path: '/',
      sameSite: 'lax',
      secure: true,
    },
  })
}

/** Server Component / Route Handler 用。Next.jsのcookies()と組み合わせて使う */
export function createServerRootAccountClient(
  config: RootAccountConfig,
  cookieMethods: CookieMethodsServer
) {
  return createServerClient(config.url, config.anonKey, {
    cookieOptions: {
      domain: config.cookieDomain,
      path: '/',
      sameSite: 'lax',
      secure: true,
    },
    cookies: cookieMethods,
  })
}
