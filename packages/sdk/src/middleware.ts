import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { decodeEntitlements, hasPlan } from './entitlements.js'
import type { PlanTier } from './types.js'
import type { RootAccountConfig } from './client.js'

export interface RootAccountMiddlewareOptions extends RootAccountConfig {
  /** 未ログイン時にリダイレクトするaccountsアプリのログインURL */
  accountsLoginUrl: string
  /** 指定した場合、このプラン未満のユーザーはupgradeUrlへリダイレクトされる */
  requiredPlan?: PlanTier
  upgradeUrl?: string
}

/**
 * QuizNavi/めくる等、各サービスのmiddleware.tsから呼び出す。
 * 1. Cookie(サブドメイン共有)からセッションを検証
 * 2. 未ログインならRoot Accountのログイン画面へ (return_to付き)
 * 3. requiredPlanが指定されていて満たさない場合はupgradeUrlへ
 */
export async function withRootAccount(
  request: NextRequest,
  options: RootAccountMiddlewareOptions
) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(options.url, options.anonKey, {
    cookieOptions: { domain: options.cookieDomain, path: '/', sameSite: 'lax', secure: true },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options: opts }) =>
          request.cookies.set(name, value)
        )
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options: opts }) =>
          response.cookies.set(name, value, opts)
        )
      },
    },
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    const loginUrl = new URL(options.accountsLoginUrl)
    loginUrl.searchParams.set('return_to', request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (options.requiredPlan) {
    const entitlements = decodeEntitlements(session.access_token)
    if (!hasPlan(entitlements, options.requiredPlan) && options.upgradeUrl) {
      return NextResponse.redirect(new URL(options.upgradeUrl, request.url))
    }
  }

  return response
}
