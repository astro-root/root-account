import type { PlanTier } from '@/lib/root-account/entitlements'

const PLAN_LABEL: Record<PlanTier, { kanji: string; latin: string }> = {
  bachelor: { kanji: '学士', latin: 'BACHELOR' },
  master: { kanji: '修士', latin: 'MASTER' },
  doctor: { kanji: '博士', latin: 'DOCTOR' },
}

/**
 * 学位スタンプ風のプランバッジ。プロフィール/プラン選択/請求画面で共通利用する
 * このアプリのsignature要素。
 */
export function PlanSeal({ plan, size = 'md' }: { plan: PlanTier; size?: 'sm' | 'md' | 'lg' }) {
  const label = PLAN_LABEL[plan]
  const dims = size === 'lg' ? 96 : size === 'sm' ? 48 : 72
  const isDoctor = plan === 'doctor'

  return (
    <div
      className="relative inline-flex flex-col items-center justify-center rounded-full border-2 border-brass text-brass"
      style={{
        width: dims,
        height: dims,
        boxShadow: isDoctor ? '0 0 0 3px rgba(227,168,87,0.15)' : undefined,
      }}
    >
      <div
        className="absolute inset-[5px] rounded-full border border-dashed border-brass/40"
        aria-hidden
      />
      <span
        className="font-display leading-none"
        style={{ fontSize: dims * 0.26 }}
      >
        {label.kanji}
      </span>
      <span
        className="font-mono tracking-widest text-brass/70"
        style={{ fontSize: dims * 0.1 }}
      >
        {label.latin}
      </span>
    </div>
  )
}
