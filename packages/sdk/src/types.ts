export type PlanTier = 'bachelor' | 'master' | 'doctor'

export type PlanStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'none'

/** JWTのカスタムクレームから取り出すエンタイトルメント情報 */
export interface Entitlements {
  plan: PlanTier
  planStatus: PlanStatus
  userId: string
}

/** プランの序列。「博士なら修士相当の機能も使える」といった判定に使う */
export const PLAN_RANK: Record<PlanTier, number> = {
  bachelor: 0,
  master: 1,
  doctor: 2,
}
