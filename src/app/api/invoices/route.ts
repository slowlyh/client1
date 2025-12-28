'use server'

import { NextRequest, NextResponse } from 'next/server'
import {
  getAllInvoices,
  getInvoice,
  invoiceAdd,
  invoiceUpdate,
  invoiceDelete
} from '@/lib/firebase/db'
import { requireAuth } from '@/lib/middleware/auth'

// GET /api/invoices - Get all invoices or by email filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const email = searchParams.get('email') || undefined
    const status = searchParams.get('status') || undefined

    // Build query
    const query: any = {}
    if (email) query.email = email
    if (status) query.status = status

    // Get invoices with pagination
    const result = await getAllInvoices({
      query,
      limit,
      page,
      sort: { field: 'created_at', direction: 'desc' }
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { status: false, message: error.message || 'Gagal mengambil invoice' },
      { status: 500 }
    )
  }
}

// POST /api/invoices - Create new invoice (auth required)
export const POST = requireAuth(async (req: NextRequest, user: any) => {
  try {
    const body = await req.json()

    // Add user info to invoice
    const invoiceData = {
      ...body,
      email: user.email,
      user_id: user.uid,
      created_by: user.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: body.status || 'Pending'
    }

    const result = await invoiceAdd(invoiceData)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error adding invoice:', error)
    return NextResponse.json(
      { status: false, message: error.message || 'Gagal menambah invoice' },
      { status: 500 }
    )
  }
})
