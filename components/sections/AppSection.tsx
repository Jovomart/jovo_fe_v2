import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMobileScreen,
  faBell,
  faLocationDot,
  faPercent,
  faMagnifyingGlass,
  faHouse,
  faNewspaper,
  faBasketShopping,
  faBook,
  faCircleQuestion,
  faChevronRight,
  faBoltLightning,
} from "@fortawesome/free-solid-svg-icons";
import { faApple, faGooglePlay } from "@fortawesome/free-brands-svg-icons";

const FEATURES = [
  { icon: faBell, text: "Instant deal alerts & flash sale notifications" },
  { icon: faLocationDot, text: "Real-time delivery tracking on map" },
  { icon: faPercent, text: "App-exclusive coupons & cashback offers" },
];

const STORES = [
  {
    icon: faApple,
    sub: "Download on the",
    main: "App Store",
    label: "Download on the App Store",
    href: "#",
  },
  {
    icon: faGooglePlay,
    sub: "Get it on",
    main: "Google Play",
    label: "Get it on Google Play",
    href: "#",
  },
];

const NAV_ITEMS = [
  { icon: faHouse, label: "Home", active: false },
  { icon: faNewspaper, label: "News", active: false },
  { icon: faBasketShopping, label: "Cart", active: true, isCart: true },
  { icon: faBook, label: "Guide", active: false },
  { icon: faCircleQuestion, label: "Help", active: false },
];

const CATEGORIES = [
  { emoji: "🏠", label: "Appliances" },
  { emoji: "📱", label: "Phones &\nTablets" },
  { emoji: "💊", label: "Health &\nBeauty" },
  { emoji: "💻", label: "Electronics" },
  { emoji: "👗", label: "Fashion" },
];

