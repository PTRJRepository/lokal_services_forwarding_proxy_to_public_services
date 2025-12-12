import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import SatelliteMap from '@/components/SatelliteMapWrapper'
import { MapPin, Phone, Mail, Building2, Factory, Leaf, Users, Award, TreePine, Heart, Globe, Shield } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <HeroSection />

      {/* Kilasan Perusahaan Section */}
      <section id="kilasan" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-6">Kilasan Perusahaan</h2>
            <div className="h-1 w-24 bg-palm-green mx-auto rounded-full mb-8" />
            <p className="text-xl text-gray-600 leading-relaxed italic">
              "Berbasis di jantung Kepulauan Bangka Belitung, PT Rebinmas Jaya adalah perusahaan perkebunan kelapa sawit yang memadukan efisiensi operasional dengan tanggung jawab sosial. Kami percaya bahwa pertumbuhan bisnis harus berjalan seiring dengan kesejahteraan masyarakat dan kelestarian lingkungan."
            </p>
          </div>
        </div>
      </section>

      {/* Tentang Kami Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Tentang Kami</h2>
            <div className="mt-4 h-1 w-24 bg-palm-green mx-auto rounded-full" />
          </div>

          {/* Profil Perusahaan */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Building2 className="h-8 w-8 text-palm-green" />
                Profil Perusahaan
              </h3>
              <div className="text-lg text-gray-600 leading-relaxed space-y-4">
                <p>
                  PT Rebinmas Jaya adalah perusahaan yang bergerak di bidang budidaya dan pengolahan kelapa sawit.
                  Berkantor pusat di Jakarta dan memiliki basis operasional strategis di Kabupaten Belitung dan
                  Belitung Timur, kami fokus pada produksi Tandan Buah Segar (TBS) dan Minyak Kelapa Sawit (CPO)
                  yang memenuhi standar industri.
                </p>
                <p>
                  Dengan pengalaman panjang di industri perkebunan, kami mengelola ribuan hektar lahan produktif
                  yang tersebar di berbagai estate, dengan dukungan tenaga kerja profesional yang berdedikasi.
                </p>
              </div>
            </div>

            <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-xl">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/assets/kebun sawit.webp')" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-palm-green/80 to-earth-brown/80" />
              </div>
              <div className="relative h-full flex items-center justify-center text-center text-white p-8">
                <div>
                  <TreePine className="h-16 w-16 mx-auto mb-4 opacity-90" />
                  <p className="text-lg font-semibold">Perkebunan Kelapa Sawit</p>
                  <p className="text-sm opacity-80">Belitung, Bangka Belitung</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visi & Misi */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Visi */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-palm-green hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Award className="h-7 w-7 text-golden-yellow" />
                Visi
              </h3>
              <p className="text-gray-600 leading-relaxed">
                PT. Rebinmas Jaya berkomitmen untuk memproduksi CPO dan Kernel berkwalitas yang berkesinambungan,
                dengan managemen yang professional didukung karyawan yang berdedikasi.
              </p>
            </div>

            {/* Misi */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-golden-yellow hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Leaf className="h-7 w-7 text-palm-green" />
                Misi
              </h3>
              <ul className="text-gray-600 leading-relaxed space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-palm-green font-bold">1.</span>
                  Melakukan kegiatan usaha yang berwawasan lingkungan dan berkelanjutan.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-palm-green font-bold">2.</span>
                  Menghasilkan produksi berkwalitas tinggi.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-palm-green font-bold">3.</span>
                  Mendorong Pembelajaran secara terus menerus dan perbaikan dalam penerapannya.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-palm-green font-bold">4.</span>
                  Menjadikan suatu perusahaan yang bertanggung jawab kepada masyarakat sekitar.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Operasional Section */}
      <section id="operations" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Operasional</h2>
            <div className="mt-4 h-1 w-24 bg-palm-green mx-auto rounded-full" />
          </div>

          {/* Estates Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Parit Gunung Estate */}
            <div className="bg-gradient-to-br from-palm-green to-emerald-700 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Parit Gunung Estate</h3>
              <p className="text-white/80 text-sm mb-4">Kecamatan Badau, Belitung</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs">1A</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs">1B</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs">2A</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs">2B</span>
              </div>
            </div>

            {/* Air Ruak Estate */}
            <div className="bg-gradient-to-br from-earth-brown to-amber-800 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <TreePine className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Air Ruak Estate</h3>
              <p className="text-white/80 text-sm mb-4">Kabupaten Belitung Timur</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs">ARE A</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs">ARE B1</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs">ARE B2</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs">ARE C</span>
              </div>
            </div>

            {/* Darul Makmur Estate */}
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Globe className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Darul Makmur Estate</h3>
              <p className="text-white/80 text-sm mb-4">Kabupaten Belitung</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs">Air Raya</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs">Kandis</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs">Cendong</span>
              </div>
            </div>
          </div>

          {/* Satellite Map */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <MapPin className="h-7 w-7 text-palm-green" />
              Lokasi Operasional
            </h3>
            <SatelliteMap />
          </div>

          {/* Standar Kualitas */}
          <div className="bg-gray-50 p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Shield className="h-7 w-7 text-palm-green" />
              Standar Kualitas
            </h3>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                Kami menerapkan <em>Good Agricultural Practices</em> (GAP) mulai dari pembibitan, perawatan,
                hingga panen untuk memastikan Tandan Buah Segar (TBS) yang diproduksi memiliki rendemen
                minyak yang tinggi.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-palm-green/10 text-palm-green rounded-full text-sm font-medium">GAP Certified</span>
                <span className="px-4 py-2 bg-golden-yellow/10 text-earth-brown rounded-full text-sm font-medium">High Yield TBS</span>
                <span className="px-4 py-2 bg-palm-green/10 text-palm-green rounded-full text-sm font-medium">Quality CPO</span>
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">ISPO Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Keberlanjutan & CSR Section */}
      <section id="sustainability" className="py-20 bg-gradient-to-br from-palm-green to-earth-brown text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">Keberlanjutan & CSR</h2>
            <div className="mt-4 h-1 w-24 bg-golden-yellow mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Komitmen Lingkungan ISPO */}
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Leaf className="h-7 w-7 text-golden-yellow" />
                Komitmen Lingkungan (ISPO)
              </h3>
              <p className="text-white/90 leading-relaxed">
                PT Rebinmas Jaya berkomitmen penuh terhadap tata kelola perkebunan yang ramah lingkungan.
                Kami telah dan terus berupaya memenuhi standar <strong>Indonesian Sustainable Palm Oil (ISPO)</strong>,
                memastikan bahwa produk kami dihasilkan tanpa merusak keseimbangan ekosistem. Predikat kelas
                kebun yang baik menjadi bukti keseriusan kami dalam pengelolaan lahan.
              </p>
            </div>

            {/* Pemberdayaan Masyarakat */}
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Users className="h-7 w-7 text-golden-yellow" />
                Pemberdayaan Masyarakat
              </h3>
              <p className="text-white/90 leading-relaxed mb-4">
                Kami percaya bahwa perusahaan tidak bisa tumbuh sendirian. PT Rebinmas Jaya aktif menjalin
                hubungan harmonis dengan masyarakat di sekitar wilayah operasional (Ring 1), termasuk desa-desa
                di Kabupaten Belitung dan Belitung Timur.
              </p>
              <div className="flex items-center gap-2 text-golden-yellow font-semibold">
                <Heart className="h-5 w-5" />
                Program Plasma untuk ekonomi warga lokal
              </div>
            </div>
          </div>

          {/* CSR & Bantuan Sosial */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
            <h3 className="text-2xl font-bold mb-6 text-center">CSR & Bantuan Sosial</h3>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-golden-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-golden-yellow" />
                </div>
                <p className="text-sm text-white/90">Bantuan paket sembako pada hari besar keagamaan (Ramadan/Idul Fitri)</p>
              </div>
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-golden-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-golden-yellow" />
                </div>
                <p className="text-sm text-white/90">Penyaluran hewan kurban untuk masyarakat desa sekitar</p>
              </div>
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-golden-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-golden-yellow" />
                </div>
                <p className="text-sm text-white/90">Bantuan infrastruktur untuk desa binaan (Air Batu Buding, Kacang Butor, Pelepak Pute)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hubungi Kami Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Hubungi Kami</h2>
            <div className="mt-4 h-1 w-24 bg-palm-green mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info Section */}
            <div className="space-y-8">
              {/* Kantor Kebun */}
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Factory className="h-6 w-6 text-palm-green" />
                  Kantor Kebun
                </h3>
                <div className="text-gray-600 space-y-4">
                  <p className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-palm-green mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Parit Gunung Estate</strong><br />
                      Dusun Parit Gunung, Desa Air Batu Buding<br />
                      Kecamatan Badau, Belitung
                    </span>
                  </p>
                  <p className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-palm-green mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Air Ruak Estate</strong><br />
                      Kabupaten Belitung Timur
                    </span>
                  </p>
                  <p className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-palm-green mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Darul Makmur Estate (Pelepak Pute)</strong><br />
                      Kabupaten Belitung
                    </span>
                  </p>
                </div>
              </div>

              {/* Kantor Induk (Head Office) */}
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-palm-green" />
                  Kantor Induk (Head Office)
                </h3>
                <div className="text-gray-600 space-y-2">
                  <p className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-palm-green mt-0.5 flex-shrink-0" />
                    <span>
                      Dusun Parit Gunung, Desa Air Batu Buding<br />
                      Kecamatan Badau, Tanjung Pandan 33451<br />
                      Kabupaten Belitung, Kepulauan Bangka Belitung
                    </span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-palm-green flex-shrink-0" />
                    <span>(021) 51401888</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Formulir Kontak</h3>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-palm-green focus:border-transparent transition-all"
                    placeholder="Nama lengkap Anda"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-palm-green focus:border-transparent transition-all"
                    placeholder="email@contoh.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subjek</label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-palm-green focus:border-transparent transition-all"
                    placeholder="Subjek pesan"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-palm-green focus:border-transparent transition-all resize-none"
                    placeholder="Tulis pesan Anda di sini..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-palm-green hover:bg-palm-green-hover text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Kirim Pesan
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-earth-brown text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold mb-4 text-golden-yellow">PT Rebinmas Jaya</h4>
              <p className="text-white/80 text-sm leading-relaxed">
                Perusahaan perkebunan kelapa sawit yang berkomitmen pada keberlanjutan dan pemberdayaan masyarakat.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 text-golden-yellow">Navigasi</h4>
              <ul className="text-white/80 text-sm space-y-2">
                <li><a href="#kilasan" className="hover:text-white transition-colors">Kilasan Perusahaan</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">Tentang Kami</a></li>
                <li><a href="#operations" className="hover:text-white transition-colors">Operasional</a></li>
                <li><a href="#sustainability" className="hover:text-white transition-colors">Keberlanjutan & CSR</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Hubungi Kami</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 text-golden-yellow">Kontak</h4>
              <div className="text-white/80 text-sm space-y-2">
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  (021) 51401888
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  info@rebinmasjaya.co.id
                </p>
                <p className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  Belitung, Bangka Belitung
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center">
            <p className="text-white/60 text-sm">
              &copy; {new Date().getFullYear()} PT Rebinmas Jaya. Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
