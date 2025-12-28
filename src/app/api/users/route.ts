import { NextRequest, NextResponse } from 'next/server'
import { getUser, getAllUsers, userEdit, userDelete } from '@/lib/firebase/db'
import { adminEmail } from '@/lib/firebase/config'

// GET /api/users - Get all users (admin only) or get user by email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    // TODO: Verify admin auth for getAllUsers
    if (email) {
      const result = await getUser(email)
      return NextResponse.json(result)
    }

    const result = await getAllUsers()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { status: false, message: error.message || 'Gagal mengambil users' },
      { status: 500 }
    )
  }
}

// PUT /api/users - Update user (admin or self)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, ...updateData } = body

    if (!email) {
      return NextResponse.json(
        { status: false, message: 'Email diperlukan' },
        { status: 400 }
      )
    }

    // TODO: Verify admin auth or self ownership
    const result = await userEdit(email, updateData)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { status: false, message: error.message || 'Gagal mengupdate user' },
      { status: 500 }
    )
  }
}

// DELETE /api/users - Delete user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { status: false, message: 'Email diperlukan' },
        { status: 400 }
      )
    }

    // TODO: Verify admin auth
    const result = await userDelete(email, adminEmail)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { status: false, message: error.message || 'Gagal menghapus user' },
      { status: 500 }
    )
  }
}
