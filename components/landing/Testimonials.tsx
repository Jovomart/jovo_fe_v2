'use client'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, Star } from 'lucide-react'
import { useScrollAnimations } from '@/hooks/useScrollAnimations'
import WaveDivider from '@/components/ui/WaveDivider'

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Chukwuemeka Nwosu',
    role: '200L Computer Science, FUTO',
    text: 'JOVO changed how I shop on campus. Got my laptop delivered in 25 minutes - insane! The seller was super professional and the price was way better than anywhere else.',
    initial: 'C',
    avatarColor: '#FF8C00',
  },
  {
    id: 2,
    name: 'Adaeze Okafor',
    role: 'Verified Seller, 300L Engineering',
    text: "I've been selling on JOVO for 3 months and made over ₦400k already. The seller dashboard is smooth and payouts hit my account every week without fail.",
    initial: 'A',
    avatarColor: '#B42225',
  },
  {
    id: 3,
    name: 'Tunde Adeleke',
    role: '400L Medicine, UNILAG',
    text: 'Flash sales are real on JOVO. Grabbed AirPods at 40% off - could not believe it. Everything is legit, no scams, and the verification gives real confidence.',
    initial: 'T',
    avatarColor: '#0E0E10',
  },
  {
    id: 4,
    name: 'Fatima Aliyu',
    role: '100L Law, ABU Zaria',
    text: 'The campus services section helped me find an amazing photographer for my birthday shoot. So affordable and talented.',
    initial: 'F',
    avatarColor: '#B7DBC3',
  },
  {
    id: 5,
    name: 'Oluwaseun Balogun',
    role: '500L Architecture, OAU',
    text: 'I ordered groceries and a new charger at the same time - both arrived together in under 30 minutes. JOVO logistics is honestly next level.',
    initial: 'O',
    avatarColor: '#C6ACEF',
  },
]

const roundBtn =
  'flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink/50 ring-1 ring-ink/10 transition-all duration-200 hover:bg-ink hover:text-white'

export default function Testimonials() {
  useScrollAnimations()
  const [active, setActive] = useState(0)
  const testimonial = TESTIMONIALS[active]

  const go = (dir: 1 | -1) => setActive((prev) => (prev + dir + TESTIMONIALS.length) % TESTIMONIALS.length)

  return (
    <section className="relative bg-white pb-14 pt-14 sm:pb-20 sm:pt-20" aria-label="Student testimonials">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:items-end">
          <h2
            className="text-balance font-display text-[30px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[40px]"
            data-animate="fade-up"
          >
            The campus
            <br className="hidden sm:block" /> loves JOVO.
          </h2>

          <div data-animate="fade-up" data-delay="80">
            <p className="text-[11px] font-medium text-ink/40">Explore testimonials:</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {TESTIMONIALS.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => setActive(i)}
                  aria-pressed={i === active}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all duration-200 ${
                    i === active
                      ? 'bg-white text-ink shadow-soft ring-1 ring-ink/[.07]'
                      : 'bg-sand/80 text-ink/45 hover:text-ink/75'
                  }`}
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: item.avatarColor }} aria-hidden="true" />
                  {item.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-9 grid gap-6 lg:mt-12 lg:grid-cols-[1.5fr_0.5fr] lg:items-center lg:gap-10">
          <div key={testimonial.id} className="animate-pop-in border-l-2 border-ink/15 pl-5 sm:pl-7" aria-live="polite">
            <div className="flex items-center gap-1 text-ink/45" aria-label="Rated 5 out of 5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={10} className="fill-ink/45" aria-hidden="true" />
              ))}
            </div>

            <blockquote className="mt-3 text-balance font-display text-[19px] font-normal leading-[1.42] tracking-[-0.015em] text-ink/85 sm:text-[25px]">
              &ldquo;{testimonial.text}&rdquo;
            </blockquote>

            <footer className="mt-5 flex items-center gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                style={{ background: testimonial.avatarColor }}
                aria-hidden="true"
              >
                {testimonial.initial}
              </span>
              <div className="min-w-0">
                <cite className="block truncate text-[12.5px] font-semibold not-italic text-ink">
                  {testimonial.name}
                </cite>
                <span className="block truncate text-[11px] text-ink/40">{testimonial.role}</span>
              </div>
              <div className="ml-auto flex gap-1.5">
                <button onClick={() => go(-1)} aria-label="Previous testimonial" className={roundBtn}>
                  <ArrowLeft size={11} />
                </button>
                <button onClick={() => go(1)} aria-label="Next testimonial" className={roundBtn}>
                  <ArrowRight size={11} />
                </button>
              </div>
            </footer>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] bg-lilac p-5 sm:p-6">
              <p className="font-display text-[32px] font-medium leading-none tracking-tight text-ink">
                4.9<span className="ml-1 align-top text-[14px]">★</span>
              </p>
              <p className="mt-2 text-[11px] leading-[1.6] text-ink/60">
                from 1,200+ verified student reviews
              </p>
            </div>
            <div className="rounded-[24px] bg-mint p-5 sm:p-6">
              <p className="font-display text-[32px] font-medium leading-none tracking-tight text-ink">
                50K+
              </p>
              <p className="mt-2 text-[11px] leading-[1.6] text-ink/60">
                students buying and selling every month
              </p>
            </div>
          </div>
        </div>
      </div>

      <WaveDivider fill="#F7F3EC" className="mt-12 sm:mt-16" />
    </section>
  )
}
