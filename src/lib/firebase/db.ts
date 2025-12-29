import {
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  type Query,
  type DocumentData
} from 'firebase/firestore'
import { db as adminDb } from './admin'
import type { User, Product, Invoice } from './types'

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  INVOICES: 'invoices'
}

// Helper: Convert Firestore Timestamp to Date
export const toDate = (timestamp: Timestamp | Date | any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate()
  }
  if (timestamp instanceof Date) {
    return timestamp
  }
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate()
  }
  return new Date()
}

// Helper: Convert to Firestore Timestamp or Date
export const toTimestamp = (date: Date | Timestamp | any): Timestamp | Date => {
  if (date instanceof Timestamp) {
    return date
  }
  if (date instanceof Date) {
    return Timestamp.fromDate(date)
  }
  return serverTimestamp() as any
}

// Helper: Use admin DB for reads (bypasses auth requirements)
const getReadDB = () => adminDb

// USER FUNCTIONS (Server-side only)
export const getUser = async (email: string): Promise<{ status: boolean; data?: User; message?: string }> => {
  try {
    const readDB = getReadDB()
    const userRef = readDB.collection(COLLECTIONS.USERS).doc(email)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
      return { status: false, message: 'Pengguna tidak ditemukan' }
    }

    const userData = userSnap.data() as any
    return {
      status: true,
      data: {
        id: userSnap.id,
        ...userData,
        joined_at: toDate(userData.joined_at),
        last_activity: toDate(userData.last_activity)
      }
    }
  } catch (error: any) {
    return { status: false, message: error.message }
  }
}

export const getAllUsers = async (options: {
  query?: any
  sort?: { field: string; direction: 'asc' | 'desc' }
  limit?: number
  startAfter?: any
} = {}): Promise<{ status: boolean; data?: User[]; message?: string }> => {
  try {
    const { query: queryOpts, sort = { field: 'joined_at', direction: 'desc' }, limit: limitNum, startAfter: startAfterDoc } = options

    let q = adminDb.collection(COLLECTIONS.USERS)

    if (queryOpts && Object.keys(queryOpts).length > 0) {
      Object.entries(queryOpts).forEach(([key, value]) => {
        q = q.where(key, '==', value)
      })
    }

    if (sort) {
      q = q.orderBy(sort.field, sort.direction)
    }

    if (limitNum) {
      q = q.limit(limitNum)
    }

    if (startAfterDoc) {
      q = q.startAfter(startAfterDoc)
    }

    const querySnapshot = await q.get()
    const users = querySnapshot.docs.map(doc => {
      const userData = doc.data() as any
      return {
        id: doc.id,
        ...userData,
        joined_at: toDate(userData.joined_at),
        last_activity: toDate(userData.last_activity)
      } as User
    })

    return { status: true, data: users }
  } catch (error: any) {
    return { status: false, message: error.message }
  }
}

export const userAdd = async (email: string, name: string, isAdmin: boolean = false): Promise<{ status: boolean; message?: string; data?: User }> => {
  try {
    const existingUser = await getUser(email)
    if (existingUser.status) {
      if (existingUser.data?.role === 'banned') {
        return { status: false, message: 'Akun Anda telah ditangguhkan' }
      }
      return { status: false, message: 'Email sudah terdaftar' }
    }

    const userData: Omit<User, 'id'> = {
      email,
      name: name || 'User',
      role: isAdmin ? 'admin' : 'user',
      joined_at: new Date(),
      verified: isAdmin,
      last_activity: new Date()
    }

    const userRef = adminDb.collection(COLLECTIONS.USERS).doc(email)
    await userRef.set(userData)

    console.log('[userAdd] User document created:', email)

    return { status: true, message: 'Pendaftaran berhasil', data: { id: email, ...userData } }
  } catch (error: any) {
    console.error('[userAdd] Error creating user:', error)
    return { status: false, message: error.message }
  }
}

