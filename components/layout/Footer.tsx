// src/components/Footer.jsx
'use client'
import Link from 'next/link'
import Image from 'next/image'
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
 // your logo path

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
    <footer className="relative bg-[#0f0f0f] text-white overflow-hidden">
      {/* ── Decorative top accent line ── */}
      <div className="h-1 w-full bg-linear-to-r from-[#B42225] via-[#FF8C00] to-[#B42225]" />

      {/* ── Subtle grid background ── */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Glow blobs ── */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#B42225]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#FF8C00]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-10">
        {/* ── Top section: Logo + Newsletter ── */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-10 pb-12 border-b border-white/10">
          {/* Logo & tagline */}
          <div className="flex flex-col gap-4 max-w-xs">
            {/* ── LOGO SLOT ── replace src with your logo variable if needed */}
            <Image 
             src="/images/Jovo_off_logo2.png"
             alt="Jovo"
             width={220}  // Adjust based on your design (md:w-55 ≈ 220px)
             height={8}  // md:h-12 = 48px
             className="cursor-pointer shrink-0 object-cover md:w-55 md:h-12 w-28 h-10"
             priority
             onError={handleImageError}
             // For responsive sizing, use style or add responsive classes
           />
            <span
              className="text-2xl font-black tracking-tight text-white hidden"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              JOVO
            </span>

            <p className="text-gray-400 text-sm leading-relaxed">
              Nigeria's smartest marketplace. Find the best deals across
              electronics, fashion, beauty, and more.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-2">
              {[
                { icon: <FiInstagram size={16} />, href: "#" },
                { icon: <FiTwitter size={16} />, href: "#" },
                { icon: <FiFacebook size={16} />, href: "#" },
                { icon: <FiYoutube size={16} />, href: "#" },
              ].map(({ icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-gray-400 hover:text-white hover:border-[#FF8C00] hover:bg-[#FF8C00]/10 transition-all duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="w-full lg:max-w-sm">
            <p className="text-xs uppercase tracking-widest text-[#FF8C00] font-semibold mb-2">
              Newsletter
            </p>
            <h4 className="text-xl font-bold mb-1">
              Get the best deals first.
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              Flash sales, new arrivals, and exclusive offers — straight to your
              inbox.
            </p>
            <div className="flex gap-0 rounded-xl overflow-hidden border border-white/10 focus-within:border-[#FF8C00]/50 transition-all">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
              />
              <button className="bg-[#B42225] hover:bg-[#FF8C00] px-5 text-white transition-colors duration-200 flex items-center gap-1 font-medium text-sm whitespace-nowrap">
                Subscribe <FiArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Middle section: Links ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-12 border-b border-white/10">
          {/* Support */}
          <div>
            <p className="text-xs uppercase tracking-widest text-[#FF8C00] font-semibold mb-4">
              Support
            </p>
            <ul className="space-y-3">
              {[
                {
                  icon: <FiMessageCircle size={14} />,
                  label: "Chat with us",
                  to: "/contact",
                },
                {
                  icon: <FiHelpCircle size={14} />,
                  label: "Help Center",
                  to: "/help",
                },
                {
                  icon: <FiMail size={14} />,
                  label: "Contact Us",
                  to: "/contact",
                },
              ].map(({ icon, label, to }) => (
                <li key={label}>
                  <Link
                    href={to}
                    className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors duration-150 group"
                  >
                    <span className="text-[#B42225] group-hover:text-[#FF8C00] transition-colors">
                      {icon}
                    </span>
                    {label}
                  </Link>
                </li>
              ))}
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <FiPhone size={14} className="text-[#B42225]" />
                +234 801 234 5678
              </li>
            </ul>
          </div>

          {/* Marketplace */}
          <div>
            <p className="text-xs uppercase tracking-widest text-[#FF8C00] font-semibold mb-4">
              Marketplace
            </p>
            <ul className="space-y-3">
              {[
                ...(isSeller
                  ? []
                  : [{ label: "Become a Seller", to: "/become-seller" }]),
                { label: "Report a Product", to: "/report-product" },
                { label: "Flash Sales", to: "/flash-sales" },
                { label: "Top Sellers", to: "/top-sellers" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    href={to}
                    className="text-gray-400 hover:text-white text-sm transition-colors duration-150 hover:translate-x-0.5 inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <p className="text-xs uppercase tracking-widest text-[#FF8C00] font-semibold mb-4">
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
                    className="text-gray-400 hover:text-white text-sm transition-colors duration-150 hover:translate-x-0.5 inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-3 text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} Jovo Marketplace. All rights
            reserved.
          </p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <span className="text-[#B42225] mx-1">♥</span>
            <span>in Nigeria</span>
          </div>
        </div>
      </div>
    </footer>
  );
};