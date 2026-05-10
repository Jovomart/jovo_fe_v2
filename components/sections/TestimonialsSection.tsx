'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight, faStar } from '@fortawesome/free-solid-svg-icons'
import { TESTIMONIALS } from '@/data'

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const [visibleCount, setVisibleCount] = useState(3) // ← stable default for SSR
  const trackRef = useRef<HTMLDivElement>(null)
  const autoRef = useRef<ReturnType<typeof setInterval>>()
  const touchX = useRef(0)

  // Only runs on client — no more server/client mismatch
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setVisibleCount(1)
      else if (window.innerWidth < 900) setVisibleCount(2)
      else setVisibleCount(3)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const maxIdx = Math.max(0, TESTIMONIALS.length - visibleCount)

  const goTo = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(idx, maxIdx))
    setCurrent(clamped)
    if (trackRef.current) {
      const card = trackRef.current.querySelector<HTMLElement>('.testi-card')
      const gap = 24
      const cardW = card ? card.offsetWidth + gap : 0
      trackRef.current.style.transform = `translateX(-${clamped * cardW}px)`
    }
  }, [maxIdx])

  const next = useCallback(() => {
    goTo(current >= maxIdx ? 0 : current + 1)
  }, [current, maxIdx, goTo])

  const prev = useCallback(() => {
    goTo(current > 0 ? current - 1 : maxIdx)
  }, [current, maxIdx, goTo])

  const resetAuto = useCallback(() => {
    clearInterval(autoRef.current)
    autoRef.current = setInterval(next, 4500)
  }, [next])

  useEffect(() => {
    autoRef.current = setInterval(next, 4500)
    return () => clearInterval(autoRef.current)
  }, [next])

  // Re-clamp current index when visibleCount changes (e.g. on resize)
  useEffect(() => {
    goTo(current)
  }, [visibleCount]) // eslint-disable-line react-hooks/exhaustive-deps

  const dots = Array.from({ length: maxIdx + 1 }, (_, i) => i)

  return (
    <section className="py-[60px] bg-white overflow-hidden" aria-label="Customer testimonials">
      <div className="max-w-[1400px] mx-auto px-6 pb-9 text-center" data-animate="fade-up">
        <div className="inline-flex items-center text-[10.5px] font-extrabold uppercase tracking-[.2em] text-brand-orange bg-[rgba(255,140,0,.08)] border border-[rgba(255,140,0,.2)] px-[14px] py-[5px] rounded-full mb-3">
          Community
        </div>
        <h2 className="font-display text-[clamp(24px,3vw,38px)] font-black leading-[1.15] text-gray-900 mb-[10px]">
          Loved by <em className="not-italic text-brand-red">Students</em>
        </h2>
        <p className="text-[14.5px] text-gray-500 max-w-[520px] mx-auto leading-[1.75]">
          Don't take our word for it — here's what our community says.
        </p>
      </div>

      <div className="max-w-[1300px] mx-auto px-6">
        <div className="overflow-hidden rounded-[28px]">
          <div
            ref={trackRef}
            className="testimonials-track"
            onTouchStart={(e) => { touchX.current = e.touches[0].clientX }}
            onTouchEnd={(e) => {
              const diff = touchX.current - e.changedTouches[0].clientX
              if (Math.abs(diff) > 45) {
                diff > 0 ? next() : prev()
                resetAuto()
              }
            }}
          >
            {TESTIMONIALS.map((t) => (
              <blockquote
                key={t.id}
                className="testi-card flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-[#FFF8F5] border border-gray-200 rounded-[28px] p-7 flex flex-col gap-[14px] hover:-translate-y-1 hover:shadow-brand-md transition-all"
              >
                <div className="text-[13px] text-brand-orange tracking-[2px]" aria-label="5 stars">
                  {Array(5).fill(null).map((_, i) => (
                    <FontAwesomeIcon key={i} icon={faStar} />
                  ))}
                </div>
                <p className="text-[13.5px] text-gray-700 leading-[1.8] flex-1 italic">
                  "{t.text}"
                </p>
                <footer className="flex items-center gap-[11px] mt-auto">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[16px] font-extrabold text-white font-display flex-shrink-0"
                    style={{ background: t.avatarColor }}
                  >
                    {t.initial}
                  </div>
                  <div>
                    <cite className="block text-[13px] font-extrabold text-gray-900 not-italic">{t.name}</cite>
                    <span className="text-[11px] text-gray-500">{t.role}</span>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => { prev(); resetAuto() }}
            className="w-[42px] h-[42px] rounded-full border border-gray-200 bg-white text-gray-700 flex items-center justify-center text-[14px] hover:border-brand-red hover:text-brand-red hover:bg-[rgba(180,34,37,.05)] hover:scale-105 transition-all"
            aria-label="Previous testimonial"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          <div className="flex gap-2 items-center" role="tablist">
            {dots.map((i) => (
              <button
                key={i}
                role="tab"
                aria-label={`Testimonial ${i + 1}`}
                onClick={() => { goTo(i); resetAuto() }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? 'w-7 bg-brand-red' : 'w-2 bg-gray-300 hover:bg-brand-orange'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => { next(); resetAuto() }}
            className="w-[42px] h-[42px] rounded-full border border-gray-200 bg-white text-gray-700 flex items-center justify-center text-[14px] hover:border-brand-red hover:text-brand-red hover:bg-[rgba(180,34,37,.05)] hover:scale-105 transition-all"
            aria-label="Next testimonial"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
    </section>
  )
}