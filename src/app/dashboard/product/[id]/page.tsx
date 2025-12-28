'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, X, Save, Trash2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert } from '@/components/Alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import Image from 'next/image'
import AppFooter from '@/components/AppFooter'

interface AdditionalInfo {
  name: string
  value: string
}

export default function EditProductPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)
  const productFileInputRef = useRef<HTMLInputElement>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    label: '',
    category: '',
    stock_available: true,
    show: true,
    rating: 5,
    sold_count: 0,
    imageUrl: '',
    image: null as File | null,
    file: null as File | string | null,
    additional_information: [] as AdditionalInfo[]
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [fileSourceType, setFileSourceType] = useState<'upload' | 'url'>('upload')

  // Redirect checks
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Akses Ditolak', {
        description: 'Silakan login terlebih dahulu'
      })
      router.push('/login')
      return
    }

    if (!authLoading && user && !isAdmin) {
      toast.error('Akses Ditolak', {
        description: 'Halaman ini khusus untuk admin'
      })
      router.push('/dashboard')
      return
    }
  }, [user, isAdmin, authLoading, router])

  // Load product data
  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  const loadProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      const result = await response.json()

      if (result.status && result.data) {
        const product = result.data
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price?.toString() || '',
          original_price: product.original_price?.toString() || '',
          label: product.label || '',
          category: product.category || '',
          stock_available: product.stock_available ?? true,
          show: product.show ?? true,
          rating: product.rating || 5,
          sold_count: product.sold_count || 0,
          imageUrl: product.imageUrl || product.image || '',
          image: null,
          file: product.file || null,
          additional_information: Array.isArray(product.additional_information)
            ? product.additional_information
            : []
        })
        setImagePreview(product.imageUrl || product.image || null)
      } else {
        throw new Error(result.message || 'Produk tidak ditemukan')
      }
    } catch (err: any) {
      console.error('Error loading product:', err)
      toast.error('Gagal Memuat Produk', {
        description: err.message || 'Terjadi kesalahan saat memuat data produk'
      })
      setTimeout(() => {
        router.push('/dashboard/products')
      }, 2000)
    }
  }

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('id-ID').format(Number(value) || 0)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.size <= 5 * 1024 * 1024) {
      setFormData(prev => ({ ...prev, image: file, imageUrl: file.name }))
      setHasChanges(true)

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else if (file) {
      toast.error('Ukuran Gambar Terlalu Besar', {
        description: 'Maksimal 5MB'
      })
    }
  }

  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.size <= 50 * 1024 * 1024) {
      setFormData(prev => ({ ...prev, file }))
      setHasChanges(true)
    } else if (file) {
      toast.error('Ukuran File Terlalu Besar', {
        description: 'Maksimal 50MB'
      })
    }
  }

  const addAdditionalInfo = () => {
    setFormData(prev => ({
      ...prev,
      additional_information: [...prev.additional_information, { name: '', value: '' }]
    }))
    setHasChanges(true)
  }

  const removeAdditionalInfo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additional_information: prev.additional_information.filter((_, i) => i !== index)
    }))
    setHasChanges(true)
  }

  const updateAdditionalInfo = (index: number, field: 'name' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      additional_information: prev.additional_information.map((info, i) =>
        i === index ? { ...info, [field]: value } : info
      )
    }))
    setHasChanges(true)
  }

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Data Tidak Lengkap', {
        description: 'Nama produk wajib diisi'
      })
      return
    }

    if (!formData.description.trim()) {
      toast.error('Data Tidak Lengkap', {
        description: 'Deskripsi produk wajib diisi'
      })
      return
    }

    if (!formData.price || Number(formData.price) <= 0) {
      toast.error('Data Tidak Lengkap', {
        description: 'Harga produk wajib diisi dengan nilai valid'
      })
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const productData: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        original_price: formData.original_price ? Number(formData.original_price) : undefined,
        label: formData.label || undefined,
        category: formData.category || undefined,
        stock_available: formData.stock_available,
        show: formData.show,
        rating: formData.rating,
        sold_count: formData.sold_count,
        additional_information: formData.additional_information.length > 0
          ? formData.additional_information
          : undefined
      }

      // Update image URL if changed
      if (formData.image && typeof formData.image === 'object') {
        productData.imageUrl = formData.image.name
        console.log('Image to upload:', formData.image.name)
      } else if (formData.imageUrl) {
        productData.imageUrl = formData.imageUrl
      }

      // Update file if changed
      if (formData.file) {
        productData.file = formData.file
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      })
      const result = await response.json()

      if (!result.status) {
        throw new Error(result.message || 'Gagal mengupdate produk')
      }

      toast.success('Produk Berhasil Diupdate', {
        description: `"${formData.name}" telah diupdate`
      })

      setTimeout(() => {
        router.push('/dashboard/products')
      }, 1500)

    } catch (err: any) {
      console.error('Error updating product:', err)
      setError(err.message || 'Terjadi kesalahan saat mengupdate produk')
      toast.error('Gagal Mengupdate Produk', {
        description: err.message || 'Terjadi kesalahan yang tidak diketahui'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${formData.name}"?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })
      const result = await response.json()

      if (!result.status) {
        throw new Error(result.message || 'Gagal menghapus produk')
      }

      toast.success('Produk Dihapus', {
        description: `"${formData.name}" berhasil dihapus`
      })

      router.push('/dashboard/products')
    } catch (err: any) {
      console.error('Error deleting product:', err)
      toast.error('Gagal Menghapus Produk', {
        description: err.message || 'Terjadi kesalahan saat menghapus produk'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-xl font-bold hover:text-foreground transition-colors">
                Yilzi Digitalz
              </Link>
              <Badge className="bg-gradient-to-r from-foreground to-muted text-background">
                Admin
              </Badge>
            </div>
            <span className="text-muted-foreground">
              {user?.displayName || user?.email}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/dashboard/products">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Edit Produk</h1>
                <p className="text-muted-foreground">Edit informasi produk: <span className="text-foreground font-semibold">{formData.name}</span></p>
              </div>
            </div>

            {/* Product ID Badge */}
            <div className="inline-block">
              <Badge variant="outline" className="text-xs">
                ID: {productId}
              </Badge>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="product" className="space-y-8">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="product">Produk</TabsTrigger>
                <TabsTrigger value="files">Gambar & File</TabsTrigger>
                <TabsTrigger value="info">Informasi Tambahan</TabsTrigger>
              </TabsList>

              {/* Product Info Tab */}
              <TabsContent value="product" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Informasi Produk
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="productName">Nama Produk *</Label>
                      <Input
                        id="productName"
                        value={formData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        placeholder="Masukkan nama produk"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productDescription">Deskripsi Produk *</Label>
                      <Textarea
                        id="productDescription"
                        value={formData.description}
                        onChange={(e) => handleFieldChange('description', e.target.value)}
                        placeholder="Deskripsi lengkap produk..."
                        rows={6}
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Gunakan format Markdown untuk better formatting
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="productPrice">Harga Jual *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            Rp
                          </span>
                          <Input
                            id="productPrice"
                            type="number"
                            min="0"
                            step="1000"
                            value={formData.price}
                            onChange={(e) => handleFieldChange('price', e.target.value)}
                            placeholder="150000"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="originalPrice">
                          Harga Asli
                          <span className="ml-2 text-muted-foreground">(Opsional)</span>
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            Rp
                          </span>
                          <Input
                            id="originalPrice"
                            type="number"
                            min="0"
                            step="1000"
                            value={formData.original_price}
                            onChange={(e) => handleFieldChange('original_price', e.target.value)}
                            placeholder="200000"
                            className="pl-10"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Harga asli akan ditampilkan sebagai harga coret
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="productBadge">Label Produk</Label>
                        <select
                          id="productBadge"
                          value={formData.label}
                          onChange={(e) => handleFieldChange('label', e.target.value)}
                          className="w-full p-2.5 bg-background border border-border rounded-lg"
                        >
                          <option value="">Label Produk</option>
                          <option value="Best Seller">Best Seller</option>
                          <option value="Hot">Hot</option>
                          <option value="New">New</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="productCategory">Kategori</Label>
                        <select
                          id="productCategory"
                          value={formData.category}
                          onChange={(e) => handleFieldChange('category', e.target.value)}
                          className="w-full p-2.5 bg-background border border-border rounded-lg"
                        >
                          <option value="">Pilih Kategori</option>
                          <option value="Digital Products">Digital Products</option>
                          <option value="Software">Software</option>
                          <option value="Templates">Templates</option>
                          <option value="Graphics">Graphics</option>
                          <option value="Audio">Audio</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Files Tab */}
              <TabsContent value="files" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Gambar & File Produk
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Image Upload */}
                    <div className="space-y-4">
                      <Label htmlFor="productImage">Gambar Produk</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex-grow">
                          <Input
                            id="productImage"
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Pilih Gambar
                          </Button>
                          {formData.image && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setFormData(prev => ({ ...prev, image: null, imageUrl: '' }))}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                          <Image
                            src={imagePreview}
                            alt="Product preview"
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                    </div>

                    {/* Product File Upload */}
                    <div className="space-y-4">
                      <Label htmlFor="productFile">File Produk</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex-grow">
                          <Input
                            id="productFile"
                            type="file"
                            ref={productFileInputRef}
                            onChange={handleProductFileChange}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => productFileInputRef.current?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Pilih File
                          </Button>
                        </div>
                      </div>

                      {/* File Info */}
                      {formData.file && (
                        <div className="p-4 bg-muted/30 border border-border rounded-lg">
                          <p className="text-sm font-medium">
                            File: <span className="text-foreground">{typeof formData.file === 'object' ? formData.file.name : formData.file}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Maksimal 50MB. File akan tersedia untuk download setelah pembelian.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Additional Info Tab */}
              <TabsContent value="info" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informasi Tambahan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      {formData.additional_information.map((info, index) => (
                        <div key={index} className="flex gap-4 items-start">
                          <Input
                            value={info.name}
                            onChange={(e) => updateAdditionalInfo(index, 'name', e.target.value)}
                            placeholder="Nama field"
                            className="max-w-xs"
                          />
                          <Input
                            value={info.value}
                            onChange={(e) => updateAdditionalInfo(index, 'value', e.target.value)}
                            placeholder="Nilai default"
                            className="flex-grow"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAdditionalInfo(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addAdditionalInfo}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Field
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
