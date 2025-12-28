'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getInvoice, invoiceUpdate, invoiceDelete } from '@/lib/firebase/db'

// GET /api/invoices/[id] - Get invoice by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getInvoice(params.id)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { status: false, message: error.message || 'Gagal mengambil invoice' },
      { status: 500 }
    )
  }
}

// PUT /api/invoices/[id] - Update invoice (admin or owner)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // TODO: Verify admin auth or user ownership
    const result = await invoiceUpdate(params.id, body)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { status: false, message: error.message || 'Gagal mengupdate invoice' },
      { status: 500 }
    )
  }
}

// DELETE /api/invoices/[id] - Delete invoice (admin or owner)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Verify admin auth or user ownership
    const result = await invoiceDelete(params.id)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { status: false, message: error.message || 'Gagal menghapus invoice' },
      { status: 500 }
    )
  }
}
