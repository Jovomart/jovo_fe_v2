'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { products } from '@/data/products'
import ProductCard from '@/components/ui/ProductCard'

type Tone = 'sky' | 'mint' | 'lilac' | 'peach' | 'sand' | 'cream'

const tones: Record<Tone, { chip: string; dot: string }> = {
  sky: { chip: 'bg-sky', dot: 'bg-sky-deep' },
  mint: { chip: 'bg-mint', dot: 'bg-mint-deep' },
  lilac: { chip: 'bg-lilac', dot: 'bg-lilac-deep' },
  peach: { chip: 'bg-peach', dot: 'bg-peach' },
  sand: { chip: 'bg-sand', dot: 'bg-ink/20' },
  cream: { chip: 'bg-cream-deep', dot: 'bg-cream-deep' },
}

interface Props {
  title: string
  subtitle: string
  category: string
  href: string
  eyebrow?: string
  tone?: Tone
  limit?: number
}

/** One restyled deal rail - every category rail on the storefront renders through this. */
export default function DealRail({
  title,
  subtitle,
  category,
  href,
  eyebrow,
  tone = 'sky',
  limit = 4,
}: Props) {
  const items = (products as any[]).filter((p) => p.category === category).slice(0, limit)
  if (!items.length) return null

  const t = tones[tone] || tones.sky

  return (
    <section className="relative pt-11 sm:pt-14" aria-label={title}>
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full ${t.chip} px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[.16em] text-ink/55`}
            >
              <span className={`h-1 w-1 rounded-full ${t.dot}`} aria-hidden="true" />
              {eyebrow || 'Deal rail'}
            </span>
            <h2 className="mt-2.5 font-display text-[24px] font-medium leading-[1.1] tracking-[-0.03em] text-ink sm:text-[30px]">
              {title}
            </h2>
            <p className="mt-1.5 max-w-[420px] text-[12px] leading-[1.65] text-ink/45 sm:text-[12.5px]">
              {subtitle}
            </p>
          </div>

          <Link
            href={href}
            className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-[11.5px] font-semibold text-ink/65 ring-1 ring-ink/[.07] transition-colors duration-200 hover:bg-white/70 hover:text-ink"
          >
            See all
            <ArrowRight size={11} />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4" role="list">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