export default function AppSection() {
  return (
    <>
      <style>{`
        /* ── Root ────────────────────────────────────────────── */
        .app2-root {
          position: relative;
          padding: 100px 24px 112px;
          background: #07070e;
          overflow: hidden;
          isolation: isolate;
        }
        @media (max-width: 767px) { .app2-root { padding: 68px 16px 80px; } }

        /* ── Background ─────────────────────────────────────── */
        .app2-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .app2-bg__grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
          background-size: 64px 64px;
        }
        .app2-bg__grain {
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          opacity: 0.016; mix-blend-mode: overlay;
        }
        .app2-bg__orb-r {
          position: absolute; top: -10%; right: -12%;
          width: 55%; height: 70%;
          background: radial-gradient(ellipse at 100% 0%, rgba(180,34,37,0.13) 0%, transparent 65%);
          filter: blur(90px);
        }
        .app2-bg__orb-l {
          position: absolute; bottom: -15%; left: -8%;
          width: 45%; height: 60%;
          background: radial-gradient(ellipse at 0% 100%, rgba(255,140,0,0.07) 0%, transparent 65%);
          filter: blur(90px);
        }
        .app2-bg__orb-mid {
          position: absolute; top: 50%; right: 18%;
          transform: translateY(-50%);
          width: 38%; height: 85%;
          background: radial-gradient(ellipse at 50% 50%, rgba(255,140,0,0.06) 0%, rgba(180,34,37,0.04) 40%, transparent 70%);
          filter: blur(80px);
        }
        .app2-bg__top-line {
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent 5%, rgba(180,34,37,0.28) 35%, rgba(255,140,0,0.28) 65%, transparent 95%);
        }
        .app2-bg__bot-line {
          position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.05) 50%, transparent 95%);
        }

        /* ── Inner grid ─────────────────────────────────────── */
        .app2-inner {
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
          .app2-inner { grid-template-columns: 1fr; gap: 64px; }
        }

        /* ══════════════ LEFT COPY ══════════════ */
        .app2-left { display: flex; flex-direction: column; }
        @media (max-width: 1023px) { .app2-left { align-items: center; text-align: center; } }

        .app2-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 5px 14px; border-radius: 100px;
          background: rgba(255,140,0,0.07);
          border: 1px solid rgba(255,140,0,0.18);
          font-size: 10px; font-weight: 800;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(255,140,0,0.7);
          margin-bottom: 26px; width: fit-content;
        }
        .app2-eyebrow__dot {
          width: 5px; height: 5px; background: #FF8C00;
          border-radius: 50%;
          animation: app2-blink 1.9s ease-in-out infinite;
        }
        @keyframes app2-blink {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.25; transform:scale(0.5); }
        }

        .app2-h2 {
          font-family: var(--font-sora, 'Sora', sans-serif);
          font-size: clamp(28px, 3.8vw, 50px);
          font-weight: 900;
          letter-spacing: -0.028em;
          line-height: 1.06;
          color: #fff;
          margin-bottom: 18px;
        }
        .app2-h2__grad {
          background: linear-gradient(135deg, #B42225 0%, #FF8C00 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .app2-h2__ghost {
          -webkit-text-stroke: 2px rgba(255,255,255,0.13);
          -webkit-text-fill-color: transparent;
        }

        .app2-sub {
          font-size: 14px; line-height: 1.78;
          color: rgba(255,255,255,0.67);
          max-width: 440px; margin-bottom: 36px;
        }
        @media (max-width: 1023px) { .app2-sub { max-width: 500px; } }

        .app2-features {
          display: flex; flex-direction: column;
          gap: 12px; margin-bottom: 44px;
          list-style: none; padding: 0;
        }
        @media (max-width: 1023px) { .app2-features { align-items: center; } }

        .app2-feature {
          display: flex; align-items: center; gap: 14px;
          padding: 13px 18px;
          background: rgba(255,255,255,0.028);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          transition: border-color 0.22s ease, background 0.22s ease;
          max-width: 440px; width: 100%;
        }
        .app2-feature:hover {
          border-color: rgba(255,140,0,0.2);
          background: rgba(255,140,0,0.04);
        }
        .app2-feature__icon {
          width: 34px; height: 34px; border-radius: 10px;
          background: rgba(255,140,0,0.1);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; color: #FF8C00; flex-shrink: 0;
          transition: transform 0.22s ease;
        }
        .app2-feature:hover .app2-feature__icon { transform: scale(1.08); }
        .app2-feature__text {
          font-size: 13px; font-weight: 600;
          color: rgba(255,255,255,0.75); line-height: 1.5;
          transition: color 0.22s ease;
        }
        .app2-feature:hover .app2-feature__text { color: rgba(255,255,255,0.88); }

        .app2-stores { display: flex; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 1023px) { .app2-stores { justify-content: center; } }

        .app2-store-btn {
          display: flex; align-items: center; gap: 12px;
          padding: 13px 22px; border-radius: 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff; text-decoration: none;
          transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
          backdrop-filter: blur(8px);
        }
        .app2-store-btn:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.22);
          transform: translateY(-3px);
          box-shadow: 0 14px 36px rgba(0,0,0,0.4);
        }
        .app2-store-btn--primary {
          background: linear-gradient(135deg, #B42225, #FF8C00);
          border-color: transparent;
          box-shadow: 0 6px 24px rgba(180,34,37,0.35);
        }
        .app2-store-btn--primary:hover {
          background: linear-gradient(135deg, #cc2a2d, #ff9d1a);
          border-color: transparent;
          box-shadow: 0 14px 40px rgba(180,34,37,0.5);
        }
        .app2-store-btn__icon { font-size: 22px; flex-shrink: 0; }
        .app2-store-btn__sub  { display: block; font-size: 9px; opacity: 0.6; letter-spacing: 0.04em; }
        .app2-store-btn__main { display: block; font-size: 14px; font-weight: 800; letter-spacing: -0.01em; }

        /* ══════════════ RIGHT — PHONE ══════════════ */
        .app2-right {
          display: flex; justify-content: center; align-items: center;
          position: relative;
        }

        /* Halo rings */
        .app2-halo {
          position: absolute; border-radius: 50%;
          pointer-events: none;
          animation: app2-halo-pulse 5s ease-in-out infinite;
        }
        .app2-halo--1 { width: 320px; height: 320px; border: 1px solid rgba(255,140,0,0.07);  animation-delay: 0s;  }
        .app2-halo--2 { width: 440px; height: 440px; border: 1px solid rgba(180,34,37,0.04);  animation-delay: 1s;  }
        .app2-halo--3 { width: 560px; height: 560px; border: 1px solid rgba(255,140,0,0.025); animation-delay: 2s;  }
        @keyframes app2-halo-pulse {
          0%,100% { transform: scale(1); opacity: 0.6; }
          50%      { transform: scale(1.03); opacity: 1; }
        }

        /* Soft glow behind phone */
        .app2-glow {
          position: absolute;
          width: 280px; height: 280px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,140,0,0.14) 0%, rgba(180,34,37,0.08) 45%, transparent 70%);
          filter: blur(44px); pointer-events: none;
          animation: app2-glow-drift 6s ease-in-out infinite;
        }
        @keyframes app2-glow-drift {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(10px,-14px); }
        }

        /* Phone outer wrapper — floats */
        .app2-phone {
          position: relative; z-index: 10;
          width: 252px;
          animation: app2-float 5s ease-in-out infinite;
          filter: drop-shadow(0 44px 88px rgba(0,0,0,0.6)) drop-shadow(0 0 36px rgba(255,140,0,0.09));
        }
        @keyframes app2-float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-14px); }
        }

        /* Physical side buttons */
        .app2-btn-l  { position: absolute; left: -8px;  top: 90px;  width: 3px; height: 28px; background: #252525; border-radius: 2px 0 0 2px; }
        .app2-btn-r1 { position: absolute; right: -8px; top: 80px;  width: 3px; height: 20px; background: #252525; border-radius: 0 2px 2px 0; }
        .app2-btn-r2 { position: absolute; right: -8px; top: 110px; width: 3px; height: 36px; background: #252525; border-radius: 0 2px 2px 0; }

        /* Phone frame */
        .app2-frame {
          border-radius: 46px;
          border: 7px solid #1a1a1a;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.07),
            inset 0 0 0 1px rgba(255,255,255,0.04);
          position: relative;
          background: #1a1a1a;
        }

        /* Notch */
        .app2-notch {
          position: absolute; top: 5px;
          left: 50%; transform: translateX(-50%);
          width: 78px; height: 22px;
          background: #1a1a1a;
          border-radius: 0 0 16px 16px;
          z-index: 30;
        }

        /* ── SCREEN (light mode) ─────────────────────────────── */
        .app2-screen {
          background: #f5f5f5;
          min-height: 470px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        /* Top status strip */
        .app2-screen__status {
          background: #fff;
          padding: 28px 12px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        /* Hamburger */
        .app2-screen__hamburger {
          display: flex; flex-direction: column; gap: 3px;
          padding: 4px;
        }
        .app2-screen__ham-line {
          width: 14px; height: 1.5px;
          background: #222;
          border-radius: 2px;
        }
        .app2-screen__ham-line:nth-child(2) { width: 10px; }
        /* Logo text */
        .app2-screen__logo {
          font-family: var(--font-sora, 'Sora', sans-serif);
          font-size: 15px;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #B42225;
        }
        .app2-screen__logo span { color: #FF8C00; }
        /* Avatar + cart */
        .app2-screen__actions { display: flex; align-items: center; gap: 7px; }
        .app2-screen__avatar {
          width: 22px; height: 22px; border-radius: 50%;
          background: linear-gradient(135deg, #FF8C00, #B42225);
          display: flex; align-items: center; justify-content: center;
          font-size: 8px; font-weight: 800; color: #fff;
        }
        .app2-screen__cart-icon { font-size: 12px; color: #333; }

        /* Search row */
        .app2-screen__search-row {
          background: #fff;
          padding: 8px 12px 10px;
          display: flex; gap: 7px; align-items: center;
        }
        .app2-screen__search-box {
          flex: 1; display: flex; align-items: center; gap: 6px;
          background: #f0f0f0; border-radius: 9px;
          padding: 6px 10px;
          border: 1px solid #e5e5e5;
        }
        .app2-screen__search-icon { font-size: 8px; color: #aaa; }
        .app2-screen__search-text { font-size: 8.5px; color: #bbb; font-weight: 500; }
        .app2-screen__search-btn {
          width: 28px; height: 28px; border-radius: 8px;
          background: #FF8C00;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; color: #fff; flex-shrink: 0;
        }

        /* Hero banner — dark like the app */
        .app2-screen__banner {
          margin: 0;
          height: 140px;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        .app2-screen__banner-bg {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #0a0306 0%, #1a0800 60%, #0d0408 100%);
        }
        .app2-screen__banner-img-overlay {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 80% 40%, rgba(180,34,37,0.5) 0%, transparent 55%),
            radial-gradient(ellipse at 20% 80%, rgba(255,140,0,0.2) 0%, transparent 50%);
        }
        /* Slide counter */
        .app2-screen__slide-counter {
          position: absolute; top: 10px; right: 12px;
          font-size: 8px; font-weight: 700;
          color: rgba(255,255,255,0.6);
          background: rgba(0,0,0,0.35);
          padding: 2px 7px; border-radius: 100px;
          backdrop-filter: blur(4px);
        }
        .app2-screen__banner-content {
          position: absolute; bottom: 14px; left: 12px; right: 12px;
          z-index: 2;
        }
        .app2-screen__flash-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 2px 8px; border-radius: 100px;
          background: linear-gradient(135deg, #B42225, #FF8C00);
          font-size: 7px; font-weight: 900;
          color: #fff; letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        .app2-screen__banner-title {
          font-size: 13px; font-weight: 900;
          color: #fff; line-height: 1.25;
          font-family: var(--font-sora, sans-serif);
          margin-bottom: 3px;
        }
        .app2-screen__banner-sub {
          font-size: 7.5px; color: rgba(255,255,255,0.5);
          margin-bottom: 8px; font-weight: 500;
        }
        .app2-screen__banner-cta {
          display: inline-flex; align-items: center; gap: 5px;
          background: linear-gradient(135deg, #B42225, #cc3030);
          color: #fff; padding: 5px 12px; border-radius: 100px;
          font-size: 8px; font-weight: 800; letter-spacing: 0.04em;
        }
        /* Dots */
        .app2-screen__dots {
          position: absolute; bottom: 8px; right: 12px;
          display: flex; gap: 3px; align-items: center;
        }
        .app2-screen__dot {
          height: 3px; border-radius: 100px; background: rgba(255,255,255,0.3);
        }
        .app2-screen__dot--active { width: 12px; background: #FF8C00; }
        .app2-screen__dot--small  { width: 4px; }

        /* Scrollable body */
        .app2-screen__body {
          flex: 1;
          background: #f5f5f5;
          padding: 12px 10px 0;
          overflow: hidden;
        }

        /* Category strip */
        .app2-screen__cats {
          display: flex; gap: 6px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .app2-screen__cat {
          display: flex; flex-direction: column; align-items: center;
          gap: 4px; flex-shrink: 0;
          width: 42px;
        }
        .app2-screen__cat-img {
          width: 42px; height: 36px; border-radius: 10px;
          background: #e8e8e8;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          border: 1px solid rgba(0,0,0,0.06);
        }
        .app2-screen__cat-lbl {
          font-size: 6px; font-weight: 600;
          color: #555; text-align: center;
          line-height: 1.3;
        }

        /* Sell on JOVO banner */
        .app2-screen__sell {
          display: flex; align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, #B42225, #FF8C00);
          border-radius: 12px;
          padding: 10px 12px;
          margin-bottom: 0;
        }
        .app2-screen__sell-left {
          display: flex; align-items: center; gap: 8px;
        }
        .app2-screen__sell-icon {
          width: 24px; height: 24px; border-radius: 7px;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; color: #fff;
        }
        .app2-screen__sell-title {
          font-size: 9px; font-weight: 900;
          color: #fff; letter-spacing: -0.01em;
        }
        .app2-screen__sell-sub {
          font-size: 7px; color: rgba(255,255,255,0.7);
          font-weight: 500; margin-top: 1px;
        }
        .app2-screen__sell-btn {
          display: flex; align-items: center; gap: 3px;
          background: rgba(255,255,255,0.2);
          border-radius: 100px;
          padding: 4px 10px;
          font-size: 7.5px; font-weight: 800;
          color: #fff; white-space: nowrap;
        }

        /* Bottom nav */
        .app2-screen__nav {
          background: #fff;
          border-top: 1px solid #eee;
          display: flex; align-items: center;
          padding: 8px 4px 14px;
          position: relative;
        }
        .app2-screen__nav-item {
          flex: 1;
          display: flex; flex-direction: column; align-items: center;
          gap: 2px;
        }
        .app2-screen__nav-icon { font-size: 11px; color: #bbb; }
        .app2-screen__nav-icon--active { color: #B42225; }
        .app2-screen__nav-lbl { font-size: 6px; font-weight: 600; color: #bbb; }
        .app2-screen__nav-lbl--active { color: #B42225; }
        /* Center cart FAB */
        .app2-screen__nav-fab {
          flex: 1;
          display: flex; justify-content: center; align-items: center;
          margin-top: -20px;
        }
        .app2-screen__nav-fab-btn {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, #FF8C00, #e67e00);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; color: #fff;
          box-shadow: 0 4px 16px rgba(255,140,0,0.45);
        }

        /* ── Floating badges ─────────────────────────────────── */
        .app2-notif {
          position: absolute;
          top: -12px; right: -22px;
          background: rgba(7,5,18,0.96);
          border: 1px solid rgba(255,140,0,0.22);
          border-radius: 14px;
          padding: 9px 13px;
          display: flex; align-items: center; gap: 9px;
          min-width: 152px;
          backdrop-filter: blur(14px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.55);
          z-index: 20;
          animation: app2-pop-in 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.8s both;
        }
        @keyframes app2-pop-in {
          from { opacity:0; transform: scale(0.85) translateY(-8px); }
          to   { opacity:1; transform: scale(1)    translateY(0);    }
        }
        .app2-notif__dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px rgba(34,197,94,0.8);
          flex-shrink: 0;
          animation: app2-nd-blink 1.6s ease-in-out infinite;
        }
        @keyframes app2-nd-blink {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.3; transform:scale(0.65); }
        }
        .app2-notif__title { font-size: 10px; font-weight: 800; color: #fff; }
        .app2-notif__sub   { font-size: 8.5px; color: rgba(255,255,255,0.38); font-weight: 600; margin-top: 1px; }

        .app2-badge {
          position: absolute;
          bottom: -12px; left: -26px;
          background: rgba(7,5,18,0.96);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px;
          padding: 10px 14px;
          display: flex; align-items: center; gap: 10px;
          backdrop-filter: blur(14px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
          z-index: 20;
          animation: app2-badge-in 0.7s cubic-bezier(0.34,1.56,0.64,1) 1.1s both;
        }
        @keyframes app2-badge-in {
          from { opacity:0; transform: scale(0.85) translateY(8px); }
          to   { opacity:1; transform: scale(1)    translateY(0);   }
        }
        .app2-badge__stars { display: flex; gap: 2px; margin-bottom: 2px; }
        .app2-badge__star  { font-size: 8px; color: #FF8C00; }
        .app2-badge__num   {
          font-size: 16px; font-weight: 900; color: #fff; line-height: 1;
          font-family: var(--font-sora, sans-serif);
        }
        .app2-badge__label { font-size: 8px; color: rgba(255,255,255,0.28); font-weight: 600; margin-top: 2px; }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .app2-phone, .app2-glow, .app2-halo, .app2-notif, .app2-badge {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
          .app2-eyebrow__dot, .app2-notif__dot { animation: none !important; }
          .app2-store-btn, .app2-feature { transition: none !important; }
        }
      `}</style>

      <section className="app2-root" aria-label="Download the JOVO app">
        {/* Background */}
        <div className="app2-bg" aria-hidden="true">
          <div className="app2-bg__grid" />
          <div className="app2-bg__grain" />
          <div className="app2-bg__orb-r" />
          <div className="app2-bg__orb-l" />
          <div className="app2-bg__orb-mid" />
          <div className="app2-bg__top-line" />
          <div className="app2-bg__bot-line" />
        </div>

        <div className="app2-inner">
          {/* ════ LEFT COPY ════ */}
          <div className="app2-left">
            <div className="app2-eyebrow">
              <span className="app2-eyebrow__dot" />
              <FontAwesomeIcon icon={faMobileScreen} />
              Mobile App
            </div>

            <h2 className="app2-h2">
              Shop on the Go
              <br />
              with the <span className="app2-h2__grad">JOVO App</span>
              <br />
              <span className="app2-h2__ghost">Anytime. Anywhere.</span>
            </h2>

            <p className="app2-sub">
              Exclusive app-only deals, instant notifications, and the smoothest
              campus shopping experience — right in your pocket.
            </p>

            <ul className="app2-features" aria-label="App features">
              {FEATURES.map(({ icon, text }) => (
                <li key={text} className="app2-feature">
                  <div className="app2-feature__icon" aria-hidden="true">
                    <FontAwesomeIcon icon={icon} />
                  </div>
                  <span className="app2-feature__text">{text}</span>
                </li>
              ))}
            </ul>

            <div className="app2-stores">
              {STORES.map(({ icon, sub, main, label, href }, i) => (
                <Link
                  key={main}
                  href={href}
                  aria-label={label}
                  className={`app2-store-btn${i === 0 ? " app2-store-btn--primary" : ""}`}
                >
                  <FontAwesomeIcon
                    icon={icon}
                    className="app2-store-btn__icon"
                  />
                  <div>
                    <span className="app2-store-btn__sub">{sub}</span>
                    <span className="app2-store-btn__main">{main}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ════ RIGHT — PHONE ════ */}
          <div className="app2-right" aria-hidden="true">
            <div className="app2-halo app2-halo--1" />
            <div className="app2-halo app2-halo--2" />
            <div className="app2-halo app2-halo--3" />
            <div className="app2-glow" />

            <div className="app2-phone">
              <div className="app2-btn-l" />
              <div className="app2-btn-r1" />
              <div className="app2-btn-r2" />

              {/* Floating notification */}
              <div className="app2-notif">
                <div className="app2-notif__dot" />
                <div>
                  <div className="app2-notif__title">⚡ Flash Sale!</div>
                  <div className="app2-notif__sub">60% OFF — 2 hrs left</div>
                </div>
              </div>

              {/* Floating rating badge */}
              <div className="app2-badge">
                <div>
                  <div className="app2-badge__stars">
                    {Array(5)
                      .fill(null)
                      .map((_, i) => (
                        <span key={i} className="app2-badge__star">
                          ★
                        </span>
                      ))}
                  </div>
                  <div className="app2-badge__num">4.9</div>
                  <div className="app2-badge__label">50k+ reviews</div>
                </div>
              </div>

              <div className="app2-frame">
                <div className="app2-notch" />

                <div className="app2-screen">
                  {/* ── Top bar ── */}
                  <div className="app2-screen__status">
                    <div className="app2-screen__hamburger">
                      <div className="app2-screen__ham-line" />
                      <div className="app2-screen__ham-line" />
                      <div className="app2-screen__ham-line" />
                    </div>
                    {/* JOVO logo text */}
                    <div className="app2-screen__logo">
                      JO<span>V</span>O
                    </div>
                    <div className="app2-screen__actions">
                      <div className="app2-screen__avatar">BS</div>
                      <FontAwesomeIcon
                        icon={faBasketShopping}
                        className="app2-screen__cart-icon"
                      />
                    </div>
                  </div>

                  {/* ── Search ── */}
                  <div className="app2-screen__search-row">
                    <div className="app2-screen__search-box">
                      <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="app2-screen__search-icon"
                      />
                      <span className="app2-screen__search-text">
                        Search products, categories...
                      </span>
                    </div>
                    <div className="app2-screen__search-btn">
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </div>
                  </div>

                  {/* ── Hero banner ── */}
                  <div className="app2-screen__banner">
                    <div className="app2-screen__banner-bg" />
                    <div className="app2-screen__banner-img-overlay" />
                    <div className="app2-screen__slide-counter">3 / 7</div>
                    <div className="app2-screen__banner-content">
                      <div className="app2-screen__flash-badge">
                        <FontAwesomeIcon icon={faBoltLightning} />
                        Flash Sales
                      </div>
                      <div className="app2-screen__banner-title">
                        Up to 60% Off
                        <br />
                        Fashion &amp; Beauty
                      </div>
                      <div className="app2-screen__banner-sub">
                        Limited time deals ending soon
                      </div>
                      <div className="app2-screen__banner-cta">
                        Grab Deals
                        <FontAwesomeIcon
                          icon={faChevronRight}
                          style={{ fontSize: "6px" }}
                        />
                      </div>
                    </div>
                    <div className="app2-screen__dots">
                      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className={`app2-screen__dot${i === 2 ? " app2-screen__dot--active" : " app2-screen__dot--small"}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* ── Body ── */}
                  <div className="app2-screen__body">
                    {/* Categories */}
                    <div className="app2-screen__cats">
                      {CATEGORIES.map(({ emoji, label }) => (
                        <div key={label} className="app2-screen__cat">
                          <div className="app2-screen__cat-img">{emoji}</div>
                          <span className="app2-screen__cat-lbl">{label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Sell on JOVO */}
                    <div className="app2-screen__sell">
                      <div className="app2-screen__sell-left">
                        <div className="app2-screen__sell-icon">🛍️</div>
                        <div>
                          <div className="app2-screen__sell-title">
                            Sell on JOVO
                          </div>
                          <div className="app2-screen__sell-sub">
                            Reach campus buyers
                          </div>
                        </div>
                      </div>
                      <div className="app2-screen__sell-btn">
                        Start Now
                        <FontAwesomeIcon
                          icon={faChevronRight}
                          style={{ fontSize: "6px" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Bottom nav ── */}
                  <div className="app2-screen__nav">
                    {NAV_ITEMS.map(({ icon, label, active, isCart }) =>
                      isCart ? (
                        <div key={label} className="app2-screen__nav-fab">
                          <div className="app2-screen__nav-fab-btn">
                            <FontAwesomeIcon icon={icon} />
                          </div>
                        </div>
                      ) : (
                        <div key={label} className="app2-screen__nav-item">
                          <FontAwesomeIcon
                            icon={icon}
                            className={`app2-screen__nav-icon${active ? " app2-screen__nav-icon--active" : ""}`}
                          />
                          <span
                            className={`app2-screen__nav-lbl${active ? " app2-screen__nav-lbl--active" : ""}`}
                          >
                            {label}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
