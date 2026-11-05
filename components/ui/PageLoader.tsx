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
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-cream"
      style={{
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.4s ease',
        pointerEvents: fading ? 'none' : 'all',
      }}
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(220,203,246,0.5), transparent 70%)' }}
      />
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-white/70 ring-1 ring-ink/[.06]">
          <img
            src="/images/Jovo_official_logo.png"
            alt="JOVO"
            style={{ width: '52px', height: '52px', objectFit: 'cover', animation: 'jovo-pulse 1s ease-in-out infinite' }}
          />
        </div>
        <p className="font-display text-[13px] font-semibold tracking-[0.32em] uppercase text-ink/45">JOVO</p>
        <div className="w-36 h-[3px] bg-ink/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-ink"
            style={{ animation: 'jovo-bar 1s ease-out forwards' }}
          />
        </div>
        <div className="flex items-center gap-2">
          {[
            { anim: 'jovo-dot1 1s ease-in-out infinite', color: '#0E0E10' },
            { anim: 'jovo-dot2 1s ease-in-out infinite', color: '#C6ACEF' },
            { anim: 'jovo-dot3 1s ease-in-out infinite', color: '#0E0E10' },
          ].map(({ anim, color }, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: color, animation: anim }} />
          ))}
        </div>
      </div>
    </div>
  )
}
