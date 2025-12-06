import HeroSection from '@/components/HeroSection'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection />

      {/* About Section (Placeholder based on requirements) */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">About PT Rebinmas Jaya</h2>
            <div className="mt-4 h-1 w-24 bg-palm-green mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                PT Rebinmas Jaya is a prominent oil palm plantation company dedicated to
                <span className="font-semibold text-palm-green"> sustainable growth</span> and
                empowering the local community of Belitung.
              </p>
              <p>
                We are committed to producing high-quality Crude Palm Oil (CPO) while adhering to
                strict environmental standards and supporting our plasma farmers to ensure mutual prosperity.
              </p>
              <p>
                With a focus on integrity and innovation, we strive to be a leader in the agro-industry
                sector in Indonesia.
              </p>
            </div>

            <div className="relative h-64 md:h-80 bg-gray-200 rounded-2xl overflow-hidden shadow-xl">
              {/* Placeholder for About Image */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                [About Image Placeholder]
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-earth-brown text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-4">PT Rebinmas Jaya, Belitung, Indonesia.</p>
          <p className="text-white/60 text-sm">
            &copy; {new Date().getFullYear()} PT Rebinmas Jaya. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}
