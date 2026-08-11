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
      className="flex w-full items-center justify-center gap-2 rounded-md border border-ink-border bg-ink-surface py-3 text-sm font-medium text-ink-text transition hover:bg-ink-surface2 disabled:opacity-50"
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
        <label htmlFor="identifier" className="mb-1.5 block text-xs text-ink-muted">
          ユーザーID または メールアドレス
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          required
          autoComplete="username"
          placeholder="your_id または you@example.com"
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
          autoComplete="current-password"
          className="w-full rounded-md border border-ink-border bg-ink-surface px-4 py-3 text-ink-text focus:border-brass"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md border border-brass bg-brass/10 py-3 font-medium text-brass transition hover:bg-brass/20 disabled:opacity-50"
      >
        {pending ? 'ログイン中…' : 'ログイン'}
      </button>
      {status && !status.ok && (
        <p className="text-sm text-red-400" role="status">
          {status.message}
        </p>
      )}
      <p className="text-center text-xs text-ink-muted">
        アカウントをお持ちでない方は{' '}
        <Link href="/signup" className="text-brass hover:underline">
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
      {status && (
        <p className={`text-sm ${status.ok ? 'text-sage' : 'text-red-400'}`} role="status">
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
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass/70">
          Root's Laboratory
        </p>
        <h1 className="mt-2 font-display text-3xl leading-snug text-ink-text">
          研究員証で
          <br />
          ログイン
        </h1>
      </header>

      <div className="mb-6">
        <GoogleButton returnTo={returnTo} />
      </div>

      <div className="mb-6 flex items-center gap-3 text-xs text-ink-muted">
        <div className="h-px flex-1 bg-ink-border" />
        または
        <div className="h-px flex-1 bg-ink-border" />
      </div>

      <div className="mb-4 flex gap-1 rounded-md border border-ink-border p-1">
        <button
          type="button"
          onClick={() => setTab('password')}
          className={`flex-1 rounded py-1.5 text-sm transition ${
            tab === 'password' ? 'bg-ink-surface2 text-ink-text' : 'text-ink-muted'
          }`}
        >
          ID・パスワード
        </button>
        <button
          type="button"
          onClick={() => setTab('magiclink')}
          className={`flex-1 rounded py-1.5 text-sm transition ${
            tab === 'magiclink' ? 'bg-ink-surface2 text-ink-text' : 'text-ink-muted'
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
      <LoginContent />
    </Suspense>
  )
}
