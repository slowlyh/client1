'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export default function Preloader({ show = true, progress = 0 }: { show?: boolean; progress?: number }) {
  const [isVisible, setIsVisible] = useState(show)
  const [currentProgress, setCurrentProgress] = useState(progress)

  // Simulate progress loading
  useEffect(() => {
    setIsVisible(show)
    if (show) {
      let interval: NodeJS.Timeout
      interval = setInterval(() => {
        setCurrentProgress((prev) => {
          if (prev < 100) {
            const increment = Math.floor(Math.random() * 10) + 1
            return Math.min(prev + increment, 100)
          }
          // Hide when complete
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => {
              setIsVisible(false)
            }, 500)
          }
          return 100
        })
      }, 150)

      return () => clearInterval(interval)
    }
  }, [show])

  if (!isVisible) return null

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center bg-background',
      'transition-opacity duration-500'
    )}>
      <div className="w-full max-w-md p-8">
        {/* Logo/Brand */}
        <div className="flex flex-col items-center mb-8">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
            <path d="M24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48Z" fill="currentColor"/>
            <path d="M24 36C30.6274 36 36 30.6274 36 24C36 17.3726 30.6274 12 24 12C17.3726 12 12 17.3726 12 24C12 30.6274 17.3726 36 24 36Z" fill="currentColor"/>
          </svg>
          <h2 className="text-3xl font-bold ">Yilzi Digitalz</h2>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full h-2  rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full bg-gradient-to-r  rounded-full transition-all duration-300',
                'shadow-lg'
              )}
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>

        {/* Percentage */}
        <div className="text-center mb-6">
          <p className="text-4xl font-bold  mb-2">
            {currentProgress}%
          </p>
          <p className=" text-lg">Memuat aplikasi...</p>
        </div>

        {/* Loading Message */}
        <p className="text-center ">
          Mohon tunggu, sedang memuat pengalaman terbaik untuk Anda...
        </p>
      </div>
    </div>
  )
}
