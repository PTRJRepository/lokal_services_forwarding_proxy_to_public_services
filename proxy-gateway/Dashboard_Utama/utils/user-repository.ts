import bcrypt from 'bcryptjs'
import { db } from './db'
import { encryptPassword, decryptPassword } from './password-encryption'

// User interface
export interface User {
    id: number
    name: string
    email: string
    password: string
    plainPassword?: string
    role: string
    divisi?: string
    gang?: string
    createdAt: Date
    updatedAt?: Date
}

export type UserWithoutPassword = Omit<User, 'password'>

// User with plainPassword for admin view
export type UserWithPlainPassword = Omit<User, 'password'> & { plainPassword?: string }

/**
 * User Repository - handles all user database operations
 */
export class UserRepository {

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        return db.queryOne<User>(
            'SELECT * FROM user_ptrj WHERE email = @email',
            { email }
        )
    }

    /**
     * Find user by id
     */
    async findById(id: number): Promise<User | null> {
        return db.queryOne<User>(
            'SELECT * FROM user_ptrj WHERE id = @id',
            { id }
        )
    }

    /**
     * Get all users (without hashed passwords)
     */
    async findAll(): Promise<UserWithoutPassword[]> {
        return db.query<UserWithoutPassword>(
            'SELECT id, name, email, role, divisi, gang, createdAt, updatedAt FROM user_ptrj ORDER BY createdAt DESC'
        )
    }

    /**
     * Get all users with decrypted plainPassword (for admin view only)
     */
    async findAllWithPlainPassword(): Promise<UserWithPlainPassword[]> {
        const users = await db.query<UserWithPlainPassword>(
            'SELECT id, name, email, role, divisi, gang, plainPassword, createdAt, updatedAt FROM user_ptrj ORDER BY createdAt DESC'
        )

        // Decrypt passwords for admin view
        return users.map(user => ({
            ...user,
            plainPassword: user.plainPassword ? decryptPassword(user.plainPassword) || undefined : undefined
        }))
    }

    /**
     * Create new user
     */
    async create(data: { name: string; email: string; password: string; role: string; divisi?: string; gang?: string }): Promise<User | null> {
        const hashedPassword = await bcrypt.hash(data.password, 10)

        await db.execute(
            `INSERT INTO user_ptrj (name, email, password, plainPassword, role, divisi, gang)
             VALUES (@name, @email, @password, @plainPassword, @role, @divisi, @gang)`,
            {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                plainPassword: encryptPassword(data.password), // Encrypt password for secure storage
                role: data.role,
                divisi: data.divisi || null,
                gang: data.gang || null
            }
        )

        return this.findByEmail(data.email)
    }

    /**
     * Update user
     */
    async update(id: number, data: Partial<{ name: string; email: string; role: string; divisi?: string; gang?: string; password?: string }>): Promise<boolean> {
        const sets: string[] = []
        const params: Record<string, any> = { id }

        if (data.name) {
            sets.push('name = @name')
            params.name = data.name
        }
        if (data.email) {
            sets.push('email = @email')
            params.email = data.email
        }
        if (data.role) {
            sets.push('role = @role')
            params.role = data.role
        }
        if (data.divisi !== undefined) {
            sets.push('divisi = @divisi')
            params.divisi = data.divisi
        }
        if (data.gang !== undefined) {
            sets.push('gang = @gang')
            params.gang = data.gang
        }
        if (data.password) {
            const hashedPassword = await bcrypt.hash(data.password, 10)
            sets.push('password = @password')
            sets.push('plainPassword = @plainPassword')
            params.password = hashedPassword
            params.plainPassword = encryptPassword(data.password) // Encrypt password for secure storage
        }

        if (sets.length === 0) return false

        sets.push('updatedAt = GETDATE()')

        const affected = await db.execute(
            `UPDATE user_ptrj SET ${sets.join(', ')} WHERE id = @id`,
            params
        )

        return affected > 0
    }

    /**
     * Delete user
     */
    async delete(id: number): Promise<boolean> {
        // Delete related access controls first (cascade should handle this but explicit is safer)
        await db.execute('DELETE FROM AccessControl WHERE userId = @id', { id: String(id) })

        const affected = await db.execute(
            'DELETE FROM user_ptrj WHERE id = @id',
            { id }
        )
        return affected > 0
    }

    /**
     * Verify password
     */
    async verifyPassword(email: string, password: string): Promise<User | null> {
        const user = await this.findByEmail(email)
        console.log('🔐 verifyPassword - User found:', user ? { id: user.id, email: user.email } : 'NOT FOUND')

        if (!user) return null

        const isValid = await bcrypt.compare(password, user.password)
        console.log('🔐 verifyPassword - Password valid:', isValid)

        return isValid ? user : null
    }

    /**
     * Get services assigned to user
     */
    async getUserServices(userId: number): Promise<string[]> {
        // Assuming AccessControl table links userId (string) to serviceId
        // But User.id is number in this class?
        // Let's check schema/db. user_ptrj id is int identity? 
        // Debug output said id: 1. So it is int (number).
        // AccessControl.userId is String? Schema said String.
        // Let's assume AccessControl.userId stores the string representation of ID.

        const rows = await db.query<{ serviceId: string }>(
            'SELECT serviceId FROM AccessControl WHERE userId = @userId',
            { userId: String(userId) }
        )
        return rows.map(r => r.serviceId)
    }

    /**
     * Assign services to user
     */
    async assignServices(userId: number, serviceIds: string[]): Promise<void> {
        const uid = String(userId)

        // Clear existing services for this user
        await db.execute(
            'DELETE FROM AccessControl WHERE userId = @userId',
            { userId: uid }
        )

        // Insert new services
        for (const serviceId of serviceIds) {
            await db.execute(
                'INSERT INTO AccessControl (userId, serviceId) VALUES (@userId, @serviceId)',
                { userId: uid, serviceId }
            )
        }
    }
}

// Export singleton instance
export const userRepository = new UserRepository()
export default userRepository
