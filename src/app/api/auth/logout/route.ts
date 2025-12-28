'use server'

import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({
    status: true,
    message: 'Logout berhasil'
  })

  // Delete all auth cookies
  response.cookies.delete('firebase_token', {
    path: '/'
  })
  response.cookies.delete('token', {
    path: '/'
  })

  // Set expired cookies for any other cookie names
  const cookieNames = ['firebase_token', 'token', 'auth_token']
  cookieNames.forEach(name => {
    response.cookies.set(name, '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      expires: new Date(0),
      path: '/'
    })
  })

  return response
}
