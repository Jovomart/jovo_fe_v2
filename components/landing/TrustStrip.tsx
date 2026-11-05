import { Lock, RotateCcw, ShieldCheck, Truck } from 'lucide-react'

const items = [
  {
    icon: ShieldCheck,
    title: 'Verified sellers',
    desc: 'Every seller is ID-checked and campus-verified before they can list a single item.',
  },
  {
    icon: Truck,
    title: '30-minute delivery',
    desc: 'Riders on every campus. From seller to hostel in under half an hour, tracked live.',
  },
  {
    icon: RotateCcw,
    title: '7-day returns',
    desc: 'Changed your mind? Send it back within a week, no questions asked.',
  },
  {
    icon: Lock,
    title: 'Protected payments',
    desc: 'Pay online or on delivery. Funds only release once you confirm the order.',
  },
]

export default function TrustStrip() {
  return (
    <section className="bg-white pb-4 pt-10 sm:pt-14" aria-label="Why shop with JOVO">
      <div className="mx-auto grid max-w-[1240px] gap-x-8 gap-y-7 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, desc }, i) => (
          <article key={title} className="flex items-start gap-3" data-animate="fade-up" data-delay={i * 70}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand text-ink/65">
              <Icon size={15} aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-[13px] font-semibold tracking-tight text-ink">{title}</h3>
              <p className="mt-1 text-[12px] leading-[1.65] text-ink/45">{desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
