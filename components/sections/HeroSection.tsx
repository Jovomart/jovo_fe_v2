'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faBolt, faTruckFast, faFire, faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { useScrollAnimations, useCounterAnimations } from '@/hooks/useScrollAnimation'

const stats = [
  { count: '50000', label: 'Products'     },
  { count: '5000',  label: 'Sellers'      },
  { count: '30',    label: 'Min. Delivery'},
]

const trust = ['Verified Sellers', 'Secure Payments', 'Easy Returns']

export default function HeroSection() {
  useScrollAnimations()
  useCounterAnimations()

  return (
    <section className="hm-root" aria-label="JOVO — Shop Smarter On Campus">

      {/* ── Background ── */}
      <div className="hm-bg" aria-hidden="true">
        <div className="hm-bg-grain" />
        <div className="hm-bg-radial-r" />
        <div className="hm-bg-radial-l" />
        <div className="hm-bg-grid" />
        <div className="hm-bg-line" />
      </div>

      {/* ── Main layout ── */}
      <div className="hm-wrap">

        {/* ════ LEFT ════ */}
        <div className="hm-left">

          {/* Live badge */}
          <div className="hm-badge">
            <span className="hm-badge-dot" aria-hidden="true" />
            <FontAwesomeIcon icon={faBolt} className="text-brand-orange text-[10px]" aria-hidden="true" />
            <span>Nigeria's #1 Campus Marketplace</span>
          </div>

          {/* Giant headline — 3 treatments */}
          <h1 className="hm-h1" aria-label="Shop Smarter. On Campus.">
            <span className="hm-line hm-line-1">
              <span>SHOP</span>
            </span>
            <span className="hm-line hm-line-2">
              <span>SMARTER.</span>
            </span>
            <span className="hm-line hm-line-3">
              <span>ON CAMPUS.</span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hm-sub">
            Thousands of verified campus sellers. Unbeatable student prices,
            lightning-fast delivery, and daily flash deals — all in one place.
          </p>

          {/* CTAs */}
          <div className="hm-ctas">
            <Link href="/shop" className="hm-cta-red">
              Start Shopping
              <FontAwesomeIcon icon={faArrowRight} className="hm-cta-arrow" aria-hidden="true" />
            </Link>
            <Link href="/flash-sales" className="hm-cta-ghost">
              <FontAwesomeIcon icon={faFire} className="text-brand-orange" aria-hidden="true" />
              Flash Deals
            </Link>
          </div>

          {/* Stats */}
          <div className="hm-stats" aria-label="JOVO stats">
            {stats.map((s, i) => (
              <div key={s.label} className="hm-stat-grp">
                {i > 0 && <div className="hm-stat-sep" aria-hidden="true" />}
                <div className="hm-stat">
                  <strong
                    className="hm-stat-num gradient-text"
                    data-count={s.count}
                  >
                    0
                  </strong>
                  <span className="hm-stat-lbl">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ════ RIGHT ════ */}
        <div className="hm-right" aria-hidden="true">

          {/* Image mosaic — CSS Grid, not absolute positioned cards */}
          <div className="hm-mosaic">

            {/* A — tall left */}
            <div className="hm-img hm-img-a">
              <Image
                src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&auto=format&fit=crop&q=80"
                alt="iPhone 15 Pro"
                fill
                className="object-cover"
                sizes="25vw"
                priority
              />
              <div className="hm-img-veil" />
              <div className="hm-img-tag">
                <span>📱 Phones</span>
                <strong className="gradient-text">₦850,000</strong>
              </div>
            </div>

            {/* B — top right */}
            <div className="hm-img hm-img-b">
              <Image
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80"
                alt="Air Jordan Sneakers"
                fill
                className="object-cover"
                sizes="20vw"
              />
              <div className="hm-img-veil" />
              <div className="hm-img-tag">
                <span>👟 Fashion</span>
                <strong className="gradient-text">₦95,000</strong>
              </div>
            </div>

            {/* C — bottom right */}
            <div className="hm-img hm-img-c">
              <Image
                src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80"
                alt="Laptop"
                fill
                className="object-cover"
                sizes="20vw"
              />
              <div className="hm-img-veil" />
              <div className="hm-img-tag">
                <span>💻 Computing</span>
                <strong className="gradient-text">₦1,400,000</strong>
              </div>
            </div>

            {/* Flash sale card — grid-breaking overlap */}
            <div className="hm-flash">
              <span className="hm-flash-dot" />
              <div>
                <p className="hm-flash-eyebrow">Live Flash Sale</p>
                <p className="hm-flash-main gradient-text">Up to 60% Off</p>
              </div>
              <FontAwesomeIcon icon={faBolt} className="text-brand-orange text-sm ml-auto flex-shrink-0" />
            </div>

            {/* Delivery pill */}
            <div className="hm-delivery">
              <FontAwesomeIcon icon={faTruckFast} className="text-brand-orange" />
              <span>Delivered in <strong>28 min</strong></span>
            </div>
          </div>

          {/* Trust strip */}
          <div className="hm-trust">
            {trust.map((t, i) => (
              <span key={t} className="hm-trust-item">
                {i > 0 && <span className="hm-trust-sep" />}
                <FontAwesomeIcon icon={faCircleCheck} className="hm-trust-icon" />
                {t}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Scroll indicator */}
      <div className="hm-scroll" aria-hidden="true">
        <div className="hm-scroll-track">
          <div className="hm-scroll-thumb animate-scroll-wheel" />
        </div>
        <span>Scroll</span>
      </div>

    </section>
  )
}