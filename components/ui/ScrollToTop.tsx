'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Scroll the window
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    // Also scroll any overflow container that might be wrapping pages
    const scrollableContainers = document.querySelectorAll(
      '[data-scroll-container], main, .overflow-y-auto, .overflow-y-scroll, .overflow-auto, .overflow-scroll'
    )
    scrollableContainers.forEach(el => {
      el.scrollTop = 0
    })

    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      document.documentElement.scrollTop = 0
    }, 50)

    return () => clearTimeout(timer)
  }, [pathname])

  return null
}