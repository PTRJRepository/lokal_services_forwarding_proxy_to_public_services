import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/utils/auth-service'

// Use Node.js runtime for mssql compatibility
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        console.log('🔐 Login attempt:', { email, passwordLength: password?.length })

        if (!email || !password) {
            console.log('❌ Login failed: Missing email or password')
            return NextResponse.json(
                { error: 'Email dan password harus diisi' },
                { status: 400 }
            )
        }

        const result = await authenticateUser(email, password)
        console.log('🔐 Auth result:', { success: result.success, error: result.error, userId: result.user?.id })

        if (!result.success) {
            console.log('❌ Login failed for:', email, '- Reason:', result.error)
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
