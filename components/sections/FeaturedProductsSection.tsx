'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight, faArrowRight, faGem, faStar } from '@fortawesome/free-solid-svg-icons'
import { PRODUCTS } from '@/data'
import ProductCard from '@/components/ui/ProductCard'
import type { Product } from '@/types'

const TABS = [
  { label: 'All Collections', value: 'all', icon: faGem },
  { label: 'Phones', value: 'phones', icon: null },
  { label: 'Electronics', value: 'electronics', icon: null },
  { label: 'Fashion', value: 'fashion', icon: null },
  { label: 'Computing', value: 'computing', icon: null },
]

export default function FeaturedProductsSection() {
  const [activeTab, setActiveTab] = useState('all')
  const [fading, setFading] = useState(false)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const sliderRef = useRef<HTMLDivElement>(null)

  const filtered: Product[] = activeTab === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.tab === activeTab)

  // Check scroll position for arrow visibility
  const checkScrollPosition = () => {
    const el = sliderRef.current
    if (!el) return
    setShowLeftArrow(el.scrollLeft > 20)
    setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 20)
  }

  useEffect(() => {
    const el = sliderRef.current
    if (el) {
      el.addEventListener('scroll', checkScrollPosition)
      checkScrollPosition()
      return () => el.removeEventListener('scroll', checkScrollPosition)
    }
  }, [filtered])

  const switchTab = (val: string) => {
    if (val === activeTab) return
    setFading(true)
    setTimeout(() => {
      setActiveTab(val)
      setFading(false)
      if (sliderRef.current) {
        sliderRef.current.scrollLeft = 0
        checkScrollPosition()
      }
    }, 250)
  }

  const scroll = (dir: 'left' | 'right') => {
    const el = sliderRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('.product-card')
    const cardW = card ? card.offsetWidth + 12 : 280
    el.scrollBy({ left: dir === 'left' ? -cardW : cardW, behavior: 'smooth' })
  }

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-white to-gray-50/30" aria-label="Featured products">
      
      {/* Decorative background element */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-brand-red/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-brand-orange/5 blur-3xl" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with luxury feel */}
        <div className="text-center mb-10 md:mb-14" data-animate="fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-brand-red/10 to-brand-orange/10 border border-brand-red/20 mb-4">
            <FontAwesomeIcon icon={faStar} className="text-brand-red text-xs" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-brand-red">
              Premium Selection
            </span>
            <FontAwesomeIcon icon={faStar} className="text-brand-orange text-xs" />
          </div>
          
          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-3">
            Curated Just 
            <span className="gradient-text mx-2">For You</span>
          </h2>
          
          <div className="w-20 h-1 bg-gradient-to-r from-brand-red to-brand-orange rounded-full mx-auto" />
          
          <p className="text-gray-500 mt-5 max-w-2xl mx-auto text-sm sm:text-base">
            Discover our handpicked collection of premium products from trusted campus sellers
          </p>
        </div>

        {/* Luxury Tabs */}
        <div className="mb-10 md:mb-12 overflow-x-auto no-scrollbar" role="tablist" aria-label="Filter products">
          <div className="flex justify-center gap-2 sm:gap-3 min-w-max px-0">
            {TABS.map(({ label, value, icon }) => (
              <button
                key={value}
                role="tab"
                aria-selected={activeTab === value}
                onClick={() => switchTab(value)}
                className={`group relative px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-[12px] sm:text-[14px] font-bold transition-all duration-300 font-body ${
                  activeTab === value
                    ? 'text-white'
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {activeTab === value && (
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-red to-brand-orange shadow-lg shadow-brand-red/25" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {icon && activeTab === value && <FontAwesomeIcon icon={icon} className="text-xs" />}
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Slider with luxury styling - CLOSED GAP */}
        <div className="relative group">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-gray-200 text-gray-700 flex items-center justify-center text-sm shadow-lg hover:bg-gradient-to-r hover:from-brand-red hover:to-brand-orange hover:border-transparent hover:text-white hover:shadow-xl transition-all duration-300 z-20 opacity-0 group-hover:opacity-100"
              aria-label="Scroll products left"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
          )}

          {/* Slider Track */}
          <div 
            ref={sliderRef} 
            className="overflow-x-auto overflow-y-visible no-scrollbar pb-6"
            style={{ scrollBehavior: 'smooth' }}
          >
            <div
              className="flex gap-2 sm:gap-3 md:gap-1 py-2 px-2"
              role="list"
              aria-label="Featured products"
              style={{ 
                opacity: fading ? 0 : 1, 
                transform: fading ? 'translateY(10px)' : 'none', 
                transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
              }}
            >
              {filtered.map((product, index) => (
                <div 
                  key={product.id} 
                  className="flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px] animate-fadeInUp"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-gray-200 text-gray-700 flex items-center justify-center text-sm shadow-lg hover:bg-gradient-to-r hover:from-brand-red hover:to-brand-orange hover:border-transparent hover:text-white hover:shadow-xl transition-all duration-300 z-20 opacity-0 group-hover:opacity-100"
              aria-label="Scroll products right"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          )}
        </div>

        {/* View All CTA - Luxury style */}
        <div className="text-center mt-5 md:mt-16">
          <Link 
            href="/shop" 
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-transparent border-2 border-brand-red/30 text-brand-red font-bold text-sm hover:bg-gradient-to-r hover:from-brand-red hover:to-brand-orange hover:border-transparent hover:text-white transition-all duration-300 group"
          >
            <span>Explore Complete Collection</span>
            <FontAwesomeIcon 
              icon={faArrowRight} 
              className="text-xs transition-transform duration-300 group-hover:translate-x-1" 
            />
          </Link>
        </div>
      </div>
    </section>
  )
}