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
        <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
          {children}
        </div>
      </body>
    </html>
  )
}
