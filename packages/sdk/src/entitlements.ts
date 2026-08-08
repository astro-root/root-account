import type { Entitlements, PlanTier, PlanStatus } from './types.js'
import { PLAN_RANK } from './types.js'

/**
 * Supabaseのaccess_token(JWT)をデコードし、Custom Access Token Hookで埋め込んだ
 * plan / plan_status クレームを取り出す。DBへの追加問い合わせは発生しない。
 */
export function decodeEntitlements(accessToken: string): Entitlements | null {
  const parts = accessToken.split('.')
  if (parts.length !== 3) return null

  try {
    const payloadJson = base64UrlDecode(parts[1])
    const payload = JSON.parse(payloadJson) as {
      sub: string
      plan?: PlanTier
      plan_status?: PlanStatus
    }

    return {
      userId: payload.sub,
      plan: payload.plan ?? 'bachelor',
      planStatus: payload.plan_status ?? 'none',
    }
  } catch {
    return null
  }
}

/**
 * 「博士プランならすべての機能で博士権限」を判定するヘルパー。
 * 例: hasPlan(entitlements, 'master') は doctor ユーザーにも true を返す。
 */
export function hasPlan(entitlements: Entitlements | null, required: PlanTier): boolean {
  if (!entitlements) return false
  if (entitlements.planStatus !== 'active' && entitlements.planStatus !== 'trialing') {
    // 決済失敗・解約済みなどは無料プラン相当として扱う
    return required === 'bachelor'
  }
  return PLAN_RANK[entitlements.plan] >= PLAN_RANK[required]
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  if (typeof atob === 'function') {
    return decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
  }
  // Node.js環境 (Next.js middleware/edge以外のサーバー処理)
  return Buffer.from(padded, 'base64').toString('utf-8')
}
