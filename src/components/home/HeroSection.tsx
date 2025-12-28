'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, Shield, Rocket } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative py-24 md:py-32 text-center">
      <div className="relative z-10 max-w-5xl mx-auto px-4">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted/50 backdrop-blur-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
          <span className="text-xs font-semibold tracking-[0.2em] uppercase">
            Digital Store Premium
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.05] tracking-tight">
          Automasi
          <br />
          <span className="">
            & Website
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-base md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed font-light">
          Platform produk digital terlengkap. Script, bot, dan website
          <br className="hidden md:block" />
          dengan kualitas premium untuk bisnis Anda.
        </p>

        {/* Features Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border backdrop-blur-sm">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Instan</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border backdrop-blur-sm">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Aman</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border backdrop-blur-sm">
            <Rocket className="w-4 h-4" />
            <span className="text-sm font-medium">Cepat</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/products" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="h-14 px-8 text-base font-semibold bg-foreground text-background hover:bg-muted hover:text-foreground border-none transition-all duration-300"
            >
              Lihat Semua Produk
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-center gap-8 mt-16 pt-8 border-t border-border">
          <div>
            <p className="text-3xl font-bold">500+</p>
            <p className="text-xs uppercase tracking-wider mt-1">Produk</p>
          </div>
          <div className="w-px h-12 bg-border" />
          <div>
            <p className="text-3xl font-bold">99.9%</p>
            <p className="text-xs uppercase tracking-wider mt-1">Uptime</p>
          </div>
          <div className="w-px h-12 bg-border" />
          <div>
            <p className="text-3xl font-bold">24/7</p>
            <p className="text-xs uppercase tracking-wider mt-1">Support</p>
          </div>
        </div>
      </div>
    </section>
  )
}
