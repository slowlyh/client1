'use server'

import { NextRequest, NextResponse } from 'next/server'
import {
  getAllProducts,
  getTopProducts,
  productAdd,
  productUpdate,
  productDelete
} from '@/lib/firebase/db'
import { requireAdmin } from '@/lib/middleware/auth'

// GET /api/products - Get all products with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const top = searchParams.get('top')
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined
    const show = searchParams.get('show')
    const stockAvailable = searchParams.get('stock_available')

    // Get top products (no composite index needed)
    if (top) {
      const result = await getTopProducts(limit || 8)
      return NextResponse.json(result)
    }

    // Build query - use only ONE filter to avoid composite index
    const query: any = {}
    if (show) query.show = true
    // Don't use stock_available filter to avoid composite index requirement
    // if (stockAvailable) query.stock_available = true
    if (category) query.category = category

    // Get products with pagination
    const result = await getAllProducts({
      query,
      search,
      limit,
      page,
      sort: { field: 'created_at', direction: 'desc' }
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { status: false, message: error.message || 'Gagal mengambil produk' },
      { status: 500 }
    )
  }
}

// POST /api/products - Add new product (admin only)
export const POST = requireAdmin(async (req: NextRequest, user: any) => {
  try {
    const body = await req.json()

    // Add user info to product
    const productData = {
      ...body,
      created_by: user.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sold_count: body.sold_count || 0,
      rating: body.rating || 5
    }

    const result = await productAdd(productData)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error adding product:', error)
    return NextResponse.json(
      { status: false, message: error.message || 'Gagal menambah produk' },
      { status: 500 }
    )
  }
})
