import bcrypt from 'bcryptjs'
import { query } from './db'
import { signToken, JwtPayload } from './jwt'

export interface User {
    id: number
    name: string
    email: string
    password: string
    role: string
    createdAt: Date
}

export interface AuthResult {
    success: boolean
    token?: string
    user?: Omit<User, 'password'>
    error?: string
}

export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
    try {
        // Find user by email
        const users = await query<User>(
            'SELECT * FROM user_ptrj WHERE email = @email',
            { email }
        )

        if (users.length === 0) {
            return { success: false, error: 'Email tidak ditemukan' }
        }

        const user = users[0]

        // Verify password
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            return { success: false, error: 'Password salah' }
        }

        // Generate JWT token
        const token = signToken({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        })

        // Return user without password
        const { password: _, ...userWithoutPassword } = user

        return {
            success: true,
            token,
            user: userWithoutPassword
        }
    } catch (error) {
        console.error('Authentication error:', error)
        return { success: false, error: 'Gagal melakukan autentikasi' }
    }
}

export async function getUserServices(role: string): Promise<any[]> {
    try {
        const services = await query(
            `SELECT s.* FROM service_ptrj s
             INNER JOIN role_service_permission rsp ON s.serviceId = rsp.serviceId
             WHERE rsp.role = @role AND s.enabled = 1`,
            { role }
        )
        return services
    } catch (error) {
        console.error('Error fetching services:', error)
        return []
    }
}

export async function createUser(name: string, email: string, password: string, role: string): Promise<boolean> {
    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        await query(
            `INSERT INTO user_ptrj (name, email, password, role) VALUES (@name, @email, @password, @role)`,
            { name, email, password: hashedPassword, role }
        )
        return true
    } catch (error) {
        console.error('Error creating user:', error)
        return false
    }
}

export default { authenticateUser, getUserServices, createUser }
