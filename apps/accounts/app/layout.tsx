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
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-50 px-4 py-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
            style={{
              background:
                'radial-gradient(circle, #6D28D9 0%, #A855F7 35%, transparent 70%)',
            }}
          />
          <div className="relative mb-6 flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg, #6D28D9, #A855F7)' }}
            >
              R
            </div>
            <span className="text-sm font-semibold text-neutral-900">るーとの研究室</span>
          </div>
          <div className="relative w-full max-w-md rounded-2xl border border-line bg-white p-8 shadow-lg shadow-brand/5">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
