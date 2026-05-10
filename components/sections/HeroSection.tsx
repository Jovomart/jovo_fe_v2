'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faFire, faTruckFast, faBolt } from '@fortawesome/free-solid-svg-icons'
import { useScrollAnimations, useCounterAnimations } from '@/hooks/useScrollAnimation'

// ─── Particle config (CSS-only, no JS, fully GPU-composited) ──────────────────
// left/right both defined — use empty string when not needed
const PARTICLES: {
  top: string; left: string; right: string
  size: number; color: string; delay: string; dur: string
}[] = [
  { top: '11%', left: '7%',  right: '',    size: 2, color: 'rgba(255,140,0,0.75)',   delay: '0s',   dur: '4.2s' },
  { top: '23%', left: '13%', right: '',    size: 3, color: 'rgba(180,34,37,0.85)',   delay: '1.1s', dur: '5.4s' },
  { top: '38%', left: '4%',  right: '',    size: 2, color: 'rgba(255,180,80,0.5)',   delay: '2.3s', dur: '3.7s' },
  { top: '58%', left: '9%',  right: '',    size: 2, color: 'rgba(255,255,255,0.25)', delay: '0.6s', dur: '6.1s' },
  { top: '74%', left: '18%', right: '',    size: 3, color: 'rgba(180,34,37,0.6)',    delay: '1.7s', dur: '4.8s' },
  { top: '87%', left: '7%',  right: '',    size: 2, color: 'rgba(255,140,0,0.45)',   delay: '3.2s', dur: '5.1s' },
  { top: '7%',  left: '42%', right: '',    size: 2, color: 'rgba(255,255,255,0.2)',  delay: '0.9s', dur: '7.3s' },
  { top: '91%', left: '44%', right: '',    size: 2, color: 'rgba(255,140,0,0.55)',   delay: '2.8s', dur: '4.4s' },
  { top: '16%', left: '',    right: '9%',  size: 3, color: 'rgba(180,34,37,0.55)',   delay: '1.4s', dur: '5.8s' },
  { top: '43%', left: '',    right: '6%',  size: 2, color: 'rgba(255,140,0,0.65)',   delay: '0.3s', dur: '3.9s' },
  { top: '69%', left: '',    right: '11%', size: 2, color: 'rgba(255,255,255,0.2)',  delay: '2.1s', dur: '6.4s' },
  { top: '85%', left: '',    right: '22%', size: 3, color: 'rgba(180,34,37,0.4)',    delay: '1.9s', dur: '4.3s' },
]

const FLOAT_ANIMS = ['animate-float-y', 'animate-float-y-2', 'animate-float-y-3']
const CARD_POSITIONS = [
  { top: '0px',   right: '110px', width: '220px', floatDelay: '0s'   },
  { top: '90px',  right: '0px',   width: '205px', floatDelay: '0.5s' },
  { top: '220px', right: '90px',  width: '195px', floatDelay: '1s'   },
]

