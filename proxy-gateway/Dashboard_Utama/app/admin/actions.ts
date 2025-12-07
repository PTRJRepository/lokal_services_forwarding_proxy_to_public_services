'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { syncRoutesConfig } from '@/utils/sync'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// USER ACTIONS
export async function createUser(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string

    // Validate required fields
    if (!name || !email || !password || !role) {
        return { error: 'Semua field harus diisi' }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return { error: 'Format email tidak valid' }
    }

    // Validate password length
    if (password.length < 6) {
        return { error: 'Password minimal 6 karakter' }
    }

    // Validate role
    const validRoles = ['ADMIN', 'KERANI', 'ACCOUNTING']
    if (!validRoles.includes(role)) {
        return { error: 'Peran tidak valid' }
    }

    try {
        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return { error: 'Email sudah terdaftar' }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role
            }
        })

        revalidatePath('/admin')
        return { message: 'Pengguna berhasil dibuat' }
    } catch (e) {
        console.error('Error creating user:', e)
        return { error: 'Gagal membuat pengguna' }
    }
}

export async function deleteUser(userId: string) {
    try {
        await prisma.user.delete({
            where: { id: userId }
        })
        revalidatePath('/admin')
        return { message: 'User deleted successfully' }
    } catch (e) {
        return { message: 'Failed to delete user' }
    }
}

// SERVICE ACTIONS
export async function addService(formData: FormData) {
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const routeUrl = formData.get('routeUrl') as string

    // Proxy fields
    const path = formData.get('path') as string
    const targetUrl = formData.get('targetUrl') as string

    try {
        await prisma.service.create({
            data: {
                name,
                description,
                routeUrl,
                path: path || null,
                targetUrl: targetUrl || null
            }
        })

        // Trigger Sync
        await syncRoutesConfig();

        revalidatePath('/admin')
        revalidatePath('/dashboard')
        return { message: 'Service added successfully' }
    } catch (e) {
        console.error(e)
        return { message: 'Failed to add service' }
    }
}

export async function deleteService(serviceId: string) {
    try {
        await prisma.service.delete({
            where: { id: serviceId }
        })

        // Trigger Sync
        await syncRoutesConfig();

        revalidatePath('/admin')
        revalidatePath('/dashboard')
        return { message: 'Service deleted successfully' }
    } catch (e) {
        return { message: 'Failed to delete service' }
    }
}
