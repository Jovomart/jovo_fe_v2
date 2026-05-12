'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMobileScreen, faTv, faSpa, faShirt, faLaptop,
  faGamepad, faArrowUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons'
import { CATEGORIES } from '@/data'

const iconMap: Record<string, any> = {
  'mobile-screen': faMobileScreen,
  tv: faTv,
  spa: faSpa,
  shirt: faShirt,
  laptop: faLaptop,
  gamepad: faGamepad,
}

export default function CategoriesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
      },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="cat2-section" aria-label="Shop by category">
      <span className="cat2-watermark" aria-hidden="true">EXPLORE</span>
      <div className="cat2-top-line" aria-hidden="true" />

      <div className={`cat2-header${visible ? ' cat2--in' : ''}`}>
        <div className="cat2-wrap">
          <div className="cat2-header__row">
            <div className="cat2-header__copy">
              <span className="cat2-eyebrow" aria-label="Section label">
                <span className="cat2-eyebrow__dot" aria-hidden="true" />
                Explore
              </span>
              <h2 className="cat2-h2">
                Shop by{' '}
                <em className="cat2-h2__accent">Category</em>
              </h2>
              <p className="cat2-sub">
                From gadgets to groceries — everything you need, right on campus.
              </p>
            </div>
            <div className="cat2-header__num" aria-hidden="true">02</div>
          </div>
        </div>
      </div>

      <div className="cat2-wrap">
        <div className={`cat2-grid${visible ? ' cat2--in' : ''}`} role="list" aria-label="Product categories">
          {CATEGORIES.map((cat, idx) => (
            <article
              key={cat.id}
              className="cat2-card"
              role="listitem"
              style={{ '--ci': idx, '--cc': cat.color } as React.CSSProperties}
            >
              <Link href={cat.href} className="cat2-card__link" aria-label={`Shop ${cat.name}`}>
                <div className="cat2-card__photo">
                  <Image
                    src={cat.image}
                    alt={cat.alt}
                    fill
                    className="cat2-card__img"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="cat2-card__veil" aria-hidden="true" />
                  <span className="cat2-card__ghost" aria-hidden="true">{cat.name}</span>
                  <div className="cat2-card__scan" aria-hidden="true" />
                </div>

                <div className="cat2-card__body">
                  <div className="cat2-card__icon" aria-hidden="true">
                    <FontAwesomeIcon icon={iconMap[cat.icon] ?? faMobileScreen} />
                  </div>
                  <div className="cat2-card__text">
                    <h3 className="cat2-card__name">{cat.name}</h3>
                    <span className="cat2-card__count">{cat.count}</span>
                  </div>
                  <span className="cat2-card__cta" aria-hidden="true">
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                  </span>
                </div>
                <div className="cat2-card__glow" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}