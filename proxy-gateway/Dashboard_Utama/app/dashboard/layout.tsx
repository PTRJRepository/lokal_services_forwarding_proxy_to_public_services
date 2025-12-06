import { auth, signOut } from '@/auth'
import Image from 'next/image'
import Link from 'next/link'
import { LogOut, User, LayoutDashboard, Settings } from 'lucide-react'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    const user = session?.user

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
                <div className="flex items-center h-16 px-6 border-b border-gray-200">
                    <span className="text-xl font-bold text-palm-green">REBINMAS JAYA</span>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/dashboard" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg group hover:bg-green-50 hover:text-palm-green transition-colors">
                        <LayoutDashboard className="w-5 h-5 mr-3 text-gray-500 group-hover:text-palm-green" />
                        Dashboard
                    </Link>
                    {user?.role === 'ADMIN' && (
                        <Link href="/admin" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 rounded-lg group hover:bg-green-50 hover:text-palm-green transition-colors">
                            <Settings className="w-5 h-5 mr-3 text-gray-400 group-hover:text-palm-green" />
                            Admin Panel
                        </Link>
                    )}
                </nav>
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                        {user?.image ? (
                            <Image src={user.image} alt="User" width={32} height={32} className="rounded-full" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-palm-green/20 flex items-center justify-center text-palm-green">
                                <User className="w-4 h-4" />
                            </div>
                        )}
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                            <p className="text-xs text-gray-500 uppercase">{user?.role || 'Staff'}</p>
                        </div>
                    </div>
                    <form action={async () => {
                        'use server';
                        await signOut({ redirectTo: '/login' });
                    }}>
                        <button className="flex w-full items-center px-4 py-2 mt-2 text-sm text-gray-500 hover:text-red-600 transition-colors">
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex md:hidden items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
                    <span className="text-lg font-bold text-palm-green">REBINMAS JAYA</span>
                    {/* Mobile menu toggle would go here */}
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
