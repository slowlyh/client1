'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'  // Add use from react
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import AppFooter from '@/components/AppFooter'
import { ArrowLeft, ShoppingCart, Star, Box, Download, MessageCircle } from 'lucide-react'
import BuyCard from '@/components/BuyCard'

interface Product {
  id: string
  name: string
  description: string
  price: number
  original_price?: number
  label?: string
  imageUrl?: string
  image?: string
  images?: string[]
  stock_available?: boolean
  stock?: number
  sold_count?: number
  rating?: number
  review_count?: number
  category?: string
  show?: boolean
  additional_information?: Array<{ key: string; value: string }>
  file?: string
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params Promise using React.use() for Next.js 15
  const resolvedParams = use(params)
  const productId = resolvedParams.id

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProduct()
  }, [productId])

  const loadProduct = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/products/${productId}`)
      const result = await response.json()

      if (result.status && result.data) {
        setProduct(result.data)
      } else {
        throw new Error(result.message || 'Produk tidak ditemukan')
      }
    } catch (err: any) {
      console.error('Error loading product:', err)
      setError(err.message || 'Gagal memuat detail produk')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value || 0)
  }

  const discountPercent = product?.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null

  // Logic pengecekan ketersediaan stok yang sederhana dan type-safe
  // Produk tersedia jika:
  // 1. stock_available === true (boolean), ATAU
  // 2. stock (number) > 0, ATAU
  // 3. stock_available tidak ada dan stock tidak ada (default: tersedia)
  const stockAvailable = product?.stock_available === true ||
                         (typeof product?.stock === 'number' && product.stock > 0) ||
                         (product?.stock_available === undefined && product?.stock === undefined);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br ">
        <nav className="fixed top-0 left-0 right-0 z-50 /95 backdrop-blur-md border-b border-border/10">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-2xl font-bold foreground hover: transition-colors">
              Yilzi Digitalz
            </Link>
          </div>
        </nav>
        <main className="flex-grow pt-24">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="h-[400px] w-full" />
              <div className="space-y-6">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-8 w-1/4" />
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <AppFooter />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br ">
        <nav className="fixed top-0 left-0 right-0 z-50 /95 backdrop-blur-md border-b border-border/10">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-2xl font-bold foreground hover: transition-colors">
              Yilzi Digitalz
            </Link>
          </div>
        </nav>
        <main className="flex-grow pt-24 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto  rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3L13.732 20c.77 1.333 2.694 1.333 3.464 0l6.462-11c.77-1.333-.192-3-1.732-3z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold ">Produk Tidak Ditemukan</h3>
                  <p className="">{error}</p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button onClick={loadProduct}>
                    Coba Lagi
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/products'}
                  >
                    Kembali ke Produk
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <AppFooter />
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br ">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 /95 backdrop-blur-md border-b border-border/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold foreground hover: transition-colors">
              Yilzi Digitalz
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/products" className=" hover:foreground transition-colors">
                Produk
              </Link>
              <Link href="/login" className="bg-gradient-to-r  foreground px-6 py-2 rounded-lg font-semibold transition-all">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-24">
        <section className="container mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/products" className="inline-flex items-center  hover: font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Produk
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product Image & Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Image */}
              <div className="relative aspect-square bg-gradient-to-br  rounded-2xl overflow-hidden shadow-2xl">
                {product.imageUrl || product.image || (product.images && product.images[0]) ? (
                  <img
                    src={product.imageUrl || product.image || product.images![0]!}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full ">
                    <svg className="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}

                {/* Stock Badge */}
                {!stockAvailable && (
                  <div className="absolute inset-0 /90 flex items-center justify-center backdrop-blur-sm">
                    <Badge className=" foreground text-xl px-6 py-3 mb-2">
                      Stok Habis
                    </Badge>
                  </div>
                )}

                {/* Discount Badge */}
                {discountPercent && discountPercent > 0 && (
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 foreground text-lg px-4 py-2 shadow-lg">
                    -{discountPercent}%
                  </Badge>
                )}

                {/* Label Badge */}
                {product.label && (
                  <Badge className="absolute top-4 left-4 bg-gradient-to-r  foreground px-4 py-2 shadow-lg">
                    {product.label}
                  </Badge>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {/* Category */}
                {product.category && (
                  <Badge className="  hover:">
                    {product.category}
                  </Badge>
                )}

                {/* Title */}
                <h1 className="text-4xl font-bold ">
                  {product.name}
                </h1>

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-3">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(product.rating!)
                              ? 'fill-yellow-400 '
                              : ''
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold ">({product.rating})</span>
                    {product.review_count && (
                      <span className="">{product.review_count} ulasan</span>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-extrabold ">
                    Rp {formatCurrency(product.price)}
                  </span>
                  {product.original_price && (
                    <span className="text-xl  line-through">
                      Rp {formatCurrency(product.original_price)}
                    </span>
                  )}
                </div>

                <Separator />

                {/* Description */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold ">Deskripsi</h3>
                  <p className=" leading-relaxed whitespace-pre-wrap">
                    {product.description || 'Tidak ada deskripsi produk'}
                  </p>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-4">
                  {product.sold_count && (
                    <Card>
                      <CardContent className="p-4 flex items-center gap-3">
                        <ShoppingCart className="w-6 h-6 " />
                        <div>
                          <div className="text-2xl font-bold ">{product.sold_count}</div>
                          <div className="text-sm ">Terjual</div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {product.stock && (
                    <Card>
                      <CardContent className="p-4 flex items-center gap-3">
                        <Box className="w-6 h-6 " />
                        <div>
                          <div className="text-2xl font-bold ">{product.stock}</div>
                          <div className="text-sm ">Tersedia</div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Additional Information */}
                {product.additional_information && product.additional_information.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informasi Tambahan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {product.additional_information.map((info, index) => (
                          <div key={index} className="flex justify-between p-2  rounded">
                            <span className="font-medium ">{info.key}</span>
                            <span className="">{info.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Buy Card */}
            <div className="lg:col-span-1">
              <BuyCard product={product} />
            </div>
          </div>

          {/* WhatsApp Contact */}
          <div className="mt-8">
            <a
              href={`https://wa.me/6281359123789?text=Halo, saya ingin bertanya tentang produk: ${product.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2  hover: foreground px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Tanya via WhatsApp
            </a>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  )
}
