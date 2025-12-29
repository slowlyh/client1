'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getProduct, productUpdate, productDelete, productIncrementSales } from '@/lib/firebase/db'
import { requireAdmin } from '@/lib/middleware/auth'

// GET /api/products/[id] - Get product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await getProduct(id)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { status: false, message: error.message || 'Gagal mengambil produk' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update product (admin only)
export const PUT = requireAdmin(async (req: NextRequest, user: any) => {
  try {
    // Extract ID from URL path
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const productId = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2]

    if (!productId) {
      return NextResponse.json(
        { status: false, message: 'Product ID tidak ditemukan' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const productData = {
      ...body,
      updated_by: user.email,
      updated_at: new Date().toISOString()
    }

    const result = await productUpdate(productId, productData)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { status: false, message: error.message || 'Gagal mengupdate produk' },
      { status: 500 }
    )
  }
})

// DELETE /api/products/[id] - Delete product (admin only)
export const DELETE = requireAdmin(async (req: NextRequest, user: any) => {
  try {
    // Extract ID from URL path
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const productId = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2]

    if (!productId) {
      return NextResponse.json(
        { status: false, message: 'Product ID tidak ditemukan' },
        { status: 400 }
      )
    }

    const result = await productDelete(productId)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { status: false, message: error.message || 'Gagal menghapus produk' },
      { status: 500 }
    )
  }
})

// POST /api/products/[id]/increment-sales - Increment product sales
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const amount = body.amount || 1

    const result = await productIncrementSales(id, amount)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error incrementing sales:', error)
    return NextResponse.json(
      { status: false, message: error.message || 'Gagal menambah penjualan' },
      { status: 500 }
    )
  }
}
