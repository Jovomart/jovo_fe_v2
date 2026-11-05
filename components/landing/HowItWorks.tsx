'use client'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CreditCard, Search, ShoppingBag, TrendingUp, Truck } from 'lucide-react'
import { useScrollAnimations } from '@/hooks/useScrollAnimations'
import WaveDivider from '@/components/ui/WaveDivider'

type Mock = 'browse' | 'pay' | 'delivery' | 'sell'

const steps: { tab: string; title: string; body: string; mock: Mock }[] = [
  {
    tab: 'Browse the deals',
    title: 'Everything on campus, in one place',
    body: 'Browse 50,000+ listings from sellers on your own campus. Filter by price, brand or category and see real photos, real reviews and real stock before you buy.',
    mock: 'browse',
  },
  {
    tab: 'Check out your way',
    title: 'Pay securely, or pay on delivery',
    body: 'Pay with card, bank transfer or wallet - or choose pay-on-delivery and inspect your item first. Every payment is held safely until your order lands.',
    mock: 'pay',
  },
  {
    tab: 'Track it to your door',
    title: 'Delivered in about 30 minutes',
    body: 'Our campus riders pick up from verified sellers and drop to your hostel, faculty or library. Follow every step live, from confirmed to delivered.',
    mock: 'delivery',
  },
  {
    tab: 'Sell and grow',
    title: 'Turn your side hustle into a storefront',
    body: 'List in minutes with no fees, get a verified seller badge, and watch orders, payouts and reviews in one simple dashboard. Weekly payouts, straight to your bank.',
    mock: 'sell',
  },
]

const card = 'rounded-[26px] bg-white ring-1 ring-ink/[.07] shadow-lift'

