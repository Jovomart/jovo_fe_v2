'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faBagShopping, faArrowRight, faCheck } from '@fortawesome/free-solid-svg-icons'
import { useCountdown } from '@/hooks/useCountdown'
import { FLASH_PRODUCTS } from '@/data'
import { showToast } from '@/components/ui/toast'
import { CART_EVENT } from '@/components/layout/Header'

let globalCartCount = 0

export default function FlashSalesSection() {
  const { hours, mins, secs } = useCountdown()
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set())
  const barsRef = useRef<HTMLDivElement>(null)
  const [barsAnimated, setBarsAnimated] = useState(false)

  // Animate progress bars on scroll into view
  useEffect(() => {
    const el = barsRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBarsAnimated(true)
          obs.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const handleAddToCart = (id: number, name: string) => {
    setAddedIds((prev) => new Set([...prev, id]))
    globalCartCount++
    window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: globalCartCount }))
    showToast('Added to cart 🛍️', 'success')
    setTimeout(() => {
      setAddedIds((prev) => { const next = new Set(prev); next.delete(id); return next })
    }, 1600)
  }

  return (
    <section className="py-8 sm:py-[52px] bg-white" aria-label="Flash sales">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-wrap mb-5 sm:mb-6">
          <div className="flex items-center gap-[10px] flex-1 min-w-0 w-full sm:w-auto">
            <span className="w-[32px] sm:w-[38px] h-[32px] sm:h-[38px] rounded-[12px] sm:rounded-[14px] bg-brand-gradient text-white flex items-center justify-center text-[15px] sm:text-[17px] shadow-orange-glow animate-bolt-pulse flex-shrink-0">
              <FontAwesomeIcon icon={faBolt} />
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-black text-gray-900">Flash Sales</h2>
            <span className="bg-[#22c55e] text-white text-[8px] sm:text-[9.5px] font-extrabold px-[7px] sm:px-[9px] py-[2px] sm:py-[3px] rounded-full tracking-[.1em] animate-live-pulse flex-shrink-0" aria-label="Sale is live">LIVE</span>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-[8px] sm:gap-[10px] flex-shrink-0" aria-label="Time remaining">
            <span className="text-[11px] sm:text-[12px] font-semibold text-gray-500">Ends in:</span>
            <div className="flex items-center gap-[2px] sm:gap-[3px]">
              {[{ val: hours, label: 'hrs' }, { val: mins, label: 'min' }, { val: secs, label: 'sec' }].map(({ val, label }, i) => (
                <div key={label} className="flex items-center gap-[2px] sm:gap-[3px]">
                  {i > 0 && <span className="font-mono text-[16px] sm:text-[18px] font-bold text-brand-orange animate-colon-blink" aria-hidden="true">:</span>}
                  <div className="flex flex-col items-center bg-gray-900 rounded-[6px] sm:rounded-[7px] px-[6px] sm:px-[9px] py-[2px] sm:py-1 min-w-[36px] sm:min-w-[42px]">
                    <strong className="font-mono text-[15px] sm:text-[17px] text-white leading-none">{val}</strong>
                    <span className="text-[7px] sm:text-[8px] text-gray-400 uppercase tracking-[.1em] mt-[1px] sm:mt-[2px]">{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link href="/flash-sales" className="inline-flex items-center gap-[5px] text-[12px] sm:text-[13px] font-bold text-brand-red whitespace-nowrap hover:gap-[9px] transition-all" aria-label="View all flash sales">
            View All <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>

        {/* Grid */}
        <div ref={barsRef} className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" role="list" aria-label="Flash sale products">
          {FLASH_PRODUCTS.map((p) => {
            const added = addedIds.has(p.id)
            return (
              <article key={p.id} className="rounded-[12px] sm:rounded-[14px] bg-white border border-gray-200 overflow-hidden hover:-translate-y-1 hover:shadow-brand-md transition-all duration-250" role="listitem">
                <Link href={`/product/${p.id}`} className="relative block aspect-[4/3] overflow-hidden" aria-label={p.name}>
                  <Image src={p.image} alt={p.alt} fill className="object-cover transition-transform duration-500 hover:scale-[1.06]" sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 25vw" />
                  <span className="absolute top-2 left-2 bg-brand-red text-white text-[9px] sm:text-[10.5px] font-extrabold px-1.5 sm:px-2 py-[2px] sm:py-[3px] rounded-full">-{p.discount}%</span>
                  <div className="absolute inset-0 bg-black/42 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-[10px] sm:text-[11.5px] font-bold bg-white/15 backdrop-blur-[8px] px-3 sm:px-[14px] py-1.5 sm:py-[6px] rounded-full border border-white/30">Quick View</span>
                  </div>
                </Link>
                <div className="p-2 sm:p-[11px]">
                  <h3 className="text-[11px] sm:text-[12.5px] font-bold mb-[5px] sm:mb-[6px] leading-[1.35]">
                    <Link href={`/product/${p.id}`} className="text-gray-900 hover:text-brand-red transition-colors line-clamp-2">{p.name}</Link>
                  </h3>
                  <div className="flex items-center gap-[4px] sm:gap-[6px] mb-1.5 sm:mb-2 flex-wrap">
                    <span className="text-[13px] sm:text-[15px] font-extrabold text-brand-red">₦{p.price.toLocaleString()}</span>
                    <span className="text-[9px] sm:text-[11px] text-gray-400"><del>₦{p.oldPrice.toLocaleString()}</del></span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-1 overflow-hidden mb-1" role="progressbar" aria-valuenow={p.sold} aria-valuemin={0} aria-valuemax={100}>
                    <div
                      className="h-full rounded-full bg-brand-gradient transition-[width] duration-500 ease-out"
                      style={{ width: barsAnimated ? `${p.sold}%` : '0%' }}
                    />
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-gray-500 mb-2 sm:mb-[10px]">{p.sold}% sold</p>
                  <button
                    onClick={() => handleAddToCart(p.id, p.name)}
                    aria-label={`Add ${p.name} to cart`}
                    className={`w-full flex items-center justify-center gap-1.5 px-2 py-1.5 sm:py-2 rounded-[7px] sm:rounded-[8px] text-[11px] sm:text-[12px] font-bold transition-all font-body ${added ? 'bg-[#22c55e] text-white' : 'bg-gray-100 text-gray-900 hover:bg-brand-gradient hover:text-white'}`}
                  >
                    <FontAwesomeIcon icon={added ? faCheck : faBagShopping} className="text-[10px] sm:text-[11px]" />
                    {added ? 'Added!' : 'Add to Cart'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}