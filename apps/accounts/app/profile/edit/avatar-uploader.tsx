'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateAvatarUrl } from './actions'

export function AvatarUploader({
  userId,
  initialUrl,
  fallbackLabel,
}: {
  userId: string
  initialUrl: string | null
  fallbackLabel: string
}) {
  const [url, setUrl] = useState(initialUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError('画像サイズは2MB以下にしてください')
      return
    }

    setUploading(true)
    setError(null)

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError('アップロードに失敗しました')
      setUploading(false)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(path)
    // キャッシュ回避のためタイムスタンプを付与
    const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`

    const result = await updateAvatarUrl(cacheBustedUrl)
    if (result.ok) {
      setUrl(cacheBustedUrl)
    } else {
      setError(result.message)
    }
    setUploading(false)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-line bg-brand/10 text-xl font-semibold text-brand">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          fallbackLabel.charAt(0).toUpperCase()
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-md border border-line px-3 py-1.5 text-xs text-neutral-900 hover:border-neutral-900 disabled:opacity-50"
        >
          {uploading ? 'アップロード中…' : '画像を変更'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    </div>
  )
}
