'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getInvoice, invoiceUpdate } from '@/lib/firebase/db'
import { verifyCallback } from '@/lib/payment/tripay'

// POST /api/payment/callback - Tripay payment callback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Log callback data for debugging
    console.log('Tripay callback received:', JSON.stringify(body, null, 2))

    // Verify callback signature
    const isValid = verifyCallback(body)

    if (!isValid) {
      console.error('Invalid Tripay callback signature')
      return NextResponse.json(
        { status: false, message: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Get invoice ID from merchant_ref
    const merchantRef = body.merchant_ref || body.reference
    if (!merchantRef) {
      console.error('No merchant_ref in callback')
      return NextResponse.json(
        { status: false, message: 'No merchant reference' },
        { status: 400 }
      )
    }

    // Get invoice from Firestore
    const invoiceResult = await getInvoice(merchantRef)
    if (!invoiceResult.status || !invoiceResult.data) {
      console.error('Invoice not found:', merchantRef)
      return NextResponse.json(
        { status: false, message: 'Invoice not found' },
        { status: 404 }
      )
    }

    const invoice = invoiceResult.data

    // Map Tripay status to our status
    const tripayStatus = body.status
    let mappedStatus = invoice.status

    if (tripayStatus === 'PAID') {
      mappedStatus = 'Paid'
    } else if (tripayStatus === 'EXPIRED') {
      mappedStatus = 'Expired'
    } else if (tripayStatus === 'FAILED') {
      mappedStatus = 'Failed'
    }

    // Prepare update data
    const updateData: any = {
      status: mappedStatus,
      tripay_status: tripayStatus,
      tripay_signature: body.signature,
      tripay_trx_id: body.trx_id,
      paid_amount: body.amount || body.total_amount,
      paid_at: tripayStatus === 'PAID' ? new Date().toISOString() : null
    }

    // Update invoice in Firestore
    await invoiceUpdate(merchantRef, updateData)

    console.log('Invoice updated:', { merchantRef, mappedStatus, tripayStatus })

    // Return success
    return NextResponse.json({
      status: true,
      message: 'Callback processed successfully',
      data: {
        invoiceId: merchantRef,
        status: mappedStatus
      }
    })
  } catch (error: any) {
    console.error('Error processing Tripay callback:', error)
    return NextResponse.json(
      { status: false, message: error.message || 'Error processing callback' },
      { status: 500 }
    )
  }
}

// GET /api/payment/callback - Tripay payment callback (for testing)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: true,
    message: 'Tripay callback endpoint',
    method: 'POST'
  })
}
