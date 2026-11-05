'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const categories = [
  { id: 1, name: 'Groceries & Snacks', route: '/groceries', image: 'https://plus.unsplash.com/premium_photo-1661380663916-b47a2b62ed0b?w=1000&auto=format&fit=crop&q=60' },
  { id: 2, name: 'Perishable Items', route: '/perishable', image: 'https://images.unsplash.com/photo-1699581913577-cc877cdae36b?w=1000&auto=format&fit=crop&q=60' },
  { id: 3, name: 'Beauty & Cosmetics', route: '/beauty-deals', image: 'https://images.unsplash.com/photo-1586359526010-3b87482012ef?w=1000&auto=format&fit=crop&q=60' },
  { id: 4, name: 'Personal Care', route: '/personal-care', image: 'https://plus.unsplash.com/premium_photo-1679049601788-357a729a2e78?w=1000&auto=format&fit=crop&q=60' },
  { id: 5, name: 'Cleaning & Hygiene', route: '/cleaning-hygiene', image: 'https://plus.unsplash.com/premium_photo-1765302374657-1cbd4af23327?w=1000&auto=format&fit=crop&q=60' },
  { id: 6, name: 'Men & Women Fashion', route: '/fashion-deals', image: 'https://images.unsplash.com/photo-1635650805023-f2529440b5aa?w=1000&auto=format&fit=crop&q=60' },
]

const tones = ['bg-sky', 'bg-mint', 'bg-lilac', 'bg-peach', 'bg-cream-light', 'bg-sky-soft']

const SuppliesSection = () => (
  <section className="bg-cream pt-14 sm:pt-20" aria-label="Premium supplies">
    <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[.18em] text-ink/35">
            Everyday essentials
          </p>
          <h2 className="mt-2.5 font-display text-[30px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[40px]">
            Premium supplies
          </h2>
        </div>
        <p className="max-w-[300px] text-[12px] leading-[1.7] text-ink/45">
          The basics you run out of mid-week, restocked by sellers on your campus.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {categories.map((category, i) => (
          <Link
            key={category.id}
            href={category.route}
            className={`group flex flex-col rounded-[22px] ${tones[i % tones.length]} p-2.5 transition-transform duration-300 hover:-translate-y-1`}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-white/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={category.image}
                alt={category.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              />
            </div>
            <div className="flex items-center justify-between gap-2 px-1 pb-1 pt-3">
              <h3 className="truncate text-[12.5px] font-medium tracking-tight text-ink">
                {category.name}
              </h3>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                <ArrowRight size={9} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
)

export default SuppliesSection
