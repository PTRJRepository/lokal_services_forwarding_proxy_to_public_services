import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenEdge } from '@/utils/jwt-edge'

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Check for auth-token cookie (our custom JWT token) or legacy payroll token
    const authToken = request.cookies.get('auth-token')?.value ||
        request.cookies.get('payroll_auth_token')?.value
    const hasToken = !!authToken

    // Verify token if it exists - use async Edge-compatible verification
    let isValidToken = false
    let payload = null
    if (hasToken) {
        try {
            payload = await verifyTokenEdge(authToken!)
            isValidToken = !!payload
        } catch (error) {
            console.error('Token verification error:', error)
        }
    }

    const isLoggedIn = hasToken && isValidToken

    // Debug logging
    console.log('🔒 Middleware:', {
        pathname,
        isLoggedIn,
        hasToken,
        isValidToken,
        tokenLength: authToken?.length || 0,
        tokenStart: authToken?.substring(0, 20) + '...',
        cookies: request.cookies.getAll().map(c => c.name)
    })

    const isOnAdmin = pathname.startsWith('/admin')
    const isOnDashboard = pathname.startsWith('/dashboard')
    const isLoginPage = pathname.startsWith('/login')
    const isProtectedRoute = isOnAdmin || isOnDashboard

    // Protected routes require authentication
    if (isProtectedRoute) {
        if (isLoggedIn) {
            console.log('✅ Middleware: Auth OK, proceeding to', pathname)
            return NextResponse.next()
        }
        console.log('❌ Middleware: No valid auth, redirecting to /login from', pathname)
        // Clear invalid token if exists
        const response = NextResponse.redirect(new URL('/login', request.url))
        if (hasToken && !isValidToken) {
            response.cookies.delete('auth-token')
            response.cookies.delete('payroll_auth_token')
            response.cookies.delete('payroll_user_info')
        }
        return response
    }

    // Redirect logged-in users from login page to dashboard
    if (isLoginPage) {
        if (isLoggedIn) {
            console.log('🔄 Middleware: Already logged in, redirecting to /dashboard')
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    // Match dashboard and admin routes, exclude api and static files
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|config-path|assets).*)'],
}
