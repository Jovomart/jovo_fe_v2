import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruckFast,
  faGraduationCap,
  faCamera,
  faHouse,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

const services = [
  {
    icon: faTruckFast,
    accent: "#FF8C00",
    glow: "rgba(255,140,0,0.18)",
    num: "01",
    title: "Campus Delivery",
    desc: "Lightning-fast delivery anywhere on campus. Real-time tracking, guaranteed timings.",
    href: "/logistics",
    cta: "Explore Logistics",
    tag: "Fast & Reliable",
  },
  {
    icon: faGraduationCap,
    accent: "#B42225",
    glow: "rgba(180,34,37,0.18)",
    num: "02",
    title: "Tutoring & Education",
    desc: "Connect with top students for tutoring in any subject. Affordable, flexible, effective.",
    href: "/services",
    cta: "Find Tutors",
    tag: "Peer-to-Peer",
  },
  {
    icon: faCamera,
    accent: "#8b5cf6",
    glow: "rgba(139,92,246,0.18)",
    num: "03",
    title: "Photography & Media",
    desc: "Book campus photographers for portraits, events, and content creation at student rates.",
    href: "/services",
    cta: "Book a Shoot",
    tag: "Student Rates",
  },
  {
    icon: faHouse,
    accent: "#10b981",
    glow: "rgba(16,185,129,0.18)",
    num: "04",
    title: "Accommodation",
    desc: "Find verified hostels, apartments, and short-let accommodation near your campus.",
    href: "/accommodations",
    cta: "Find Housing",
    tag: "Verified Listings",
  },
];

