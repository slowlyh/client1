'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export function ThemeSwitcher({ className }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check localStorage for saved theme, otherwise use system preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const defaultTheme = prefersDark ? 'dark' : 'light'
      setTheme(defaultTheme)
      document.documentElement.classList.toggle('dark', prefersDark)
    }
  }, [])

  const toggleTheme = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light'
    setTheme(newTheme)

    // Update DOM
    document.documentElement.classList.toggle('dark', newTheme === 'dark')

    // Save to localStorage
    localStorage.setItem('theme', newTheme)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <Sun className="w-4 h-4 opacity-50" />
        <Switch
          id="themeSwitch"
          checked={theme === 'dark'}
          onCheckedChange={toggleTheme}
          aria-label="Toggle theme"
        />
        <Moon className="w-4 h-4 opacity-50" />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Sun className="w-4 h-4" />
      <Switch
        id="themeSwitch"
        checked={theme === 'dark'}
        onCheckedChange={toggleTheme}
        aria-label="Toggle theme"
      />
      <Moon className="w-4 h-4" />
    </div>
  )
}

export default function Theme() {
  return (
    <div className="flex items-center gap-4 p-3 bg-card rounded-lg border border-border">
      <span className="text-sm font-medium">
        Tema
      </span>
      <ThemeSwitcher />
    </div>
  )
}
