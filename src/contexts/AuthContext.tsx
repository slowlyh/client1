'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react'
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

/**
 * Helper untuk mengambil message dari unknown error
 * (Type-safe & konsisten)
 */
function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message
  }
  return fallback
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const checkToken = async (currentUser: User | null) => {
      if (!currentUser) return null

      try {
        const idToken = await getIdToken(currentUser)
        setToken(idToken)
        return idToken
      } catch (error) {
        console.error('Error getting ID token:', error)
        return null
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      setLoading(false)

      if (user) {
        await checkToken(user)
        setIsAdmin(user.email === adminEmail)
        await sendTokenToServer(user)
      } else {
        setToken(null)
        setIsAdmin(false)
      }
    })

    const idTokenUnsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken()
        setToken(idToken)
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

  const sendTokenToServer = async (currentUser: User) => {
    try {
      const idToken = await getIdToken(currentUser)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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

  const refreshToken = async () => {
    if (!user) return

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

  const signInWithGoogle = async (): Promise<User | null> => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      toast.success('Login Berhasil', {
        description: `Selamat datang, ${user.displayName || user.email}!`
      })

      return user
    } catch (error) {
      console.error('Error signing in with Google:', error)

      const message = getErrorMessage(
        error,
        'Terjadi kesalahan saat login.'
      )

      toast.error('Gagal Login', {
        description: message
      })

      throw error
    }
  }

  const logout = async () => {
    try {
      setToken(null)
      await signOut(auth)
      setUser(null)
      setIsAdmin(false)

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
        description: getErrorMessage(
          error,
          'Terjadi kesalahan saat logout.'
        )
      })

      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        token,
        signInWithGoogle,
        logout,
        refreshToken
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
