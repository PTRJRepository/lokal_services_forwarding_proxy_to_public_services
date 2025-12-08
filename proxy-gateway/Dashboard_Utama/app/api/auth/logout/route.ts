import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
    const cookieStore = await cookies()

    // Clear the auth token cookie
    cookieStore.delete('auth-token')

    // Redirect to landing page
    return NextResponse.redirect(new URL('/', process.env.NEXTAUTH_URL || 'http://localhost:3001'))
}

export async function POST() {
    const cookieStore = await cookies()

    // Clear the auth token cookie
    cookieStore.delete('auth-token')

    // Return success response for API calls
    return NextResponse.json({ success: true, message: 'Logged out successfully' })
}
