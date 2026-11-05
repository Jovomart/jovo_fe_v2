'use client'
import { useEffect } from 'react'

/** Reveals every `[data-animate]` element in the document as it scrolls into view. */
export function useScrollAnimations() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-animate]')
    if (!els.length) return

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const delay = Number((e.target as HTMLElement).dataset.delay || 0)
            setTimeout(() => e.target.classList.add('animated'), delay)
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

export default useScrollAnimations