export default function HeroSection() {
  useScrollAnimations()
  useCounterAnimations()

  // ── Mouse parallax orbs (desktop only, passive listener) ────────────────────
  useEffect(() => {
    if (window.innerWidth <= 1024) return
    const orbs = document.querySelectorAll<HTMLElement>('.hero-orb')
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2
      const dx = (e.clientX - cx) / cx, dy = (e.clientY - cy) / cy
      orbs.forEach((orb, i) => {
        const s = (i + 1) * 10
        orb.style.transform = `translate(${dx * s}px, ${dy * s}px)`
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const floatCards = [
    {
      src: 'https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=300&auto=format&fit=crop&q=80',
      alt: 'iPhone 15 Pro', name: 'iPhone 15 Pro', price: '₦850,000',
      badge: '🔥 Hot', badgeCls: 'badge-hot',
    },
    {
      src: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80',
      alt: 'MacBook Air M2', name: 'MacBook Air M2', price: '₦1,200,000',
      badge: '-30%', badgeCls: 'badge-sale',
    },
    {
      src: 'https://images.unsplash.com/photo-1629429407756-4a7703614972?w=300&auto=format&fit=crop&q=80',
      alt: 'PS5 Console', name: 'PS5 Console', price: '₦490,000',
      badge: null, badgeCls: '',
    },
  ]

  return (
    <section
      className="hero-cinema relative min-h-[calc(100vh-142px)] flex items-center overflow-hidden px-4 sm:px-6 py-16 sm:py-20 md:py-[70px_24px_90px]"
      aria-label="Welcome to JOVO"
    >

      {/* ══ BACKGROUND STACK ═══════════════════════════════════════════════════ */}

      {/* 1. Layered aurora base */}
      <div className="hero-base-grad absolute inset-0 pointer-events-none" aria-hidden="true" />

      {/* 2. Film-grain cinematic texture */}
      <div className="hero-grain absolute inset-0 pointer-events-none" aria-hidden="true" />

      {/* 3. Cyber grid */}
      <div className="hero-grid absolute inset-0 pointer-events-none" aria-hidden="true" />

      {/* 4. Light beams — transform-only, GPU safe */}
      <div className="hero-beam hero-beam-a absolute pointer-events-none" aria-hidden="true" />
      <div className="hero-beam hero-beam-b absolute pointer-events-none" aria-hidden="true" />

      {/* 5. Aurora orbs — enhanced radial glows */}
      <div
        className="hero-orb hero-orb-red pointer-events-none absolute
          w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] md:w-[680px] md:h-[680px]
          -top-[100px] sm:-top-[150px] md:-top-[200px]
          -left-[100px] sm:-left-[150px] rounded-full animate-orb-float"
        aria-hidden="true"
      />
      <div
        className="hero-orb hero-orb-orange pointer-events-none absolute
          w-[260px] h-[260px] sm:w-[400px] sm:h-[400px] md:w-[540px] md:h-[540px]
          -bottom-[100px] sm:-bottom-[150px] md:-bottom-[180px]
          -right-[50px] sm:-right-[100px] rounded-full animate-orb-float-2"
        aria-hidden="true"
      />
      <div
        className="hero-orb hero-orb-accent pointer-events-none absolute
          w-[160px] h-[160px] sm:w-[220px] sm:h-[220px] md:w-[300px] md:h-[300px]
          top-[40%] left-[38%] rounded-full animate-orb-float-3"
        aria-hidden="true"
      />

      {/* 6. Floating particles — CSS-only, zero JS */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className={`hero-particle hero-particle-${(i % 4) + 1}`}
            style={{
              position:        'absolute',
              top:             p.top,
              left:            p.left  || undefined,
              right:           p.right || undefined,
              width:           p.size,
              height:          p.size,
              background:      p.color,
              borderRadius:    '50%',
              animationDelay:  p.delay,
              animationDuration: p.dur,
            }}
          />
        ))}
      </div>

      {/* ══ MAIN GRID ══════════════════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-[50px] items-center">

        {/* ── LEFT: Text content ──────────────────────────────────────────────── */}
        <div className="max-w-[580px] lg:text-left text-center mx-auto lg:mx-0 px-2 sm:px-0">

          {/* Pill badge */}
          <div
            className="hero-badge inline-flex items-center gap-[8px] px-3 sm:px-4 py-[6px] sm:py-[8px] rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[.12em] mb-5 sm:mb-[24px]"
            data-animate="fade-up"
          >
            <span className="hero-badge-pulse" aria-hidden="true" />
            <FontAwesomeIcon icon={faBolt} className="text-[11px] text-brand-orange" aria-hidden="true" />
            <span className="text-brand-orange">Nigeria's #1 Campus Marketplace</span>
          </div>

          {/* Headline — staggered line reveal */}
          <h1
            className="font-display text-[36px] xs:text-[34px] sm:text-[44px] md:text-[56px] lg:text-[66px] font-black leading-[1.08] text-white mb-4 sm:mb-[20px]"
            data-animate="fade-up"
            data-delay="80"
          >
            <span className="hero-line-reveal inline-block" style={{ animationDelay: '0.05s' }}>
              Shop <span className="hero-shimmer-word">Smarter.</span>
            </span>
            <br />
            <em
              className="not-italic gradient-text hero-line-reveal inline-block"
              style={{ animationDelay: '0.18s' }}
            >
              Live Better.
            </em>
            <br />
            <span
              className="headline-outline hero-line-reveal inline-block"
              style={{ animationDelay: '0.32s' }}
            >
              On Campus.
            </span>
          </h1>

          {/* Subtext */}
          <p
            className="text-[13px] sm:text-[15px] leading-[1.7] sm:leading-[1.85] text-white/45 mb-6 sm:mb-9 max-w-[460px] mx-auto lg:mx-0 px-2 sm:px-0"
            data-animate="fade-up"
            data-delay="200"
          >
            Discover thousands of products from verified campus sellers. Fast delivery,
            unbeatable prices, and exclusive student deals — all in one place.
          </p>

          {/* CTA buttons */}
          <div
            className="flex items-center gap-2 sm:gap-3 flex-wrap mb-8 sm:mb-12 justify-center lg:justify-start"
            data-animate="fade-up"
            data-delay="300"
          >
            <Link href="/shop" className="cta-primary inline-flex items-center gap-2 text-white px-6 sm:px-8 py-[13px] sm:py-[14px] rounded-full text-[13px] sm:text-[15px] font-bold">
              <span>Start Shopping</span>
              <FontAwesomeIcon icon={faArrowRight} className="cta-arrow text-xs sm:text-sm" />
            </Link>
            <Link href="/flash-sales" className="cta-secondary inline-flex items-center gap-2 text-white/75 px-6 sm:px-8 py-[13px] sm:py-[14px] rounded-full text-[13px] sm:text-[15px] font-bold hover:text-white">
              <FontAwesomeIcon icon={faFire} className="text-xs sm:text-sm" />
              Flash Sales
            </Link>
          </div>

          {/* Stats bar */}
          <div
            className="stats-glass flex items-center px-4 sm:px-[24px] py-[14px] sm:py-[20px] rounded-[18px] sm:rounded-[22px] w-full justify-center lg:justify-start"
            data-animate="fade-up"
            data-delay="400"
            aria-label="JOVO statistics"
          >
            {([
              { count: '50000', label: 'Products'     },
              null,
              { count: '5000',  label: 'Sellers'      },
              null,
              { count: '30',    label: 'Min Delivery' },
            ] as const).map((item, i) =>
              item === null ? (
                <div key={i} className="stats-divider w-px h-7 sm:h-10 mx-3 sm:mx-4" aria-hidden="true" />
              ) : (
                <div key={i} className="flex-1 text-center">
                  <strong
                    className="stat-num stat-glow block text-[19px] sm:text-[23px] font-extrabold font-display gradient-text"
                    data-count={item.count}
                  >
                    0
                  </strong>
                  <span className="text-[8px] sm:text-[10px] text-white/35 font-semibold uppercase tracking-[.1em]">
                    {item.label}
                  </span>
                </div>
              )
            )}
          </div>

        </div>

        {/* ── RIGHT: Floating product cards (desktop only) ────────────────────── */}
        <div className="relative hidden lg:block" aria-hidden="true">
          <div className="relative h-[480px] w-full">

            {/* Ambient glow ring behind cards */}
            <div className="hero-ring-glow absolute top-1/2 right-[100px] -translate-y-1/2 w-[300px] h-[300px] rounded-full" />

            {/* Product cards */}
            {floatCards.map((card, i) => (
              <div
                key={i}
                className={`hero-card absolute rounded-[22px] overflow-hidden ${FLOAT_ANIMS[i]}`}
                style={{
                  top:              CARD_POSITIONS[i].top,
                  right:            CARD_POSITIONS[i].right,
                  width:            CARD_POSITIONS[i].width,
                  animationDelay:   CARD_POSITIONS[i].floatDelay,
                }}
              >
                {/* Image */}
                <div className="relative" style={{ height: '162px' }}>
                  <Image
                    src={card.src}
                    alt={card.alt}
                    width={400}
                    height={162}
                    className="w-full h-full object-cover"
                  />
                  <div className="hero-card-img-veil absolute inset-0" />
                </div>

                {/* Info row */}
                <div className="hero-card-info px-[14px] py-[12px] flex justify-between items-center">
                  <span className="text-[12px] font-bold text-white/88 line-clamp-1">{card.name}</span>
                  <span className="text-[13px] font-extrabold gradient-text whitespace-nowrap">{card.price}</span>
                </div>

                {/* Badge */}
                {card.badge && (
                  <span className={`${card.badgeCls} absolute top-[10px] right-[10px] text-white text-[10px] font-extrabold px-[9px] py-[4px] rounded-full`}>
                    {card.badge}
                  </span>
                )}

                {/* Card shine sweep */}
                <div className="hero-card-shine absolute inset-0 pointer-events-none" />
              </div>
            ))}

            {/* Live purchase notification */}
            <div className="hero-notif absolute left-0 top-[140px] rounded-[16px] px-[14px] py-[12px] flex items-center gap-[10px] animate-float-y z-10">
              <span className="text-[22px]">🛍️</span>
              <div className="flex flex-col">
                <strong className="text-[11px] font-bold text-white leading-tight">Chidi just bought</strong>
                <span className="text-[10px] text-white/55">Airpods Pro — 2 mins ago</span>
              </div>
              <span className="notif-live ml-1" />
            </div>

            {/* Delivery tag */}
            <div
              className="cta-primary absolute left-30 bottom-14 rounded-full w-fit px-4 py-[10px] flex  items-center gap-[5px] text-[12px] font-bold text-white z-10 whitespace-nowrap animate-float-y"
              style={{ animationDelay: '0.7s' }}
            >
              <FontAwesomeIcon icon={faTruckFast} className="text-xs" />
              <span>Delivered in <strong>28 min</strong></span>
            </div>

          </div>
        </div>
      </div>

      {/* ══ SCROLL INDICATOR ════════════════════════════════════════════════════ */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-[8px] z-10" aria-hidden="true">
        <div className="scroll-mouse w-[22px] h-[36px] border-2 rounded-[11px] flex justify-center pt-[6px]">
          <div className="w-[3px] h-[7px] bg-brand-orange/60 rounded-sm animate-scroll-wheel" />
        </div>
        <span className="text-[9px] text-white/25 tracking-[.15em] uppercase font-semibold">Scroll</span>
      </div>

    </section>
  )
}