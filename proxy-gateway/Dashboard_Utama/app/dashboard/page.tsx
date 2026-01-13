import { cookies } from 'next/headers'
import { verifyToken } from '@/utils/jwt'
import { serviceRepository } from '@/utils/service-repository'
import Link from 'next/link'
import { Server, Settings, Shield } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'
import ServiceCard from '@/components/ServiceCard'

// Force Node.js runtime
export const runtime = 'nodejs'

export default async function DashboardPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value ||
        cookieStore.get('payroll_auth_token')?.value

    let user = null
    if (token) {
        const payload = verifyToken(token)
        if (payload) {
            user = {
                id: payload.userId,
                name: payload.name,
                email: payload.email,
                role: payload.role
            }
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center py-12 px-8 bg-white rounded-2xl shadow-lg max-w-md">
                    <h1 className="text-2xl font-bold text-red-600">Akses Ditolak</h1>
                    <p className="mt-2 text-gray-600">Silakan login terlebih dahulu.</p>
                    <Link
                        href="/login"
                        className="mt-6 inline-block px-6 py-3 bg-palm-green text-white rounded-lg hover:bg-palm-green-hover transition-colors"
                    >
                        Login
                    </Link>
                </div>
            </div>
        )
    }

    // Get services authorized for this user's role from database
    const services = await serviceRepository.findByRole(user.role)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-palm-green to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Dashboard Layanan</h1>
                                <p className="text-sm text-gray-500">Selamat datang, {user.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">
                                <Shield className="w-4 h-4" />
                                {user.role}
                            </div>
                            {user.role === 'ADMIN' && (
                                <Link
                                    href="/admin"
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                >
                                    <Settings className="w-4 h-4" />
                                    Admin Panel
                                </Link>
                            )}
                            <LogoutButton variant="header" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Layanan Anda</h2>
                    <p className="text-gray-500 mt-1">Layanan yang dapat Anda akses berdasarkan role</p>
                </div>

                {services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <ServiceCard
                                key={service.serviceId}
                                name={service.name}
                                description={service.description || null}
                                icon={null} // Icon data not currently in DB query, fallback to default
                                routeUrl={service.path || `/${service.serviceId}`}
                                imagePath={service.imagePath}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <Server className="w-16 h-16 text-gray-300 mx-auto" />
                        <h3 className="mt-4 text-xl font-semibold text-gray-900">Belum Ada Layanan</h3>
                        <p className="mt-2 text-gray-500 max-w-md mx-auto">
                            Anda belum memiliki akses ke layanan apapun. Hubungi administrator untuk mendapatkan akses.
                        </p>
                        {user.role === 'ADMIN' && (
                            <Link
                                href="/admin?tab=services"
                                className="mt-6 inline-block px-6 py-3 bg-palm-green text-white rounded-lg hover:bg-palm-green-hover transition-colors"
                            >
                                Kelola Layanan
                            </Link>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
