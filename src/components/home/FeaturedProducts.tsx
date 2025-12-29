'use client'

import { useState, useEffect } from 'react'
import ProductCardNeo from './ProductCardNeo'
import { Loader2, Sparkles } from 'lucide-react'

export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/products?top=true&limit=4')
      const result = await response.json()

      if (result.status && result.data) {
        const productsList = result.data.products || result.data || []
        setProducts(productsList)
      } else {
        throw new Error(result.message || 'Gagal mengambil produk unggulan')
      }
    } catch (err: any) {
      console.error('Error loading featured products:', err)
      setError(err.message || 'Terjadi kesalahan saat memuat produk')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative py-24">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted/50 backdrop-blur-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-[0.2em] uppercase">
              Produk Pilihan
            </span>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            Unggulan
            <span className="">
              Minggu Ini
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-base md:text-lg max-w-2xl mx-auto">
            Koleksi produk digital terbaik yang paling diminati
            <br className="hidden md:block" />
            oleh komunitas kami.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 animate-spin mx-auto" />
            <p>Memuat produk...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-muted border border-border rounded-2xl p-8 text-center mb-8 backdrop-blur-sm">
            <p className="font-semibold mb-2">⚠️ Error</p>
            <p className="opacity-80">{error}</p>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCardNeo key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && products.length === 0 && (
          <div className="text-center py-24 bg-muted/50 backdrop-blur-sm border border-border rounded-3xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/30 border border-border flex items-center justify-center">
              <span className="text-4xl">✨</span>
            </div>
            <h3 className="text-2xl font-bold mb-3">
              Produk Segera Hadir
            </h3>
            <p className="mb-8 max-w-md mx-auto">
              Kami sedang mempersiapkan koleksi produk digital terbaik untuk Anda.
              <br />
              Nantikan update terbaru!
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-muted/50 font-medium cursor-not-allowed">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Coming Soon</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