function BrowseMock() {
  return (
    <div className={`${card} p-3.5 sm:p-4`}>
      <div className="flex items-center gap-2 rounded-full bg-sand px-3 py-2">
        <Search size={11} className="text-ink/35" />
        <span className="text-[11px] text-ink/35">Search &ldquo;power bank&rdquo;</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {[
          { bg: 'bg-sky', label: 'Anker 20K', price: '₦18,000' },
          { bg: 'bg-lilac', label: 'AirPods Pro', price: '₦145,000' },
          { bg: 'bg-mint', label: 'HP Pavilion', price: '₦480,000' },
          { bg: 'bg-peach', label: 'Nike AF1', price: '₦62,000' },
        ].map((p) => (
          <div key={p.label} className="rounded-2xl bg-white p-2 ring-1 ring-ink/[.06]">
            <div className={`mb-2 h-16 rounded-xl ${p.bg}`} />
            <p className="truncate text-[10.5px] font-medium text-ink/70">{p.label}</p>
            <p className="text-[10.5px] font-semibold text-ink">{p.price}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PayMock() {
  return (
    <div className={`${card} p-4 sm:p-5`}>
      <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-ink/35">Order summary</p>
      <div className="mt-3 space-y-2">
        {[
          ['Sony WH-1000XM5', '₦185,000'],
          ['Campus delivery', '₦1,500'],
          ['Student discount', '−₦18,500'],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between border-b border-ink/[.06] pb-2">
            <span className="text-[11px] text-ink/55">{label}</span>
            <span className="text-[11px] font-medium text-ink/80">{value}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-ink/45">Total</span>
        <span className="text-[17px] font-semibold tracking-tight">₦168,000</span>
      </div>
      <div className="mt-3 flex gap-1.5">
        {['Card', 'Transfer', 'On delivery'].map((m, i) => (
          <span
            key={m}
            className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
              i === 0 ? 'bg-ink text-white' : 'bg-sand text-ink/50'
            }`}
          >
            {m}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-lilac py-2.5 text-[11px] font-semibold text-ink">
        <CreditCard size={11} />
        Pay ₦168,000
      </div>
    </div>
  )
}

function DeliveryMock() {
  return (
    <div className={`${card} overflow-hidden`}>
      <div className="relative h-40 bg-sky-soft p-4">
        <svg viewBox="0 0 360 160" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path
            d="M12 132C74 132 62 44 148 44s86 84 196 60"
            fill="none"
            stroke="#0E0E10"
            strokeOpacity=".16"
            strokeWidth="2"
            strokeDasharray="6 8"
          />
          <circle cx="148" cy="44" r="9" fill="#0E0E10" />
          <circle cx="344" cy="104" r="9" fill="#DCCBF6" />
        </svg>
        <span className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-ink shadow-soft">
          Arriving in 28 min
        </span>
      </div>
      <div className="space-y-2.5 p-4">
        {['Order confirmed', 'Picked up by rider', 'On the way to you'].map((s, i) => (
          <div key={s} className="flex items-center gap-2.5">
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full ${
                i < 2 ? 'bg-mint-deep text-ink' : 'bg-sand text-ink/30'
              }`}
            >
              <Check size={8} />
            </span>
            <span className={`text-[11px] ${i < 2 ? 'text-ink/70' : 'text-ink/35'}`}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SellMock() {
  return (
    <div className={`${card} p-4 sm:p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-ink/35">This month</p>
          <p className="mt-1 text-[24px] font-semibold leading-none tracking-tight">₦2.4M</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-mint px-2 py-1 text-[10px] font-semibold text-ink/70">
          <TrendingUp size={9} />
          18%
        </span>
      </div>
      <div className="mt-4 flex h-24 items-end gap-1.5">
        {[38, 52, 44, 68, 60, 82, 100].map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t-md ${i === 6 ? 'bg-ink' : 'bg-mint'}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {[
          ['Order #4821 · Power bank', '₦18,000'],
          ['Order #4820 · Sneakers', '₦62,000'],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between rounded-xl bg-sand px-2.5 py-2">
            <span className="truncate text-[10.5px] text-ink/55">{label}</span>
            <span className="text-[10.5px] font-semibold text-ink">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const mocks: Record<Mock, () => JSX.Element> = {
  browse: BrowseMock,
  pay: PayMock,
  delivery: DeliveryMock,
  sell: SellMock,
}

export default function HowItWorks() {
  useScrollAnimations()
  const [active, setActive] = useState(0)
  const step = steps[active]
  const Mock = mocks[step.mock]

  const go = (dir: 1 | -1) => setActive((prev) => (prev + dir + steps.length) % steps.length)

  return (
    <section className="relative bg-white pb-16 pt-12 sm:pb-20 sm:pt-16" aria-label="How JOVO works">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <h2
            className="text-balance font-display text-[32px] font-medium leading-[1.03] tracking-[-0.03em] sm:text-[44px]"
            data-animate="fade-up"
          >
            Shopping,
            <br className="hidden sm:block" /> sorted.
          </h2>

          <div data-animate="fade-up" data-delay="80">
            <p className="text-[11.5px] font-medium text-ink/40">Explore how JOVO works:</p>
            <div role="tablist" aria-label="How JOVO works" className="mt-3 flex flex-wrap gap-1.5">
              {steps.map(({ tab }, i) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={i === active}
                  aria-controls="how-panel"
                  id={`how-tab-${i}`}
                  onClick={() => setActive(i)}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-left text-[11.5px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                    i === active
                      ? 'bg-white text-ink shadow-soft ring-1 ring-ink/[.07]'
                      : 'bg-sand/80 text-ink/45 hover:text-ink/75'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${i === active ? 'bg-ink' : 'bg-ink/20'}`}
                    aria-hidden="true"
                  />
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className="mt-9 grid items-center gap-8 lg:mt-14 lg:grid-cols-2 lg:gap-16"
          id="how-panel"
          role="tabpanel"
          aria-labelledby={`how-tab-${active}`}
        >
          <div key={`copy-${active}`} className="animate-pop-in">
            <span className="font-mono text-[10.5px] uppercase tracking-[.2em] text-ink/35">
              {String(active + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
            </span>
            <h3 className="mt-4 max-w-[380px] text-balance text-[24px] font-medium leading-[1.15] tracking-[-0.02em] sm:text-[29px]">
              {step.title}
            </h3>
            <p className="mt-3 max-w-[420px] text-[12.5px] leading-[1.8] text-ink/55 sm:text-[13.5px]">
              {step.body}
            </p>

            <div className="mt-7 flex items-center gap-2">
              <button
                onClick={() => go(-1)}
                aria-label="Previous step"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink/60 ring-1 ring-ink/10 transition-all duration-200 hover:bg-ink hover:text-white"
              >
                <ArrowLeft size={12} />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Next step"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink/60 ring-1 ring-ink/10 transition-all duration-200 hover:bg-ink hover:text-white"
              >
                <ArrowRight size={12} />
              </button>
              <span className="ml-1 font-mono text-[10.5px] text-ink/30">Step {active + 1}</span>
            </div>
          </div>

          <div className="relative" aria-hidden="true">
            <div className="absolute inset-8 rounded-full bg-peach/70 blur-2xl" />
            <div className="absolute -right-2 -top-3 hidden rounded-full bg-mint px-3 py-1.5 text-[10px] font-semibold text-ink/70 shadow-soft sm:flex sm:items-center sm:gap-1.5">
              <ShoppingBag size={9} />
              Verified seller
            </div>
            <div className="relative mx-auto max-w-[380px] animate-pop-in" key={`mock-${active}`}>
              <Mock />
            </div>
            <div className="absolute -bottom-3 -left-2 hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-ink/60 shadow-soft ring-1 ring-ink/[.05] sm:flex">
              <Truck size={9} className="text-ink/40" />
              30 min campus delivery
            </div>
          </div>
        </div>
      </div>

      <WaveDivider fill="#D9EBF8" variant="hill" className="mt-12 sm:mt-16" />
    </section>
  )
}
