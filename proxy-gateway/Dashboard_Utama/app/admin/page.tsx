import { auth } from '@/auth'
import UserManagement from '@/components/UserManagement'
import ServiceTable from '@/components/ServiceTable'
import AddServiceForm from '@/components/AddServiceForm'
import { userRepository } from '@/utils/user-repository'
import { serviceRepository } from '@/utils/service-repository'
import Link from 'next/link'

async function getUsers() {
    return await userRepository.findAll()
}

async function getServices() {
    return await serviceRepository.findAll()
}

export default async function AdminPage({ searchParams }: { searchParams: { tab?: string } }) {
    const session = await auth()

    // Check if user is admin
    if ((session?.user as any)?.role !== 'ADMIN') {
        return (
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-red-600">Akses Ditolak</h1>
                <p className="mt-2 text-gray-600">Hanya admin yang dapat mengakses halaman ini.</p>
            </div>
        )
    }

    const users = await getUsers()
    const services = await getServices()

    const tab = searchParams?.tab || 'users';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Panel Admin</h1>
                <div className="flex gap-2">
                    <Link
                        href="/config-path"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                        ⚙️ Konfigurasi Route
                    </Link>
                </div>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <Link
                        href="/admin?tab=users"
                        className={`pb-4 px-1 border-b-2 font-medium text-sm ${tab === 'users' ? 'border-palm-green text-palm-green' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Pengguna
                    </Link>
                    <Link
                        href="/admin?tab=services"
                        className={`pb-4 px-1 border-b-2 font-medium text-sm ${tab === 'services' ? 'border-palm-green text-palm-green' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Layanan & Hak Akses
                    </Link>
                </nav>
            </div>

            {tab === 'users' ? (
                <UserManagement users={users} />
            ) : (
                <div className="space-y-8">
                    <AddServiceForm />
                    <ServiceTable services={services} />
                </div>
            )}
        </div>
    )
}
