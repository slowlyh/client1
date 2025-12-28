'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

interface FaqItem {
  id: number
  question: string
  answer: string
  icon: string
}

const faqItems: FaqItem[] = [
  {
    id: 1,
    question: 'Bagaimana cara membeli produk?',
    answer:
      'Sebelum membeli produk baca deskripsi terlebih dahulu, pembelian cukup dengan mengklik tombol "Beli" lalu ikuti instruksi di layar. Jika ada kendala setelah pembayaran, segera hubungi admin.',
    icon: '🛒'
  },
  {
    id: 2,
    question: 'Apakah pembayaran dicek otomatis?',
    answer:
      'Ya, sistem akan mengecek pembayaran secara otomatis. Disarankan tetap berada di halaman invoice hingga status pembayaran berhasil.',
    icon: '🛡️'
  },
  {
    id: 3,
    question: 'Metode pembayaran apa yang digunakan?',
    answer:
      'Kami menggunakan QRIS yang fleksibel, bisa dibayar lewat bank maupun e-wallet dengan cepat dan aman.',
    icon: '💳'
  }
]

export default function FaqSection() {
  const [openItem, setOpenItem] = useState<string | undefined>(undefined)

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">Pertanyaan Umum</h2>
          <p className="text-xl text-slate-600">
            Temukan jawaban untuk pertanyaan yang sering diajukan
          </p>
          <Badge className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            FAQ
          </Badge>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqItems.map((item) => (
            <AccordionItem
              key={item.id}
              value={`item-${item.id}`}
              className="border border-slate-200 rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 overflow-hidden"
            >
              <AccordionTrigger
                className="w-full p-6 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                onClick={() => setOpenItem(openItem === `item-${item.id}` ? undefined : `item-${item.id}`)}
              >
                <div className="flex items-center gap-4 flex-grow">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    {item.question}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-slate-500 transition-transform duration-200',
                    openItem === `item-${item.id}` && 'rotate-180'
                  )}
                />
              </AccordionTrigger>

              <AccordionContent className="px-6 pb-6">
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Help Text */}
        <div className="mt-12 text-center p-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-blue-200 dark:border-blue-900">
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">
            Masih memiliki pertanyaan? Hubungi kami untuk bantuan lebih lanjut.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/6281359123789"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.736-1.758-.736-2.034-.632-2.034-2.034.859 1.047 1.777 1.997 2.348.166.417.416 1.777.486-2.378c-.848.417-1.707.417-2.378V5c0-1.104.896-2-2-2s-2 .896-2 2v12.5c0 1.104.896 2 2 2s2-.896 2-2V8.023c0-1.104-.896-2-2-2-.672.417-1.707-.417-2.378l-3.053-4.672c-.396-.149-.736-.376-1.035-.69-.297-.822-.426-.699-.732.094-.094.163-.31.31-.31-3.506-.506-7.554-1.076-7.554-1.076-.31 0-.31.155 0-.155.31 0l-8.023 1.347c-1.38.231-2.5.956-2.5-2.15 0-1.194.896-2.15-2.15-2.15zm0 14.077c-1.38.231-2.5.956-2.5-2.15 0-1.194.896-2.15-2.15-2.15z" />
              </svg>
              WhatsApp
            </a>
            <a
              href="mailto:owner@yilziii.com"
              className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
