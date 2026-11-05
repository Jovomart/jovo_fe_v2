'use client'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

const ServicesSection = () => (
  <section className="pt-11 sm:pt-14" aria-label="Campus services">
    <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
      <div className="relative overflow-hidden rounded-[26px] bg-sky px-6 py-7 sm:px-9 sm:py-9">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/40 blur-2xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-[10px] font-semibold text-ink/55">
              <Sparkles size={10} />
              Campus services
            </span>
            <h3 className="mt-3 max-w-[420px] text-balance font-display text-[22px] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[28px]">
              Need a service? We have got you.
            </h3>
            <p className="mt-2 max-w-[460px] text-[12px] leading-[1.7] text-ink/55 sm:text-[12.5px]">
              Cleaning, barbing, laundry, repairs, tutoring and more - book trusted campus providers instantly.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-ink px-5 py-3 text-[12.5px] font-semibold text-white shadow-pill transition-all duration-200 hover:bg-ink/85 active:scale-[.98]"
          >
            Visit services
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  </section>
)

export default ServicesSection
