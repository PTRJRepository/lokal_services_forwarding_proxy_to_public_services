import NextAuth from "next-auth"
import { auth } from "@/auth"

const { auth: middleware } = NextAuth({
    providers: [] // providers not needed validation in middleware
})

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
    const isOnAdmin = req.nextUrl.pathname.startsWith('/admin')
    const isLoginPage = req.nextUrl.pathname.startsWith('/login')

    if (isOnDashboard || isOnAdmin) {
        if (isLoggedIn) return
        return Response.redirect(new URL('/login', req.nextUrl))
    }

    if (isLoginPage) {
        if (isLoggedIn) {
            return Response.redirect(new URL('/dashboard', req.nextUrl))
        }
    }
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
