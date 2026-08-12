'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { sendMagicLink, loginWithPassword, type ActionResult } from './actions'
import { createClient } from '@/lib/supabase/client'

type Tab = 'password' | 'magiclink'

function GoogleButton({ returnTo }: { returnTo: string }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    const supabase = createClient()
    const siteUrl = process.env.NEXT_PUBLIC_ACCOUNTS_URL ?? window.location.origin
    const callbackUrl = new URL('/auth/callback', siteUrl)
    if (returnTo) callbackUrl.searchParams.set('return_to', returnTo)

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl.toString() },
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-md border border-line bg-white py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-surface disabled:opacity-50"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z" />
        <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03z" />
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
      </svg>
      Googleでログイン
    </button>
  )
}

function PasswordForm({ returnTo }: { returnTo: string }) {
  const [status, setStatus] = useState<ActionResult | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <form
      className="space-y-4"
      action={async (formData) => {
        setPending(true)
        setStatus(null)
        const result = await loginWithPassword(formData)
        setStatus(result)
        setPending(false)
        if (result.ok && result.redirectTo) {
          window.location.href = result.redirectTo
        }
      }}
    >
      <input type="hidden" name="return_to" value={returnTo} />
      <div>
        <label htmlFor="identifier" className="mb-1.5 block text-xs text-muted">
          ユーザーID または メールアドレス
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          required
          autoComplete="username"
          placeholder="your_id または you@example.com"
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
          autoComplete="current-password"
          className="w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-accent"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-accent py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? 'ログイン中…' : 'ログイン'}
      </button>
      {status && !status.ok && (
        <p className="text-sm text-danger" role="status">
          {status.message}
        </p>
      )}
      <p className="text-center text-xs text-muted">
        アカウントをお持ちでない方は{' '}
        <Link href="/signup" className="font-medium text-neutral-900 hover:underline">
          新規登録
        </Link>
      </p>
    </form>
  )
}

function MagicLinkForm({ returnTo }: { returnTo: string }) {
  const [status, setStatus] = useState<ActionResult | null>(null)
  const [pending, setPending] = useState(false)

  return (
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
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-accent py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? '送信中…' : 'ログインリンクを送る'}
      </button>
      {status && (
        <p className={`text-sm ${status.ok ? 'text-success' : 'text-danger'}`} role="status">
          {status.message}
        </p>
      )}
    </form>
  )
}

function LoginContent() {
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('return_to') ?? ''
  const [tab, setTab] = useState<Tab>('password')

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          Root's Laboratory
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-900">ログイン</h1>
      </header>

      <div className="mb-6">
        <GoogleButton returnTo={returnTo} />
      </div>

      <div className="mb-6 flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-line" />
        または
        <div className="h-px flex-1 bg-line" />
      </div>

      <div className="mb-4 flex gap-1 rounded-md bg-surface p-1">
        <button
          type="button"
          onClick={() => setTab('password')}
          className={`flex-1 rounded py-1.5 text-sm transition ${
            tab === 'password' ? 'bg-white text-neutral-900 shadow-sm' : 'text-muted'
          }`}
        >
          ID・パスワード
        </button>
        <button
          type="button"
          onClick={() => setTab('magiclink')}
          className={`flex-1 rounded py-1.5 text-sm transition ${
            tab === 'magiclink' ? 'bg-white text-neutral-900 shadow-sm' : 'text-muted'
          }`}
        >
          メールでリンク送信
        </button>
      </div>

      {tab === 'password' ? (
        <PasswordForm returnTo={returnTo} />
      ) : (
        <MagicLinkForm returnTo={returnTo} />
      )}

      <p className="mt-10 text-center text-xs text-muted">
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
      <LoginContent />
    </Suspense>
  )
}
