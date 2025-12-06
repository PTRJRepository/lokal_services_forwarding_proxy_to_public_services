import { auth } from '@/auth'
import AdminTableWrapper from '@/components/AdminTableWrapper'
import ServiceTable from '@/components/ServiceTable'
import AddServiceForm from '@/components/AddServiceForm'
import { PrismaClient } from '@prisma/client'
import Link from 'next/link'

const prisma = new PrismaClient()

async function getUsers() {
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true }
    })
}

async function getServices() {
    return await prisma.service.findMany({
        orderBy: { createdAt: 'desc' }
    })
}

export default async function AdminPage({ searchParams }: { searchParams: { tab?: string } }) {
    const users = await getUsers()
    const services = await getServices()

    const tab = searchParams?.tab || 'users';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <Link
                        href="/admin?tab=users"
                        className={`pb-4 px-1 border-b-2 font-medium text-sm ${tab === 'users' ? 'border-palm-green text-palm-green' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Users
                    </Link>
                    <Link
                        href="/admin?tab=services"
                        className={`pb-4 px-1 border-b-2 font-medium text-sm ${tab === 'services' ? 'border-palm-green text-palm-green' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Services & Proxy
                    </Link>
                </nav>
            </div>

            {tab === 'users' ? (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button className="px-4 py-2 bg-palm-green text-white rounded-lg hover:bg-palm-green-hover transition-colors">
                            Add New User
                        </button>
                    </div>
                    <AdminTableWrapper users={users} />
                </div>
            ) : (
                <div className="space-y-8">
                    <AddServiceForm />
                    <ServiceTable services={services} />
                </div>
            )}
        </div>
    )
}
