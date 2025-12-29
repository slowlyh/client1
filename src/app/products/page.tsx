'use client'

import { useState, useEffect } from 'react'
import ProductList from '@/components/ProductList'
import AppFooter from '@/components/AppFooter'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/Alert'

export default function ProductsPage() {
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
      const response = await fetch('/api/products?show=true&stock_available=true')
      const result = await response.json()

      if (result.status && result.data) {
        // Handle both paginated and non-paginated responses
        const productsList = result.data.products || result.data || []
        setProducts(productsList)
      } else {
        throw new Error(result.message || 'Gagal mengambil data produk')
      }
    } catch (err: any) {
      console.error('Error loading products:', err)
      setError(err.message || 'Terjadi kesalahan saat memuat produk')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br ">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow pt-24">
        <section className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <Link href="/">
              <Button variant="outline" size="sm" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
            </Link>
            <h1 className="text-5xl font-bold mb-4  bg-gradient-to-r  bg-clip-text text-transparent">
              Semua Produk
            </h1>
            <p className="text-xl  max-w-2xl mx-auto">
              Temukan berbagai produk digital berkualitas untuk kebutuhan bisnis Anda. Script, Bot, Website, dan lainnya.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-3xl mx-auto">
              <div className="bg-background rounded-xl p-6 shadow-md border ">
                <div className="text-3xl font-bold  mb-2">
                  {isLoading ? '...' : products.length}
                </div>
                <div className="text-sm ">Total Produk</div>
              </div>
              <div className="bg-background rounded-xl p-6 shadow-md border ">
                <div className="text-3xl font-bold  mb-2">
                  {isLoading ? '...' : products.filter(p => p.stock_available).length}
                </div>
                <div className="text-sm ">Tersedia</div>
              </div>
              <div className="bg-background rounded-xl p-6 shadow-md border ">
                <div className="text-3xl font-bold  mb-2">
                  {isLoading ? '...' : products.reduce((sum, p) => sum + (p.sold_count || 0), 0)}
                </div>
                <div className="text-sm ">Terjual</div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <Alert
              variant="danger"
              message={error}
              dismissible
              onClose={() => setError(null)}
            />
          )}

          {/* Products List with Infinite Scroll */}
          {!isLoading && products.length > 0 && (
            <ProductList products={products} loadFromAPI={true} />
          )}

          {/* Empty State */}
          {!isLoading && products.length === 0 && (
            <div className="bg-background rounded-2xl p-12 text-center shadow-md border ">
              <div className="w-20 h-20 mx-auto mb-4  rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 002 2H6a2 2 0 002-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414-2.414a1 1 0 01-.293-.707V5a2 2 0 012-2h2.586a1 1 0 001.414.586l2.414 2.414a1 1 0 01.293.707L20 12.586V10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold  mb-2">Belum Ada Produk</h3>
              <p className=" mb-6 max-w-md mx-auto">
                Saat ini tidak ada produk yang tersedia. Nantikan produk digital terbaru dari kami!
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={loadProducts} variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </Button>
                <Link href="/">
                  <Button className="bg-gradient-to-r  foreground">
                    Kembali ke Beranda
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </section>

      </main>

      <AppFooter />
    </div>
  )
}
