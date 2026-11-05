'use client'
import Link from 'next/link'
import { ArrowRight, Bolt, Zap } from 'lucide-react'
import { products } from '@/data/products'
import { useCountdown } from '@/hooks/useCountdown'
import ProductCard from '@/components/ui/ProductCard'

const FlashSales = () => {
  const { hours, mins, secs } = useCountdown()
  const deals = (products as any[]).filter((p) => p.category === 'flash-sales').slice(0, 4)

  return (
    <section className="pt-12 sm:pt-16" aria-label="Flash sales">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <div className="relative overflow-hidden rounded-[26px] bg-ink px-5 py-5 text-white sm:px-7 sm:py-6">
          <div className="dotgrid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/10">
                <Bolt size={16} className="text-peach" />
              </span>
              <div>
                <h2 className="font-display text-[17px] font-semibold leading-none tracking-tight sm:text-[19px]">
                  Flash sales
                </h2>
                <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-white/45">
                  <Zap size={10} />
                  Ends in
                  <span className="font-mono tracking-wider text-peach">
                    {hours}:{mins}:{secs}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-end gap-1.5 sm:flex">
                {[
                  { value: hours, label: 'hrs' },
                  { value: mins, label: 'min' },
                  { value: secs, label: 'sec' },
                ].map(({ value, label }) => (
                  <div key={label} className="rounded-xl bg-white/[.07] px-2.5 py-1.5 text-center">
                    <span className="block font-mono text-[16px] leading-none">{value}</span>
                    <span className="mt-1 block text-[8px] uppercase tracking-[.14em] text-white/35">{label}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/flash-sales"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-[11.5px] font-semibold text-ink transition-colors duration-200 hover:bg-mint"
              >
                See all
                <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4" role="list">
          {deals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FlashSales
