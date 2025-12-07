import bcrypt from 'bcryptjs'
import { db } from './db'

// User interface
export interface User {
    id: number
    name: string
    email: string
    password: string
    role: string
    createdAt: Date
    updatedAt?: Date
}

export type UserWithoutPassword = Omit<User, 'password'>

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
     * Get all users (without passwords)
     */
    async findAll(): Promise<UserWithoutPassword[]> {
        return db.query<UserWithoutPassword>(
            'SELECT id, name, email, role, createdAt, updatedAt FROM user_ptrj ORDER BY createdAt DESC'
        )
    }

    /**
     * Create new user
     */
    async create(data: { name: string; email: string; password: string; role: string }): Promise<User | null> {
        const hashedPassword = await bcrypt.hash(data.password, 10)

        await db.execute(
            `INSERT INTO user_ptrj (name, email, password, role) 
             VALUES (@name, @email, @password, @role)`,
            {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role
            }
        )

        return this.findByEmail(data.email)
    }

    /**
     * Update user
     */
    async update(id: number, data: Partial<{ name: string; email: string; role: string }>): Promise<boolean> {
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
        if (!user) return null

        const isValid = await bcrypt.compare(password, user.password)
        return isValid ? user : null
    }
}

// Export singleton instance
export const userRepository = new UserRepository()
export default userRepository
