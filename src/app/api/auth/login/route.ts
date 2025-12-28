'use server'

import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'
import { getUser, userAdd, userEdit } from '@/lib/firebase/db'
import { adminEmail } from '@/lib/firebase/config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idToken } = body

    console.log('[Login API] Received login request with token')

    if (!idToken) {
      return NextResponse.json(
        { status: false, message: 'ID token diperlukan' },
        { status: 400 }
      )
    }

    // Verify ID token using Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const { email, name, uid } = decodedToken

    console.log('[Login API] Token verified for email:', email)

    if (!email) {
      return NextResponse.json(
        { status: false, message: 'Invalid token' },
        { status: 400 }
      )
    }

    // Check if user exists in Firestore
    console.log('[Login API] Checking if user exists...')
    const userResult = await getUser(email)

    if (!userResult.status) {
      console.log('[Login API] User does not exist, creating new user...')
      // Create new user in Firestore
      const isAdmin = email === adminEmail
      const addResult = await userAdd(
        email,
        name || email,
        isAdmin
      )

      if (!addResult.status) {
        console.error('[Login API] Failed to create user:', addResult.message)
        return NextResponse.json(
          { status: false, message: addResult.message || 'Gagal membuat pengguna' },
          { status: 500 }
        )
      }

      console.log('[Login API] User created successfully')
    } else {
      console.log('[Login API] User exists, updating...')
      // Update user name if changed
      if (userResult.data && userResult.data.name !== name) {
        await userEdit(email, { name: name || userResult.data.name })
      }
    }

    // Return user data with cookie
    const isAdminUser = email === adminEmail
    const response = NextResponse.json({
      status: true,
      message: 'Login berhasil',
      data: {
        uid,
        email,
        name,
        type: isAdminUser ? 'admin' : 'user'
      }
    })

    // Set httpOnly cookie with Firebase token
    response.cookies.set('firebase_token', idToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    // Set additional cookie for backward compatibility
    response.cookies.set('token', idToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return response
  } catch (error: any) {
    console.error('[Login API] Login error:', error)

    // Check if it's an auth error
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json(
        { status: false, message: 'Sesi telah kedaluwarsa. Silakan login kembali.' },
        { status: 401 }
      )
    }

    if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-revoked') {
      return NextResponse.json(
        { status: false, message: 'Token tidak valid. Silakan login kembali.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { status: false, message: error.message || 'Terjadi kesalahan saat login' },
      { status: 500 }
    )
  }
}
