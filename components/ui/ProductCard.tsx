'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Heart, Star } from 'lucide-react'

interface Props {
  product: any
  className?: string
}

/** Card used by every product rail and the landing page. */
export default function ProductCard({ product, className = '' }: Props) {
  const [wished, setWished] = useState(false)

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null

  return (
    <article
      className={`product-card group flex flex-col rounded-[22px] bg-white p-2.5 ring-1 ring-ink/[.06] transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${className}`}
      role="listitem"
    >
      <div className="relative aspect-[5/4] overflow-hidden rounded-[16px] bg-sand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {discount && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-ink px-2 py-[3px] text-[9.5px] font-semibold text-white">
            −{discount}%
          </span>
        )}

        <button
          onClick={() => setWished((w) => !w)}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={wished}
          className={`absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur transition-all duration-200 hover:scale-105 ${
            wished ? 'text-brand-red' : 'text-ink/40 hover:text-brand-red'
          }`}
        >
          <Heart size={12} className={wished ? 'fill-current' : ''} />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-1 pt-2.5">
        <p className="text-[9px] font-semibold uppercase tracking-[.14em] text-ink/35">
          {(product.brand || product.category || 'JOVO').replace(/-/g, ' ')}
        </p>

        <h3 className="mt-1 line-clamp-2 min-h-[32px] text-[12.5px] font-medium leading-[1.35] text-ink">
          <Link href={`/product/${product.id}`} className="transition-colors hover:text-ink/60">
            {product.name}
          </Link>
        </h3>

        {typeof product.rating === 'number' && (
          <div className="mt-1.5 flex items-center gap-1 text-[9.5px] text-ink/35">
            <Star size={8} className="fill-brand-orange text-brand-orange" aria-hidden="true" />
            <span className="text-ink/55">{product.rating}</span>
            <span aria-hidden="true">·</span>
            <span>{product.reviews ?? 0} reviews</span>
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
          <span className="text-[14px] font-semibold tracking-tight text-ink">
            ₦{product.price?.toLocaleString()}
          </span>
          {product.oldPrice && (
            <span className="text-[10px] text-ink/30 line-through">
              ₦{product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>

        <Link
          href={`/product/${product.id}`}
          aria-label={`View ${product.name}`}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full bg-ink py-2 text-[11.5px] font-semibold text-white transition-colors duration-200 hover:bg-ink/85"
        >
          View deal
          <ArrowUpRight size={11} />
        </Link>
      </div>
    </article>
  )
}
