import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('admin123', 10)

    // Create Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@rebinmas.com' },
        update: {},
        create: {
            email: 'admin@rebinmas.com',
            name: 'Admin User',
            password,
            role: 'ADMIN',
            image: '/assets/admin-avatar.png', // Placeholder
        },
    })

    // Create Services
    const harvestMonitoring = await prisma.service.upsert({
        where: { id: 'service-harvest' },
        update: {},
        create: {
            id: 'service-harvest',
            name: 'Daily Harvest Input',
            description: 'Input and monitor daily harvest data.',
            icon: 'Sprout',
            routeUrl: '/monitoring/harvest',
            path: '/harvest',
            targetUrl: 'http://localhost:5178', // Example
        },
    })

    const costAnalysis = await prisma.service.upsert({
        where: { id: 'service-cost' },
        update: {},
        create: {
            id: 'service-cost',
            name: 'Cost Analysis',
            description: 'Analyze operation costs and expenses.',
            icon: 'BarChart3',
            routeUrl: '/finance/cost-analysis',
            path: '/finance',
            targetUrl: 'http://localhost:5179', // Example
        },
    })

    const fleetGPS = await prisma.service.upsert({
        where: { id: 'service-fleet' },
        update: {},
        create: {
            id: 'service-fleet',
            name: 'Fleet GPS',
            description: 'Track vehicle locations in real-time.',
            icon: 'Truck',
            routeUrl: '/operations/fleet',
            path: '/fleet',
            targetUrl: 'http://localhost:5180', // Example
        },
    })

    // Default Access Controls
    // Admin gets access to Fleet GPS (and logic usually allows Admin everything, but let's be explicit if needed)
    // Actually, typically Admin ignores AccessControl or has all. 
    // But strictly per relation table:
    // SQLite does not support createMany, so we use Promise.all
    await Promise.all([
        prisma.accessControl.upsert({
            where: { role_serviceId: { role: 'KERANI', serviceId: harvestMonitoring.id } },
            update: {},
            create: { role: 'KERANI', serviceId: harvestMonitoring.id },
        }),
        prisma.accessControl.upsert({
            where: { role_serviceId: { role: 'ACCOUNTING', serviceId: costAnalysis.id } },
            update: {},
            create: { role: 'ACCOUNTING', serviceId: costAnalysis.id },
        }),
        prisma.accessControl.upsert({
            where: { role_serviceId: { role: 'ADMIN', serviceId: fleetGPS.id } },
            update: {},
            create: { role: 'ADMIN', serviceId: fleetGPS.id },
        }),
        prisma.accessControl.upsert({
            where: { role_serviceId: { role: 'ADMIN', serviceId: harvestMonitoring.id } },
            update: {},
            create: { role: 'ADMIN', serviceId: harvestMonitoring.id },
        }),
        prisma.accessControl.upsert({
            where: { role_serviceId: { role: 'ADMIN', serviceId: costAnalysis.id } },
            update: {},
            create: { role: 'ADMIN', serviceId: costAnalysis.id },
        }),
    ])

    console.log({ admin, harvestMonitoring, costAnalysis, fleetGPS })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
