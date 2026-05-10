'use client'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-[400] w-11 h-11 rounded-full bg-brand-gradient text-white flex items-center justify-center shadow-[0_6px_18px_rgba(180,34,37,.4)] transition-[opacity,visibility,transform] duration-300 hover:-translate-y-1 ${visible ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}
    >
      <FontAwesomeIcon icon={faArrowUp} className="text-sm" />
    </button>
  )
}
