import Link from 'next/link'
import { ArrowRight, Check, Store } from 'lucide-react'
import Doodle from '@/components/ui/Doodle'
import WaveDivider from '@/components/ui/WaveDivider'

const benefits = ['No listing fees', 'Verified seller badge', 'Weekly payouts']

export default function SellerBanner() {
  return (
    <section className="relative bg-ink" aria-label="Become a seller on JOVO">
      <div className="mx-auto max-w-[1100px] px-4 pt-14 sm:px-6 sm:pt-20">
        <div className="relative overflow-hidden rounded-[30px] bg-cream px-6 pb-24 pt-10 text-center sm:px-10 sm:pb-28 sm:pt-14">
          <Doodle className="pointer-events-none absolute -bottom-32 left-1/2 w-[520px] -translate-x-1/2 opacity-40" />

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[.18em] text-ink/40">
              <Store size={10} />
              For sellers
            </span>

            <h2 className="mx-auto mt-3 max-w-[560px] text-balance font-display text-[27px] font-medium leading-[1.08] tracking-[-0.03em] sm:text-[38px]">
              Turn your hustle into a storefront.
            </h2>

            <p className="mx-auto mt-3 max-w-[440px] text-pretty text-[12.5px] leading-[1.75] text-ink/55 sm:text-[13.5px]">
              List for free, reach thousands of students and get paid weekly. We handle the riders,
              the payments and the trust badges.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <Link
                href="/become-seller"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[12.5px] font-semibold text-white shadow-pill transition-all duration-200 hover:bg-ink/85 active:scale-[.98]"
              >
                Start selling free
                <ArrowRight size={11} />
              </Link>
              <Link
                href="/become-seller"
                className="inline-flex items-center rounded-full bg-white px-5 py-3 text-[12.5px] font-semibold text-ink ring-1 ring-ink/10 transition-colors duration-200 hover:bg-white/70"
              >
                Seller login
              </Link>
            </div>

            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-1.5 text-[10.5px] font-medium text-ink/45">
                  <Check size={9} className="text-ink/35" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <WaveDivider fill="#FFFFFF" className="mt-10 sm:mt-12" />
    </section>
  )
}
