'use client'
import { useEffect } from 'react'

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

export function useCounterAnimations() {
  useEffect(() => {
    const counters = document.querySelectorAll<HTMLElement>('.stat-num[data-count]')
    if (!counters.length) return

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCounter(e.target as HTMLElement)
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.5 }
    )
    counters.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

function animateCounter(el: HTMLElement) {
  const target = parseInt(el.dataset.count || '0', 10)
  const steps = 1800 / 16
  let current = 0
  const inc = target / steps
  const suffix = el.dataset.suffix || ''

  const timer = setInterval(() => {
    current = Math.min(current + inc, target)
    const val = Math.round(current)
    el.textContent = val >= 1000 ? (val / 1000).toFixed(0) + 'K+' : val + suffix
    if (current >= target) clearInterval(timer)
  }, 16)
}
