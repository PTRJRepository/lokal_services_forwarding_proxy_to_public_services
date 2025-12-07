'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ArrowRight } from 'lucide-react'

const navLinks = [
    { name: 'Beranda', href: '#' },
    { name: 'Tentang', href: '#about' },
    { name: 'Operasional', href: '#operations' },
    { name: 'Keberlanjutan', href: '#sustainability' },
    { name: 'Kontak', href: '#contact' },
]

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                    ? 'bg-white/95 backdrop-blur-md shadow-lg py-2'
                    : 'bg-gradient-to-b from-black/50 to-transparent py-4'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white shadow-md group-hover:shadow-lg transition-shadow">
                            <Image
                                src="/assets/logo.webp"
                                alt="PT Rebinmas Jaya"
                                fill
                                className="object-contain p-1"
                            />
                        </div>
                        <div className={`hidden sm:block transition-colors ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                            <p className="font-bold text-lg leading-tight">PT Rebinmas Jaya</p>
                            <p className={`text-xs ${isScrolled ? 'text-gray-500' : 'text-white/80'}`}>Palm Oil Plantation</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${isScrolled
                                        ? 'text-gray-700 hover:text-palm-green hover:bg-palm-green/10'
                                        : 'text-white/90 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {link.name}
                            </a>
                        ))}
                        <Link
                            href="/login"
                            className={`ml-4 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${isScrolled
                                    ? 'bg-palm-green text-white hover:bg-palm-green-hover shadow-md hover:shadow-lg'
                                    : 'bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30'
                                }`}
                        >
                            Portal Karyawan <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`md:hidden p-2 rounded-lg transition-colors ${isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                            }`}
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-white/20">
                        <div className="pt-4 space-y-2">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isScrolled
                                            ? 'text-gray-700 hover:bg-gray-100'
                                            : 'text-white hover:bg-white/10'
                                        }`}
                                >
                                    {link.name}
                                </a>
                            ))}
                            <Link
                                href="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-3 bg-palm-green text-white rounded-lg text-sm font-semibold text-center mt-4"
                            >
                                Portal Karyawan
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
