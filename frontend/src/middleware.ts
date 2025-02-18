import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const token = req.auth?.user;
    const pathname = req.nextUrl.pathname
    const returnUrl = req.nextUrl.searchParams.get('callbackUrl')
    
    // Redirect from auth page if logged in
    if (pathname === '/auth') {
      if (token) {
        // If there's a return URL and user has required access, redirect there
        if (returnUrl) {
          const isAdminRoute = returnUrl.includes('/create-blog') || 
                             returnUrl.includes('/edit-blog')
          
          if (!isAdminRoute || (isAdminRoute && token.type === 'admin')) {
            return NextResponse.redirect(new URL(returnUrl, req.url))
          }
        }
        // Otherwise redirect to home
        return NextResponse.redirect(new URL('/', req.url))
      }
      return NextResponse.next()
    }

    // Check admin routes
    const isAdminRoute = pathname.startsWith('/create-blog') || 
                        pathname.startsWith('/edit-blog')

    if (isAdminRoute) {
      if (!token) {
        // Store the requested URL for redirect after login
        const searchParams = new URLSearchParams({
          callbackUrl: pathname
        })
        return NextResponse.redirect(
          new URL(`/auth?${searchParams}`, req.url)
        )
      }
      if (token.type !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return NextResponse.next()
  }
)

export const config = {
  matcher: [
    '/auth',
    '/create-blog/:path*', 
    '/edit-blog/:path*',
    '/profile/:path*'
  ]
}