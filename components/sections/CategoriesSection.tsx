import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMobileScreen, faTv, faSpa, faShirt, faLaptop, faGamepad, faArrowRight,
} from '@fortawesome/free-solid-svg-icons'
import { CATEGORIES } from '@/data'

const iconMap: Record<string, ReturnType<typeof faMobileScreen['icon'] extends string ? never : () => never> | typeof faMobileScreen> = {
  'mobile-screen': faMobileScreen,
  tv: faTv,
  spa: faSpa,
  shirt: faShirt,
  laptop: faLaptop,
  gamepad: faGamepad,
}

export default function CategoriesSection() {
  return (
    <section className="py-10 sm:py-[60px] bg-[#FFF8F5]" aria-label="Shop by category">
      <div className="section-header max-w-[1400px] mx-auto px-4 sm:px-6 pb-6 sm:pb-9 text-center" data-animate="fade-up">
        <div className="inline-flex items-center text-[9px] sm:text-[10.5px] font-extrabold uppercase tracking-[.2em] text-brand-orange bg-[rgba(255,140,0,.08)] border border-[rgba(255,140,0,.2)] px-3 sm:px-[14px] py-1 sm:py-[5px] rounded-full mb-2 sm:mb-3">
          Explore
        </div>
        <h2 className="font-display text-[22px] sm:text-[28px] md:text-[34px] lg:text-[38px] font-black leading-[1.15] text-gray-900 mb-2 sm:mb-[10px]">
          Shop by <em className="not-italic text-brand-red">Category</em>
        </h2>
        <p className="text-[13px] sm:text-[14.5px] text-gray-500 max-w-[520px] mx-auto leading-[1.6] sm:leading-[1.75] px-2 sm:px-0">
          From gadgets to groceries, we have everything you need on campus.
        </p>
      </div>

      {/* Responsive grid - mobile: 2 columns, tablet: 3 columns, desktop: custom grid with row spans */}
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6">
        {/* Mobile & Tablet: Flexible grid layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:hidden" role="list">
          {CATEGORIES.map((cat) => (
            <article
              key={cat.id}
              className="rounded-[16px] sm:rounded-[20px] overflow-hidden relative group h-[160px] sm:h-[180px]"
              role="listitem"
              style={{ '--cat-color': cat.color } as React.CSSProperties}
            >
              <Link
                href={cat.href}
                className="block relative w-full h-full"
                aria-label={`Shop ${cat.name}`}
              >
                <Image
                  src={cat.image}
                  alt={cat.alt}
                  fill
                  className="object-cover transition-transform duration-[600ms] group-hover:scale-[1.07]"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/06 to-transparent group-hover:from-black/90 transition-all duration-300 flex flex-col justify-end p-3 sm:p-4">
                  <div
                    className="w-7 h-7 sm:w-9 sm:h-9 bg-white/12 backdrop-blur-[8px] border border-white/20 rounded-[6px] sm:rounded-[8px] flex items-center justify-center text-[13px] sm:text-[15px] text-white mb-1.5 sm:mb-2"
                    aria-hidden="true"
                    style={{ ['--icon-bg' as string]: cat.color }}
                  >
                    <FontAwesomeIcon icon={iconMap[cat.icon] as typeof faMobileScreen} />
                  </div>
                  <h3 className="font-display font-black text-white leading-[1.2] mb-0.5 text-[14px] sm:text-[16px]">
                    {cat.name}
                  </h3>
                  <span className="text-[9px] sm:text-[10.5px] text-white/50 font-semibold">{cat.count}</span>
                  <span className="cat-card-cta mt-1.5 sm:mt-2 items-center gap-[5px] text-[10px] sm:text-[11.5px] font-bold text-white px-2.5 sm:px-3 py-1.5 sm:py-[6px] rounded-full w-fit" style={{ background: cat.color }}>
                    Shop Now <FontAwesomeIcon icon={faArrowRight} />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* Desktop: Original grid with row spans */}
        <div className="hidden md:grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: '180px 180px' }} role="list">
          {CATEGORIES.map((cat) => (
            <article
              key={cat.id}
              className={`rounded-[20px] overflow-hidden relative group ${cat.large ? 'row-span-2' : ''}`}
              role="listitem"
              style={{ '--cat-color': cat.color } as React.CSSProperties}
            >
              <Link
                href={cat.href}
                className="block relative w-full h-full min-h-[180px]"
                aria-label={`Shop ${cat.name}`}
              >
                <Image
                  src={cat.image}
                  alt={cat.alt}
                  fill
                  className="object-cover transition-transform duration-[600ms] group-hover:scale-[1.07]"
                  sizes="(max-width:1024px) 33vw, 25vw"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/06 to-transparent group-hover:from-black/90 transition-all duration-300 flex flex-col justify-end p-4">
                  <div
                    className="w-9 h-9 bg-white/12 backdrop-blur-[8px] border border-white/20 rounded-[8px] flex items-center justify-center text-[15px] text-white mb-2"
                    aria-hidden="true"
                    style={{ ['--icon-bg' as string]: cat.color }}
                  >
                    <FontAwesomeIcon icon={iconMap[cat.icon] as typeof faMobileScreen} />
                  </div>
                  <h3 className={`font-display font-black text-white leading-[1.2] mb-0.5 ${cat.large ? 'text-[22px]' : 'text-[16px]'}`}>
                    {cat.name}
                  </h3>
                  <span className="text-[10.5px] text-white/50 font-semibold">{cat.count}</span>
                  <span className="cat-card-cta mt-2 items-center gap-[5px] text-[11.5px] font-bold text-white px-3 py-[6px] rounded-full w-fit" style={{ background: cat.color }}>
                    Shop Now <FontAwesomeIcon icon={faArrowRight} />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}