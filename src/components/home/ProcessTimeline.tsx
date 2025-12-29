'use client'

import {
  UserCircle,
  ShoppingBag,
  CreditCard,
  Download,
  Check
} from 'lucide-react'

const steps = [
  {
    icon: UserCircle,
    title: 'Login / Daftar',
    description: 'Masuk atau mendaftar jika belum mempunyai akun untuk melanjutkan proses.'
  },
  {
    icon: ShoppingBag,
    title: 'Pesan Online',
    description: 'Pilih produk, baca deskripsi produk dan ikuti instruksi di layar.'
  },
  {
    icon: CreditCard,
    title: 'Pembayaran',
    description: 'Lakukan pembayaran melalui metode yang tersedia dengan aman dan cepat.'
  },
  {
    icon: Download,
    title: 'Unduh Produk',
    description: 'Download file atau hubungi admin melalui kontak yang tersedia di website ini.'
  }
]

export default function ProcessTimeline() {
  return (
    <section className="relative py-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Vertical Connecting Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-border transform -translate-x-1/2" />

        {/* Steps */}
        <div className="relative space-y-16">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isLast = index === steps.length - 1

            return (
              <div
                key={index}
                className="relative flex flex-col items-center text-center"
              >
                {/* Icon Container */}
                <div className="relative z-10 w-20 h-20 rounded-full border-2 border-border bg-background flex items-center justify-center shadow-lg">
                  <Icon className="w-8 h-8 text-foreground" />
                </div>

                {/* Typography */}
                <h3 className="font-bold text-lg mt-4 text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mt-2">
                  {step.description}
                </p>

                {/* Checkmark for last item */}
                {isLast && (
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
                      <Check className="w-4 h-4 text-background" />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
