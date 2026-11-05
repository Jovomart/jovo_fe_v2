import Link from 'next/link'
import { Apple, Check, Play, Smartphone } from 'lucide-react'
import WaveDivider from '@/components/ui/WaveDivider'

const perks = [
  'Deal alerts the moment a flash sale drops',
  'Live rider tracking to your hostel',
  'App-only coupons and student cashback',
]

export default function AppPromo() {
  return (
    <section className="relative bg-white pt-14 sm:pt-20" aria-label="Download the JOVO app">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <div
          className="relative overflow-hidden rounded-[30px] bg-sky px-6 py-9 sm:px-10 sm:py-12"
          data-animate="fade-up"
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/40 blur-2xl"
            aria-hidden="true"
          />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-[10px] font-semibold text-ink/55">
                <Smartphone size={10} />
                The JOVO app
              </span>

              <h2 className="mt-4 max-w-[420px] text-balance font-display text-[27px] font-medium leading-[1.07] tracking-[-0.03em] sm:text-[36px]">
                The whole market, in your pocket.
              </h2>

              <p className="mt-3 max-w-[400px] text-[12.5px] leading-[1.75] text-ink/55">
                Faster checkout, saved addresses and the best deals before anyone else.
              </p>

              <ul className="mt-5 space-y-2.5">
                {perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5 text-[12px] text-ink/65">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/80 text-ink/60">
                      <Check size={8} />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  { icon: Apple, top: 'Download on the', bottom: 'App Store', label: 'Download on the App Store' },
                  { icon: Play, top: 'Get it on', bottom: 'Google Play', label: 'Get it on Google Play' },
                ].map(({ icon: Icon, top, bottom, label }) => (
                  <Link
                    key={bottom}
                    href="#"
                    aria-label={label}
                    className="flex items-center gap-2.5 rounded-full bg-ink px-4 py-2.5 text-white transition-all duration-200 hover:bg-ink/85 active:scale-[.98]"
                  >
                    <Icon size={17} />
                    <span className="text-left leading-tight">
                      <span className="block text-[8px] text-white/55">{top}</span>
                      <span className="block text-[12px] font-semibold">{bottom}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Phone mock */}
            <div className="relative mx-auto w-[210px] sm:w-[232px]" aria-hidden="true">
              <div className="absolute -inset-8 rounded-full bg-white/40 blur-2xl" />
              <div className="relative animate-float rounded-[34px] bg-ink p-[6px] shadow-lift">
                <div className="overflow-hidden rounded-[28px] bg-white">
                  <div className="flex items-center justify-between px-3 pb-1.5 pt-3">
                    <span className="font-display text-[11px] font-semibold tracking-tight text-ink">JOVO</span>
                    <span className="h-1 w-6 rounded-full bg-ink/10" />
                  </div>
                  <div className="px-2.5 pb-3">
                    <div className="flex h-7 items-center rounded-full bg-sand px-2.5 text-[8px] text-ink/30">
                      Search products
                    </div>
                    <div className="mt-2 rounded-xl bg-ink px-3 py-3 text-white">
                      <p className="text-[8px] text-white/45">Flash sale · ends today</p>
                      <p className="mt-0.5 text-[11.5px] font-semibold">Up to 60% off</p>
                    </div>
                    <div className="mt-2 grid grid-cols-4 gap-1">
                      {['bg-sky', 'bg-mint', 'bg-lilac', 'bg-peach'].map((tone) => (
                        <div key={tone} className={`h-8 rounded-lg ${tone}`} />
                      ))}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1.5">
                      {[
                        { tone: 'bg-sky', price: '₦850k', name: 'iPhone 15' },
                        { tone: 'bg-lilac', price: '₦185k', name: 'MacBook Air' },
                      ].map(({ tone, price, name }) => (
                        <div key={name} className="rounded-lg bg-sand p-1.5">
                          <div className={`h-9 rounded-md ${tone}`} />
                          <p className="mt-1 text-[8.5px] font-semibold text-ink">{price}</p>
                          <p className="text-[7.5px] text-ink/40">{name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WaveDivider fill="#0E0E10" variant="hill" className="mt-12 sm:mt-16" />
    </section>
  )
}
