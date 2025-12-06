'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function HeroSection() {
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image using generic placeholder or gradient if image fails */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/assets/plantation_bg.png')" }}
            >
                <div className="absolute inset-0 bg-black/40" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                        Sustainable Growth, <br className="hidden md:block" />
                        <span className="text-golden-yellow">Empowering Belitung</span>
                    </h1>
                    <p className="text-lg md:text-2xl mb-8 font-light max-w-3xl mx-auto text-gray-200">
                        PT Rebinmas Jaya - Delivering Quality Crude Palm Oil with Integrity.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-8 py-3 bg-palm-green hover:bg-palm-green-hover text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            Employee Portal <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <Link
                            href="#about"
                            className="inline-flex items-center justify-center px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold rounded-full border border-white/30 transition-all duration-300"
                        >
                            Learn More
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Decorative bottom wave or gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </section>
    )
}
