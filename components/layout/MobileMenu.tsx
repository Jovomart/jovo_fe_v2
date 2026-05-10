'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faXmark, faPlug, faMobileScreen, faSpa, faTv, faShirt, faLaptop,
  faGamepad, faBasketShopping, faBolt, faConciergeBell, faTruck,
  faStore, faBagShopping, faUser, faChevronRight, faHeart,
  faNewspaper, faPhone,
} from '@fortawesome/free-solid-svg-icons'

interface Props { open: boolean; onClose: () => void }

const categories = [
  { href: '/appliances-deals', icon: faPlug, label: 'Appliances', color: '#f59e0b' },
  { href: '/phone-deals', icon: faMobileScreen, label: 'Phones & Tablets', color: '#3b82f6' },
  { href: '/beauty-deals', icon: faSpa, label: 'Health & Beauty', color: '#ec4899' },
  { href: '/electronic-deals', icon: faTv, label: 'Electronics', color: '#8b5cf6' },
  { href: '/fashion-deals', icon: faShirt, label: 'Fashion', color: '#B42225' },
  { href: '/computing-deals', icon: faLaptop, label: 'Computing', color: '#06b6d4' },
  { href: '/gaming-deals', icon: faGamepad, label: 'Gaming', color: '#10b981' },
  { href: '/groceries', icon: faBasketShopping, label: 'Groceries', color: '#84cc16' },
]

const explore = [
  { href: '/shop', icon: faBagShopping, label: 'Shop All', sub: 'Browse everything' },
  { href: '/services', icon: faConciergeBell, label: 'Campus Services', sub: 'Skills & freelance' },
  { href: '/logistics', icon: faTruck, label: 'Delivery', sub: 'Track your orders' },
  { href: '/become-seller', icon: faStore, label: 'Sell on JOVO', sub: 'Start earning today' },
  { href: '/wishlist', icon: faHeart, label: 'My Wishlist', sub: 'Saved items' },
  { href: '/news', icon: faNewspaper, label: 'News', sub: 'Campus updates' },
  { href: '/contact', icon: faPhone, label: 'Contact Us', sub: "We're here to help" },
]

