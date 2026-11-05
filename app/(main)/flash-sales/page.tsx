'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
// src/pages/FlashSalesPage.jsx
import { products } from "@/data/products";
import { useState, useEffect, useMemo, useRef } from "react";
import { FiHeart, FiShoppingBag, FiArrowLeft, FiZap } from "react-icons/fi";
import { FaHeart, FaFire } from "react-icons/fa";
import Footer from "@/components/layout/Footer";

/* ── Countdown hook ──────────────────────────────────────────────────────── */
const useCountdown = (duration) => {
  const [t, setT] = useState(duration);
  useEffect(() => {
    const id = setInterval(() => setT((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  return {
    hours:   String(Math.floor(t / 3600)).padStart(2, "0"),
    minutes: String(Math.floor((t % 3600) / 60)).padStart(2, "0"),
    seconds: String(t % 60).padStart(2, "0"),
  };
};

/* ── Digit flip cell ─────────────────────────────────────────────────────── */
const TimeCell = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div
      className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)",
        border: "1px solid rgba(255,255,255,0.25)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
      }}
    >
      {/* Shine streak */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-2xl" />
      <span className="relative text-2xl md:text-3xl font-semibold text-white tracking-tight tabular-nums">
        {value}
      </span>
    </div>
    <span className="mt-2 text-[10px] md:text-xs font-bold tracking-[0.2em] text-white/60 uppercase">
      {label}
    </span>
  </div>
);

/* ── Separator ───────────────────────────────────────────────────────────── */
const Sep = () => (
  <span className="text-2xl md:text-3xl font-semibold text-white/40 mb-5 select-none">:</span>
);

/* ── Product card ────────────────────────────────────────────────────────── */
const ProductCard = ({ product, wishlisted, onWishlist, index }) => {
  const router = useRouter()
  const navigate = (p: string) => router.push(p)
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  return (
    <div
      className="group relative bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-1.5"
      style={{
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden cursor-pointer"
        style={{ aspectRatio: "1/1" }}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
        />

        {/* Dark gradient overlay on hover */}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Discount badge */}
        {discount && (
          <div
            className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #0E0E10, #ff4444)" }}
          >
            <FiZap size={10} />
            -{discount}%
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => { e.stopPropagation(); onWishlist(product.id); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-soft transition-transform duration-200 hover:scale-110"
        >
          {wishlisted ? (
            <FaHeart className="text-red-500" size={14} />
          ) : (
            <FiHeart className="text-ink/40" size={14} />
          )}
        </button>

        {/* Quick add - slides up on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button className="w-full flex items-center justify-center gap-2 bg-white text-ink py-2.5 rounded-xl text-xs font-bold shadow-lift hover:bg-[#0E0E10] hover:text-white transition-colors duration-200">
            <FiShoppingBag size={13} /> Add to Cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3 className="text-xs md:text-sm font-semibold text-ink line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-sm md:text-base font-semibold text-[#0E0E10]">
            ₦{product.price.toLocaleString()}
          </span>
          {product.oldPrice && (
            <span className="text-[11px] text-ink/40 line-through">
              ₦{product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock bar */}
        <div className="mt-2.5">
          <div className="flex justify-between text-[10px] text-ink/40 mb-1">
            <span className="text-[#0E0E10] font-semibold">🔥 Selling fast</span>
            <span>72% sold</span>
          </div>
          <div className="h-1 w-full bg-sand rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: "72%",
                background: "linear-gradient(90deg, #B42225, #0E0E10)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ───────────────────────────────────────────────────────────── */
const FlashSalesPage = () => {
  const router = useRouter()
  const navigate = (p: string) => router.push(p)
  const [wishlist, setWishlist] = useState([]);
  const { hours, minutes, seconds } = useCountdown(24 * 60 * 60);

  const flashProducts = useMemo(
    () => products.filter((p) => p.category === "flash-sales"),
    []
  );
  const suggestedProducts = useMemo(() => products.slice(0, 8), []);

  const toggleWishlist = (id) =>
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  return (
    <div className="min-h-screen" style={{ background: "#F3F4F8" }}>

      {/* ══════════════════ HERO HEADER ══════════════════ */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f0f0f 0%, #1a0505 40%, #2d0a0a 70%, #0E0E10 100%)",
          minHeight: "340px",
        }}
      >
        {/* Animated background orbs */}
        <div
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-20 animate-pulse"
          style={{ background: "radial-gradient(circle, #B42225, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-10 right-0 w-80 h-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #0E0E10, transparent 70%)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #B42225, transparent 60%)" }}
        />

        {/* Diagonal slash decoration */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 20px,
              rgba(255,255,255,1) 20px,
              rgba(255,255,255,1) 21px
            )`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-14">

          {/* Back link */}
          <Link href="/"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors mb-8"
          >
            <FiArrowLeft size={14} /> Back to Home
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

            {/* Left - Title */}
            <div>
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 mb-4">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-white/80 text-xs font-semibold tracking-widest uppercase">Live Now</span>
              </div>

              <div className="flex items-center gap-3">
                <FaFire className="text-[#B42225] text-4xl md:text-5xl drop-shadow-lift" />
                <div>
                  <h1
                    className="text-4xl md:text-6xl font-semibold text-white leading-none tracking-tight"
                    style={{ fontFamily: "'Instrument Sans',sans-serif", textShadow: "0 4px 30px rgba(180,34,37,0.5)" }}
                  >
                    FLASH
                  </h1>
                  <h1
                    className="text-4xl md:text-6xl font-semibold leading-none tracking-tight"
                    style={{
                      fontFamily: "'Instrument Sans',sans-serif",
                      background: "linear-gradient(90deg, #B42225, #ffcc00)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    SALES
                  </h1>
                </div>
              </div>

              <p className="mt-3 text-white/50 text-sm md:text-base max-w-xs">
                Unbeatable prices. Limited stock. Don't sleep on it.
              </p>
            </div>

            {/* Right - Countdown */}
            <div className="flex flex-col items-start lg:items-end gap-3">
              <p className="text-white/50 text-xs font-semibold tracking-widest uppercase">
                Ends in
              </p>
              <div className="flex items-center gap-3">
                <TimeCell value={hours}   label="Hours" />
                <Sep />
                <TimeCell value={minutes} label="Mins" />
                <Sep />
                <TimeCell value={seconds} label="Secs" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 40"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 L0,20 Q360,0 720,20 Q1080,40 1440,20 L1440,40 Z"
            fill="#F3F4F8"
          />
        </svg>
      </div>

      {/* ══════════════════ FLASH PRODUCTS ══════════════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-6">

        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-1 h-7 rounded-full"
              style={{ background: "linear-gradient(180deg, #B42225, #0E0E10)" }}
            />
            <h2 className="text-xl md:text-2xl font-semibold text-ink">
              Today's Deals
            </h2>
            <span className="hidden md:inline text-sm text-ink/40 font-medium">
              ({flashProducts.length} items)
            </span>
          </div>

        </div>

        {/* Grid */}
        {flashProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {flashProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                wishlisted={wishlist.includes(product.id)}
                onWishlist={toggleWishlist}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-ink/40">
            <FaFire size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-semibold">No flash sales right now.</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        )}
      </div>

      {/* ══════════════════ BANNER STRIP ══════════════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{
            background: "linear-gradient(120deg, #0f0f0f 0%, #0E0E10 60%, #B42225 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
                                radial-gradient(circle at 80% 50%, white 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative z-10">
            <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-1">Limited time</p>
            <h3 className="text-white text-xl md:text-2xl font-semibold">
              Become a Seller on Jovo
            </h3>
            <p className="text-white/60 text-sm mt-1">
              Reach millions of buyers. Zero listing fees this month.
            </p>
          </div>
          <Link href="/become-seller"
            className="relative z-10 shrink-0 bg-white text-ink px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#B42225] hover:text-white transition-colors duration-200 shadow-lift"
          >
            Start Selling →
          </Link>
        </div>
      </div>

      {/* ══════════════════ SUGGESTED ══════════════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-1 h-7 rounded-full"
            style={{ background: "linear-gradient(180deg, #B42225, #0E0E10)" }}
          />
          <h2 className="text-xl md:text-2xl font-semibold text-ink">
            You Might Also Like
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {suggestedProducts.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              wishlisted={wishlist.includes(product.id)}
              onWishlist={toggleWishlist}
              index={i}
            />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FlashSalesPage;