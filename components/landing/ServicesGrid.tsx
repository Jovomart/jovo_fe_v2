import Link from 'next/link'
import { ArrowRight, Camera, GraduationCap, Home, Truck } from 'lucide-react'

const services = [
  {
    icon: Truck,
    title: 'Campus delivery',
    desc: 'Fast, tracked delivery to any hostel, faculty or hall on campus.',
    href: '/logistics',
    cta: 'See delivery zones',
    bg: 'bg-sky',
  },
  {
    icon: GraduationCap,
    title: 'Tutoring',
    desc: 'Book top students for 1-on-1 help in any course, at student rates.',
    href: '/services',
    cta: 'Find a tutor',
    bg: 'bg-mint',
  },
  {
    icon: Camera,
    title: 'Photography',
    desc: 'Campus photographers for portraits, events and content days.',
    href: '/services',
    cta: 'Book a shoot',
    bg: 'bg-lilac',
  },
  {
    icon: Home,
    title: 'Accommodation',
    desc: 'Verified hostels, apartments and short lets close to campus.',
    href: '/accommodations',
    cta: 'Find housing',
    bg: 'bg-peach',
  },
]

export default function ServicesGrid() {
  return (
    <section className="bg-sand pb-14 pt-14 sm:pb-20 sm:pt-20" aria-label="Campus services">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div data-animate="fade-up">
            <p className="text-[10.5px] font-semibold uppercase tracking-[.18em] text-ink/35">
              Beyond shopping
            </p>
            <h2 className="mt-2.5 text-balance font-display text-[30px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[40px]">
              More than a marketplace
            </h2>
          </div>
          <p
            className="max-w-[300px] text-[12px] leading-[1.7] text-ink/45"
            data-animate="fade-up"
            data-delay="80"
          >
            Services that make campus life easier - booked and paid in the same place.
          </p>
        </div>

        <div className="mt-7 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ icon: Icon, title, desc, href, cta, bg }, i) => (
            <article
              key={title}
              className={`group flex flex-col rounded-[24px] ${bg} p-5 transition-transform duration-300 hover:-translate-y-1`}
              data-animate="fade-up"
              data-delay={i * 70}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-ink/70">
                <Icon size={14} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-[13.5px] font-semibold tracking-tight text-ink">{title}</h3>
              <p className="mt-1.5 flex-1 text-[11.5px] leading-[1.65] text-ink/55">{desc}</p>
              <Link
                href={href}
                className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink/70 transition-colors hover:text-ink"
              >
                {cta}
                <ArrowRight
                  size={9}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