export const userEdit = async (email: string, updateData: Partial<User>): Promise<{ status: boolean; message?: string }> => {
  try {
    const userRef = adminDb.collection(COLLECTIONS.USERS).doc(email)

    // Don't update protected fields
    const { id, email: _, role, joined_at, ...allowedUpdates } = updateData as any
    allowedUpdates.last_activity = new Date()

    await userRef.update(allowedUpdates)

    console.log('[userEdit] User document updated:', email)
    return { status: true, message: 'Profil pengguna berhasil diperbarui' }
  } catch (error: any) {
    console.error('[userEdit] Error updating user:', error)
    return { status: false, message: error.message }
  }
}

export const userDelete = async (email: string, adminEmail: string): Promise<{ status: boolean; message?: string }> => {
  try {
    if (email === adminEmail) {
      return { status: false, message: 'Tidak dapat menghapus akun administrator utama' }
    }

    await adminDb.collection(COLLECTIONS.USERS).doc(email).delete()
    return { status: true, message: 'Pengguna berhasil dihapus' }
  } catch (error: any) {
    return { status: false, message: error.message }
  }
}

// PRODUCT FUNCTIONS (Server-side only)
export const getProduct = async (productId: string): Promise<{ status: boolean; data?: Product; message?: string }> => {
  try {
    const productRef = adminDb.collection(COLLECTIONS.PRODUCTS).doc(productId)
    const productSnap = await productRef.get()

    if (!productSnap.exists) {
      return { status: false, message: 'Produk tidak ditemukan' }
    }

    const productData = productSnap.data() as any
    return {
      status: true,
      data: {
        id: productSnap.id,
        ...productData,
        created_at: toDate(productData.created_at),
        updated_at: toDate(productData.updated_at)
      }
    }
  } catch (error: any) {
    return { status: false, message: error.message }
  }
}

export const getAllProducts = async (options: {
  query?: any
  sort?: { field: string; direction: 'asc' | 'desc' }
  limit?: number
  startAfter?: any
} = {}): Promise<{ status: boolean; data?: Product[]; message?: string }> => {
  try {
    const { query: queryOpts, sort, limit: limitNum, startAfter: startAfterDoc } = options

    let q = adminDb.collection(COLLECTIONS.PRODUCTS)

    // Add where clauses - use only ONE clause to avoid composite index requirement
    if (queryOpts && Object.keys(queryOpts).length > 0) {
      // Only apply to first filter to avoid composite index requirement
      const entries = Object.entries(queryOpts)
      if (entries.length > 0) {
        const [key, value] = entries[0]
        q = q.where(key, '==', value)
      }
    }

    // Only add orderBy if explicitly requested and no where clause
    if (sort && (!queryOpts || Object.keys(queryOpts).length === 0)) {
      q = q.orderBy(sort.field, sort.direction)
    }

    if (limitNum) {
      q = q.limit(limitNum)
    }

    if (startAfterDoc) {
      q = q.startAfter(startAfterDoc)
    }

    const querySnapshot = await q.get()
    const products = querySnapshot.docs.map(doc => {
      const productData = doc.data() as any
      return {
        id: doc.id,
        ...productData,
        created_at: toDate(productData.created_at),
        updated_at: toDate(productData.updated_at)
      } as Product
    })

    return { status: true, data: products }
  } catch (error: any) {
    return { status: false, message: error.message }
  }
}

export const getTopProducts = async (limitCount: number = 8): Promise<{ status: boolean; data?: Product[]; message?: string }> => {
  try {
    // Get shown products WITHOUT orderBy to avoid index issues
    const q = adminDb.collection(COLLECTIONS.PRODUCTS)
      .where('show', '==', true)
      .limit(limitCount * 3) // Get more for filtering

    const querySnapshot = await q.get()
    const products = querySnapshot.docs.map(doc => {
      const productData = doc.data() as any
      return {
        id: doc.id,
        ...productData,
        created_at: toDate(productData.created_at),
        updated_at: toDate(productData.updated_at)
      } as Product
    })

    // Filter for stock availability and sort in-memory
    const availableProducts = products.filter(p => p.stock_available === true)
    availableProducts.sort((a, b) => {
      // Sort by sales first, then by created_at
      const salesDiff = (b.sales || 0) - (a.sales || 0)
      if (salesDiff !== 0) return salesDiff

      // If sales are equal, sort by created_at (newest first)
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })

    return { status: true, data: availableProducts.slice(0, limitCount) }
  } catch (error: any) {
    return { status: false, message: error.message }
  }
}

