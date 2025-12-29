'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2, Plus, Search, Filter, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/Alert'
import ProductCard from '@/components/ProductCard'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import AppFooter from '@/components/AppFooter'

export default function DashboardProductsPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Akses Ditolak', {
        description: 'Silakan login terlebih dahulu'
      })
      router.push('/login')
      return
    }

    if (!loading && user && !isAdmin) {
      toast.error('Akses Ditolak', {
        description: 'Halaman ini khusus untuk admin'
      })
      router.push('/dashboard')
      return
    }

    loadProducts()
  }, [user, isAdmin, loading, router])

  const loadProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/products')
      const result = await response.json()

      if (result.status && result.data) {
        setProducts(result.data)
        setFilteredProducts(result.data)
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

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${productName}"?`)) {
      return
    }

    setIsDeleting(productId)
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })
      const result = await response.json()

      if (result.status) {
        toast.success('Produk Dihapus', {
          description: `Produk "${productName}" berhasil dihapus`
        })
        await loadProducts()
      } else {
        throw new Error(result.message || 'Gagal menghapus produk')
      }
    } catch (err: any) {
      console.error('Error deleting product:', err)
      toast.error('Gagal Menghapus', {
        description: err.message || 'Terjadi kesalahan saat menghapus produk'
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query))
    )
    setFilteredProducts(filtered)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value || 0)
  }

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br ">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 /95 backdrop-blur-md border-b border-border/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-xl font-bold foreground hover: transition-colors">
                Yilzi Digitalz
              </Link>
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 foreground">
                Admin
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className=" hidden md:block">
                {user?.displayName || user?.email}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="p-2  hover: rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 " />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold ">Manajemen Produk</h1>
                  <p className="">Kelola semua produk toko Anda</p>
                </div>
              </div>
              {/* TAMBAH PRODUK BUTTON DIHAPUS SEMENTARA */}
              {/* <Link href="/dashboard/add-product">
                <Button className="bg-gradient-to-r  foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Produk Baru
                </Button>
              </Link> */}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium  mb-1">Total Produk</p>
                      <p className="text-2xl font-bold ">{products.length}</p>
                    </div>
                    <div className="w-10 h-10  rounded-lg flex items-center justify-center">
                      <Filter className="w-5 h-5 " />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium  mb-1">Tersedia</p>
                      <p className="text-2xl font-bold ">
                        {products.filter(p => p.stock_available).length}
                      </p>
                    </div>
                    <div className="w-10 h-10  rounded-lg flex items-center justify-center">
                      <Search className="w-5 h-5 " />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium  mb-1">Habis</p>
                      <p className="text-2xl font-bold ">
                        {products.filter(p => !p.stock_available).length}
                      </p>
                    </div>
                    <div className="w-10 h-10  rounded-lg flex items-center justify-center">
                      <Filter className="w-5 h-5 " />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium  mb-1">Total Penjualan</p>
                      <p className="text-2xl font-bold ">
                        {products.reduce((sum, p) => sum + (p.sold_count || 0), 0)}
                      </p>
                    </div>
                    <div className="w-10 h-10  rounded-lg flex items-center justify-center">
                      <Filter className="w-5 h-5 " />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 " />
                <Input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="md:w-64 p-2.5 bg-background border  rounded-lg"
              >
                <option value="">Semua Kategori</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
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

            {/* Loading */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="h-80">
                    <div className="h-full  animate-pulse rounded-lg" />
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <Card className="text-center p-12">
                <div className="w-16 h-16 mx-auto mb-4  rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 " />
                </div>
                <h3 className="text-xl font-bold  mb-2">Tidak Ada Produk</h3>
                <p className=" mb-6">
                  {searchQuery || filterCategory
                    ? 'Tidak ada produk yang sesuai dengan pencarian'
                    : 'Belum ada produk yang ditambahkan'}
                </p>
                {/* TAMBAH PRODUK PERTAMA BUTTON DIHAPUS SEMENTARA */}
                {/* {!searchQuery && !filterCategory && (
                  <Link href="/dashboard/add-product">
                    <Button className="bg-gradient-to-r  foreground">
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Produk Pertama
                    </Button>
                  </Link>
                )} */}
              </Card>
            ) : (
              /* Products Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="group overflow-hidden">
                    {/* Image */}
                    <div className="aspect-[4/3] bg-gradient-to-br  overflow-hidden relative">
                      <img
                        src={product.imageUrl || product.image || '/images/hero-fallback.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Actions */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/dashboard/product/${product.id}`}>
                          <Button size="sm" variant="secondary" className="bg-background/90 hover:bg-background">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={isDeleting === product.id}
                          className=" hover:"
                        >
                          {isDeleting === product.id ? (
                            <div className="w-4 h-4 border-2 border-border border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-4">
                      {/* Badge */}
                      {product.label && (
                        <Badge className="mb-2 bg-gradient-to-r  foreground">
                          {product.label}
                        </Badge>
                      )}

                      {/* Name */}
                      <h3 className="text-lg font-bold  mb-2 line-clamp-2">
                        {product.name}
                      </h3>

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

                      {/* Stock */}
                      <div className="flex items-center gap-2">
                        <Badge variant={product.stock_available ? 'default' : 'secondary'}>
                          {product.stock_available ? 'Tersedia' : 'Habis'}
                        </Badge>
                        {product.sold_count && (
                          <span className="text-sm ">
                            {product.sold_count} terjual
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
