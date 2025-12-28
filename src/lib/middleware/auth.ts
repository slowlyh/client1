import { NextRequest } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, doc, getDoc, setDoc } from 'firebase-admin/firestore'
import { app } from '@/lib/firebase/admin'
import { adminEmail } from '@/lib/firebase/config'

// Get current user from token
export async function getCurrentUser(request: NextRequest) {
  try {
    // Get token from cookie or header
    const token = request.cookies.get('firebase_token')?.value ||
                 request.cookies.get('token')?.value ||
                 request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return null
    }

    // Verify token with Firebase Admin
    const auth = getAuth(app)
    const decodedToken = await auth.verifyIdToken(token)

    // Get user data from Firestore
    const db = getFirestore(app)
    const userDoc = await getDoc(doc(db, 'users', decodedToken.uid))

    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      const userData = {
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email,
        photoURL: decodedToken.picture || '',
        emailVerified: decodedToken.email_verified,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: 'user' // Default role
      }
      await setDoc(doc(db, 'users', decodedToken.uid), userData)
      return { uid: decodedToken.uid, ...userData }
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      ...userDoc.data()
    }
  } catch (error: any) {
    console.error('Error getting current user:', error)
    // Token is invalid or expired
    return null
  }
}

// Check if user is admin
export async function isAdmin(request: NextRequest): Promise<boolean> {
  const user = await getCurrentUser(request)
  if (!user) {
    return false
  }

  return user.email === adminEmail
}

// Protect API route - return 401 if not authenticated
export function requireAuth(handler: (req: NextRequest, user: any) => Promise<Response>) {
  return async (req: NextRequest) => {
    const user = await getCurrentUser(req)

    if (!user) {
      return new Response(
        JSON.stringify({
          status: false,
          message: 'Unauthorized. Please login.',
          error: 'UNAUTHORIZED'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return handler(req, user)
  }
}

// Protect admin API route - return 403 if not admin
export function requireAdmin(handler: (req: NextRequest, user: any) => Promise<Response>) {
  return async (req: NextRequest) => {
    const user = await getCurrentUser(req)

    if (!user) {
      return new Response(
        JSON.stringify({
          status: false,
          message: 'Unauthorized. Please login.',
          error: 'UNAUTHORIZED'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (user.email !== adminEmail) {
      return new Response(
        JSON.stringify({
          status: false,
          message: 'Forbidden. Admin access only.',
          error: 'FORBIDDEN'
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return handler(req, user)
  }
}
