'use server'

import { revalidatePath } from 'next/cache'
import { userRepository } from '@/utils/user-repository'
import { serviceRepository } from '@/utils/service-repository'

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
        const existingUser = await userRepository.findByEmail(email)

        if (existingUser) {
            return { error: 'Email sudah terdaftar' }
        }

        // Create user using repository
        await userRepository.create({ name, email, password, role })

        revalidatePath('/admin')
        return { message: 'Pengguna berhasil dibuat' }
    } catch (e) {
        console.error('Error creating user:', e)
        return { error: 'Gagal membuat pengguna' }
    }
}

export async function deleteUser(userId: string) {
    try {
        await userRepository.delete(parseInt(userId))
        revalidatePath('/admin')
        return { message: 'User berhasil dihapus' }
    } catch (e) {
        return { error: 'Gagal menghapus user' }
    }
}

// SERVICE ACTIONS
export async function addService(formData: FormData) {
    const serviceId = formData.get('serviceId') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const serviceUrl = formData.get('serviceUrl') as string
    const path = formData.get('path') as string

    if (!serviceId || !name || !serviceUrl) {
        return { error: 'Service ID, Nama, dan URL harus diisi' }
    }

    try {
        await serviceRepository.create({
            serviceId,
            name,
            description: description || '',
            serviceUrl,
            path: path || null,
            enabled: true
        })

        revalidatePath('/admin')
        return { message: 'Service berhasil ditambahkan' }
    } catch (e) {
        console.error('Error adding service:', e)
        return { error: 'Gagal menambahkan service' }
    }
}

export async function deleteService(serviceId: string) {
    try {
        await serviceRepository.delete(serviceId)
        revalidatePath('/admin')
        return { message: 'Service berhasil dihapus' }
    } catch (e) {
        return { error: 'Gagal menghapus service' }
    }
}

// ROLE PERMISSION ACTIONS
export async function assignServiceToRole(formData: FormData) {
    const role = formData.get('role') as string
    const serviceId = formData.get('serviceId') as string

    if (!role || !serviceId) {
        return { error: 'Role dan Service ID harus diisi' }
    }

    try {
        await serviceRepository.assignToRole(role, serviceId)
        revalidatePath('/admin')
        return { message: 'Hak akses berhasil diberikan' }
    } catch (e) {
        return { error: 'Gagal memberikan hak akses' }
    }
}

export async function removeServiceFromRole(formData: FormData) {
    const role = formData.get('role') as string
    const serviceId = formData.get('serviceId') as string

    if (!role || !serviceId) {
        return { error: 'Role dan Service ID harus diisi' }
    }

    try {
        await serviceRepository.removeFromRole(role, serviceId)
        revalidatePath('/admin')
        return { message: 'Hak akses berhasil dicabut' }
    } catch (e) {
        return { error: 'Gagal mencabut hak akses' }
    }
}
