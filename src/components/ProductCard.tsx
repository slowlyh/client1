'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { ShoppingCart as CartIcon } from 'lucide-react'
import { toast } from 'sonner'

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

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID').format(value || 0)

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const handleAddToCart = () => {
    toast.success('Ditambahkan ke Keranjang', {
      description: `"${product.name}" telah ditambahkan ke keranjang`
    })
  }

  const rating = product.rating ?? 0

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-background">
      {product.label && (
        <div className="absolute top-3 left-3 z-20">
          <Badge className="shadow-md">
            {product.label}
          </Badge>
        </div>
      )}

      <Link href={`/product/${product.id}`}>
        <div className="aspect-[4/3] overflow-hidden relative">
          <img
            src={product.imageUrl || product.image || '/images/hero-fallback.jpg'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>

      <CardContent className="p-4">
        {product.category && (
          <Badge variant="secondary" className="text-xs mb-2">
            {product.category}
          </Badge>
        )}

        <Link href={`/product/${product.id}`}>
          <h3 className="text-lg font-bold mb-2 line-clamp-2 hover:transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xl font-bold">
            Rp {formatCurrency(product.price)}
          </span>
          {product.original_price && (
            <span className="text-sm line-through">
              Rp {formatCurrency(product.original_price)}
            </span>
          )}
        </div>

        <p className="text-sm line-clamp-2 mb-4 min-h-[40px]">
          {truncateText(product.description, 100)}
        </p>

        <div className="flex items-center justify-between mb-4">
          <Badge
            variant={product.stock_available ? 'default' : 'secondary'}
          >
            {product.stock_available ? 'Tersedia' : 'Habis'}
          </Badge>
          {product.sold_count !== undefined && (
            <span className="text-sm">
              {product.sold_count} terjual
            </span>
          )}
        </div>

        {product.rating !== undefined && (
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < rating ? 'fill-current' : ''}`}
                viewBox="0 0 24 24"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.24 2 5.46 7.19-.61L5.82 14l-1.64 7.03L12 17.27z" />
              </svg>
            ))}
            <span className="text-sm ml-1">
              {rating}.0
            </span>
          </div>
        )}

        <div className="flex gap-2">
          <Link href={`/product/${product.id}`} className="flex-1">
            <Button className="w-full">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Detail
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            onClick={handleAddToCart}
          >
            <CartIcon className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
