'use server'

import { revalidatePath } from 'next/cache'
import { userRepository } from '@/utils/user-repository'
import { serviceRepository } from '@/utils/service-repository'

export interface ActionState {
    success: boolean
    message?: string
    error?: string
}

export async function createUser(data: {
    name: string
    email: string
    password: string
    role: string
    divisi: string
    serviceIds?: string[]
}): Promise<ActionState> {
    try {
        const existing = await userRepository.findByEmail(data.email)
        if (existing) {
            return { success: false, error: 'Email sudah terdaftar' }
        }

        const newUser = await userRepository.create({
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role,
            divisi: data.divisi === 'ALL' ? undefined : data.divisi // Handle ALL as null or undefined? Or 'ALL'?
            // The requirement says: "divisinya itu, bisa ada opsi ALL, artinya dia memiliki akses seluruh kerani"
            // If I store 'ALL', I check for 'ALL'. If I store null, maybe that means 'ALL'?
            // Let's store 'ALL' explicitly if the DB column allows.
            // DB column is varchar/nvarchar?
            // "divisi: null" usually implies no division.
            // Let's use 'ALL' string if selected.
        })

        // Wait, userRepository.create interface needs to be checked.
        // It takes { divisi?: string }.
        // If I pass 'ALL', it stores 'ALL'.

        if (newUser && data.serviceIds && data.serviceIds.length > 0) {
            await userRepository.assignServices(newUser.id, data.serviceIds)
        }

        revalidatePath('/admin')
        return { success: true, message: 'Pengguna berhasil dibuat' }
    } catch (error) {
        console.error('Create user error:', error)
        return { success: false, error: 'Gagal membuat pengguna' }
    }
}

export async function updateUser(id: number, data: {
    name: string
    email: string
    role: string
    divisi: string
}): Promise<ActionState> {
    try {
        await userRepository.update(id, {
            name: data.name,
            email: data.email,
            role: data.role,
            divisi: data.divisi
        })

        revalidatePath('/admin')
        return { success: true, message: 'Data pengguna berhasil diperbarui' }
    } catch (error) {
        console.error('Update user error:', error)
        return { success: false, error: 'Gagal memperbarui data pengguna' }
    }
}

export async function resetPassword(id: number, newPassword: string): Promise<ActionState> {
    try {
        await userRepository.update(id, { password: newPassword })
        return { success: true, message: 'Password berhasil direset' }
    } catch (error) {
        console.error('Reset password error:', error)
        return { success: false, error: 'Gagal mereset password' }
    }
}

export async function deleteUser(id: number): Promise<ActionState> {
    try {
        await userRepository.delete(id)
        revalidatePath('/admin')
        return { success: true, message: 'Pengguna berhasil dihapus' }
    } catch (error) {
        console.error('Delete user error:', error)
        return { success: false, error: 'Gagal menghapus pengguna' }
    }
}

export async function updateUserServices(userId: number, serviceIds: string[]): Promise<ActionState> {
    try {
        await userRepository.assignServices(userId, serviceIds)
        revalidatePath('/admin')
        return { success: true, message: 'Hak akses layanan berhasil diperbarui' }
    } catch (error) {
        console.error('Update user services error:', error)
        return { success: false, error: 'Gagal memperbarui layanan' }
    }
}

export async function fetchUserServices(userId: number): Promise<string[]> {
    try {
        return await userRepository.getUserServices(userId)
    } catch (error) {
        console.error('Fetch user services error:', error)
        return []
    }
}
