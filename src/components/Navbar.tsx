'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, User, ShoppingCart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { ThemeSwitcher } from '@/components/Theme'

export default function Navbar() {
  const { user, loading, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center group-hover:border-foreground transition-all duration-300">
                <span className="text-xl font-bold">Y</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold tracking-tight">
                  Yilzi
                </span>
                <span className="font-bold">
                  Digitalz
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Link href="/products" className="px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-muted">
                Produk
              </Link>
              <Link href="/dashboard" className="px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-muted">
                Dashboard
              </Link>

              {/* Theme Switcher */}
              <div className="ml-2">
                <ThemeSwitcher />
              </div>

              {/* Login/Logout Button */}
              {loading ? (
                <div className="w-20 h-10 bg-muted rounded-lg animate-pulse" />
              ) : user ? (
                <button
                  onClick={() => {
                    logout()
                  }}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-muted border border-border rounded-lg hover:bg-accent transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              ) : (
                <Link href="/login">
                  <button className="flex items-center gap-2 px-6 py-2 text-sm font-semibold bg-foreground border text-background rounded-lg hover:bg-muted hover:text-foreground transition-all duration-300">
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline">Masuk</span>
                  </button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center hover:bg-accent transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 pt-20 bg-background backdrop-blur-xl">
          <div className="container mx-auto px-4 py-8 space-y-2">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-5 py-4 text-lg hover:bg-muted rounded-xl transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              Produk
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-5 py-4 text-lg hover:bg-muted rounded-xl transition-all"
            >
              <span className="w-5 h-5" />
              Dashboard
            </Link>

            {/* Theme Switcher in Mobile Menu */}
            <div className="flex items-center gap-3 px-5 py-4">
              <ThemeSwitcher />
              <span className="text-lg">Tema</span>
            </div>

            <div className="border-t border-border pt-4 mt-4">
              {loading ? (
                <div className="w-full h-14 bg-muted rounded-xl animate-pulse" />
              ) : user ? (
                <button
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                  className="flex w-full items-center gap-3 px-5 py-4 text-lg font-medium bg-muted border border-border rounded-xl hover:bg-accent transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center gap-3 px-5 py-4 text-lg font-semibold bg-foreground text-background rounded-xl hover:bg-muted hover:text-foreground transition-all"
                >
                  <User className="w-5 h-5" />
                  Masuk
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
