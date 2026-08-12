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
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          Root's Laboratory
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-900">
          研究員証の
          <br />
          新規発行
        </h1>
        <p className="mt-3 text-sm text-muted">
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
          <label htmlFor="username" className="mb-1.5 block text-xs text-muted">
            ユーザーID
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            pattern="[a-z0-9_]{3,20}"
            placeholder="your_id"
            className="w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-accent"
          />
          <p className="mt-1 text-xs text-muted">半角英数字とアンダースコア、3〜20文字</p>
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs text-muted">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-accent"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs text-muted">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-accent"
          />
          <p className="mt-1 text-xs text-muted">8文字以上</p>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-accent py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? '登録中…' : '登録する'}
        </button>

        {status && (
          <p className={`text-sm ${status.ok ? 'text-success' : 'text-danger'}`} role="status">
            {status.message}
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-xs text-muted">
        既にアカウントをお持ちの方は{' '}
        <Link href="/login" className="font-medium text-neutral-900 hover:underline">
          ログイン
        </Link>
      </p>
    </div>
  )
}
