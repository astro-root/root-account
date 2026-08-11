'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signUp } from './actions'
import type { ActionResult } from '../login/actions'

export default function SignupPage() {
  const [status, setStatus] = useState<ActionResult | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <div>
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass/70">
          Root's Laboratory
        </p>
        <h1 className="mt-2 font-display text-3xl leading-snug text-ink-text">
          研究員証の
          <br />
          新規発行
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Q-Mark・QuizNavi・めくるなど、るーとの研究室の全サービスで使える共通アカウントを作成します。
        </p>
      </header>

      <form
        className="space-y-4"
        action={async (formData) => {
          setPending(true)
          setStatus(null)
          const result = await signUp(formData)
          setStatus(result)
          setPending(false)
        }}
      >
        <div>
          <label htmlFor="username" className="mb-1.5 block text-xs text-ink-muted">
            ユーザーID
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            pattern="[a-z0-9_]{3,20}"
            placeholder="your_id"
            className="w-full rounded-md border border-ink-border bg-ink-surface px-4 py-3 text-ink-text placeholder:text-ink-muted/50 focus:border-brass"
          />
          <p className="mt-1 text-xs text-ink-muted">半角英数字とアンダースコア、3〜20文字</p>
        </div>

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

        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs text-ink-muted">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-md border border-ink-border bg-ink-surface px-4 py-3 text-ink-text focus:border-brass"
          />
          <p className="mt-1 text-xs text-ink-muted">8文字以上</p>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md border border-brass bg-brass/10 py-3 font-medium text-brass transition hover:bg-brass/20 disabled:opacity-50"
        >
          {pending ? '登録中…' : '登録する'}
        </button>

        {status && (
          <p className={`text-sm ${status.ok ? 'text-sage' : 'text-red-400'}`} role="status">
            {status.message}
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-xs text-ink-muted">
        既にアカウントをお持ちの方は{' '}
        <Link href="/login" className="text-brass hover:underline">
          ログイン
        </Link>
      </p>
    </div>
  )
}
