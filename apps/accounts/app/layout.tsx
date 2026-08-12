import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '研究員証 | るーとの研究室',
  description: 'るーとの研究室 共通アカウント',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-12">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-900 text-sm font-bold text-white">
              R
            </div>
            <span className="text-sm font-medium text-neutral-900">るーとの研究室</span>
          </div>
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 shadow-sm">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
