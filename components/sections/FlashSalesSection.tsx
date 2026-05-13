"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faArrowRight,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { useCountdown } from "@/hooks/useCountdown";
import { products } from "@/data/products";

export default function FlashSalesSection() {
  const { hours, mins, secs } = useCountdown();
  const barsRef = useRef<HTMLDivElement>(null);
  const [barsAnimated, setBarsAnimated] = useState(false);

  const flashProducts = products.filter((p) => p.category === "flash-sales");

  useEffect(() => {
    const el = barsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBarsAnimated(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="flash-section" aria-label="Flash sales">
      {/* Ambient background */}
      <div className="flash-bg" aria-hidden="true">
        <div className="flash-bg-orb flash-bg-orb--r" />
        <div className="flash-bg-orb flash-bg-orb--l" />
        <div className="flash-bg-grain" />
        <div className="flash-bg-grid" />
        <div className="flash-bg-line" />
      </div>

      <div className="flash-inner">
        {/* ── Header ── */}
        <header className="flash-header">
          {/* Left — label + live pill */}
          <div className="flash-header__left">
            <span className="flash-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faBolt} />
            </span>
            <h2 className="flash-title">Flash Sales</h2>
            <span className="flash-live" aria-label="Sale is live">
              <span className="flash-live__dot" />
              LIVE
            </span>
          </div>

          {/* Center — countdown */}
          <div className="flash-countdown" aria-label="Time remaining">
            <span className="flash-countdown__label">Ends in</span>
            <div className="flash-countdown__digits">
              {[
                { val: hours, label: "HRS" },
                { val: mins, label: "MIN" },
                { val: secs, label: "SEC" },
              ].map(({ val, label }, i) => (
                <div key={label} className="flash-countdown__group">
                  {i > 0 && (
                    <span className="flash-countdown__colon" aria-hidden="true">
                      :
                    </span>
                  )}
                  <div className="flash-countdown__block">
                    <strong className="flash-countdown__num">{val}</strong>
                    <span className="flash-countdown__unit">{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — view all */}
          <Link
            href="/flash-sales"
            className="flash-viewall"
            aria-label="View all flash sales"
          >
            View All
            <FontAwesomeIcon
              icon={faArrowRight}
              className="flash-viewall__icon"
            />
          </Link>
        </header>

        {/* ── Divider ── */}
        <div className="flash-divider" aria-hidden="true" />

        {/* ── Product Grid ── */}
        <div
          ref={barsRef}
          className="flash-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          role="list"
          aria-label="Flash sale products"
        >
          {flashProducts.map((p, idx) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="flash-card"
              role="listitem"
              aria-label={p.name}
              style={{ "--card-delay": `${idx * 80}ms` } as React.CSSProperties}
            >
              {/* Image */}
              <div className="flash-card__img-wrap">
                <Image
                  src={p.image}
                  alt={p.alt}
                  fill
                  className="flash-card__img"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Veil */}
                <div className="flash-card__veil" aria-hidden="true" />

                {/* Discount badge */}
                <span
                  className="flash-card__discount"
                  aria-label={`${p.discount}% off`}
                >
                  −{p.discount}%
                </span>

                {/* Hover overlay */}
                <div className="flash-card__hover-overlay" aria-hidden="true">
                  <span className="flash-card__explore-pill">
                    <FontAwesomeIcon
                      icon={faArrowUpRightFromSquare}
                      className="flash-card__explore-icon"
                    />
                    Explore
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flash-card__info">
                <h3 className="flash-card__name">{p.name}</h3>

                {/* Pricing */}
                <div className="flash-card__pricing">
                  <span className="flash-card__price">
                    ₦{p.price.toLocaleString()}
                  </span>
                  <span className="flash-card__old-price">
                    <del>₦{p.oldPrice.toLocaleString()}</del>
                  </span>
                </div>

                {/* Progress */}
                <div className="flash-card__progress-wrap">
                  <div
                    className="flash-card__progress-track"
                    role="progressbar"
                    aria-valuenow={p.sold}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${p.sold}% sold`}
                  >
                    <div
                      className="flash-card__progress-fill"
                      style={{ width: barsAnimated ? `${p.sold}%` : "0%" }}
                    />
                  </div>
                  <span className="flash-card__sold-label">
                    {p.sold}% claimed
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
