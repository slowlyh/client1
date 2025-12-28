'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getProduct, productIncrementSales, invoiceAdd } from '@/lib/firebase/db'
import { requireAuth } from '@/lib/middleware/auth'
import { createTransaction, generateSignature, calculateExpiredTime } from '@/lib/payment/tripay'

// POST /api/payment/create - Create Tripay transaction (auth required)
export const POST = requireAuth(async (req: NextRequest, user: any) => {
  try {
    const body = await req.json()
    const { productId, additional_information } = body

    if (!productId) {
      return NextResponse.json(
        { status: false, message: 'ID Produk diperlukan' },
        { status: 400 }
      )
    }

    // Get product data
    const productResult = await getProduct(productId)
    if (!productResult.status || !productResult.data) {
      return NextResponse.json(
        { status: false, message: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    const product = productResult.data

    // Check if product is available
    if (!product.stock_available) {
      return NextResponse.json(
        { status: false, message: 'Produk ini sedang habis stok.' },
        { status: 400 }
      )
    }

    // Calculate price and fee
    const price = product.price
    const taxPercent = 10
    const fee = price * (taxPercent / 100)
    const total = Math.round(price + fee)

    // Generate merchant reference (unique ID)
    const merchantRef = `INV-${Date.now()}-${user.uid.substring(0, 8)}`

    // Prepare Tripay order data
    const orderItems = [{
      sku: product.id,
      name: product.name,
      price: total,
      quantity: 1,
      product_url: `http://localhost:3000/product/${product.id}`
    }]

    // Generate signature
    const signatureData = {
      merchant_ref: merchantRef,
      amount: total,
      expired_time: calculateExpiredTime(24) // 24 hours
    }
    const signature = generateSignature(signatureData)

    // Create Tripay transaction
    const tripayData = {
      merchant_ref: merchantRef,
      amount: total,
      customer_name: user.displayName || user.email.split('@')[0],
      customer_email: user.email,
      order_items: orderItems,
      signature,
      expired_time: calculateExpiredTime(24),
      callback_url: `http://localhost:3000/api/payment/callback`
    }

    const tripayResult = await createTransaction(tripayData)

    // Prepare invoice data
    const invoiceData = {
      email: user.email,
      user_id: user.uid,
      amount: total,
      items: [{
        name: product.name,
        price: price,
        quantity: 1,
        productId: product.id,
        file: product.file ? { type: 'cloud', data: product.file } : undefined
      }],
      qr: tripayData.qr_string || tripayData.qr_url || '',
      payment_url: tripayData.payment_url || '',
      redirect_url: tripayData.redirect_url || '',
      status: tripayData.status || 'Pending',
      payment_method: 'Tripay',
      additional_information: additional_information || product.additional_information,
      product_id: product.id,
      tripay_reference: merchantRef,
      tripay_trx_id: tripayData.trx_id,
      created_at: new Date().toISOString(),
      expires_at: new Date(calculateExpiredTime(24) * 1000).toISOString()
    }

    // Create invoice in Firestore
    const invoiceResult = await invoiceAdd(invoiceData)

    if (!invoiceResult.status) {
      return NextResponse.json(
        { status: false, message: 'Gagal membuat invoice' },
        { status: 500 }
      )
    }

    // Return invoice data with redirect URL
    return NextResponse.json({
      status: true,
      message: 'Invoice berhasil dibuat',
      data: {
        invoiceId: invoiceResult.data,
        amount: total,
        fee,
        price,
        payment_url: tripayData.payment_url || '',
        redirect_url: tripayData.redirect_url || '',
        qr_string: tripayData.qr_string || '',
        qr_url: tripayData.qr_url || '',
        pay_url: tripayData.pay_url || tripayData.checkout_url || '',
        redirect: `/invoice/${invoiceResult.data}`
      }
    })
  } catch (error: any) {
    console.error('Error creating Tripay payment:', error)
    return NextResponse.json(
      { status: false, message: error.message || 'Gagal membuat pembayaran' },
      { status: 500 }
    )
  }
})
