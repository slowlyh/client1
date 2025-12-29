// Firestore data models and types

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'banned'
  joined_at: Date
  verified: boolean
  last_activity: Date
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  original_price: number
  sales: number
  label?: string | null
  imageUrl?: string | null
  image?: string | null
  images?: string[]
  file?: {
    type: 'local' | 'firebase'
    data: string
  } | null
  additional_information?: Array<{
    key: string
    value: string
  }>
  stock_available: boolean
  show: boolean
  category?: string
  sold_count?: number
  rating?: number
  review_count?: number
  discount_percent?: number
  created_at: Date
  updated_at: Date
}

export interface Invoice {
  id: string
  email: string | null
  user_id?: string
  amount: number
  items: Array<{
    productId: string
    productName: string
    price: number
    quantity: number
    file?: {
      type: 'local' | 'firebase' | 'cloud'
      data: string
    }
  }>
  qr?: string | null
  va?: string | null
  redirect?: string | null
  payment_url?: string | null
  download_link?: string | null
  qr_string?: string | null
  qr_url?: string | null
  pay_url?: string | null
  checkout_url?: string | null
  status: 'Pending' | 'Paid' | 'Failed' | 'Expired' | 'Paid_Lunas'
  additional_information?: Array<{
    key: string
    value: string
  }>
  created_at: Date
  paid_at?: Date | null
  expires_at?: Date
  payment_method: string | null
  receipt?: string | null
  download_link_expires_at?: Date | null
  product_id?: string
  tripay_reference?: string
  tripay_trx_id?: string
}

export interface AuthResponse {
  status: boolean
  message: string
  data?: {
    token: string
    type: 'admin' | 'user'
    created_at: number
    expired_at: number
  }
}

export interface ApiResponse<T = any> {
  status: boolean
  message: string
  data?: T
}
