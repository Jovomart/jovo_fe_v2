import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTruckFast, faGraduationCap, faCamera, faHouse, faArrowRight } from '@fortawesome/free-solid-svg-icons'

const services = [
  { icon: faTruckFast, color: '#ff8c00', title: 'Campus Delivery', desc: 'Lightning-fast delivery anywhere on campus. Real-time tracking, guaranteed timings.', href: '/logistics', cta: 'Explore' },
  { icon: faGraduationCap, color: '#b42225', title: 'Tutoring & Education', desc: 'Connect with top students for tutoring in any subject. Affordable, flexible, effective.', href: '/services', cta: 'Find Tutors' },
  { icon: faCamera, color: '#8b5cf6', title: 'Photography & Media', desc: 'Book campus photographers for portraits, events, and content creation at student rates.', href: '/services', cta: 'Book Now' },
  { icon: faHouse, color: '#10b981', title: 'Accommodation', desc: 'Find verified hostels, apartments, and short-let accommodation near your campus.', href: '/accommodations', cta: 'Find Housing' },
]

export default function ServicesSection() {
  return (
    <section className="py-[60px] bg-[#FFF8F5]" aria-label="Campus services">
      <div className="max-w-[1400px] mx-auto px-6 pb-9 text-center" data-animate="fade-up">
        <div className="inline-flex items-center text-[10.5px] font-extrabold uppercase tracking-[.2em] text-brand-orange bg-[rgba(255,140,0,.08)] border border-[rgba(255,140,0,.2)] px-[14px] py-[5px] rounded-full mb-3">
          Beyond Shopping
        </div>
        <h2 className="font-display text-[clamp(24px,3vw,38px)] font-black leading-[1.15] text-gray-900 mb-[10px]">
          Services &amp; <em className="not-italic text-brand-red">Logistics</em>
        </h2>
        <p className="text-[14.5px] text-gray-500 max-w-[520px] mx-auto leading-[1.75]">
          JOVO is more than a marketplace. We power campus life.
        </p>
      </div>

      <div className="max-w-[1300px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map(({ icon, color, title, desc, href, cta }) => (
          <article
            key={title}
            className="service-card relative bg-white border border-gray-200 rounded-[28px] px-[22px] py-7 text-center hover:-translate-y-1 hover:shadow-brand-md transition-all duration-250 overflow-hidden"
          >
            <div
              className="w-14 h-14 rounded-[20px] mx-auto mb-4 flex items-center justify-center text-[22px] group-hover:scale-110 transition-transform"
              style={{ background: `${color}1f`, color }}
              aria-hidden="true"
            >
              <FontAwesomeIcon icon={icon} />
            </div>
            <h3 className="text-[15px] font-extrabold text-gray-900 mb-2">{title}</h3>
            <p className="text-[13px] text-gray-500 leading-[1.7] mb-4">{desc}</p>
            <Link href={href} className="inline-flex items-center gap-[5px] text-[13px] font-bold text-brand-red hover:gap-[9px] transition-all">
              {cta} <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
