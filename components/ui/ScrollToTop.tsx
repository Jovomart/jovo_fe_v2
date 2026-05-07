'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Method 1: Standard scroll
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    
    // Method 2: Fallback for older browsers
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
    
    // Method 3: Double-check after a tiny delay (handles delayed DOM rendering)
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }, 50)
    
    return () => clearTimeout(timer)
  }, [pathname])

  return null
}