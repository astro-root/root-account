'use client'

import { useState } from 'react'
import { updateProfile, changeEmail, changePassword, type EditResult } from './actions'

function ResultMessage({ result }: { result: EditResult | null }) {
  if (!result) return null
  return (
    <p className={`mt-2 text-sm ${result.ok ? 'text-sage' : 'text-red-400'}`} role="status">
      {result.message}
    </p>
  )
}

export function ProfileForm({
  initialUsername,
  initialDisplayName,
  initialBio,
}: {
  initialUsername: string
  initialDisplayName: string
  initialBio: string
}) {
  const [result, setResult] = useState<EditResult | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <form
      className="space-y-4 rounded-lg border border-ink-border bg-ink-surface p-5"
      action={async (formData) => {
        setPending(true)
        setResult(await updateProfile(formData))
        setPending(false)
      }}
    >
      <h2 className="font-display text-lg text-ink-text">プロフィール</h2>

      <div>
        <label htmlFor="username" className="mb-1.5 block text-xs text-ink-muted">
          ユーザーID
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          defaultValue={initialUsername}
          pattern="[a-z0-9_]{3,20}"
          className="w-full rounded-md border border-ink-border bg-ink-surface2 px-4 py-2.5 text-ink-text focus:border-brass"
        />
      </div>

      <div>
        <label htmlFor="display_name" className="mb-1.5 block text-xs text-ink-muted">
          表示名
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          required
          defaultValue={initialDisplayName}
          className="w-full rounded-md border border-ink-border bg-ink-surface2 px-4 py-2.5 text-ink-text focus:border-brass"
        />
      </div>

      <div>
        <label htmlFor="bio" className="mb-1.5 block text-xs text-ink-muted">
          自己紹介
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={initialBio}
          className="w-full rounded-md border border-ink-border bg-ink-surface2 px-4 py-2.5 text-ink-text focus:border-brass"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-brass bg-brass/10 px-4 py-2 text-sm font-medium text-brass hover:bg-brass/20 disabled:opacity-50"
      >
        {pending ? '保存中…' : '保存する'}
      </button>
      <ResultMessage result={result} />
    </form>
  )
}

export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [result, setResult] = useState<EditResult | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <form
      className="space-y-4 rounded-lg border border-ink-border bg-ink-surface p-5"
      action={async (formData) => {
        setPending(true)
        setResult(await changeEmail(formData))
        setPending(false)
      }}
    >
      <h2 className="font-display text-lg text-ink-text">メールアドレス</h2>
      <p className="text-xs text-ink-muted">現在: {currentEmail}</p>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs text-ink-muted">
          新しいメールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-ink-border bg-ink-surface2 px-4 py-2.5 text-ink-text focus:border-brass"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-brass bg-brass/10 px-4 py-2 text-sm font-medium text-brass hover:bg-brass/20 disabled:opacity-50"
      >
        {pending ? '送信中…' : '変更する'}
      </button>
      <ResultMessage result={result} />
    </form>
  )
}

export function PasswordForm() {
  const [result, setResult] = useState<EditResult | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <form
      className="space-y-4 rounded-lg border border-ink-border bg-ink-surface p-5"
      action={async (formData) => {
        setPending(true)
        setResult(await changePassword(formData))
        setPending(false)
      }}
    >
      <h2 className="font-display text-lg text-ink-text">パスワード</h2>
      <p className="text-xs text-ink-muted">
        Google/メールリンクのみで登録した方も、ここで新しくパスワードを設定できます。
      </p>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs text-ink-muted">
          新しいパスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-md border border-ink-border bg-ink-surface2 px-4 py-2.5 text-ink-text focus:border-brass"
        />
      </div>

      <div>
        <label htmlFor="password_confirm" className="mb-1.5 block text-xs text-ink-muted">
          新しいパスワード(確認)
        </label>
        <input
          id="password_confirm"
          name="password_confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-md border border-ink-border bg-ink-surface2 px-4 py-2.5 text-ink-text focus:border-brass"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-brass bg-brass/10 px-4 py-2 text-sm font-medium text-brass hover:bg-brass/20 disabled:opacity-50"
      >
        {pending ? '変更中…' : 'パスワードを変更する'}
      </button>
      <ResultMessage result={result} />
    </form>
  )
}
