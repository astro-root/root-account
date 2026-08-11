'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { sendMagicLink } from './actions'

function LoginForm() {
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('return_to') ?? ''
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <div>
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass/70">
          Root's Laboratory
        </p>
        <h1 className="mt-2 font-display text-3xl leading-snug text-ink-text">
          研究員証で
          <br />
          ログイン
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          パスワードは不要です。メールアドレス宛に届くリンクから、全サービス共通の研究員証にアクセスできます。
        </p>
      </header>

      <form
        className="space-y-4"
        action={async (formData) => {
          setPending(true)
          setStatus(null)
          const result = await sendMagicLink(formData)
          setStatus(result)
          setPending(false)
        }}
      >
        <input type="hidden" name="return_to" value={returnTo} />
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs text-ink-muted">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-md border border-ink-border bg-ink-surface px-4 py-3 text-ink-text placeholder:text-ink-muted/50 focus:border-brass"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md border border-brass bg-brass/10 py-3 font-medium text-brass transition hover:bg-brass/20 disabled:opacity-50"
        >
          {pending ? '送信中…' : 'ログインリンクを送る'}
        </button>
      </form>

      {status && (
        <p
          className={`mt-4 text-sm ${status.ok ? 'text-sage' : 'text-red-400'}`}
          role="status"
        >
          {status.message}
        </p>
      )}

      <p className="mt-10 text-center text-xs text-ink-muted">
        このアカウントは Q-Mark / Q-Room / QuizNavi / めくる など
        <br />
        るーとの研究室の全サービスで共通利用できます
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
