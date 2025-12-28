'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getInvoice, invoiceUpdate } from '@/lib/firebase/db'
import { getTransactionStatus } from '@/lib/payment/tripay'

// GET /api/payment/[id]/status - Get Tripay transaction status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id

    // Get invoice from Firestore
    const invoiceResult = await getInvoice(invoiceId)
    if (!invoiceResult.status || !invoiceResult.data) {
      return NextResponse.json(
        { status: false, message: 'Invoice tidak ditemukan' },
        { status: 404 }
      )
    }

    const invoice = invoiceResult.data

    // If invoice is already Paid, return immediately
    if (invoice.status === 'Paid' || invoice.status === 'Paid_Lunas') {
      return NextResponse.json({
        status: true,
        data: {
          status: 'Paid',
          message: 'Invoice sudah lunas'
        }
      })
    }

    // If no Tripay reference, return mock status
    if (!invoice.tripay_reference) {
      return NextResponse.json({
        status: true,
        data: {
          status: invoice.status,
          message: 'Status dari database'
        }
      })
    }

    // Get Tripay transaction status
    const tripayResult = await getTransactionStatus(invoice.tripay_reference)

    // Map Tripay status to our status
    const tripayStatus = tripayResult.status
    let mappedStatus = invoice.status

    if (tripayStatus === 'PAID') {
      mappedStatus = 'Paid'
      // Update invoice status in Firestore
      await invoiceUpdate(invoiceId, {
        status: 'Paid',
        paid_at: new Date().toISOString(),
        payment_at: new Date().toISOString()
      })
      // Increment product sales
      if (invoice.product_id) {
        // TODO: Implement increment sales
        // await productIncrementSales(invoice.product_id)
      }
    } else if (tripayStatus === 'EXPIRED') {
      mappedStatus = 'Expired'
      // Update invoice status in Firestore
      await invoiceUpdate(invoiceId, {
        status: 'Expired'
      })
    } else if (tripayStatus === 'FAILED') {
      mappedStatus = 'Failed'
      // Update invoice status in Firestore
      await invoiceUpdate(invoiceId, {
        status: 'Failed'
      })
    }

    // Return updated status
    return NextResponse.json({
      status: true,
      data: {
        status: mappedStatus,
        tripay_status: tripayStatus,
        message: getStatusMessage(mappedStatus)
      }
    })
  } catch (error: any) {
    console.error('Error checking Tripay payment status:', error)
    return NextResponse.json(
      { status: false, message: error.message || 'Gagal cek status pembayaran' },
      { status: 500 }
    )
  }
}

// POST /api/payment/[id]/status - Manual status check
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return GET(request, { params })
}

function getStatusMessage(status: string): string {
  const messages = {
    Paid: 'Pembayaran berhasil',
    Paid_Lunas: 'Pembayaran berhasil',
    Pending: 'Menunggu pembayaran',
    Expired: 'Waktu pembayaran habis',
    Failed: 'Pembayaran gagal'
  }
  return messages[status as keyof typeof messages] || 'Status tidak diketahui'
}