export default function ServicesSection() {
  return (
    <>
      <style>{`
        /* ── Root ──────────────────────────────────────────────── */
        .svc-root {
          position: relative;
          padding: 96px 24px 108px;
          background: #07070e;
          overflow: hidden;
          isolation: isolate;
        }
        @media (max-width: 767px) { .svc-root { padding: 64px 16px 76px; } }

        /* ── Background layer ──────────────────────────────────── */
        .svc-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }

        .svc-bg__grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
          background-size: 64px 64px;
        }
        .svc-bg__grain {
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          opacity: 0.016;
          mix-blend-mode: overlay;
        }
        .svc-bg__orb-r {
          position: absolute; bottom: -20%; right: -10%;
          width: 52%; height: 65%;
          background: radial-gradient(ellipse at 100% 100%, rgba(180,34,37,0.11) 0%, transparent 65%);
          filter: blur(90px);
        }
        .svc-bg__orb-l {
          position: absolute; top: -15%; left: -8%;
          width: 40%; height: 55%;
          background: radial-gradient(ellipse at 0% 0%, rgba(255,140,0,0.07) 0%, transparent 65%);
          filter: blur(90px);
        }
        .svc-bg__top-line {
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent 5%, rgba(180,34,37,0.28) 35%, rgba(255,140,0,0.28) 65%, transparent 95%);
        }
        .svc-bg__bot-line {
          position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.05) 50%, transparent 95%);
        }

        /* ── Inner ─────────────────────────────────────────────── */
        .svc-inner {
          position: relative;
          z-index: 1;
          max-width: 1340px;
          margin: 0 auto;
        }

        /* ── Header ────────────────────────────────────────────── */
        .svc-header {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: end;
          gap: 24px;
          margin-bottom: 56px;
        }
        @media (max-width: 767px) {
          .svc-header { grid-template-columns: 1fr; margin-bottom: 40px; }
          .svc-header__right { display: none; }
        }

        .svc-eyebrow {
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
          margin-bottom: 22px;
        }
        .svc-eyebrow__dot {
          width: 5px; height: 5px;
          background: #FF8C00;
          border-radius: 50%;
          animation: svc-blink 1.9s ease-in-out infinite;
        }
        @keyframes svc-blink {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.25; transform:scale(0.5); }
        }

        .svc-h2 {
          font-family: var(--font-sora, 'Sora', sans-serif);
          font-size: clamp(28px, 4vw, 52px);
          font-weight: 900;
          letter-spacing: -0.028em;
          line-height: 1.05;
          color: #fff;
          margin-bottom: 16px;
        }
        .svc-h2__grad {
          background: linear-gradient(135deg, #B42225 0%, #FF8C00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .svc-h2__ghost {
          -webkit-text-stroke: 2px rgba(255,255,255,0.14);
          -webkit-text-fill-color: transparent;
        }

        .svc-sub {
          font-size: 14px;
          line-height: 1.78;
          color: rgba(255,255,255,0.68);
          max-width: 400px;
        }

        /* Service count pill (top-right) */
        .svc-header__right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          padding-bottom: 4px;
        }
        .svc-count-big {
          font-family: var(--font-sora, monospace);
          font-size: clamp(52px, 6vw, 80px);
          font-weight: 900;
          line-height: 0.9;
          letter-spacing: -0.04em;
          background: linear-gradient(135deg, rgba(180,34,37,0.35), rgba(255,140,0,0.18));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .svc-count-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
        }

        /* ── Grid ──────────────────────────────────────────────── */
        .svc-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 1023px) { .svc-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; } }
        @media (max-width: 559px)  { .svc-grid { grid-template-columns: 1fr; gap: 12px; } }

        /* ── Card ──────────────────────────────────────────────── */
        .svc-card {
          position: relative;
          border-radius: 22px;
          background: rgba(255,255,255,0.028);
          border: 1px solid rgba(255,255,255,0.07);
          padding: 28px 24px 26px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition:
            transform 0.32s cubic-bezier(0.16,1,0.3,1),
            border-color 0.28s ease,
            box-shadow 0.32s ease;
          text-decoration: none;
          cursor: default;
        }
        .svc-card:hover {
          transform: translateY(-7px);
          border-color: var(--svc-accent-border, rgba(255,140,0,0.25));
          box-shadow: 0 28px 60px rgba(0,0,0,0.5), var(--svc-glow-shadow, 0 0 40px rgba(255,140,0,0.08));
        }

        /* Top bar accent on hover */
        .svc-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--svc-accent-grad, linear-gradient(90deg, #B42225, #FF8C00));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .svc-card:hover::before { transform: scaleX(1); }

        /* Ambient glow behind icon */
        .svc-card__glow-blob {
          position: absolute;
          top: -30px; left: -30px;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: var(--svc-glow, rgba(255,140,0,0.14));
          filter: blur(55px);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
          z-index: 0;
        }
        .svc-card:hover .svc-card__glow-blob { opacity: 1; }

        /* Scan sheen */
        .svc-card__scan {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.055), transparent);
          transform: translateX(-100%);
          pointer-events: none;
          z-index: 1;
        }
        .svc-card:hover .svc-card__scan {
          transform: translateX(100%);
          transition: transform 0.75s ease;
        }

        /* Card number watermark */
        .svc-card__num {
          position: absolute;
          top: 18px; right: 22px;
          font-family: var(--font-sora, monospace);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.06);
          z-index: 1;
          pointer-events: none;
          transition: color 0.3s ease;
        }
        .svc-card:hover .svc-card__num {
          color: var(--svc-accent-faint, rgba(255,140,0,0.15));
        }

        /* Tag chip */
        .svc-card__tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 100px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: var(--svc-tag-bg, rgba(255,140,0,0.08));
          border: 1px solid var(--svc-tag-border, rgba(255,140,0,0.18));
          color: var(--svc-accent, #FF8C00);
          margin-bottom: 18px;
          width: fit-content;
          position: relative;
          z-index: 2;
        }
        .svc-card__tag-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.6;
        }

        /* Icon */
        .svc-card__icon {
          width: 52px; height: 52px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          background: var(--svc-icon-bg, rgba(255,140,0,0.1));
          color: var(--svc-accent, #FF8C00);
          margin-bottom: 20px;
          position: relative;
          z-index: 2;
          transition: transform 0.28s cubic-bezier(0.16,1,0.3,1), box-shadow 0.28s ease;
        }
        .svc-card:hover .svc-card__icon {
          transform: scale(1.1) rotate(-4deg);
          box-shadow: 0 6px 24px var(--svc-glow, rgba(255,140,0,0.28));
        }

        /* Text */
        .svc-card__title {
          font-family: var(--font-sora, sans-serif);
          font-size: 15.5px;
          font-weight: 800;
          color: rgba(255,255,255,0.88);
          letter-spacing: -0.015em;
          margin-bottom: 10px;
          line-height: 1.3;
          position: relative;
          z-index: 2;
          transition: color 0.22s ease;
        }
        .svc-card:hover .svc-card__title { color: #fff; }

        .svc-card__desc {
          font-size: 13px;
          line-height: 1.72;
          color: rgba(255,255,255,0.65);
          flex: 1;
          margin-bottom: 22px;
          position: relative;
          z-index: 2;
          transition: color 0.22s ease;
        }
        .svc-card:hover .svc-card__desc { color: rgba(255,255,255,0.7); }

        /* CTA link */
        .svc-card__cta {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 12.5px;
          font-weight: 800;
          color: var(--svc-accent, #FF8C00);
          text-decoration: none;
          letter-spacing: 0.02em;
          position: relative;
          z-index: 2;
          transition: gap 0.22s ease, opacity 0.22s ease;
          width: fit-content;
        }
        .svc-card__cta:hover { gap: 12px; }
        .svc-card__cta-icon {
          font-size: 10px;
          transition: transform 0.22s ease;
        }
        .svc-card__cta:hover .svc-card__cta-icon { transform: translateX(3px); }

        /* Bottom glow line */
        .svc-card__foot-line {
          position: absolute;
          bottom: 0; left: 15%; right: 15%;
          height: 1.5px;
          background: var(--svc-accent-grad, linear-gradient(90deg, transparent, #FF8C00, #B42225, transparent));
          transform: scaleX(0);
          transition: transform 0.35s ease;
          border-radius: 2px;
          z-index: 2;
        }
        .svc-card:hover .svc-card__foot-line { transform: scaleX(1); }

        /* ── Footer strip ──────────────────────────────────────── */
        .svc-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 56px;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.18);
          letter-spacing: 0.06em;
        }
        @media (max-width: 767px) { .svc-footer { margin-top: 40px; flex-wrap: wrap; } }
        .svc-footer__sep {
          width: 3px; height: 3px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .svc-card, .svc-card__icon, .svc-card__scan,
          .svc-card__cta, .svc-card__foot-line, .svc-card__glow-blob {
            transition: none !important;
            animation: none !important;
          }
          .svc-eyebrow__dot { animation: none !important; }
        }
      `}</style>

      <section className="svc-root" aria-label="Campus services">
        {/* ── Ambient background ────────────────────────────────── */}
        <div className="svc-bg" aria-hidden="true">
          <div className="svc-bg__grid" />
          <div className="svc-bg__grain" />
          <div className="svc-bg__orb-r" />
          <div className="svc-bg__orb-l" />
          <div className="svc-bg__top-line" />
          <div className="svc-bg__bot-line" />
        </div>

        <div className="svc-inner">
          {/* ── Header ─────────────────────────────────────────── */}
          <div className="svc-header">
            <div>
              <div className="svc-eyebrow">
                <span className="svc-eyebrow__dot" />
                Beyond Shopping
              </div>
              <h2 className="svc-h2">
                Services &amp; <span className="svc-h2__grad">Logistics</span>
                <br />
                <span className="svc-h2__ghost">For Campus Life</span>
              </h2>
              <p className="svc-sub">
                JOVO is more than a marketplace — we power every corner of
                campus life.
              </p>
            </div>
            <div className="svc-header__right">
              <span className="svc-count-big">04</span>
              <span className="svc-count-label">Services</span>
            </div>
          </div>

          {/* ── Cards ──────────────────────────────────────────── */}
          <div className="svc-grid">
            {services.map(
              ({ icon, accent, glow, num, title, desc, href, cta, tag }) => (
                <article
                  key={title}
                  className="svc-card"
                  style={
                    {
                      "--svc-accent": accent,
                      "--svc-glow": glow,
                      "--svc-accent-border": `${accent}40`,
                      "--svc-glow-shadow": `0 0 40px ${glow}`,
                      "--svc-icon-bg": `${accent}18`,
                      "--svc-tag-bg": `${accent}10`,
                      "--svc-tag-border": `${accent}28`,
                      "--svc-accent-faint": `${accent}22`,
                      "--svc-accent-grad": `linear-gradient(90deg, ${accent}, ${accent}aa)`,
                    } as React.CSSProperties
                  }
                >
                  <div className="svc-card__glow-blob" />
                  <div className="svc-card__scan" />
                  <span className="svc-card__num">{num}</span>

                  <div className="svc-card__tag">
                    <span className="svc-card__tag-dot" />
                    {tag}
                  </div>

                  <div className="svc-card__icon" aria-hidden="true">
                    <FontAwesomeIcon icon={icon} />
                  </div>

                  <h3 className="svc-card__title">{title}</h3>
                  <p className="svc-card__desc">{desc}</p>

                  <Link href={href} className="svc-card__cta">
                    {cta}
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="svc-card__cta-icon"
                    />
                  </Link>

                  <div className="svc-card__foot-line" />
                </article>
              ),
            )}
          </div>

          {/* ── Footer trust strip ─────────────────────────────── */}
          <div className="svc-footer">
            {[
              "Campus-first platform",
              "Student-run network",
              "Verified service providers",
              "Available 24 / 7",
            ].map((t, i, arr) => (
              <span key={t} style={{ display: "contents" }}>
                <span>{t}</span>
                {i < arr.length - 1 && <span className="svc-footer__sep" />}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
