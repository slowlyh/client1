'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const user = await signInWithGoogle()

      if (user) {
        // Get ID token and send to server
        const idToken = await user.getIdToken()

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        })

        const data = await response.json()

        if (data.status) {
          toast.success('Berhasil masuk!')
          router.push('/dashboard')
        } else {
          toast.error('Gagal masuk. Silakan coba lagi.')
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error('Gagal masuk. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        aria-hidden="true"
      >
        <svg
          className="w-full h-full"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="dot-pattern"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="2"
                cy="2"
                r="1"
                className="fill-foreground"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#dot-pattern)"
          />
        </svg>
      </div>

      {/* Top Navigation */}
      <div className="absolute top-8 left-4 md:left-8 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-4 text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Selamat Datang</h1>
          <p className="text-muted-foreground">Masuk untuk melakukan pembelian produk</p>
        </div>

        {/* Login Container */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 shadow-sm">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-100 text-neutral-700 font-medium h-12 rounded-lg transition-all border border-neutral-200 active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
              </svg>
            )}
            <span>Masuk dengan Google</span>
          </button>
        </div>
      </div>
    </main>
  )
}
