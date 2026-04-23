'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
// src/pages/GamingDealsPage.jsx
import { useState, useMemo } from "react";
import { products } from "@/data/products";
import { FiHeart, FiShoppingBag, FiArrowLeft, FiZap, FiMonitor } from "react-icons/fi";
import { FaHeart, FaStar, FaGamepad, FaHeadset, FaTrophy } from "react-icons/fa";
import { MdOutlineSpeed, MdSportsEsports } from "react-icons/md";
import Footer from "@/components/layout/Footer";

// ─── Gaming Badge ─────────────────────────────────────────────────────────
const GamingBadge = () => (
  <div
    className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black text-white"
    style={{
      background: "linear-gradient(135deg,#14532d,#16a34a)",
      boxShadow: "0 2px 8px rgba(22,163,74,0.6)",
    }}
  >
    <MdSportsEsports size={10} /> PRO
  </div>
);

// ─── Stars ────────────────────────────────────────────────────────────────
const Stars = ({ count = 5 }) => (
  <div className="flex items-center gap-0.5 mt-2">
    {[1,2,3,4,5].map((s) => (
      <FaStar key={s} size={10} style={{ color: s <= count ? "#4ade80" : "#e5e7eb" }} />
    ))}
    <span className="text-[10px] text-gray-400 ml-1">
      ({Math.floor(Math.random() * 900) + 100})
    </span>
  </div>
);

