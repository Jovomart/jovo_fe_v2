"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faArrowRight,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import apiService from "@/services/apiService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlashProduct {
  id: string;
  product_name: string;
  product_images: string[];
  product_original_price: number;
  current_price: number;
  flash_price?: number;
  discount_percentage: number;
  stock_quantity?: number;
  flash_stock?: number;
  remaining_stock?: number;
  ends_at?: string;
  is_in_stock: boolean;
}

interface FlashCampaign {
  id: string;
  name: string;
  ends_at: string;
  products: FlashProduct[];
}

// ─── Countdown helpers ────────────────────────────────────────────────────────

const getSecondsUntil = (isoDate: string | undefined): number => {
  if (!isoDate) return 36000;
  const diff = Math.floor((new Date(isoDate).getTime() - Date.now()) / 1000);
  return Math.max(0, diff);
};

const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");

const parseCountdown = (seconds: number) => ({
  hours: pad(seconds / 3600),
  mins: pad((seconds % 3600) / 60),
  secs: pad(seconds % 60),
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function FlashSalesSection() {
  const [campaign, setCampaign] = useState<FlashCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(36000);
  const [barsAnimated, setBarsAnimated] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const barsRef = useRef<HTMLDivElement>(null);

  // ── Fetch campaign (same pattern as shop FlashSales) ──────────────────────
  const fetchCampaign = useCallback(async () => {
    try {
      const data = await apiService.getActiveFlashSaleCampaign();
      const raw = data?.data ?? data;

      if (!raw) {
        setLoading(false);
        return;
      }

      const campaignObj: FlashCampaign = {
        id: raw.id ?? "",
        name: raw.name ?? "Flash Sales",
        ends_at: raw.ends_at ?? raw.end_time ?? "",
        products: Array.isArray(raw.products)
          ? raw.products.map((p: any) => ({
              id: String(p.id ?? p.product_id ?? ""),
              product_name: p.product_name ?? p.name ?? "",
              product_images: Array.isArray(p.product_images)
                ? p.product_images
                : p.image
                ? [p.image]
                : [],
              product_original_price:
                p.product_original_price ?? p.original_price ?? 0,
              current_price: p.current_price ?? p.price ?? 0,
              flash_price: p.flash_price ?? p.current_price ?? p.price ?? 0,
              discount_percentage: p.discount_percentage ?? 0,
              stock_quantity: p.stock_quantity ?? p.stock ?? 0,
              flash_stock: p.flash_stock ?? p.stock_quantity ?? 0,
              remaining_stock:
                p.remaining_stock ?? p.flash_stock ?? p.stock_quantity ?? 0,
              ends_at: p.ends_at ?? raw.ends_at ?? "",
              is_in_stock: p.is_in_stock ?? true,
            }))
          : [],
      };

      setCampaign(campaignObj);
      setTimeLeft(getSecondsUntil(campaignObj.ends_at));
    } catch {
      // No active flash sale — silently show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchCampaign();
    };
    load();
  }, [fetchCampaign]);

  // ── Countdown tick ────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(
      () => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)),
      1000,
    );
    return () => clearInterval(timer);
  }, []);

  // ── Animate progress bars on scroll into view ─────────────────────────────
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

  const { hours, mins, secs } = parseCountdown(timeLeft);

  const flashProducts = campaign?.products ?? [];

  // ── Skeleton cards ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="flash-section" aria-label="Flash sales">
        <div className="flash-bg" aria-hidden="true">
          <div className="flash-bg-orb flash-bg-orb--r" />
          <div className="flash-bg-orb flash-bg-orb--l" />
          <div className="flash-bg-grain" />
          <div className="flash-bg-grid" />
          <div className="flash-bg-line" />
        </div>

        <div className="flash-inner">
          <header className="flash-header">
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

          <div className="flash-divider" aria-hidden="true" />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flash-card flash-card--skeleton animate-pulse"
                aria-hidden="true"
              >
                <div className="flash-card__img-wrap flash-skeleton-img" />
                <div className="flash-card__info">
                  <div className="flash-skeleton-line flash-skeleton-line--name" />
                  <div className="flash-skeleton-line flash-skeleton-line--price" />
                  <div className="flash-skeleton-line flash-skeleton-line--bar" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!campaign || flashProducts.length === 0) {
    return (
      <section className="flash-section" aria-label="Flash sales">
        <div className="flash-bg" aria-hidden="true">
          <div className="flash-bg-orb flash-bg-orb--r" />
          <div className="flash-bg-orb flash-bg-orb--l" />
          <div className="flash-bg-grain" />
          <div className="flash-bg-grid" />
          <div className="flash-bg-line" />
        </div>

        <div className="flash-inner">
          <header className="flash-header">
            <div className="flash-header__left">
              <span className="flash-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faBolt} />
              </span>
              <h2 className="flash-title">Flash Sales</h2>
            </div>
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

          <div className="flash-divider" aria-hidden="true" />

          <div className="flash-empty" role="status" aria-live="polite">
            <span className="flash-empty__icon" aria-hidden="true">
              <FontAwesomeIcon icon={faBolt} />
            </span>
            <p className="flash-empty__title">No flash sales right now</p>
            <p className="flash-empty__sub">
              Check back soon — the next deal drops any moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ── Full section ──────────────────────────────────────────────────────────
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
            <h2 className="flash-title">{campaign.name}</h2>
            <span className="flash-live" aria-label="Sale is live">
              <span className="flash-live__dot" />
              LIVE
            </span>
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
                    <span
                      className="flash-countdown__colon"
                      aria-hidden="true"
                    >
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
          {flashProducts.map((p, idx) => {
            const effectivePrice = p.flash_price ?? p.current_price;
            const originalPrice = p.product_original_price;
            const discount =
              originalPrice > effectivePrice
                ? Math.round(
                    ((originalPrice - effectivePrice) / originalPrice) * 100,
                  )
                : Math.round(p.discount_percentage ?? 0);

            const totalStock = p.flash_stock ?? p.stock_quantity ?? 100;
            const remainingStock = p.remaining_stock ?? totalStock;
            const soldPct =
              totalStock > 0
                ? Math.round(
                    ((totalStock - remainingStock) / totalStock) * 100,
                  )
                : 0;

            const imgSrc = imgErrors[p.id]
              ? undefined
              : p.product_images?.[0] ?? undefined;

            return (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="flash-card"
                role="listitem"
                aria-label={p.product_name}
                style={
                  { "--card-delay": `${idx * 80}ms` } as React.CSSProperties
                }
              >
                {/* Image */}
                <div className="flash-card__img-wrap">
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={p.product_name}
                      fill
                      className="flash-card__img"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      onError={() =>
                        setImgErrors((prev) => ({ ...prev, [p.id]: true }))
                      }
                    />
                  ) : (
                    /* Fallback placeholder when no image or load error */
                    <div className="flash-card__img-placeholder" aria-hidden="true">
                      <FontAwesomeIcon icon={faBolt} />
                    </div>
                  )}

                  {/* Veil */}
                  <div className="flash-card__veil" aria-hidden="true" />

                  {/* Discount badge */}
                  {discount > 0 && (
                    <span
                      className="flash-card__discount"
                      aria-label={`${discount}% off`}
                    >
                      −{discount}%
                    </span>
                  )}

                  {/* Hover overlay */}
                  <div
                    className="flash-card__hover-overlay"
                    aria-hidden="true"
                  >
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
                  <h3 className="flash-card__name">{p.product_name}</h3>

                  {/* Pricing */}
                  <div className="flash-card__pricing">
                    <span className="flash-card__price">
                      ₦{effectivePrice.toLocaleString()}
                    </span>
                    {originalPrice > effectivePrice && (
                      <span className="flash-card__old-price">
                        <del>₦{originalPrice.toLocaleString()}</del>
                      </span>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="flash-card__progress-wrap">
                    <div
                      className="flash-card__progress-track"
                      role="progressbar"
                      aria-valuenow={soldPct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${soldPct}% sold`}
                    >
                      <div
                        className="flash-card__progress-fill"
                        style={{
                          width: barsAnimated ? `${soldPct}%` : "0%",
                        }}
                      />
                    </div>
                    <span className="flash-card__sold-label">
                      {soldPct}% claimed
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}