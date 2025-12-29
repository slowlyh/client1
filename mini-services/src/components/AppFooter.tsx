'use client'

import Link from 'next/link'
import { Mail, Instagram, Send, ExternalLink } from 'lucide-react'

interface Contact {
  name: string
  url: string
  icon: 'mail' | 'instagram' | 'send'
}

interface LinkItem {
  name: string
  url: string
  icon: 'telegram' | 'info' | 'helper' | 'github'
}

const iconComponents = {
  mail: Mail,
  instagram: Instagram,
  send: Send,
  telegram: Send,
  info: Send,
  helper: Send,
  github: ExternalLink
}

export default function AppFooter() {
  const contacts: Contact[] = [
    { name: 'WhatsApp', url: 'https://wa.me/6281359123789', icon: 'send' },
    { name: 'Instagram', url: 'https://instagram.com/Yilzi_dominan', icon: 'instagram' },
    { name: 'Email', url: 'mailto:owner@yilziii.com', icon: 'mail' }
  ]

  const links: LinkItem[] = [
    { name: 'Telegram', url: 'https://t.me/Yilziii', icon: 'telegram' },
    { name: 'Yilzi Information', url: 'https://info.yilziii.com', icon: 'info' },
    { name: 'Helper (Portfolio)', url: 'https://yilziii.com', icon: 'helper' },
    { name: 'Script WhatsApp Bot', url: 'https://github.com/YilziiHCT', icon: 'github' }
  ]

  return (
    <footer className="relative border-t border-border bg-muted/30 md:bg-muted/50">
      {/* Footer Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] hidden md:block" aria-hidden="true">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(128, 128, 128, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(128, 128, 128, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold mb-4 tracking-tight">
              <span className="">Yilzi</span>
              <span className="">Digitalz</span>
            </h3>
            <p className="mb-6 leading-relaxed font-light text-sm">
              Platform produk digital premium. Script, bot, dan website dengan kualitas terbaik untuk kebutuhan bisnis Anda.
            </p>
            <div className="flex gap-3">
              {contacts.map((contact) => {
                const Icon = iconComponents[contact.icon]
                return (
                  <Link
                    key={contact.name}
                    href={contact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-muted border border-border hover:border-foreground transition-all duration-300 flex items-center justify-center group"
                    aria-label={contact.name}
                  >
                    <Icon className="w-5 h-5 group-hover:text-foreground transition-colors" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-semibold mb-4 uppercase tracking-[0.15em]">
              Navigasi
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Beranda', url: '/' },
                { name: 'Produk', url: '/products' },
                { name: 'Dashboard', url: '/dashboard' },
                { name: 'Login', url: '/login' }
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.url}
                    className="hover:text-foreground transition-colors flex items-center gap-2 group text-sm"
                  >
                    <span className="w-1 h-1 rounded-full group-hover:bg-foreground transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-base font-semibold mb-4 uppercase tracking-[0.15em]">
              Resources
            </h4>
            <ul className="space-y-3">
              {links.map((link) => {
                const Icon = iconComponents[link.icon]
                return (
                  <li key={link.name}>
                    <Link
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors flex items-center gap-3 group text-sm"
                    >
                      <Icon className="w-4 h-4 group-hover:text-foreground transition-colors" />
                      {link.name}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center relative z-10">
            <p className="text-xs font-light">
              © 2025 Yilzi Digitalz. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs">
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors font-light"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors font-light"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
