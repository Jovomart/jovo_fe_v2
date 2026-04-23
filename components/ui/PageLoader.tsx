'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function PageLoader() {
  const pathname = usePathname()
  const [show, setShow] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    setShow(true)
    setFading(false)
    const fadeTimer = setTimeout(() => setFading(true), 900)
    const hideTimer = setTimeout(() => { setShow(false); setFading(false) }, 1300)
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }
  }, [pathname])

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center"
      style={{
        background: '#000',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.4s ease',
        pointerEvents: fading ? 'none' : 'all',
      }}
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,140,0,0.12), transparent 70%)' }}
      />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <img
          src="/images/Jovo_off_logo2.png"
          alt="JOVO"
          className="object-cover"
          style={{
            width: '200px', height: '80px', objectFit: 'cover',
            animation: 'jovo-pulse 1s ease-in-out infinite',
            filter: 'drop-shadow(0 0 20px rgba(255,140,0,0.4))',
          }}
        />
        <p className="text-white/30 text-xs font-medium tracking-widest uppercase">Your Campus Marketplace</p>
        <div className="w-40 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #B42225, #FF8C00)',
              animation: 'jovo-bar 1s ease-out forwards',
              boxShadow: '0 0 8px rgba(255,140,0,0.6)',
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          {[
            { anim: 'jovo-dot1 1s ease-in-out infinite', color: '#B42225' },
            { anim: 'jovo-dot2 1s ease-in-out infinite', color: '#FF8C00' },
            { anim: 'jovo-dot3 1s ease-in-out infinite', color: '#B42225' },
          ].map(({ anim, color }, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ background: color, animation: anim }} />
          ))}
        </div>
      </div>
    </div>
  )
}
