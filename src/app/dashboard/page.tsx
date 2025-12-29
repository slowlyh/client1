'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DotPattern } from '@/components/home/DotPattern'
import { Wallet, FileText, Package, CalendarCheck, ArrowLeft, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import StatsCard from '@/components/dashboard/StatsCard'
import TransactionHistory from '@/components/dashboard/TransactionHistory'
import OwnedProducts from '@/components/dashboard/OwnedProducts'

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full relative bg-background text-foreground flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const userName = user?.displayName || user?.email?.split('@')[0] || 'Pengguna'
  const memberSince = '25 Des 2025'

  return (
    <main className="min-h-screen w-full relative bg-background text-foreground">
      {/* Background Pattern */}
      <DotPattern />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* 1. Back Button */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
        </div>

        {/* 2. Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Selamat Datang, <span className="text-foreground">{userName}</span>!
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Kelola pembelian dan pantau transaksi Anda
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/products">
              <Button variant="outline" className="border-white/10 hover:bg-white/5">
                Belanja Produk
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 3. Stats Grid (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatsCard
            icon={<Wallet className="w-8 h-8" />}
            label="TOTAL BELANJA"
            value="Rp 0"
          />
          <StatsCard
            icon={<FileText className="w-8 h-8" />}
            label="TOTAL TRANSAKSI"
            value="0 Transaksi"
          />
          <StatsCard
            icon={<Package className="w-8 h-8" />}
            label="PRODUK DIMILIKI"
            value="0 Produk"
          />
          <StatsCard
            icon={<CalendarCheck className="w-8 h-8" />}
            label="MEMBER SEJAK"
            value={memberSince}
          />
        </div>

        {/* 4. Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TransactionHistory />
          <OwnedProducts />
        </div>
      </div>
    </main>
  )
}
