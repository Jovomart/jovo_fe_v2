import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMobileScreen, faBell, faLocationDot, faPercent, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { faApple, faGooglePlay } from '@fortawesome/free-brands-svg-icons'

const FEATURES = [
  { icon: faBell,        text: 'Instant deal alerts & flash sale notifications' },
  { icon: faLocationDot, text: 'Real-time delivery tracking on map'             },
  { icon: faPercent,     text: 'App-exclusive coupons & cashback offers'        },
]

const STORES = [
  { icon: faApple,      sub: 'Download on the', main: 'App Store',   label: 'Download on the App Store', href: '#' },
  { icon: faGooglePlay, sub: 'Get it on',        main: 'Google Play', label: 'Get it on Google Play',    href: '#' },
]

export default function AppSection() {
  return (
    <>
      <style>{`
        /* ── Root ──────────────────────────────────────────────── */
        .app-root {
          position: relative;
          padding: 100px 24px 112px;
          background: #07070e;
          overflow: hidden;
          isolation: isolate;
        }
        @media (max-width: 767px) { .app-root { padding: 68px 16px 80px; } }

        /* ── Background ──────────────────────────────────────────*/
        .app-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }

        .app-bg__grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
          background-size: 64px 64px;
        }
        .app-bg__grain {
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          opacity: 0.016;
          mix-blend-mode: overlay;
        }
        .app-bg__orb-r {
          position: absolute; top: -10%; right: -12%;
          width: 55%; height: 70%;
          background: radial-gradient(ellipse at 100% 0%, rgba(180,34,37,0.14) 0%, transparent 65%);
          filter: blur(90px);
        }
        .app-bg__orb-l {
          position: absolute; bottom: -15%; left: -8%;
          width: 45%; height: 60%;
          background: radial-gradient(ellipse at 0% 100%, rgba(255,140,0,0.08) 0%, transparent 65%);
          filter: blur(90px);
        }
        /* Mid glow directly behind phone */
        .app-bg__orb-mid {
          position: absolute;
          top: 50%; right: 20%;
          transform: translateY(-50%);
          width: 35%; height: 80%;
          background: radial-gradient(ellipse at 50% 50%, rgba(255,140,0,0.07) 0%, rgba(180,34,37,0.05) 40%, transparent 70%);
          filter: blur(70px);
        }
        .app-bg__top-line {
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent 5%, rgba(180,34,37,0.28) 35%, rgba(255,140,0,0.28) 65%, transparent 95%);
        }
        .app-bg__bot-line {
          position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.05) 50%, transparent 95%);
        }

        /* ── Inner ─────────────────────────────────────────────── */
        .app-inner {
          position: relative;
          z-index: 1;
          max-width: 1340px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        @media (max-width: 1023px) {
          .app-inner { grid-template-columns: 1fr; gap: 64px; }
        }

        /* ── LEFT ──────────────────────────────────────────────── */
        .app-left { display: flex; flex-direction: column; }
        @media (max-width: 1023px) { .app-left { align-items: center; text-align: center; } }

        /* Eyebrow */
        .app-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 14px;
          border-radius: 100px;
          background: rgba(255,140,0,0.07);
          border: 1px solid rgba(255,140,0,0.18);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,140,0,0.7);
          margin-bottom: 26px;
          width: fit-content;
        }
        .app-eyebrow__dot {
          width: 5px; height: 5px;
          background: #FF8C00;
          border-radius: 50%;
          animation: app-blink 1.9s ease-in-out infinite;
        }
        @keyframes app-blink {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.25; transform:scale(0.5); }
        }

        /* Heading */
        .app-h2 {
          font-family: var(--font-sora, 'Sora', sans-serif);
          font-size: clamp(28px, 3.8vw, 50px);
          font-weight: 900;
          letter-spacing: -0.028em;
          line-height: 1.06;
          color: #fff;
          margin-bottom: 18px;
        }
        .app-h2__grad {
          background: linear-gradient(135deg, #B42225 0%, #FF8C00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .app-h2__ghost {
          -webkit-text-stroke: 2px rgba(255,255,255,0.13);
          -webkit-text-fill-color: transparent;
        }

        /* Sub */
        .app-sub {
          font-size: 14px;
          line-height: 1.78;
          color: rgba(255,255,255,0.3);
          max-width: 440px;
          margin-bottom: 36px;
        }
        @media (max-width: 1023px) { .app-sub { max-width: 500px; } }

        /* Feature list */
        .app-features {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 44px;
          list-style: none;
          padding: 0;
        }
        @media (max-width: 1023px) { .app-features { align-items: center; } }

        .app-feature {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 13px 18px;
          background: rgba(255,255,255,0.028);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          transition: border-color 0.22s ease, background 0.22s ease;
          max-width: 440px;
          width: 100%;
        }
        .app-feature:hover {
          border-color: rgba(255,140,0,0.2);
          background: rgba(255,140,0,0.04);
        }
        .app-feature__icon-wrap {
          width: 34px; height: 34px;
          border-radius: 10px;
          background: rgba(255,140,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          color: #FF8C00;
          flex-shrink: 0;
          transition: transform 0.22s ease;
        }
        .app-feature:hover .app-feature__icon-wrap { transform: scale(1.08); }
        .app-feature__text {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.5);
          line-height: 1.5;
        }
        .app-feature:hover .app-feature__text { color: rgba(255,255,255,0.7); }

        /* Store buttons */
        .app-stores {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        @media (max-width: 1023px) { .app-stores { justify-content: center; } }

        .app-store-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 22px;
          border-radius: 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
          backdrop-filter: blur(8px);
        }
        .app-store-btn:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.22);
          transform: translateY(-3px);
          box-shadow: 0 14px 36px rgba(0,0,0,0.4);
        }
        .app-store-btn--primary {
          background: linear-gradient(135deg, #B42225, #FF8C00);
          border-color: transparent;
          box-shadow: 0 6px 24px rgba(180,34,37,0.35);
        }
        .app-store-btn--primary:hover {
          background: linear-gradient(135deg, #cc2a2d, #ff9d1a);
          border-color: transparent;
          box-shadow: 0 14px 40px rgba(180,34,37,0.5);
        }
        .app-store-btn__icon { font-size: 22px; flex-shrink: 0; }
        .app-store-btn__sub  { display: block; font-size: 9px; opacity: 0.6; letter-spacing: 0.04em; }
        .app-store-btn__main { display: block; font-size: 14px; font-weight: 800; letter-spacing: -0.01em; }

        /* ── RIGHT — phone ─────────────────────────────────────── */
        .app-right {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        /* Floating ring halos behind phone */
        .app-halo {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,140,0,0.06);
          pointer-events: none;
          animation: app-halo-breathe 5s ease-in-out infinite;
        }
        .app-halo--1 { width: 340px; height: 340px; animation-delay: 0s; }
        .app-halo--2 { width: 460px; height: 460px; animation-delay: 1s;  border-color: rgba(180,34,37,0.04); }
        .app-halo--3 { width: 580px; height: 580px; animation-delay: 2s;  border-color: rgba(255,140,0,0.03); }
        @keyframes app-halo-breathe {
          0%,100% { transform: scale(1); opacity: 0.6; }
          50%      { transform: scale(1.03); opacity: 1; }
        }

        /* Floating glow orb */
        .app-glow {
          position: absolute;
          width: 260px; height: 260px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,140,0,0.18) 0%, rgba(180,34,37,0.1) 40%, transparent 70%);
          filter: blur(40px);
          pointer-events: none;
          animation: app-glow-drift 6s ease-in-out infinite;
        }
        @keyframes app-glow-drift {
          0%,100% { transform: translate(0, 0); }
          50%      { transform: translate(12px, -16px); }
        }

        /* Phone shell */
        .app-phone {
          position: relative;
          z-index: 10;
          width: 248px;
          animation: app-float 5s ease-in-out infinite;
          filter: drop-shadow(0 40px 80px rgba(0,0,0,0.55)) drop-shadow(0 0 40px rgba(255,140,0,0.1));
        }
        @keyframes app-float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-14px); }
        }

        /* Side buttons */
        .app-phone__btn-l {
          position: absolute; left: -8px; top: 88px;
          width: 3px; height: 30px;
          background: linear-gradient(180deg, #2a2a2a, #1a1a1a);
          border-radius: 2px 0 0 2px;
        }
        .app-phone__btn-r1 {
          position: absolute; right: -8px; top: 78px;
          width: 3px; height: 20px;
          background: linear-gradient(180deg, #2a2a2a, #1a1a1a);
          border-radius: 0 2px 2px 0;
        }
        .app-phone__btn-r2 {
          position: absolute; right: -8px; top: 108px;
          width: 3px; height: 36px;
          background: linear-gradient(180deg, #2a2a2a, #1a1a1a);
          border-radius: 0 2px 2px 0;
        }

        /* Frame */
        .app-phone__frame {
          background: #0e0e0e;
          border-radius: 44px;
          border: 6px solid #111;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.06),
            inset 0 0 0 1px rgba(255,255,255,0.04),
            0 40px 80px rgba(0,0,0,0.6);
          position: relative;
        }

        /* Notch */
        .app-phone__notch {
          position: absolute;
          top: 5px;
          left: 50%;
          transform: translateX(-50%);
          width: 76px; height: 20px;
          background: #0a0a0a;
          border-radius: 0 0 14px 14px;
          z-index: 20;
        }
        /* Status dots in notch */
        .app-phone__notch::after {
          content: '';
          position: absolute;
          right: 14px; top: 6px;
          width: 5px; height: 5px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
        }

        /* Screen body */
        .app-phone__screen {
          background: #0a0a12;
          padding: 32px 10px 14px;
          min-height: 420px;
          position: relative;
        }

        /* Screen top bar */
        .app-screen__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 4px 10px;
        }
        .app-screen__bell {
          width: 22px; height: 22px;
          border-radius: 7px;
          background: rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          color: rgba(255,255,255,0.4);
        }

        /* Search bar */
        .app-screen__search {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 9px;
          padding: 7px 10px;
          margin-bottom: 10px;
          gap: 6px;
        }
        .app-screen__search-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
          flex-shrink: 0;
        }
        .app-screen__search-text {
          font-size: 9px;
          color: rgba(255,255,255,0.2);
        }

        /* Hero banner */
        .app-screen__banner {
          height: 80px;
          border-radius: 14px;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #0d0408, #1a0500);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 10px 12px;
        }
        .app-screen__banner-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(180,34,37,0.35), rgba(255,140,0,0.2));
          opacity: 0.6;
        }
        .app-screen__banner-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 16px 16px;
        }
        .app-screen__banner-title {
          position: relative; z-index: 1;
          font-size: 12px; font-weight: 900;
          color: #fff; line-height: 1.2;
          font-family: var(--font-sora, sans-serif);
        }
        .app-screen__banner-sub {
          position: relative; z-index: 1;
          font-size: 8.5px;
          color: rgba(255,255,255,0.45);
          margin-top: 2px;
        }

        /* Section label */
        .app-screen__label {
          font-size: 7.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.22);
          margin-bottom: 7px;
          padding: 0 2px;
        }

        /* Categories */
        .app-screen__cats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 5px;
          margin-bottom: 12px;
        }
        .app-screen__cat {
          border-radius: 9px;
          padding: 7px 3px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .app-screen__cat-icon { font-size: 12px; }
        .app-screen__cat-lbl  { font-size: 6.5px; font-weight: 700; color: rgba(255,255,255,0.35); }

        /* Products */
        .app-screen__products {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
          margin-bottom: 12px;
        }
        .app-screen__product {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          overflow: hidden;
        }
        .app-screen__product-img {
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          opacity: 0.75;
        }
        .app-screen__product-info { padding: 5px 7px 7px; }
        .app-screen__product-price {
          font-size: 10px;
          font-weight: 900;
          background: linear-gradient(135deg, #FF6B6B, #FF8C00);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .app-screen__product-name {
          font-size: 8px;
          color: rgba(255,255,255,0.35);
          font-weight: 600;
          margin-top: 1px;
        }

        /* CTA pill */
        .app-screen__cta {
          background: linear-gradient(135deg, #B42225, #FF8C00);
          color: #fff;
          text-align: center;
          padding: 9px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.02em;
          font-family: var(--font-sora, sans-serif);
        }

        /* Floating notification bubble */
        .app-notif {
          position: absolute;
          top: -16px;
          right: -24px;
          background: rgba(7,5,18,0.96);
          border: 1px solid rgba(255,140,0,0.22);
          border-radius: 14px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 158px;
          backdrop-filter: blur(14px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
          z-index: 20;
          animation: app-notif-in 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.8s both;
        }
        @keyframes app-notif-in {
          from { opacity:0; transform: scale(0.85) translateY(-8px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }
        .app-notif__dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px rgba(34,197,94,0.8);
          flex-shrink: 0;
          animation: app-notif-blink 1.6s ease-in-out infinite;
        }
        @keyframes app-notif-blink {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.3; transform:scale(0.65); }
        }
        .app-notif__body { display: flex; flex-direction: column; gap: 1px; }
        .app-notif__title { font-size: 10px; font-weight: 800; color: #fff; }
        .app-notif__sub   { font-size: 8.5px; color: rgba(255,255,255,0.38); font-weight: 600; }

        /* Floating download count badge */
        .app-badge {
          position: absolute;
          bottom: -14px;
          left: -28px;
          background: rgba(7,5,18,0.96);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          backdrop-filter: blur(14px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
          z-index: 20;
          animation: app-badge-in 0.7s cubic-bezier(0.34,1.56,0.64,1) 1.1s both;
        }
        @keyframes app-badge-in {
          from { opacity:0; transform: scale(0.85) translateY(8px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }
        .app-badge__stars { display: flex; gap: 2px; }
        .app-badge__star  { font-size: 8px; color: #FF8C00; }
        .app-badge__num {
          font-size: 15px;
          font-weight: 900;
          font-family: var(--font-sora, sans-serif);
          color: #fff;
          line-height: 1;
        }
        .app-badge__label {
          font-size: 8.5px;
          font-weight: 700;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.04em;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .app-phone, .app-glow,
          .app-halo, .app-notif, .app-badge {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .app-eyebrow__dot, .app-notif__dot { animation: none !important; }
        }
      `}</style>

      <section className="app-root" aria-label="Download the JOVO app">

        {/* ── Background ─────────────────────────────────────── */}
        <div className="app-bg" aria-hidden="true">
          <div className="app-bg__grid" />
          <div className="app-bg__grain" />
          <div className="app-bg__orb-r" />
          <div className="app-bg__orb-l" />
          <div className="app-bg__orb-mid" />
          <div className="app-bg__top-line" />
          <div className="app-bg__bot-line" />
        </div>

        <div className="app-inner">

          {/* ════════════════ LEFT ════════════════ */}
          <div className="app-left">

            <div className="app-eyebrow">
              <span className="app-eyebrow__dot" />
              <FontAwesomeIcon icon={faMobileScreen} />
              Mobile App
            </div>

            <h2 className="app-h2">
              Shop on the Go<br />
              with the{' '}
              <span className="app-h2__grad">JOVO App</span>
              <br />
              <span className="app-h2__ghost">Anytime, Anywhere</span>
            </h2>

            <p className="app-sub">
              Exclusive app-only deals, instant notifications, and the smoothest
              campus shopping experience — right in your pocket.
            </p>

            <ul className="app-features" aria-label="App features">
              {FEATURES.map(({ icon, text }) => (
                <li key={text} className="app-feature">
                  <div className="app-feature__icon-wrap" aria-hidden="true">
                    <FontAwesomeIcon icon={icon} />
                  </div>
                  <span className="app-feature__text">{text}</span>
                </li>
              ))}
            </ul>

            <div className="app-stores">
              {STORES.map(({ icon, sub, main, label, href }, i) => (
                <Link
                  key={main}
                  href={href}
                  aria-label={label}
                  className={`app-store-btn${i === 0 ? ' app-store-btn--primary' : ''}`}
                >
                  <FontAwesomeIcon icon={icon} className="app-store-btn__icon" />
                  <div>
                    <span className="app-store-btn__sub">{sub}</span>
                    <span className="app-store-btn__main">{main}</span>
                  </div>
                </Link>
              ))}
            </div>

          </div>

          {/* ════════════════ RIGHT — phone ════════════════ */}
          <div className="app-right" aria-hidden="true">

            {/* Halo rings */}
            <div className="app-halo app-halo--1" />
            <div className="app-halo app-halo--2" />
            <div className="app-halo app-halo--3" />

            {/* Glow blob */}
            <div className="app-glow" />

            {/* Phone */}
            <div className="app-phone">

              {/* Side buttons */}
              <div className="app-phone__btn-l" />
              <div className="app-phone__btn-r1" />
              <div className="app-phone__btn-r2" />

              {/* Floating notification */}
              <div className="app-notif">
                <div className="app-notif__dot" />
                <div className="app-notif__body">
                  <span className="app-notif__title">⚡ Flash Sale!</span>
                  <span className="app-notif__sub">60% OFF — 2 hrs left</span>
                </div>
              </div>

              {/* Floating rating badge */}
              <div className="app-badge">
                <div>
                  <div className="app-badge__stars">
                    {Array(5).fill(null).map((_, i) => (
                      <span key={i} className="app-badge__star">★</span>
                    ))}
                  </div>
                  <div className="app-badge__num">4.9</div>
                  <div className="app-badge__label">50k+ reviews</div>
                </div>
              </div>

              {/* Frame */}
              <div className="app-phone__frame">
                <div className="app-phone__notch" />

                <div className="app-phone__screen">

                  {/* Header */}
                  <div className="app-screen__header">
                    <Image
                      src="/images/Jovo_official_logo.png"
                      alt="JOVO"
                      width={64} height={20}
                      className="h-4 w-20 object-cover brightness-0 invert"
                    />
                    <div className="app-screen__bell">
                      <FontAwesomeIcon icon={faBell} />
                    </div>
                  </div>

                  {/* Search */}
                  <div className="app-screen__search">
                    <div className="app-screen__search-dot" />
                    <span className="app-screen__search-text">Search products...</span>
                  </div>

                  {/* Banner */}
                  <div className="app-screen__banner">
                    <div className="app-screen__banner-glow" />
                    <div className="app-screen__banner-grid" />
                    <span className="app-screen__banner-title">Flash Sales ⚡</span>
                    <span className="app-screen__banner-sub">Up to 60% OFF today only</span>
                  </div>

                  {/* Categories */}
                  <p className="app-screen__label">Categories</p>
                  <div className="app-screen__cats">
                    {[
                      { icon: '📱', label: 'Phones'  },
                      { icon: '📺', label: 'Elec.'   },
                      { icon: '👗', label: 'Fashion'  },
                      { icon: '🎮', label: 'Games'   },
                    ].map(({ icon, label }) => (
                      <div key={label} className="app-screen__cat">
                        <span className="app-screen__cat-icon">{icon}</span>
                        <span className="app-screen__cat-lbl">{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Products */}
                  <p className="app-screen__label">Featured</p>
                  <div className="app-screen__products">
                    {[
                      { icon: '📱', price: '₦850k', name: 'iPhone 15',       bg: 'rgba(255,140,0,0.08)'  },
                      { icon: '💻', price: '₦185k', name: 'MacBook Air',     bg: 'rgba(180,34,37,0.08)'  },
                    ].map(({ icon, price, name, bg }) => (
                      <div key={name} className="app-screen__product">
                        <div className="app-screen__product-img" style={{ background: bg }}>{icon}</div>
                        <div className="app-screen__product-info">
                          <div className="app-screen__product-price">{price}</div>
                          <div className="app-screen__product-name">{name}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="app-screen__cta">Shop Now at JOVO</div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}