export const productAdd = async (productData: Partial<Product>): Promise<{ status: boolean; message?: string; data?: Product }> => {
  try {
    const { name, description, price, original_price, label, imageUrl, file, additional_information, stock_available, show } = productData

    if (!name || !price) {
      return { status: false, message: 'Nama dan harga produk wajib diisi' }
    }

    const newProduct: Omit<Product, 'id'> = {
      name: name!,
      description: description || '',
      price: Number(price),
      original_price: Number(original_price) || 0,
      sales: 0,
      label: label || null,
      imageUrl: imageUrl || null,
      file: file || null,
      additional_information: additional_information || [],
      stock_available: stock_available !== undefined ? stock_available : true,
      show: show !== undefined ? show : true,
      created_at: new Date(),
      updated_at: new Date()
    }

    const docRef = await adminDb.collection(COLLECTIONS.PRODUCTS).add(newProduct)
    return { status: true, message: 'Produk berhasil ditambahkan', data: { id: docRef.id, ...newProduct } }
  } catch (error: any) {
    return { status: false, message: error.message }
  }
}

export const productUpdate = async (productId: string, updateData: Partial<Product>): Promise<{ status: boolean; message?: string }> => {
  try {
    const productRef = adminDb.collection(COLLECTIONS.PRODUCTS).doc(productId)

    // Don't update protected fields
    const { id, created_at, ...allowedUpdates } = updateData as any
    allowedUpdates.updated_at = new Date()

    await productRef.update(allowedUpdates)
    return { status: true, message: 'Produk berhasil diperbarui' }
  } catch (error: any) {
    return { status: false, message: error.message }
  }
}

export const productIncrementSales = async (productId: string, amount: number = 1): Promise<{ status: boolean; message?: string }> => {
  try {
    const productRef = adminDb.collection(COLLECTIONS.PRODUCTS).doc(productId)

    await productRef.update({
      sales: increment(amount),
      updated_at: new Date()
    })

    return { status: true, message: `Penjualan produk berhasil ditambah sebanyak ${amount}` }
  } catch (error: any) {
    return { status: false, message: error.message }
  }
}

export const productDelete = async (productId: string): Promise<{ status: boolean; message?: string }> => {
  try {
    await adminDb.collection(COLLECTIONS.PRODUCTS).doc(productId).delete()
    return { status: true, message: 'Produk berhasil dihapus' }
  } catch (error: any) {
    return { status: false, message: error.message }
  }
}

// INVOICE FUNCTIONS (Server-side only)
export const getInvoice = async (invoiceId: string): Promise<{ status: boolean; data?: Invoice; message?: string }> => {
  try {
    const invoiceRef = adminDb.collection(COLLECTIONS.INVOICES).doc(invoiceId)
    const invoiceSnap = await invoiceRef.get()

    if (!invoiceSnap.exists) {
      return { status: false, message: 'Invoice tidak ditemukan' }
    }

    const invoiceData = invoiceSnap.data() as any
    return {
      status: true,
      data: {
        id: invoiceSnap.id,
        ...invoiceData,
        created_at: toDate(invoiceData.created_at),
        paid_at: invoiceData.paid_at ? toDate(invoiceData.paid_at) : null,
        download_link_expires_at: invoiceData.download_link_expires_at ? toDate(invoiceData.download_link_expires_at) : null
      }
    }
  } catch (error: any) {
    return { status: false, message: error.message }
  }
}

