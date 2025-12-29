'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageCircle, ShoppingCart } from 'lucide-react'
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
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value || 0)
  }

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const handleAddToCart = () => {
    toast.success('Ditambahkan ke Keranjang', {
      description: `"${product.name}" telah ditambahkan ke keranjang`
    })
    // TODO: Add to cart logic
  }

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-background">
      {/* Badge */}
      {product.label && (
        <div className="absolute top-3 left-3 z-20">
          <Badge className="bg-gradient-to-r  foreground shadow-md">
            {product.label}
          </Badge>
        </div>
      )}

      {/* Product Image */}
      <Link href={`/product/${product.id}`}>
        <div className="aspect-[4/3] bg-gradient-to-br  overflow-hidden relative">
          <img
            src={product.imageUrl || product.image || '/images/hero-fallback.jpg'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>

      {/* Content */}
      <CardContent className="p-4">
        {/* Category */}
        {product.category && (
          <Badge variant="secondary" className="text-xs mb-2">
            {product.category}
          </Badge>
        )}

        {/* Name */}
        <Link href={`/product/${product.id}`}>
          <h3 className="text-lg font-bold  mb-2 line-clamp-2 hover: transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xl font-bold ">
            Rp {formatCurrency(product.price)}
          </span>
          {product.original_price && (
            <span className="text-sm  line-through">
              Rp {formatCurrency(product.original_price)}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm  line-clamp-2 mb-4 min-h-[40px]">
          {truncateText(product.description, 100)}
        </p>

        {/* Stock & Sold */}
        <div className="flex items-center justify-between mb-4">
          <Badge
            variant={product.stock_available ? 'default' : 'secondary'}
            className={product.stock_available ? '' : ' '}
          >
            {product.stock_available ? 'Tersedia' : 'Habis'}
          </Badge>
          {product.sold_count && (
            <span className="text-sm ">
              {product.sold_count} terjual
            </span>
          )}
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < product.rating ? 'fill-foreground' : ''}`}
                viewBox="0 0 24 24"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.24 2 5.46 7.19-.61L5.82 14l-1.64 7.03L12 17.27z" />
              </svg>
            ))}
            <span className="text-sm  ml-1">
              {product.rating}.0
            </span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <Link href={`/product/${product.id}`} className="flex-1">
            <Button className="w-full bg-gradient-to-r  foreground">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Detail
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            onClick={handleAddToCart}
            className="  hover:"
          >
            <CartIcon className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
