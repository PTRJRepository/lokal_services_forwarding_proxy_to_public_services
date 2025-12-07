import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/utils/auth-service'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email dan password harus diisi' },
                { status: 400 }
            )
        }

        const result = await authenticateUser(email, password)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 401 }
            )
        }

        // Set token in HTTP-only cookie for security
        const response = NextResponse.json({
            success: true,
            user: result.user,
            token: result.token // Also return token for API usage
        })

        response.cookies.set('auth-token', result.token!, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 8 // 8 hours
        })

        return response

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
