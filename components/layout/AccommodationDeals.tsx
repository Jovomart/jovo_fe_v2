'use client'
import Link from 'next/link'
import { ArrowRight, MapPin, Star } from 'lucide-react'
import { accommodations } from '@/data/accommodation'

const AccommodationDeals = () => {
  const places = (accommodations as any[]).slice(0, 4)
  if (!places.length) return null

  return (
    <section className="pt-11 sm:pt-14" aria-label="Accommodation deals">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-peach px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[.16em] text-ink/55">
              <span className="h-1 w-1 rounded-full bg-ink/30" aria-hidden="true" />
              Near campus
            </span>
            <h2 className="mt-2.5 font-display text-[24px] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[30px]">
              Accommodation deals
            </h2>
            <p className="mt-1.5 max-w-[420px] text-[12px] leading-[1.65] text-ink/45 sm:text-[12.5px]">
              Verified hostels, apartments and short lets within walking distance of lectures.
            </p>
          </div>
          <Link
            href="/accommodations"
            className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-[11.5px] font-semibold text-ink/65 ring-1 ring-ink/[.07] transition-colors duration-200 hover:bg-white/70 hover:text-ink"
          >
            See all
            <ArrowRight size={11} />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4">
          {places.map((place) => (
            <Link
              key={place.id}
              href={`/accommodation/${place.id}`}
              className="group flex flex-col overflow-hidden rounded-[22px] bg-white ring-1 ring-ink/[.06] transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                <img
                  src={place.image}
                  alt={place.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-white/90 px-2 py-[3px] text-[9.5px] font-semibold text-ink backdrop-blur">
                  <Star size={8} className="fill-brand-orange text-brand-orange" />
                  {place.rating}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-3">
                <h3 className="line-clamp-1 text-[12.5px] font-semibold tracking-tight text-ink">{place.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-[10.5px] text-ink/40">
                  <MapPin size={9} />
                  {place.location}
                </p>
                <p className="mt-2 text-[13px] font-semibold text-ink">
                  ₦{place.price.toLocaleString()}
                  <span className="ml-1 text-[10px] font-normal text-ink/40">/year</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AccommodationDeals
