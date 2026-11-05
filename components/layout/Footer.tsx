// src/components/Footer.jsx
'use client'
import Link from 'next/link'
import {
  FiMail,
  FiPhone,
  FiMessageCircle,
  FiHelpCircle,
  FiArrowRight,
  FiInstagram,
  FiTwitter,
  FiFacebook,
  FiYoutube,
} from "react-icons/fi";
import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

export default function Footer() {
  const { isSeller } = useContext(AuthContext);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.style.display = "none";
    if (target.nextSibling && target.nextSibling instanceof HTMLElement) {
      target.nextSibling.style.display = "block";
    }
  };

  return (
    <footer className="relative mt-16 overflow-hidden rounded-t-[36px] bg-ink text-cream">
      <div className="relative mx-auto max-w-7xl px-5 pb-8 pt-14 sm:px-8">
        {/* Logo + newsletter */}
        <div className="flex flex-col justify-between gap-10 border-b border-cream/10 pb-12 lg:flex-row lg:items-start">
          <div className="flex max-w-sm flex-col gap-4">
            <div className="inline-flex w-fit items-center rounded-[16px] bg-cream p-2">
              <img
                src="/images/Jovo_official_logo.png"
                alt="Jovo Marketplace"
                className="h-9 w-9 object-cover"
                onError={handleImageError}
              />
            </div>
            <span className="hidden font-display text-2xl font-semibold tracking-tight text-cream">
              JOVO
            </span>

            <p className="text-[13px] leading-relaxed text-cream/55">
              Nigeria's smartest campus marketplace. Find the best deals across
              electronics, fashion, beauty, and more.
            </p>

            <div className="mt-1 flex items-center gap-2.5">
              {[
                { icon: <FiInstagram size={14} />, href: "#" },
                { icon: <FiTwitter size={14} />, href: "#" },
                { icon: <FiFacebook size={14} />, href: "#" },
                { icon: <FiYoutube size={14} />, href: "#" },
              ].map(({ icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 text-cream/70 transition-colors duration-200 hover:bg-cream hover:text-ink"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="w-full lg:max-w-sm">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-mint">
              Newsletter
            </p>
            <h4 className="mb-1 text-xl font-semibold tracking-tight text-cream">
              Get the best deals first.
            </h4>
            <p className="mb-4 text-[13px] text-cream/50">
              Flash sales, new arrivals, and exclusive offers - straight to your
              inbox.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-1 rounded-full bg-cream/10 p-1 pl-4"
            >
              <input
                type="email"
                placeholder="your@email.com"
                aria-label="Email address"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-cream placeholder-cream/35"
              />
              <button
                type="submit"
                className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-cream px-4 py-2.5 text-[12px] font-semibold text-ink transition-transform duration-200 hover:scale-[1.03]"
              >
                Subscribe <FiArrowRight size={13} />
              </button>
            </form>
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-8 border-b border-cream/10 py-11 md:grid-cols-3">
          <div>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-mint">
              Support
            </p>
            <ul className="space-y-3">
              {[
                { icon: <FiMessageCircle size={14} />, label: "Chat with us", to: "/contact" },
                { icon: <FiHelpCircle size={14} />, label: "Help Center", to: "/help" },
                { icon: <FiMail size={14} />, label: "Contact Us", to: "/contact" },
              ].map(({ icon, label, to }) => (
                <li key={label}>
                  <Link
                    href={to}
                    className="flex items-center gap-2 text-[13px] text-cream/55 transition-colors duration-150 hover:text-cream"
                  >
                    <span className="text-cream/40">{icon}</span>
                    {label}
                  </Link>
                </li>
              ))}
              <li className="flex items-center gap-2 text-[13px] text-cream/55">
                <FiPhone size={14} className="text-cream/40" />
                +234 801 234 5678
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-mint">
              Marketplace
            </p>
            <ul className="space-y-3">
              {[
                ...(isSeller ? [] : [{ label: "Become a Seller", to: "/become-seller" }]),
                { label: "Report a Product", to: "/report-product" },
                { label: "Flash Sales", to: "/flash-sales" },
                { label: "Top Sellers", to: "/top-sellers" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    href={to}
                    className="inline-block text-[13px] text-cream/55 transition-colors duration-150 hover:text-cream"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-mint">
              Legal
            </p>
            <ul className="space-y-3">
              {[
                { label: "Terms & Conditions", to: "/terms" },
                { label: "Privacy Notice", to: "/privacy" },
                { label: "Cookie Notice", to: "/cookie" },
                { label: "Return Policy", to: "/return-policy" },
                { label: "Returns & Refunds", to: "/returns-refund" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    href={to}
                    className="inline-block text-[13px] text-cream/55 transition-colors duration-150 hover:text-cream"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 pt-7 text-[11px] text-cream/40 md:flex-row">
          <p>&copy; {new Date().getFullYear()} Jovo Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <span className="mx-1 text-brand-red">♥</span>
            <span>in Nigeria</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
