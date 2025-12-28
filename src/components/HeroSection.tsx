'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Sparkles, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'

export default function HeroSection() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch featured products on mount
  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    setIsLoading(true)
    try {
      // Get top 4 products from API
      const response = await fetch('/api/products?top=true&limit=4')
      const result = await response.json()

      if (result.status && result.data) {
        setFeaturedProducts(result.data)
      } else {
        throw new Error(result.message || 'Gagal mengambil produk')
      }
    } catch (error: any) {
      console.error('Error fetching featured products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Hero Card */}
        <CardContent className="max-w-4xl mx-auto p-12 text-center bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Yilzi Digitalz
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-slate-300 mb-4 font-semibold">
            Automasi & Website
          </p>

          {/* Description */}
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Script Bot WhatsApp hingga website dengan otomatisasi proses. Solusi digital lengkap untuk kebutuhan bisnis Anda.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/products">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Lihat Produk
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <Link href="https://wa.me/6281359123789" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-2 border-white/20 text-white hover:bg-white/10 font-semibold px-8 py-6 text-lg backdrop-blur-sm">
                Hubungi Kami
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-xl border border-blue-500/30">
              <div className="text-3xl font-bold text-blue-400 mb-2">{isLoading ? '...' : featuredProducts.length}+</div>
              <div className="text-slate-400">Produk Digital</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-xl border border-indigo-500/30">
              <div className="text-3xl font-bold text-indigo-400 mb-2">500+</div>
              <div className="text-slate-400">Pelanggan Puas</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30">
              <div className="text-3xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-slate-400">Dukungan</div>
            </div>
          </div>
        </CardContent>

        {/* Featured Products */}
        {!isLoading && featuredProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Produk Unggulan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
