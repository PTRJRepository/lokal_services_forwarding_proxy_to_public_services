import NextAuth from "next-auth"
import { auth } from "@/auth"

const { auth: middleware } = NextAuth({
    providers: [] // providers not needed validation in middleware
})

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnAdmin = req.nextUrl.pathname.startsWith('/admin')
    const isLoginPage = req.nextUrl.pathname.startsWith('/login')

    // Only /admin requires authentication
    if (isOnAdmin) {
        if (isLoggedIn) return
        return Response.redirect(new URL('/login', req.nextUrl))
    }

    if (isLoginPage) {
        if (isLoggedIn) {
            return Response.redirect(new URL('/admin', req.nextUrl))
        }
    }
})

export const config = {
    // Exclude /config-path and /dashboard from middleware - they are served by Express
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|config-path|dashboard).*)'],
}
