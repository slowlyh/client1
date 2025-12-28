import crypto from 'crypto'

// Tripay Configuration
const config = {
  apiKey: '', // Set your Tripay API key here
  privateKey: '', // Set your Tripay private key here
  merchantCode: '', // Set your Tripay merchant code here
  mode: 'sandbox', // 'sandbox' or 'production'
  baseUrl: 'https://tripay.co.id'
}

/**
 * Generate signature for Tripay API requests
 * Signature is generated using HMAC-SHA512
 */
export function generateSignature(data: any): string {
  // Convert data object to JSON string
  const jsonData = JSON.stringify(data)

  // Sort object keys (required by Tripay)
  const sortedData = Object.keys(data)
    .sort()
    .reduce((result: any, key) => {
      result[key] = data[key]
      return result
    }, {})

  // Convert sorted data to URL-encoded string
  const sortedString = Object.keys(sortedData)
    .map(key => `${key}=${sortedData[key]}`)
    .join('&')

  // Generate HMAC-SHA512 signature
  return crypto
    .createHmac('sha512', config.privateKey)
    .update(sortedString)
    .digest('hex')
}

/**
 * Create transaction with Tripay
 */
export async function createTransaction(data: {
  merchant_ref: string
  amount: number
  customer_name: string
  customer_email: string
  order_items: Array<{
    sku: string
    name: string
    price: number
    quantity: number
  }>
  signature: string
  expired_time?: number
}): Promise<any> {
  try {
    // Prepare request data
    const requestData = {
      merchant_code: config.merchantCode,
      merchant_ref: data.merchant_ref,
      amount: data.amount,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      order_items: data.order_items,
      signature: data.signature,
      expired_time: data.expired_time || 24 * 60 * 60 // 24 hours
    }

    // Create request with signature
    const response = await fetch(`${config.baseUrl}/api/transaction/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(requestData)
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message || 'Gagal membuat transaksi Tripay')
    }

    return result.data
  } catch (error: any) {
    console.error('Tripay create transaction error:', error)
    throw new Error(error.message || 'Terjadi kesalahan saat membuat transaksi Tripay')
  }
}

/**
 * Get transaction status
 */
export async function getTransactionStatus(transactionId: string): Promise<any> {
  try {
    const response = await fetch(
      `${config.baseUrl}/api/transaction/detail?reference=${transactionId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      }
    )

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message || 'Gagal mengambil status transaksi Tripay')
    }

    return result.data
  } catch (error: any) {
    console.error('Tripay get transaction status error:', error)
    throw new Error(error.message || 'Terjadi kesalahan saat mengambil status transaksi Tripay')
  }
}

/**
 * Verify Tripay payment callback
 */
export function verifyCallback(callbackData: any): boolean {
  try {
    // Generate expected signature
    const signature = generateSignature(callbackData)

    // Verify signature matches
    return callbackData.signature === signature
  } catch (error) {
    console.error('Tripay verify callback error:', error)
    return false
  }
}

/**
 * Get payment URL (for redirect)
 */
export function getPaymentUrl(transactionData: any): string {
  if (transactionData.payment_url) {
    return transactionData.payment_url
  }

  if (transactionData.redirect_url) {
    return transactionData.redirect_url
  }

  return `${config.baseUrl}/payment/${transactionData.reference}`
}

/**
 * Calculate expired time
 */
export function calculateExpiredTime(minutes: number): number {
  return Math.floor(Date.now() / 1000) + minutes * 60
}

/**
 * Get Tripay configuration
 */
export function getConfig() {
  return config
}
