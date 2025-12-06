import { auth } from '@/auth'
import ServiceCard from '@/components/ServiceCard'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getUserServices(userId: string, role: string) {
    // Logic: Users only see services assigned to their Role or specifically to their User ID
    const accessControls = await prisma.accessControl.findMany({
        where: {
            OR: [
                { role: role },
                { userId: userId }
            ]
        },
        include: {
            service: true
        }
    });

    // Unique services
    const services = Array.from(new Map(accessControls.map(ac => [ac.service.id, ac.service])).values());
    return services;
}

export default async function DashboardPage() {
    const session = await auth()
    const user = session?.user

    if (!user) return null // Handled by middleware mostly

    const services = await getUserServices(user.id, user.role);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}</h1>
                <p className="mt-1 text-gray-500">Here are the services available to you based on your role.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                    <ServiceCard
                        key={service.id}
                        name={service.name}
                        description={service.description}
                        icon={service.icon}
                        routeUrl={service.routeUrl}
                    />
                ))}
            </div>
        </div>
    )
}
