import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname
    
    // Redirect from auth page if logged in
    if (pathname === '/auth' && token) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Check admin routes
    const isAdminRoute = pathname.startsWith('/create-blog') || 
                        pathname.startsWith('/edit-blog')

    if (isAdminRoute && token?.type !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        // Allow access to auth page without token
        if (pathname === '/auth') {
          return true
        }
        // Require token for all other protected routes
        return !!token
      },
    },
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