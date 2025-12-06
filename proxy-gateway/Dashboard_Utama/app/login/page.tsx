import LoginForm from '@/components/LoginForm'
import Image from 'next/image'

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center relative overflow-hidden bg-gray-50">
            {/* Background with Blur */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/30 z-10" />
                {/* Placeholder or generated image */}
                <div className="relative w-full h-full bg-[url('/assets/plantation_bg.png')] bg-cover bg-center blur-sm scale-110">
                    {/* Fallback color if image missing */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#3A7D44] to-[#5C4033] opacity-80" />
                </div>
            </div>

            <div className="relative z-10 w-full max-w-md p-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8">
                        <div className="mb-8 text-center">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employee Portal</h1>
                            <p className="text-sm text-gray-500 mt-2">Enter your credentials to access the dashboard</p>
                        </div>
                        <LoginForm />
                    </div>
                    <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-500">
                            &copy; {new Date().getFullYear()} PT Rebinmas Jaya. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}
