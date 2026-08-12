'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const [pending, setPending] = useState(false)

  const handleClick = async () => {
    setPending(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-sm text-muted transition hover:text-danger disabled:opacity-50"
    >
      {pending ? 'ログアウト中…' : 'ログアウト'}
    </button>
  )
}
