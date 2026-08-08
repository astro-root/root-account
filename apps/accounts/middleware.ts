import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_ROOT_ACCOUNT_URL!,
    process.env.NEXT_PUBLIC_ROOT_ACCOUNT_ANON_KEY!,
    {
      cookieOptions: {
        domain: process.env.ROOT_ACCOUNT_COOKIE_DOMAIN,
        path: '/',
        sameSite: 'lax',
        secure: true,
      },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const protectedPaths = ['/profile', '/billing']
  const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p))

  if (isProtected && !session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('return_to', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/profile/:path*', '/billing/:path*'],
}
