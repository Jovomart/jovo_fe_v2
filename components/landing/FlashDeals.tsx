'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Bolt, Check, ShoppingBag } from 'lucide-react'
import { products } from '@/data/products'
import { useCountdown } from '@/hooks/useCountdown'
import ProductCard from '@/components/ui/ProductCard'
import WaveDivider from '@/components/ui/WaveDivider'

const roundBtn =
  'flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink/50 ring-1 ring-ink/10 transition-all duration-200 hover:bg-ink hover:text-white'

export default function FlashDeals() {
  const { hours, mins, secs } = useCountdown()
  const [added, setAdded] = useState(false)
  const [active, setActive] = useState(0)

  const deals = (products as any[]).filter((p) => p.category === 'flash-sales').slice(0, 4)
  if (!deals.length) return null

  const product = deals[active]
  const sold = Math.min(96, Math.max(18, 100 - (product.stock ?? 50)))
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0

  const go = (dir: 1 | -1) => setActive((prev) => (prev + dir + deals.length) % deals.length)

  return (
    <section className="relative bg-sky pt-14 sm:pt-20" aria-label="Flash sales">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="text-center" data-animate="fade-up">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-[10.5px] font-semibold text-ink/60 ring-1 ring-ink/[.05]">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-brand-orange" aria-hidden="true" />
            Live now
          </span>
          <h2 className="mt-4 text-balance font-display text-[31px] font-medium leading-[1.06] tracking-[-0.03em] sm:text-[42px]">
            Deals that move fast
          </h2>
          <p className="mx-auto mt-3 max-w-[440px] text-pretty text-[12.5px] leading-[1.75] text-ink/55 sm:text-[13.5px]">
            Deep student discounts, refreshed daily. When the timer hits zero, the price goes back
            up.
          </p>
        </div>

        <div className="mt-8 grid items-start gap-3.5 lg:mt-10 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Countdown + lineup */}
          <div className="rounded-[26px] bg-ink p-5 text-white sm:p-6">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] text-white/40">
              <Bolt size={10} />
              Ends today
            </div>

            <div className="mt-4 flex items-end gap-1.5">
              {[
                { value: hours, label: 'hrs' },
                { value: mins, label: 'min' },
                { value: secs, label: 'sec' },
              ].map(({ value, label }, i) => (
                <div key={label} className="flex items-end gap-1.5">
                  {i > 0 && (
                    <span className="pb-2.5 font-mono text-[16px] text-white/25" aria-hidden="true">
                      :
                    </span>
                  )}
                  <div className="rounded-xl bg-white/[.07] px-2.5 py-2 text-center sm:px-3">
                    <span className="block font-mono text-[24px] leading-none tracking-tight sm:text-[26px]">
                      {value}
                    </span>
                    <span className="mt-1.5 block text-[8.5px] uppercase tracking-[.14em] text-white/35">
                      {label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="text-[9.5px] font-semibold uppercase tracking-[.16em] text-white/35">
                Today&apos;s lineup
              </p>
              <ul className="mt-2 space-y-0.5">
                {deals.map((item, i) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActive(i)}
                      aria-pressed={i === active}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2.5 text-left text-[11.5px] transition-colors duration-200 ${
                        i === active
                          ? 'bg-white/10 text-white'
                          : 'text-white/45 hover:bg-white/5 hover:text-white/70'
                      }`}
                    >
                      <span className="truncate">{item.name}</span>
                      <span className="shrink-0 font-mono text-[10px] text-white/45">
                        ₦{(item.price / 1000).toFixed(0)}k
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/flash-sales"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-[12px] font-semibold text-ink transition-colors duration-200 hover:bg-mint"
            >
              View all flash deals
              <ArrowRight size={11} />
            </Link>
          </div>

          {/* Showcase */}
          <div className="rounded-[26px] bg-white p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2 sm:items-center sm:gap-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-sand sm:aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={product.image}
                  src={product.image}
                  alt={product.name}
                  className="animate-fade-in h-full w-full object-cover"
                />
                <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold text-white">
                  −{discount}%
                </span>
              </div>

              <div>
                <p className="text-[9.5px] font-semibold uppercase tracking-[.16em] text-ink/35">
                  Flash deal
                </p>
                <h3 className="mt-1.5 text-balance font-display text-[19px] font-medium leading-snug tracking-[-0.015em] sm:text-[21px]">
                  {product.name}
                </h3>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-[21px] font-semibold tracking-tight text-ink">
                    ₦{product.price.toLocaleString()}
                  </span>
                  {product.oldPrice && (
                    <span className="text-[11.5px] text-ink/35 line-through">
                      ₦{product.oldPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <div
                    className="h-1.5 overflow-hidden rounded-full bg-sand"
                    role="progressbar"
                    aria-valuenow={sold}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${sold}% claimed`}
                  >
                    <div
                      className="h-full rounded-full bg-ink transition-[width] duration-700 ease-out"
                      style={{ width: `${sold}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[10.5px] text-ink/40">
                    {sold}% claimed · {100 - sold}% left
                  </p>
                </div>

                <Link
                  href={`/product/${product.id}`}
                  onClick={() => setAdded(true)}
                  className={`mt-4 flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[12px] font-semibold transition-colors duration-200 ${
                    added ? 'bg-mint text-ink' : 'bg-ink text-white hover:bg-ink/85'
                  }`}
                >
                  {added ? <Check size={11} /> : <ShoppingBag size={11} />}
                  {added ? 'Opening deal' : 'View flash deal'}
                </Link>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <button onClick={() => go(-1)} aria-label="Previous flash deal" className={roundBtn}>
                      <ArrowLeft size={11} />
                    </button>
                    <button onClick={() => go(1)} aria-label="Next flash deal" className={roundBtn}>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                  <span className="font-mono text-[10.5px] text-ink/30">
                    {active + 1} / {deals.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="mt-4 grid grid-cols-4 gap-1.5 sm:gap-2">
              {deals.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => setActive(i)}
                  aria-label={`Show ${item.name}`}
                  aria-pressed={i === active}
                  className={`relative aspect-[4/3] overflow-hidden rounded-xl transition-all duration-200 ${
                    i === active ? 'ring-2 ring-ink' : 'opacity-55 ring-1 ring-ink/10 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <WaveDivider fill="#FFFFFF" className="mt-12 sm:mt-16" />
    </section>
  )
}