export default function MobileMenu({ open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  return (
    <>
      <style>{`
        @media (min-width: 1024px) {
          .jvm-overlay { display: none !important; }
        }
        .jvm-overlay {
          position: fixed; inset: 0; z-index: 800;
          pointer-events: none; opacity: 0;
          transition: opacity 0.3s ease;
        }
        .jvm-overlay.open { pointer-events: all; opacity: 1; }
        .jvm-backdrop {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
        .jvm-panel {
          position: absolute; top: 0; left: 0; bottom: 0;
          width: 300px; max-width: 88vw;
          background: #fff;
          display: flex; flex-direction: column; overflow: hidden;
          transform: translateX(-100%);
          transition: transform 0.38s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 20px 0 60px rgba(0,0,0,0.12);
        }
        .jvm-overlay.open .jvm-panel { transform: translateX(0); }

        .jvm-head {
          background: #111;
          padding: 20px 18px 18px;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }
        .jvm-head::before {
          content: '';
          position: absolute; top: -40px; right: -30px;
          width: 140px; height: 140px; border-radius: 50%;
          background: radial-gradient(circle, rgba(180,34,37,0.3), transparent 65%);
          pointer-events: none;
        }
        .jvm-close {
          width: 30px; height: 30px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.45);
          background: rgba(255,255,255,0.07);
          font-size: 13px;
          transition: all 0.2s;
          border: none; cursor: pointer;
        }
        .jvm-close:hover { background: rgba(255,255,255,0.13); color: white; }
        .jvm-flash {
          display: flex; align-items: center; gap: 10px;
          margin: 10px 12px 0;
          padding: 10px 12px;
          border-radius: 10px;
          background: rgba(255,140,0,0.06);
          border: 1px solid rgba(255,140,0,0.18);
          transition: all 0.2s;
          text-decoration: none;
        }
        .jvm-flash:hover { background: rgba(255,140,0,0.1); border-color: rgba(255,140,0,0.3); }
        .jvm-flash-ic {
          width: 34px; height: 34px; border-radius: 9px;
          background: rgba(255,140,0,0.1);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; color: #FF8C00; flex-shrink: 0;
        }
        .jvm-pulse { animation: jvmp 1.4s ease-in-out infinite; }
        @keyframes jvmp { 0%,100%{opacity:1} 50%{opacity:0.25} }
        .jvm-body { flex:1; overflow-y:auto; padding: 6px 12px 16px; scrollbar-width:none; }
        .jvm-body::-webkit-scrollbar { display:none; }
        .jvm-sec {
          font-size: 10px; font-weight: 800;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: #bbb; padding: 14px 8px 5px;
        }
        .jvm-div { height: 1px; background: #f0f0f0; margin: 8px; }
        .jvm-item {
          display: flex; align-items: center; gap: 11px;
          padding: 9px 10px; border-radius: 10px;
          text-decoration: none; transition: background 0.18s;
          margin-bottom: 1px;
        }
        .jvm-item:hover { background: #fafafa; }
        .jvm-item:hover .jvm-ic { color: var(--ic, #B42225); background: color-mix(in srgb, var(--ic, #B42225) 10%, transparent); }
        .jvm-item:hover .jvm-lbl { color: var(--ic, #B42225); }
        .jvm-item:hover .jvm-arr { color: #ccc; transform: translateX(2px); }
        .jvm-ic {
          width: 34px; height: 34px; border-radius: 9px;
          background: #f3f3f3;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; color: #888; flex-shrink: 0;
          transition: all 0.18s;
        }
        .jvm-lbl { font-size: 13.5px; font-weight: 600; color: #1a1a1a; flex:1; transition: color 0.18s; }
        .jvm-sub { font-size: 11px; color: #bbb; font-weight: 500; margin-top: 1px; }
        .jvm-arr { font-size: 10px; color: #e0e0e0; transition: all 0.18s; flex-shrink: 0; }
        .jvm-foot {
          padding: 12px; border-top: 1px solid #f0f0f0;
          background: #fafafa; flex-shrink: 0;
        }
        .jvm-signinbtn {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; width: 100%; padding: 13px;
          border-radius: 10px; background: #B42225;
          color: white; font-size: 14px; font-weight: 700;
          text-decoration: none; letter-spacing: 0.01em;
          box-shadow: 0 4px 14px rgba(180,34,37,0.22);
          transition: all 0.2s;
        }
        .jvm-signinbtn:hover { background: #9e1e21; transform: translateY(-1px); }
      `}</style>

      <div className={`jvm-overlay ${open ? 'open' : ''}`} id="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation">
        <div className="jvm-backdrop" onClick={onClose} />
        <div className="jvm-panel" ref={panelRef}>

          {/* Header */}
          <div className="jvm-head">
            <div className="flex items-center justify-between relative z-10">
              <Image src="/images/Jovo_off_logo2.png" alt="JOVO" width={90} height={32} className="h-7 w-24 object-cover" priority />
              <button onClick={onClose} className="jvm-close" aria-label="Close">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <p className="text-[10.5px] font-medium tracking-widest uppercase text-white/25 mt-2.5 relative z-10">Your Campus Marketplace</p>
          </div>

          {/* Flash */}
          <Link href="/flash-sales" onClick={onClose} className="jvm-flash">
            <div className="jvm-flash-ic"><FontAwesomeIcon icon={faBolt} /></div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-[#FF8C00]">Flash Sales</p>
              <p className="text-[11px] text-[#FF8C00]/50 mt-0.5">Limited time deals</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-[#FF8C00] jvm-pulse" />
          </Link>

          {/* Body */}
          <div className="jvm-body">
            <p className="jvm-sec">Shop by Category</p>
            {categories.map(({ href, icon, label, color }) => (
              <Link key={href} href={href} onClick={onClose} className="jvm-item" style={{ '--ic': color } as React.CSSProperties}>
                <div className="jvm-ic"><FontAwesomeIcon icon={icon} /></div>
                <span className="jvm-lbl">{label}</span>
                <FontAwesomeIcon icon={faChevronRight} className="jvm-arr" />
              </Link>
            ))}
            <div className="jvm-div" />
            <p className="jvm-sec">Explore</p>
            {explore.map(({ href, icon, label, sub }) => (
              <Link key={href} href={href} onClick={onClose} className="jvm-item">
                <div className="jvm-ic"><FontAwesomeIcon icon={icon} /></div>
                <div className="flex-1">
                  <p className="jvm-lbl">{label}</p>
                  <p className="jvm-sub">{sub}</p>
                </div>
                <FontAwesomeIcon icon={faChevronRight} className="jvm-arr" />
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="jvm-foot">
            <Link href="/login" onClick={onClose} className="jvm-signinbtn">
              <FontAwesomeIcon icon={faUser} className="text-[12px]" />
              Sign In / Register
            </Link>
          </div>

        </div>
      </div>
    </>
  )
}