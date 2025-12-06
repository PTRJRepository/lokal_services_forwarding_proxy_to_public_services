'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { syncRoutesConfig } from '@/utils/sync'

const prisma = new PrismaClient()

// USER ACTIONS
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
