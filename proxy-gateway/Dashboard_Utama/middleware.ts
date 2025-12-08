import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Check for auth-token cookie (our custom JWT token)
    const authToken = request.cookies.get('auth-token')?.value
    const isLoggedIn = !!authToken

    const isOnAdmin = pathname.startsWith('/admin')
    const isOnDashboard = pathname.startsWith('/dashboard')
    const isLoginPage = pathname.startsWith('/login')
    const isProtectedRoute = isOnAdmin || isOnDashboard

    // Protected routes require authentication
    if (isProtectedRoute) {
        if (isLoggedIn) {
            return NextResponse.next()
        }
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirect logged-in users from login page to dashboard
    if (isLoginPage) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    // Match dashboard and admin routes, exclude api and static files
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|config-path|assets).*)'],
}
