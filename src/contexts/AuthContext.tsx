'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  getIdToken,
  onIdTokenChanged
} from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { adminEmail } from '@/lib/firebase/config'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  token: string | null
  signInWithGoogle: () => Promise<User | null>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  // Initialize auth state
  useEffect(() => {
    // Check for existing token on mount
    const checkToken = async (currentUser: User | null) => {
      if (currentUser) {
        try {
          const idToken = await getIdToken(currentUser)
          setToken(idToken)
          return idToken
        } catch (error) {
          console.error('Error getting ID token:', error)
          return null
        }
      }
      return null
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      setLoading(false)

      // Get ID token
      if (user) {
        await checkToken(user)

        // Check if user is admin
        setIsAdmin(user.email === adminEmail)

        // Send token to server
        await sendTokenToServer(user)
      } else {
        setToken(null)
        setIsAdmin(false)
      }
    })

    // Listen for ID token changes (auto-refresh)
    const idTokenUnsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken()
        setToken(idToken)

        // Send new token to server
        await sendTokenToServer(user)
      } else {
        setToken(null)
      }
    })

    return () => {
      unsubscribe()
      idTokenUnsubscribe()
    }
  }, [])

  // Send token to server
  const sendTokenToServer = async (currentUser: User) => {
    try {
      const idToken = await getIdToken(currentUser)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
        credentials: 'include'
      })

      const data = await response.json()

      if (!data.status) {
        console.error('Server login failed:', data.message)
      }
    } catch (error) {
      console.error('Error sending token to server:', error)
    }
  }

  // Manually refresh token
  const refreshToken = async () => {
    if (user) {
      try {
        const idToken = await getIdToken(user, true)
        setToken(idToken)
        await sendTokenToServer(user)
        toast.success('Token di-refresh')
      } catch (error) {
        console.error('Error refreshing token:', error)
        toast.error('Gagal refresh token')
      }
    }
  }

  const signInWithGoogle = async (): Promise<User | null> => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      toast.success('Login Berhasil', {
        description: `Selamat datang, ${user.displayName || user.email}!`
      })

      return user
    } catch (error: any) {
      console.error('Error signing in with Google:', error)

      // Handle auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        toast.info('Login Dibatalkan', {
          description: 'Anda menutup popup login.'
        })
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup Diblokir', {
          description: 'Silakan izinkan popup untuk login.'
        })
      } else {
        toast.error('Gagal Login', {
          description: error.message || 'Terjadi kesalahan saat login.'
        })
      }

      throw error
    }
  }

  const logout = async () => {
    try {
      // Clear token
      setToken(null)

      // Logout from Firebase
      await signOut(auth)

      // Clear auth state
      setUser(null)
      setIsAdmin(false)

      // Logout from server
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      toast.success('Logout Berhasil', {
        description: 'Anda telah logout.'
      })
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Gagal Logout', {
        description: error.message || 'Terjadi kesalahan saat logout.'
      })
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, token, signInWithGoogle, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
