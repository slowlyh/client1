import AppFooter from '@/components/AppFooter'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/home/HeroSection'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import ProcessTimeline from '@/components/home/ProcessTimeline'
import { DotPattern } from '@/components/home/DotPattern'

export default function Home() {
  return (
    <main className="min-h-screen w-full relative overflow-hidden bg-background text-foreground transition-colors duration-300 font-sans">
      {/* Dot Pattern Background */}
      <DotPattern />

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-32">
        {/* Hero Section */}
        <HeroSection />

        {/* Featured Products */}
        <FeaturedProducts />

        {/* Process Timeline Section */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Proses Pembelian</h2>
            <p className="text-muted-foreground">Hanya dengan 4 langkah sederhana untuk mendapatkan produk.</p>
          </div>
          <ProcessTimeline />
        </section>
      </div>

      {/* Footer */}
      <AppFooter />
    </main>
  )
}