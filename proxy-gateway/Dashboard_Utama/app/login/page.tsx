import LoginForm from '@/components/LoginForm'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center relative overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/assets/kelapa-sawit-pohon.webp"
                    alt="Perkebunan Kelapa Sawit"
                    fill
                    className="object-cover scale-105"
                    priority
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 bg-gradient-to-br from-palm-green/30 via-transparent to-earth-brown/30" />
            </div>

            {/* Back to Home */}
            <Link
                href="/"
                className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20"
            >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Beranda</span>
            </Link>

            <div className="relative z-10 w-full max-w-md p-6">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50">
                    {/* Header with Logo */}
                    <div className="bg-gradient-to-r from-palm-green to-emerald-600 px-8 py-8">
                        <div className="flex flex-col items-center">
                            <div className="relative w-20 h-20 rounded-full bg-white/20 backdrop-blur-md p-1 shadow-lg mb-4">
                                <Image
                                    src="/assets/logo.webp"
                                    alt="PT Rebinmas Jaya"
                                    fill
                                    className="object-contain p-2"
                                />
                            </div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Portal Karyawan</h1>
                            <p className="text-sm text-white/80 mt-1">PT Rebinmas Jaya</p>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="p-8">
                        <p className="text-sm text-gray-500 text-center mb-6">
                            Masuk untuk mengakses dashboard
                        </p>
                        <LoginForm />
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-500">
                            &copy; {new Date().getFullYear()} PT Rebinmas Jaya. Hak Cipta Dilindungi.
                        </p>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-golden-yellow/20 rounded-full blur-3xl" />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-palm-green/20 rounded-full blur-3xl" />
            </div>
        </main>
    )
}
