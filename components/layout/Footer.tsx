'use client'
import { useContext, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  Facebook,
  HelpCircle,
  Instagram,
  Mail,
  MessageCircle,
  Phone,
  Twitter,
  Youtube,
} from 'lucide-react'
import { AuthContext } from '@/context/AuthContext'
import Doodle from '@/components/ui/Doodle'

const columns = [
  {
    title: 'Shop',
    links: [
      { href: '/deals', label: 'All deals' },
      { href: '/phone-deals', label: 'Phones & tablets' },
      { href: '/electronic-deals', label: 'Electronics' },
      { href: '/fashion-deals', label: 'Fashion' },
      { href: '/computing-deals', label: 'Computing' },
      { href: '/groceries', label: 'Groceries' },
      { href: '/flash-sales', label: 'Flash sales' },
    ],
  },
  {
    title: 'Marketplace',
    links: [
      { href: '/become-seller', label: 'Become a seller' },
      { href: '/top-sellers', label: 'Top sellers' },
      { href: '/report-product', label: 'Report a product' },
      { href: '/logistics', label: 'Delivery & logistics' },
      { href: '/services', label: 'Campus services' },
      { href: '/accommodations', label: 'Accommodation' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/help', label: 'Help centre' },
      { href: '/contact', label: 'Contact us' },
      { href: '/verify', label: 'Company Verification' },
      { href: '/terms', label: 'Terms of service' },
      { href: '/privacy', label: 'Privacy policy' },
      { href: '/cookie', label: 'Cookie notice' },
      { href: '/return-policy', label: 'Return policy' },
    ],
  },
]

const socials = [
  { href: 'https://instagram.com/jovong', icon: Instagram, label: 'Instagram' },
  { href: 'https://twitter.com/jovong', icon: Twitter, label: 'Twitter / X' },
  { href: 'https://facebook.com/jovong', icon: Facebook, label: 'Facebook' },
  { href: 'https://youtube.com/@jovong', icon: Youtube, label: 'YouTube' },
]

export default function Footer() {
  const { isSeller } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return
    setSubmitted(true)
    setEmail('')
    setTimeout(() => setSubmitted(false), 3000)
  }

  const shopColumns = columns.map((column, index) => {
    if (index !== 1 || isSeller) return column
    return {
      ...column,
      links: [
        { href: '/become-seller', label: 'Become a seller' },
        ...column.links.slice(1),
      ],
    }
  })

  return (
    <footer className="relative mt-4 overflow-hidden bg-ink text-white/50" role="contentinfo">
      <Doodle tone="dark" className="pointer-events-none absolute -bottom-24 right-[-40px] hidden w-[420px] opacity-50 md:block" />

      <div className="relative mx-auto max-w-[1320px] px-5 pb-8 pt-14 sm:px-8 sm:pt-20">
        <div className="grid gap-9 lg:grid-cols-[1.15fr_1fr_1fr_1fr] lg:gap-8">
          {/* Newsletter card */}
          <div className="rounded-[26px] bg-cream px-5 py-6 text-ink sm:px-6">
            <h2 className="font-display text-[21px] font-medium leading-tight tracking-[-0.02em]">
              Join the JOVO journal
            </h2>
            <p className="mt-2 text-[12.5px] leading-[1.65] text-ink/55">
              Deals, fresh arrivals and campus-only drops - straight to your inbox.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-1.5 rounded-full bg-white p-1.5" noValidate>
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                aria-required="true"
                autoComplete="email"
                className="min-w-0 flex-1 rounded-full bg-transparent px-3 py-1.5 text-[12.5px] text-ink placeholder:text-ink/35"
              />
              <button
                type="submit"
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-lilac px-3.5 py-2 text-[12px] font-semibold text-ink transition-colors duration-200 hover:bg-lilac-deep"
              >
                {submitted ? (
                  <>
                    <Check size={10} />
                    Done
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>

            <p className="mt-2.5 text-[10.5px] leading-relaxed text-ink/40">
              No spam. Unsubscribe anytime.
            </p>
          </div>

          {/* Link columns */}
          {shopColumns.map(({ title, links }) => (
            <nav key={title} aria-label={`${title} links`} className="min-w-0">
              <h3 className="text-[11px] font-semibold uppercase tracking-[.16em] text-white/80">
                {title}
              </h3>
              <ul className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-2 lg:grid-cols-1">
                {links.map(({ href, label }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[12px] leading-snug text-white/45 transition-colors duration-200 hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Contact + socials */}
        <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link href="/contact" className="flex items-center gap-1.5 text-[11.5px] text-white/45 transition-colors hover:text-white">
            <MessageCircle size={12} />
            Chat with us
          </Link>
          <Link href="/help" className="flex items-center gap-1.5 text-[11.5px] text-white/45 transition-colors hover:text-white">
            <HelpCircle size={12} />
            Help centre
          </Link>
          <a href="mailto:hello@jovo.ng" className="flex items-center gap-1.5 text-[11.5px] text-white/45 transition-colors hover:text-white">
            <Mail size={12} />
            hello@jovo.ng
          </a>
          <span className="flex items-center gap-1.5 text-[11.5px] text-white/45">
            <Phone size={12} />
            0700 600 0000
          </span>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] text-white/35">Follow JOVO</span>
            {socials.map(({ href, icon: Icon, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[.07] text-white/55 transition-colors duration-200 hover:bg-white hover:text-ink"
              >
                <Icon size={13} />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href="/"
              aria-label="JOVO home"
              className="inline-flex items-center rounded-full bg-cream px-3 py-1.5 transition-opacity hover:opacity-90"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/Jovo_official_logo.png"
                alt="JOVO"
                onError={(e) => {
                  const target = e.currentTarget
                  target.style.display = 'none'
                  if (target.nextSibling instanceof HTMLElement) target.nextSibling.style.display = 'block'
                }}
                className="h-6 w-[104px] object-cover"
              />
              <span className="hidden font-display text-lg font-semibold tracking-tight text-ink">
                JOVO
              </span>
            </Link>
            <p className="text-[11.5px] text-white/30">
              &copy; {new Date().getFullYear()} JOVO Technologies Ltd.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {[
              { href: '/terms', label: 'Terms' },
              { href: '/privacy', label: 'Privacy' },
              { href: '/cookie', label: 'Cookies' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[11.5px] text-white/35 transition-colors hover:text-white/80"
              >
                {label}
              </Link>
            ))}
            <span className="text-[11px] text-white/30">Visa · Mastercard · Bank · COD</span>
            <Link
              href="/deals"
              className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-white/60 transition-colors hover:text-white"
            >
              All deals
              <ArrowRight size={10} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