export const getAllInvoices = async (options: {
  email?: string
  sort?: { field: string; direction: 'asc' | 'desc' }
  limit?: number
  startAfter?: any
} = {}): Promise<{ status: boolean; data?: Invoice[]; message?: string }> => {
  try {
    const { email, sort = { field: 'created_at', direction: 'desc' }, limit: limitNum, startAfter: startAfterDoc } = options

    let q = adminDb.collection(COLLECTIONS.INVOICES)

    if (email) {
      q = q.where('email', '==', email)
    }

    if (sort) {
      q = q.orderBy(sort.field, sort.direction)
    }

    if (limitNum) {
      q = q.limit(limitNum)
    }

    if (startAfterDoc) {
      q = q.startAfter(startAfterDoc)
    }

    const querySnapshot = await q.get()
    const invoices = querySnapshot.docs.map(doc => {
      const invoiceData = doc.data() as any
      return {
        id: doc.id,
        ...invoiceData,
        created_at: toDate(invoiceData.created_at),
        paid_at: invoiceData.paid_at ? toDate(invoiceData.paid_at) : null,
        download_link_expires_at: invoiceData.download_link_expires_at ? toDate(invoiceData.download_link_expires_at) : null
      } as Invoice
    })

    return { status: true, data: invoices }
  } catch (error: any) {
    return { status: false, message: error.message }
  }
}

export const invoiceAdd = async (invoiceData: Omit<Invoice, 'id' | 'created_at'>): Promise<{ status: boolean; message?: string; data?: Invoice }> => {
  try {
    const newInvoice: Omit<Invoice, 'id'> = {
      ...invoiceData,
      created_at: new Date()
    }

    const docRef = await adminDb.collection(COLLECTIONS.INVOICES).add(newInvoice)
    return { status: true, message: 'Invoice berhasil dibuat', data: { id: docRef.id, ...newInvoice } }
  } catch (error: any) {
    return { status: false, message: error.message }
  }
}

export const invoiceUpdate = async (invoiceId: string, updateData: Partial<Invoice>): Promise<{ status: boolean; message?: string }> => {
  try {
    const invoiceRef = adminDb.collection(COLLECTIONS.INVOICES).doc(invoiceId)

    // Don't update protected fields
    const { id, created_at, items, amount, ...allowedUpdates } = updateData as any

    if (allowedUpdates.status === 'Paid' && !allowedUpdates.paid_at) {
      allowedUpdates.paid_at = new Date()
    }

    await invoiceRef.update(allowedUpdates)
    return { status: true, message: 'Invoice berhasil diperbarui' }
  } catch (error: any) {
    return { status: false, message: error.message }
  }
}

export const invoiceDelete = async (invoiceId: string): Promise<{ status: boolean; message?: string }> => {
  try {
    const invoiceRes = await getInvoice(invoiceId)
    if (!invoiceRes.status) {
      return { status: false, message: 'Invoice tidak ditemukan' }
    }

    if (invoiceRes.data?.status === 'Paid') {
      return { status: false, message: 'Tidak dapat menghapus invoice yang sudah lunas' }
    }

    await adminDb.collection(COLLECTIONS.INVOICES).doc(invoiceId).delete()
    return { status: true, message: 'Invoice berhasil dihapus' }
  } catch (error: any) {
    return { status: false, message: error.message }
  }
}

export const cleanupPendingInvoices = async (): Promise<{ status: boolean; message?: string }> => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)

    const q = adminDb.collection(COLLECTIONS.INVOICES)
      .where('status', '==', 'Pending')
      .where('created_at', '<', tenMinutesAgo)

    const querySnapshot = await q.get()

    const deletePromises = querySnapshot.docs.map(doc => doc.ref.delete())
    await Promise.all(deletePromises)

    if (querySnapshot.size > 0) {
      console.log(`[Scheduler] Berhasil menghapus ${querySnapshot.size} invoice yang kadaluarsa.`)
    }

    return {
      status: true,
      message: `${querySnapshot.size} invoice kadaluarsa dibersihkan`
    }
  } catch (error: any) {
    return { status: false, message: error.message }
  }
}