// ─── Product Card ─────────────────────────────────────────────────────────
const ProductCard = ({ product, wishlisted, onWishlist }) => {
  const router = useRouter()
  const navigate = (p: string) => router.push(p)
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  return (
    <div
      className="group relative rounded-3xl overflow-hidden transition-all duration-400 hover:-translate-y-2"
      style={{
        background: "#0f1117",
        boxShadow: "0 2px 20px rgba(0,0,0,0.25)",
      }}
    >
      {/* Green neon top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 z-10"
        style={{ background: "linear-gradient(90deg,transparent,#4ade80,transparent)" }}
      />

      {/* Image */}
      <div
        className="relative overflow-hidden cursor-pointer"
        style={{ aspectRatio: "1/1" }}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-108 opacity-90"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        <GamingBadge />

        {discount && (
          <div
            className="absolute bottom-3 left-3 flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-black text-white"
            style={{ background: "linear-gradient(135deg,#14532d,#15803d)" }}
          >
            <FiZap size={9} /> -{discount}%
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => { e.stopPropagation(); onWishlist(product.id); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-110"
        >
          {wishlisted
            ? <FaHeart className="text-red-500" size={13} />
            : <FiHeart className="text-white/60" size={13} />}
        </button>

        {/* Slide-up CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black shadow-lg text-black"
            style={{ background: "linear-gradient(135deg,#4ade80,#22c55e)" }}
          >
            <FiShoppingBag size={13} /> Add to Cart
          </button>
        </div>
      </div>

      {/* Info — dark card */}
      <div className="p-3.5">
        <h3 className="text-xs md:text-sm font-semibold text-gray-100 line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-sm md:text-base font-black text-green-400">
            ₦{product.price.toLocaleString()}
          </span>
          {product.oldPrice && (
            <span className="text-[11px] text-gray-500 line-through">
              ₦{product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>
        <Stars count={5} />
      </div>
    </div>
  );
};

// ─── Suggested Card ───────────────────────────────────────────────────────
const SuggestedCard = ({ product }) => {
  const router = useRouter()
  const navigate = (p: string) => router.push(p)
  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
      style={{ boxShadow: "0 2px 14px rgba(0,0,0,0.06)" }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-3">
        <h3 className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
        <p className="text-green-600 font-black mt-1.5 text-sm md:text-base">
          ₦{product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────
const GamingDealsPage = () => {
  const [wishlist, setWishlist] = useState([]);

  const gamingProducts = useMemo(() => products.filter((p) => p.category === "gaming"), []);
  const suggestedProducts = useMemo(() => products.filter((p) => p.category !== "gaming").slice(0, 8), []);

  const toggleWishlist = (id) =>
    setWishlist((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  return (
    <div className="min-h-screen" style={{ background: "#0a0e14" }}>

      {/* ══════════ HERO ══════════ */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #000000 0%, #020d05 35%, #052e16 65%, #14532d 100%)",
          minHeight: "340px",
        }}
      >
        {/* Neon green glow orbs */}
        <div className="absolute -top-20 left-1/4 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle,#4ade80,transparent 70%)" }} />
        <div className="absolute -bottom-10 right-10 w-72 h-72 rounded-full opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle,#22c55e,transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full opacity-[0.07] pointer-events-none"
          style={{ background: "radial-gradient(circle,#86efac,transparent 60%)" }} />

        {/* RGB scanlines texture */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.15) 2px,
            rgba(255,255,255,0.15) 3px
          )`,
        }} />

        {/* Dot matrix */}
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: `radial-gradient(circle, rgba(74,222,128,0.8) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-16">
          <Link href="/" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white text-sm transition-colors mb-8">
            <FiArrowLeft size={14} /> Back to Home
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            {/* Title */}
            <div>
              <div className="inline-flex items-center gap-2 bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-full px-3 py-1.5 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400/80 text-xs font-semibold tracking-widest uppercase">Online — Ready to Play</span>
              </div>

              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(74,222,128,0.1)",
                    border: "1px solid rgba(74,222,128,0.3)",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 0 20px rgba(74,222,128,0.15)",
                  }}
                >
                  <FaGamepad className="text-green-400 text-2xl md:text-3xl" />
                </div>
                <div>
                  <h1
                    className="text-4xl md:text-6xl font-black text-white leading-none tracking-tight"
                    style={{ fontFamily: "'Georgia', serif", textShadow: "0 0 40px rgba(74,222,128,0.3)" }}
                  >
                    GAMING
                  </h1>
                  <h1
                    className="text-4xl md:text-6xl font-black leading-none tracking-tight"
                    style={{
                      fontFamily: "'Georgia', serif",
                      background: "linear-gradient(90deg,#4ade80,#86efac,#4ade80)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      filter: "drop-shadow(0 0 12px rgba(74,222,128,0.4))",
                    }}
                  >
                    DEALS
                  </h1>
                </div>
              </div>

              <p className="mt-3 text-white/35 text-sm md:text-base max-w-sm">
                Level up your setup. The best consoles, controllers, and gear at unbeatable prices.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: <FaGamepad size={13} />,      label: "Platforms",   val: "All Consoles" },
                { icon: <MdOutlineSpeed size={15} />, label: "Performance", val: "120FPS+" },
                { icon: <FaTrophy size={13} />,       label: "Top Picks",   val: "Pro Gear" },
              ].map(({ icon, label, val }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                  style={{
                    background: "rgba(74,222,128,0.07)",
                    border: "1px solid rgba(74,222,128,0.15)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <span className="text-green-400">{icon}</span>
                  <div>
                    <p className="text-white font-black text-sm leading-none">{val}</p>
                    <p className="text-white/30 text-[10px] mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave — dark background */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path d="M0,40 L0,20 Q360,0 720,20 Q1080,40 1440,20 L1440,40 Z" fill="#0a0e14" />
        </svg>
      </div>

      {/* ══════════ PRODUCTS ══════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-7 rounded-full"
            style={{ background: "linear-gradient(180deg,#86efac,#16a34a)" }} />
          <h2 className="text-xl md:text-2xl font-black text-white">Gaming Deals</h2>
          <span className="hidden md:inline text-sm text-white/30 font-medium">({gamingProducts.length} items)</span>
        </div>

        {gamingProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {gamingProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wishlisted={wishlist.includes(product.id)}
                onWishlist={toggleWishlist}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-white/30">
            <FaGamepad size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-semibold">No gaming deals right now.</p>
          </div>
        )}
      </div>

      {/* ══════════ BANNER ══════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ background: "linear-gradient(120deg,#000000 0%,#052e16 55%,#14532d 100%)" }}
        >
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: `radial-gradient(circle at 30% 50%, rgba(74,222,128,0.6) 1px, transparent 1px)`,
            backgroundSize: "22px 22px",
          }} />
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg,transparent,#4ade80,transparent)", boxShadow: "0 0 10px rgba(74,222,128,0.4)" }} />
          <div className="relative z-10">
            <p className="text-green-400/60 text-xs font-semibold tracking-widest uppercase mb-1">Game on</p>
            <h3 className="text-white text-xl md:text-2xl font-black">Sell Gaming Gear on Jovo</h3>
            <p className="text-white/35 text-sm mt-1">Reach thousands of gamers looking for their next upgrade.</p>
          </div>
          <Link href="/become-seller"
            className="relative z-10 shrink-0 px-6 py-3 rounded-2xl font-black text-sm shadow-lg hover:scale-105 transition-all duration-200 text-black"
            style={{ background: "linear-gradient(135deg,#4ade80,#22c55e)" }}
          >
            Start Selling →
          </Link>
        </div>
      </div>

      {/* ══════════ SUGGESTED ══════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-7 rounded-full"
            style={{ background: "linear-gradient(180deg,#86efac,#16a34a)" }} />
          <h2 className="text-xl md:text-2xl font-black text-white">You May Also Like</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {suggestedProducts.map((product) => (
            <SuggestedCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GamingDealsPage;