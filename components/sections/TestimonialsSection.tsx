"use client";
import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faStar,
  faQuoteLeft,
} from "@fortawesome/free-solid-svg-icons";
import { TESTIMONIALS } from "@/data";

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval>>();
  const touchX = useRef(0);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setVisibleCount(1);
      else if (window.innerWidth < 960) setVisibleCount(2);
      else setVisibleCount(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIdx = Math.max(0, TESTIMONIALS.length - visibleCount);

  // Derived value — auto-clamps current when visibleCount shrinks.
  // No setState inside an effect needed.
  const effectiveCurrent = Math.min(current, maxIdx);

  const goTo = useCallback(
    (idx: number) => {
      setCurrent(Math.max(0, Math.min(idx, maxIdx)));
    },
    [maxIdx],
  );

  // Pure DOM sync — reads effectiveCurrent, never calls setState.
  useLayoutEffect(() => {
    if (!trackRef.current) return;
    const card = trackRef.current.querySelector<HTMLElement>(".tsc-card");
    const gap = 16;
    const cardW = card ? card.offsetWidth + gap : 0;
    trackRef.current.style.transform = `translateX(-${effectiveCurrent * cardW}px)`;
  }, [effectiveCurrent]);

  const next = useCallback(
    () => goTo(effectiveCurrent >= maxIdx ? 0 : effectiveCurrent + 1),
    [effectiveCurrent, maxIdx, goTo],
  );
  const prev = useCallback(
    () => goTo(effectiveCurrent > 0 ? effectiveCurrent - 1 : maxIdx),
    [effectiveCurrent, maxIdx, goTo],
  );

  const resetAuto = useCallback(() => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(next, 4800);
  }, [next]);

  useEffect(() => {
    autoRef.current = setInterval(next, 4800);
    return () => clearInterval(autoRef.current);
  }, [next]);

  const dots = Array.from({ length: maxIdx + 1 }, (_, i) => i);

  return (
    <>
      <style>{`
        /* ── Root ──────────────────────────────────────────────── */
        .tsc-root {
          position: relative;
          padding: 96px 24px 108px;
          background: #07070e;
          overflow: hidden;
          isolation: isolate;
        }
        @media (max-width: 767px) { .tsc-root { padding: 64px 16px 76px; } }

        /* ── Ambient background ──────────────────────────────── */
        .tsc-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .tsc-bg__grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
          background-size: 64px 64px;
        }
        .tsc-bg__grain {
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          opacity: 0.016;
          mix-blend-mode: overlay;
        }
        .tsc-bg__orb-r {
          position: absolute; top: -15%; right: -10%;
          width: 50%; height: 65%;
          background: radial-gradient(ellipse at 100% 0%, rgba(180,34,37,0.12) 0%, transparent 65%);
          filter: blur(90px);
        }
        .tsc-bg__orb-l {
          position: absolute; bottom: -20%; left: -8%;
          width: 42%; height: 58%;
          background: radial-gradient(ellipse at 0% 100%, rgba(255,140,0,0.07) 0%, transparent 65%);
          filter: blur(90px);
        }
        .tsc-bg__top-line {
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent 5%, rgba(180,34,37,0.28) 35%, rgba(255,140,0,0.28) 65%, transparent 95%);
        }
        /* Large watermark quote mark */
        .tsc-bg__watermark {
          position: absolute;
          top: 12%;
          left: 50%;
          transform: translateX(-50%);
          font-size: clamp(180px, 30vw, 360px);
          font-weight: 900;
          font-family: Georgia, serif;
          color: rgba(255,255,255,0.018);
          line-height: 1;
          pointer-events: none;
          user-select: none;
          letter-spacing: -0.05em;
        }

        /* ── Inner ─────────────────────────────────────────────── */
        .tsc-inner {
          position: relative;
          z-index: 1;
          max-width: 1340px;
          margin: 0 auto;
        }

        /* ── Header ────────────────────────────────────────────── */
        .tsc-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 60px;
        }
        @media (max-width: 767px) { .tsc-header { margin-bottom: 40px; } }

        .tsc-eyebrow {
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
          margin-bottom: 24px;
        }
        .tsc-eyebrow__dot {
          width: 5px; height: 5px;
          background: #FF8C00;
          border-radius: 50%;
          animation: tsc-blink 1.9s ease-in-out infinite;
        }
        @keyframes tsc-blink {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.25; transform:scale(0.5); }
        }

        .tsc-h2 {
          font-family: var(--font-sora, 'Sora', sans-serif);
          font-size: clamp(28px, 4vw, 52px);
          font-weight: 900;
          letter-spacing: -0.028em;
          line-height: 1.05;
          color: #fff;
          margin-bottom: 16px;
        }
        .tsc-h2__grad {
          background: linear-gradient(135deg, #B42225 0%, #FF8C00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .tsc-h2__ghost {
          -webkit-text-stroke: 2px rgba(255,255,255,0.13);
          -webkit-text-fill-color: transparent;
        }
        .tsc-sub {
          font-size: 14px;
          line-height: 1.78;
          color: rgba(255,255,255,0.68);
          max-width: 400px;
        }

        /* Rating summary pill */
        .tsc-rating-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 20px;
          border-radius: 100px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          margin-top: 24px;
        }
        .tsc-rating-stars { display: flex; gap: 3px; }
        .tsc-rating-star  { font-size: 10px; color: #FF8C00; }
        .tsc-rating-sep   { width: 1px; height: 14px; background: rgba(255,255,255,0.1); }
        .tsc-rating-text  {
          font-size: 11.5px;
          font-weight: 700;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.03em;
        }
        .tsc-rating-text strong { color: rgba(255,255,255,0.85); font-weight: 800; }

        /* ── Slider shell ──────────────────────────────────────── */
        .tsc-slider-shell { position: relative; }

        /* Edge fade masks */
        .tsc-slider-shell::before,
        .tsc-slider-shell::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 72px;
          pointer-events: none;
          z-index: 10;
        }
        .tsc-slider-shell::before {
          left: 0;
          background: linear-gradient(90deg, #07070e 0%, transparent 100%);
        }
        .tsc-slider-shell::after {
          right: 0;
          background: linear-gradient(90deg, transparent 0%, #07070e 100%);
        }

        /* ── Track ─────────────────────────────────────────────── */
        .tsc-viewport {
          overflow: hidden;
          padding: 16px 4px 24px;
        }
        .tsc-track {
          display: flex;
          gap: 16px;
          transition: transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94);
          will-change: transform;
        }

        /* ── Card ──────────────────────────────────────────────── */
        .tsc-card {
          flex-shrink: 0;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0;
          background: rgba(255,255,255,0.028);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 22px;
          padding: 28px 26px 26px;
          overflow: hidden;
          position: relative;
          transition:
            transform 0.32s cubic-bezier(0.16,1,0.3,1),
            border-color 0.28s ease,
            box-shadow 0.32s ease;
          cursor: default;
        }
        @media (min-width: 640px)  { .tsc-card { width: calc(50% - 8px); } }
        @media (min-width: 960px)  { .tsc-card { width: calc(33.333% - 11px); } }

        .tsc-card:hover {
          transform: translateY(-6px);
          border-color: rgba(255,140,0,0.2);
          box-shadow: 0 24px 56px rgba(0,0,0,0.5), 0 0 40px rgba(255,140,0,0.06);
        }

        /* Top accent bar */
        .tsc-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, #B42225, #FF8C00);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
          border-radius: 2px 2px 0 0;
        }
        .tsc-card:hover::before { transform: scaleX(1); }

        /* Scan sheen */
        .tsc-card__scan {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
          transform: translateX(-100%);
          pointer-events: none;
          z-index: 0;
        }
        .tsc-card:hover .tsc-card__scan {
          transform: translateX(100%);
          transition: transform 0.8s ease;
        }

        /* Quote icon */
        .tsc-card__quote-icon {
          position: absolute;
          top: 22px;
          right: 22px;
          font-size: 22px;
          color: rgba(255,255,255,0.04);
          transition: color 0.3s ease;
          z-index: 1;
        }
        .tsc-card:hover .tsc-card__quote-icon {
          color: rgba(255,140,0,0.1);
        }

        /* Stars */
        .tsc-card__stars {
          display: flex;
          gap: 3px;
          margin-bottom: 16px;
          position: relative;
          z-index: 2;
        }
        .tsc-card__star { font-size: 11px; color: #FF8C00; }

        /* Quote text */
        .tsc-card__text {
          font-size: 13.5px;
          line-height: 1.8;
          color: rgba(255,255,255,0.7);
          font-style: italic;
          flex: 1;
          margin-bottom: 22px;
          position: relative;
          z-index: 2;
          transition: color 0.22s ease;
        }
        .tsc-card:hover .tsc-card__text { color: rgba(255,255,255,0.85); }

        /* Divider */
        .tsc-card__divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0.07), transparent);
          margin-bottom: 18px;
          position: relative;
          z-index: 2;
        }

        /* Author */
        .tsc-card__author {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 2;
        }
        .tsc-card__avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 900;
          color: #fff;
          font-family: var(--font-sora, sans-serif);
          flex-shrink: 0;
          border: 1.5px solid rgba(255,255,255,0.12);
          transition: transform 0.25s ease;
        }
        .tsc-card:hover .tsc-card__avatar { transform: scale(1.06); }

        .tsc-card__name {
          display: block;
          font-size: 13px;
          font-weight: 800;
          color: rgba(255,255,255,0.8);
          letter-spacing: -0.01em;
          font-style: normal;
          transition: color 0.22s ease;
        }
        .tsc-card:hover .tsc-card__name { color: #fff; }
        .tsc-card__role {
          display: block;
          font-size: 11px;
          color: rgba(255,255,255,0.55);
          font-weight: 600;
          margin-top: 2px;
        }

        /* Verified badge */
        .tsc-card__verified {
          margin-left: auto;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,140,0,0.55);
          background: rgba(255,140,0,0.08);
          border: 1px solid rgba(255,140,0,0.15);
          border-radius: 100px;
          padding: 3px 9px;
        }

        /* ── Controls ─────────────────────────────────────────── */
        .tsc-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 44px;
        }

        .tsc-arrow {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.78);
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.22s ease;
          backdrop-filter: blur(8px);
        }
        .tsc-arrow:hover {
          background: linear-gradient(135deg, #B42225, #FF8C00);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 6px 24px rgba(180,34,37,0.4);
          transform: scale(1.06);
        }
        .tsc-arrow:active { transform: scale(0.96); }

        /* Dots */
        .tsc-dots {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .tsc-dot {
          height: 6px;
          border-radius: 100px;
          cursor: pointer;
          border: none;
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .tsc-dot--inactive {
          width: 6px;
          background: rgba(255,255,255,0.12);
        }
        .tsc-dot--inactive:hover {
          background: rgba(255,140,0,0.4);
          transform: scale(1.2);
        }
        .tsc-dot--active {
          width: 28px;
          background: linear-gradient(90deg, #B42225, #FF8C00);
          box-shadow: 0 0 10px rgba(255,140,0,0.35);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .tsc-track { transition: none !important; }
          .tsc-card, .tsc-card__scan, .tsc-card__avatar { transition: none !important; animation: none !important; }
          .tsc-eyebrow__dot { animation: none !important; }
          .tsc-arrow { transition: none !important; }
          .tsc-dot  { transition: none !important; }
        }
      `}</style>

      <section className="tsc-root" aria-label="Customer testimonials">
        {/* ── Background ─────────────────────────────────────── */}
        <div className="tsc-bg" aria-hidden="true">
          <div className="tsc-bg__grid" />
          <div className="tsc-bg__grain" />
          <div className="tsc-bg__orb-r" />
          <div className="tsc-bg__orb-l" />
          <div className="tsc-bg__top-line" />
          <div className="tsc-bg__watermark">"</div>
        </div>

        <div className="tsc-inner">
          {/* ── Header ─────────────────────────────────────────── */}
          <header className="tsc-header">
            <div className="tsc-eyebrow">
              <span className="tsc-eyebrow__dot" />
              Community Voices
            </div>

            <h2 className="tsc-h2">
              Loved by <span className="tsc-h2__grad">Students</span>
              <br />
              <span className="tsc-h2__ghost">Across Campus</span>
            </h2>

            <p className="tsc-sub">
              Don't take our word for it — hear directly from our community.
            </p>

            <div
              className="tsc-rating-pill"
              aria-label="Average rating 4.9 from 2400 reviews"
            >
              <div className="tsc-rating-stars" aria-hidden="true">
                {Array(5)
                  .fill(null)
                  .map((_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
                      className="tsc-rating-star"
                    />
                  ))}
              </div>
              <div className="tsc-rating-sep" />
              <span className="tsc-rating-text">
                <strong>4.9</strong> from 2,400+ reviews
              </span>
            </div>
          </header>

          {/* ── Slider ─────────────────────────────────────────── */}
          <div className="tsc-slider-shell">
            <div className="tsc-viewport">
              <div
                ref={trackRef}
                className="tsc-track"
                onTouchStart={(e) => {
                  touchX.current = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  const diff = touchX.current - e.changedTouches[0].clientX;
                  if (Math.abs(diff) > 45) {
                    diff > 0 ? next() : prev();
                    resetAuto();
                  }
                }}
              >
                {TESTIMONIALS.map((t) => (
                  <blockquote key={t.id} className="tsc-card">
                    <div className="tsc-card__scan" aria-hidden="true" />
                    <FontAwesomeIcon
                      icon={faQuoteLeft}
                      className="tsc-card__quote-icon"
                      aria-hidden="true"
                    />

                    {/* Stars */}
                    <div className="tsc-card__stars" aria-label="5 stars">
                      {Array(5)
                        .fill(null)
                        .map((_, i) => (
                          <FontAwesomeIcon
                            key={i}
                            icon={faStar}
                            className="tsc-card__star"
                          />
                        ))}
                    </div>

                    {/* Quote */}
                    <p className="tsc-card__text">"{t.text}"</p>

                    {/* Divider */}
                    <div className="tsc-card__divider" aria-hidden="true" />

                    {/* Author */}
                    <footer className="tsc-card__author">
                      <div
                        className="tsc-card__avatar"
                        style={{ background: t.avatarColor }}
                        aria-hidden="true"
                      >
                        {t.initial}
                      </div>
                      <div>
                        <cite className="tsc-card__name">{t.name}</cite>
                        <span className="tsc-card__role">{t.role}</span>
                      </div>
                      <span
                        className="tsc-card__verified"
                        aria-label="Verified buyer"
                      >
                        ✓ Verified
                      </span>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </div>

          {/* ── Controls ───────────────────────────────────────── */}
          <div className="tsc-controls">
            <button
              onClick={() => {
                prev();
                resetAuto();
              }}
              className="tsc-arrow"
              aria-label="Previous testimonial"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <div
              className="tsc-dots"
              role="tablist"
              aria-label="Testimonial navigation"
            >
              {dots.map((i) => (
                <button
                  key={i}
                  role="tab"
                  aria-label={`Go to testimonial ${i + 1}`}
                  aria-selected={i === effectiveCurrent}
                  onClick={() => {
                    goTo(i);
                    resetAuto();
                  }}
                  className={`tsc-dot ${i === effectiveCurrent ? "tsc-dot--active" : "tsc-dot--inactive"}`}
                />
              ))}
            </div>

            <button
              onClick={() => {
                next();
                resetAuto();
              }}
              className="tsc-arrow"
              aria-label="Next testimonial"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
