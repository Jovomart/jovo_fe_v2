"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt, faUser, faPlug, faMobileScreen, faSpa, faTv,
  faShirt, faLaptop, faGamepad, faBasketShopping,
} from "@fortawesome/free-solid-svg-icons";
import MobileMenu from "./MobileMenu";

export const CART_EVENT = "jovo:cart-update";

const navLinks = [
  { href: "/shop", label: "Shop All" },
  { href: "/services", label: "Services" },
  { href: "/logistics", label: "Delivery" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
];

const catItems = [
  { href: "/appliances-deals", icon: faPlug, label: "Appliances", color: "#f59e0b" },
  { href: "/phone-deals", icon: faMobileScreen, label: "Phones", color: "#3b82f6" },
  { href: "/beauty-deals", icon: faSpa, label: "Beauty", color: "#ec4899" },
  { href: "/electronic-deals", icon: faTv, label: "Electronics", color: "#8b5cf6" },
  { href: "/fashion-deals", icon: faShirt, label: "Fashion", color: "#B42225" },
  { href: "/computing-deals", icon: faLaptop, label: "Computing", color: "#06b6d4" },
  { href: "/gaming-deals", icon: faGamepad, label: "Gaming", color: "#10b981" },
  { href: "/groceries", icon: faBasketShopping, label: "Groceries", color: "#84cc16" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <style>{`
        .jv-header {
          position: sticky;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 500;
        }

        /* ── Main bar ── */
        .jv-main {
          background: #ffffff;
          transition: box-shadow 0.3s ease;
          border-bottom: 1px solid #f0f0f0;
        }
        .jv-main.scrolled {
          box-shadow: 0 2px 20px rgba(0,0,0,0.08);
        }
        .jv-main-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
          height: 70px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        @media (min-width: 1024px) {
          .jv-main-inner { padding: 0 48px; gap: 0; }
        }

        /* Burger */
        .jv-burger {
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 38px;
          height: 38px;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: 1px solid #efefef;
          background: none;
          cursor: pointer;
          flex-shrink: 0;
          margin-right: 10px;
          transition: border-color 0.2s, background 0.2s;
        }
        .jv-burger:hover { background: #fafafa; border-color: #e0e0e0; }
        .jv-burger span {
          display: block;
          height: 1.5px;
          border-radius: 2px;
          background: #222;
          transition: background 0.2s, width 0.2s;
        }
        .jv-burger span:nth-child(1) { width: 18px; }
        .jv-burger span:nth-child(2) { width: 12px; }
        .jv-burger span:nth-child(3) { width: 18px; }
        .jv-burger:hover span { background: #B42225; }
        .jv-burger:hover span:nth-child(2) { width: 18px; }
        @media (min-width: 1024px) { .jv-burger { display: none; } }

        /* Logo */
        .jv-logo { flex-shrink: 0; transition: opacity 0.2s; }
        .jv-logo:hover { opacity: 0.75; }

        /* Nav */
        .jv-nav {
          display: none;
          align-items: center;
          gap: 2px;
          margin-left: 40px;
        }
        @media (min-width: 1024px) { .jv-nav { display: flex; } }
        .jv-navlink {
          font-size: 14px;
          font-weight: 500;
          color: #444;
          padding: 8px 14px;
          border-radius: 8px;
          letter-spacing: 0.01em;
          white-space: nowrap;
          transition: color 0.2s, background 0.2s;
        }
        .jv-navlink:hover { color: #111; background: #f7f7f7; }

        /* Right side */
        .jv-right {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .jv-sell {
          display: none;
          align-items: center;
          gap: 6px;
          font-size: 13.5px;
          font-weight: 600;
          color: #B42225;
          padding: 8px 16px;
          border-radius: 8px;
          border: 1.5px solid rgba(180,34,37,0.22);
          white-space: nowrap;
          transition: all 0.2s;
        }
        @media (min-width: 1024px) { .jv-sell { display: flex; } }
        .jv-sell:hover {
          background: #B42225;
          color: white;
          border-color: #B42225;
        }
        .jv-signin {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13.5px;
          font-weight: 700;
          color: white;
          background: #B42225;
          padding: 9px 20px;
          border-radius: 8px;
          white-space: nowrap;
          transition: all 0.2s;
          letter-spacing: 0.01em;
        }
        .jv-signin:hover {
          background: #9e1e21;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(180,34,37,0.3);
        }
        .jv-signin:active { transform: none; }

        /* Flash pill in nav */
        .jv-flash {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13.5px;
          font-weight: 700;
          color: #FF8C00;
          padding: 8px 14px;
          border-radius: 8px;
          white-space: nowrap;
          transition: background 0.2s;
        }
        .jv-flash:hover { background: rgba(255,140,0,0.06); }
        .jv-flash-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #FF8C00;
          animation: jv-pulse 1.6s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes jv-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.65); }
        }

        /* ── Category strip (dark) ── */
        .jv-cats {
          background: #111111;
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: none;
          -ms-overflow-style: none;
          position: relative;
        }
        .jv-cats::-webkit-scrollbar { display: none; }
        .jv-cats::before, .jv-cats::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 40px;
          z-index: 2;
          pointer-events: none;
        }
        .jv-cats::before { left: 0; background: linear-gradient(to right, #111, transparent); }
        .jv-cats::after  { right: 0; background: linear-gradient(to left, #111, transparent); }
        .jv-cats-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          align-items: center;
          gap: 0;
          width: max-content;
          min-width: 100%;
          justify-content: center;
        }
        .jv-catlink {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 11px 12px;
          font-size: 12.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.45);
          white-space: nowrap;
          transition: color 0.2s;
          position: relative;
          letter-spacing: 0.02em;
        }
        .jv-catlink::after {
          content: '';
          position: absolute;
          bottom: 0; left: 16px; right: 16px;
          height: 2px;
          border-radius: 2px 2px 0 0;
          background: var(--cat-color, #B42225);
          transform: scaleX(0);
          transition: transform 0.22s cubic-bezier(0.16,1,0.3,1);
        }
        .jv-catlink:hover { color: rgba(255,255,255,0.95); }
        .jv-catlink:hover::after { transform: scaleX(1); }
        .jv-catlink:hover .jv-catic { color: var(--cat-color, #B42225); }
        .jv-catic {
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          transition: color 0.2s;
        }
        .jv-cat-sep {
          width: 1px;
          height: 14px;
          background: rgba(255,255,255,0.07);
          flex-shrink: 0;
        }
      `}</style>

      <header className="jv-header" role="banner">

        {/* ── Main bar ── */}
        <div className={`jv-main ${scrolled ? "scrolled" : ""}`}>
          <div className="jv-main-inner">

            <button
              className="jv-burger"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <span /><span /><span />
            </button>

            <Link href="/" className="jv-logo" aria-label="JOVO">
              <Image
                src="/images/Jovo_official_logo.png"
                alt="JOVO"
                width={130}
                height={44}
                className="h-9 w-24 object-cover"
                priority
              />
            </Link>

            <nav className="jv-nav" aria-label="Main navigation">
              {navLinks.map(({ href, label }) => (
                <Link key={href} href={href} className="jv-navlink">{label}</Link>
              ))}
              <Link href="/flash-sales" className="jv-flash">
                <span className="jv-flash-dot" />
                <FontAwesomeIcon icon={faBolt} className="text-[11px]" />
                Flash Sales
              </Link>
            </nav>

            <div className="jv-right">
              <Link href="/become-seller" className="jv-sell">
                Sell on JOVO
              </Link>
              <Link href="/login" className="jv-signin">
                <FontAwesomeIcon icon={faUser} className="text-[11px]" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            </div>

          </div>
        </div>

        {/* ── Category strip ── */}
        <nav className="jv-cats" aria-label="Product categories">
          <div className="jv-cats-inner">
            {catItems.map(({ href, icon, label, color }, i) => (
              <React.Fragment key={href}>
                {i > 0 && <span className="jv-cat-sep" />}
                <Link
                  href={href}
                  className="jv-catlink"
                  style={{ "--cat-color": color } as React.CSSProperties}
                >
                  <FontAwesomeIcon icon={icon} className="jv-catic" />
                  {label}
                </Link>
              </React.Fragment>
            ))}
          </div>
        </nav>

      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}