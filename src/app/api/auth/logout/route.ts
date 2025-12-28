'use server'

import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({
    status: true,
    message: 'Logout berhasil'
  })

  // Delete all auth cookies
  response.cookies.delete('firebase_token')
  response.cookies.delete('token')
  response.cookies.delete('auth_token')

  return response
}
