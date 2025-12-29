'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert } from '@/components/Alert'
import { toast } from 'sonner'
import ProductCard from '@/components/ProductCard'

interface Product {
  id: string
  name: string
  description: string
  price: number
  original_price?: number
  label?: string
  imageUrl?: string
  image?: string
  stock_available?: boolean
  sold_count?: number
  rating?: number
  category?: string
  show?: boolean
}

interface ProductListProps {
  products?: Product[]
  loadFromAPI?: boolean
}

export default function ProductList({ products: initialProducts, loadFromAPI = false }: ProductListProps) {
  const router = useRouter()
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>(initialProducts || [])
  const [isLoading, setIsLoading] = useState(false)
  const [isShowingMore, setIsShowingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const ITEMS_PER_PAGE = 8

  const loaderRef = useRef<HTMLDivElement>(null)

  // Initial load
  useEffect(() => {
    if (loadFromAPI) {
      loadProducts()
    } else if (initialProducts) {
      setDisplayedProducts(initialProducts.slice(0, ITEMS_PER_PAGE))
      setHasMore(initialProducts.length > ITEMS_PER_PAGE)
      setTotalCount(initialProducts.length)
    }
  }, [initialProducts, loadFromAPI])

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, displayedProducts.length])

  const loadProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/products?page=1&limit=${ITEMS_PER_PAGE}`)
      const result = await response.json()

      if (result.status && result.data) {
        const products = result.data.products || result.data || []
        setDisplayedProducts(products)
        setTotalCount(result.data.totalCount || products.length)
        setHasMore(result.data.totalCount > ITEMS_PER_PAGE)
        setPage(1)
      } else {
        throw new Error(result.message || 'Gagal mengambil data produk')
      }
    } catch (err: any) {
      console.error('Error loading products:', err)
      setError(err.message || 'Terjadi kesalahan saat memuat produk')
      toast.error('Gagal Memuat Produk', {
        description: err.message || 'Terjadi kesalahan yang tidak diketahui'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadMore = async () => {
    if (isShowingMore) return
    setIsShowingMore(true)

    try {
      const nextPage = page + 1
      const response = await fetch(`/api/products?page=${nextPage}&limit=${ITEMS_PER_PAGE}`)
      const result = await response.json()

      if (result.status && result.data) {
        const products = result.data.products || result.data || []
        setDisplayedProducts(prev => [...prev, ...products])
        setPage(nextPage)
        setHasMore(displayedProducts.length + products.length < totalCount)
      } else {
        throw new Error(result.message || 'Gagal mengambil data produk')
      }
    } catch (err: any) {
      console.error('Error loading more products:', err)
      setError(err.message || 'Terjadi kesalahan saat memuat produk')
    } finally {
      setIsShowingMore(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value || 0)
  }

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="space-y-8">
      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden h-full">
              <Skeleton className="h-full w-full" />
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert
          variant="danger"
          message={error}
          dismissible
          onClose={() => setError(null)}
        />
      )}

      {/* Products Grid */}
      {!isLoading && !error && displayedProducts.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Load More Indicator */}
          {hasMore && (
            <div ref={loaderRef} className="text-center py-8">
              {isShowingMore ? (
                <div className="inline-flex items-center gap-2">
                  <div className="w-6 h-6 border-2  border-t-transparent rounded-full animate-spin"></div>
                  <span className="">Memuat lebih banyak produk...</span>
                </div>
              ) : (
                <div className="h-8"></div>
              )}
            </div>
          )}

          {/* Product Count */}
          <div className="text-center ">
            Menampilkan <span className="font-semibold ">{displayedProducts.length}</span> dari <span className="font-semibold">{totalCount}</span> produk
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && !error && displayedProducts.length === 0 && (
        <Card className="text-center p-16">
          <div className="w-24 h-24 mx-auto mb-6  rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 002 2H6a2 2 0 002-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414-2.414a1 1 0 01-.293-.707V5a2 2 0 012-2h2.586a1 1 0 001.414.586l2.414 2.414a1 1 0 01.293.707L20 12.586V10" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold  mb-2">Tidak Ada Produk</h3>
          <p className=" mb-6 max-w-md mx-auto">
            {loadFromAPI
              ? 'Saat ini tidak ada produk yang tersedia.'
              : 'Tidak ada produk yang dapat ditampilkan.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={loadFromAPI ? loadProducts : () => window.location.reload()}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
            >
              Kembali ke Beranda
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
