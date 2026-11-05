'use client'
import Link from 'next/link'
import { ArrowRight, Gamepad2, Laptop, Plug, Shirt, ShoppingBasket, Smartphone, Store } from 'lucide-react'
import { useScrollAnimations } from '@/hooks/useScrollAnimations'
import WaveDivider from '@/components/ui/WaveDivider'
import Doodle from '@/components/ui/Doodle'

const bubbles = [
  { href: '/phone-deals', icon: Smartphone, label: 'Phones', bg: 'bg-sky' },
  { href: '/computing-deals', icon: Laptop, label: 'Computing', bg: 'bg-mint' },
  { href: '/fashion-deals', icon: Shirt, label: 'Fashion', bg: 'bg-lilac' },
  { href: '/gaming-deals', icon: Gamepad2, label: 'Gaming', bg: 'bg-peach' },
  { href: '/groceries', icon: ShoppingBasket, label: 'Groceries', bg: 'bg-cream-light' },
  { href: '/appliances-deals', icon: Plug, label: 'Appliances', bg: 'bg-sky-soft' },
]

const campuses = ['FUTO', 'UNILAG', 'OAU', 'ABU Zaria', 'UNN', 'UNIBEN']

export default function LandingHero() {
  useScrollAnimations()

  return (
    <section
      className="relative overflow-hidden bg-cream pt-10 sm:pt-14 lg:pt-16"
      aria-label="JOVO - Nigeria's campus marketplace"
    >
      <div className="paper pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -right-32 -top-20 h-[380px] w-[380px] rounded-full bg-sky/45 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-24 top-40 h-[320px] w-[320px] rounded-full bg-peach/50 blur-3xl"
        aria-hidden="true"
      />

      <Doodle className="pointer-events-none absolute -left-32 top-24 hidden w-[400px] opacity-60 lg:block xl:-left-16 xl:w-[470px]" />

      <div className="relative z-10 mx-auto max-w-[1000px] px-5 text-center sm:px-8">
        <div
          className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-[10.5px] font-medium text-ink/60 ring-1 ring-ink/[.05] backdrop-blur"
          data-animate="fade-up"
        >
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-mint-deep" aria-hidden="true" />
          Live on 20+ Nigerian campuses
        </div>

        <h1
          className="mt-5 text-balance font-display text-[36px] font-medium leading-[1.04] tracking-[-0.035em] text-ink sm:text-[52px] lg:text-[62px]"
          data-animate="fade-up"
          data-delay="80"
        >
          Campus shopping,
          <br className="hidden sm:block" /> made effortless.
        </h1>

        <p
          className="mx-auto mt-5 max-w-[520px] text-pretty text-[13px] leading-[1.75] text-ink/55 sm:text-[14.5px]"
          data-animate="fade-up"
          data-delay="160"
        >
          Buy and sell anything on campus - verified sellers, 30-minute delivery and
          student-only prices across 50,000+ products.
        </p>

        <div
          className="mt-7 flex flex-wrap items-center justify-center gap-2.5"
          data-animate="fade-up"
          data-delay="240"
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[13px] font-semibold text-white shadow-pill transition-all duration-200 hover:bg-ink/85 active:scale-[.98]"
          >
            Start shopping
            <ArrowRight size={13} />
          </Link>
          <Link
            href="/become-seller"
            className="inline-flex items-center gap-2 rounded-full bg-sky px-5 py-3 text-[13px] font-semibold text-ink ring-1 ring-ink/[.06] transition-all duration-200 hover:bg-sky-deep active:scale-[.98]"
          >
            <Store size={13} />
            Sell on JOVO
          </Link>
        </div>

        {/* Category bubbles */}
        <div className="relative mt-10 sm:mt-12" data-animate="fade-up" data-delay="320">
          <div
            className="absolute left-1/2 top-7 hidden h-px w-[76%] -translate-x-1/2 border-t border-dashed border-ink/15 sm:block"
            aria-hidden="true"
          />
          <ul className="no-scrollbar relative flex items-start justify-start gap-2 overflow-x-auto px-1 pb-1 sm:justify-center sm:gap-4">
            {bubbles.map(({ href, icon: Icon, label, bg }, i) => (
              <li key={href} className="animate-float shrink-0" style={{ animationDelay: `${i * 0.35}s` }}>
                <Link href={href} className="group flex w-[62px] flex-col items-center gap-2 sm:w-[74px]">
                  <span
                    className={`flex h-[54px] w-[54px] items-center justify-center rounded-full ${bg} text-ink shadow-soft ring-1 ring-ink/[.07] transition-transform duration-300 group-hover:scale-105 sm:h-16 sm:w-16`}
                  >
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  <span className="text-[10px] font-medium text-ink/50 transition-colors group-hover:text-ink">
                    {label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Campus trust row */}
      <div className="relative z-10 mx-auto mt-9 max-w-[1100px] px-5 pb-8 sm:mt-12 sm:pb-12">
        <p className="text-center text-[10px] font-medium uppercase tracking-[.18em] text-ink/35">
          Trusted by 50,000+ students at
        </p>
        <ul className="mt-3.5 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 sm:gap-x-10">
          {campuses.map((campus, i) => (
            <li
              key={campus}
              className={`text-[13px] tracking-tight text-ink/35 sm:text-[14.5px] ${
                i % 2 === 0 ? 'font-display font-semibold' : 'font-body font-medium'
              }`}
            >
              {campus}
            </li>
          ))}
        </ul>
      </div>

      <WaveDivider fill="#FFFFFF" />
    </section>
  )
}
