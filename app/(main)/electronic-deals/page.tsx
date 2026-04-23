'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
// src/pages/ElectronicDealsPage.jsx
import { useState, useMemo } from "react";
import { products } from "@/data/products";
import { FiHeart, FiShoppingBag, FiArrowLeft, FiZap, FiCpu, FiWifi, FiMonitor } from "react-icons/fi";
import { FaHeart, FaStar, FaMicrochip } from "react-icons/fa";
import { MdOutlineDevices, MdOutlineMemory } from "react-icons/md";
import Footer from "@/components/layout/Footer";

// ─── Tech Badge ───────────────────────────────────────────────────────────
const TechBadge = () => (
  <div
    className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black text-white"
    style={{
      background: "linear-gradient(135deg,#0e4f4f,#0d9488)",
      boxShadow: "0 2px 8px rgba(13,148,136,0.55)",
    }}
  >
    <FiCpu size={9} /> TECH
  </div>
);

// ─── Stars ────────────────────────────────────────────────────────────────
const Stars = ({ count = 4 }) => (
  <div className="flex items-center gap-0.5 mt-2">
    {[1,2,3,4,5].map((s) => (
      <FaStar key={s} size={10} style={{ color: s <= count ? "#0d9488" : "#e5e7eb" }} />
    ))}
    <span className="text-[10px] text-gray-400 ml-1">
      ({Math.floor(Math.random() * 800) + 100})
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
      className="group relative bg-white rounded-3xl overflow-hidden transition-all duration-400 hover:-translate-y-2"
      style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.07)" }}
    >
      {/* Teal top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 z-10"
        style={{ background: "linear-gradient(90deg,transparent,#0d9488,transparent)" }}
      />

      <div
        className="relative overflow-hidden cursor-pointer"
        style={{ aspectRatio: "1/1" }}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-108"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <TechBadge />

        {discount && (
          <div
            className="absolute bottom-3 left-3 flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-black text-white"
            style={{ background: "linear-gradient(135deg,#0e4f4f,#0f766e)" }}
          >
            <FiZap size={9} /> -{discount}%
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onWishlist(product.id); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-110"
        >
          {wishlisted
            ? <FaHeart className="text-red-500" size={13} />
            : <FiHeart className="text-gray-400" size={13} />}
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold shadow-lg text-white"
            style={{ background: "linear-gradient(135deg,#0e4f4f,#0d9488)" }}
          >
            <FiShoppingBag size={13} /> Add to Cart
          </button>
        </div>
      </div>

      <div className="p-3.5">
        <h3 className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-sm md:text-base font-black text-teal-700">
            ₦{product.price.toLocaleString()}
          </span>
          {product.oldPrice && (
            <span className="text-[11px] text-gray-400 line-through">
              ₦{product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>
        <Stars count={4} />
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
        <p className="text-teal-700 font-black mt-1.5 text-sm md:text-base">
          ₦{product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────
const ElectronicDealsPage = () => {
  const [wishlist, setWishlist] = useState([]);

  const electronicProducts = useMemo(() => products.filter((p) => p.category === "electronics"), []);
  const suggestedProducts = useMemo(() => products.filter((p) => p.category !== "electronics").slice(0, 8), []);

  const toggleWishlist = (id) =>
    setWishlist((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  return (
    <div className="min-h-screen" style={{ background: "#F0FDFA" }}>

      {/* ══════════ HERO ══════════ */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #020d0d 0%, #042f2e 35%, #0d4f4a 65%, #0d9488 100%)",
          minHeight: "320px",
        }}
      >
        {/* Teal glow orbs */}
        <div className="absolute -top-20 -left-10 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle,#2dd4bf,transparent 70%)" }} />
        <div className="absolute -bottom-10 right-10 w-80 h-80 rounded-full opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle,#0d9488,transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full opacity-[0.06] pointer-events-none"
          style={{ background: "radial-gradient(circle,#5eead4,transparent 60%)" }} />

        {/* Circuit-trace lines — PCB feel */}
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }} />
        {/* Node dots at intersections */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `radial-gradient(circle, rgba(45,212,191,0.8) 1.5px, transparent 1.5px)`,
          backgroundSize: "60px 60px",
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-16">
          <Link href="/" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors mb-8">
            <FiArrowLeft size={14} /> Back to Home
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5 mb-4">
                <FaMicrochip size={11} className="text-teal-300" />
                <span className="text-white/70 text-xs font-semibold tracking-widest uppercase">Next-Gen Tech</span>
              </div>

              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(13,148,136,0.2)",
                    border: "1px solid rgba(94,234,212,0.3)",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 0 20px rgba(13,148,136,0.15)",
                  }}
                >
                  <MdOutlineDevices className="text-teal-300 text-3xl" />
                </div>
                <div>
                  <h1
                    className="text-4xl md:text-6xl font-black text-white leading-none tracking-tight"
                    style={{ fontFamily: "'Georgia', serif", textShadow: "0 4px 30px rgba(13,148,136,0.5)" }}
                  >
                    ELECTRONIC
                  </h1>
                  <h1
                    className="text-4xl md:text-6xl font-black leading-none tracking-tight"
                    style={{
                      fontFamily: "'Georgia', serif",
                      background: "linear-gradient(90deg,#5eead4,#ccfbf1,#5eead4)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    DEALS
                  </h1>
                </div>
              </div>

              <p className="mt-3 text-white/45 text-sm md:text-base max-w-sm">
                Cutting-edge gadgets and devices at unbeatable prices. The future of tech, today.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: <FaMicrochip size={12} />,     label: "Processing",  val: "Latest Chips" },
                { icon: <FiWifi size={14} />,          label: "Connectivity", val: "WiFi 6E" },
                { icon: <MdOutlineMemory size={15} />, label: "Storage",     val: "Up to 2TB" },
              ].map(({ icon, label, val }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(94,234,212,0.2)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <span className="text-teal-300">{icon}</span>
                  <div>
                    <p className="text-white font-black text-sm leading-none">{val}</p>
                    <p className="text-white/40 text-[10px] mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave — mint background */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path d="M0,40 L0,20 Q360,0 720,20 Q1080,40 1440,20 L1440,40 Z" fill="#F0FDFA" />
        </svg>
      </div>

      {/* ══════════ PRODUCTS ══════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-7 rounded-full"
            style={{ background: "linear-gradient(180deg,#5eead4,#0d9488)" }} />
          <h2 className="text-xl md:text-2xl font-black text-gray-900">Electronic Deals</h2>
          <span className="hidden md:inline text-sm text-gray-400 font-medium">({electronicProducts.length} items)</span>
        </div>

        {electronicProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {electronicProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wishlisted={wishlist.includes(product.id)}
                onWishlist={toggleWishlist}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <MdOutlineDevices size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-semibold">No electronic deals right now.</p>
          </div>
        )}
      </div>

      {/* ══════════ BANNER ══════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ background: "linear-gradient(120deg,#020d0d 0%,#0d4f4a 55%,#0d9488 100%)" }}
        >
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: `radial-gradient(circle at 30% 50%, rgba(94,234,212,0.6) 1px, transparent 1px)`,
            backgroundSize: "22px 22px",
          }} />
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg,transparent,#2dd4bf,transparent)" }} />
          <div className="relative z-10">
            <p className="text-teal-300/60 text-xs font-semibold tracking-widest uppercase mb-1">Tech marketplace</p>
            <h3 className="text-white text-xl md:text-2xl font-black">Sell Electronics on Jovo</h3>
            <p className="text-white/40 text-sm mt-1">Reach millions of tech-savvy buyers looking for their next gadget.</p>
          </div>
          <Link href="/become-seller"
            className="relative z-10 shrink-0 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg hover:scale-105 transition-all duration-200 text-white"
            style={{ background: "linear-gradient(135deg,#0d9488,#0e4f4f)" }}
          >
            Start Selling →
          </Link>
        </div>
      </div>

      {/* ══════════ SUGGESTED ══════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-7 rounded-full"
            style={{ background: "linear-gradient(180deg,#5eead4,#0d9488)" }} />
          <h2 className="text-xl md:text-2xl font-black text-gray-900">You May Also Like</h2>
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

export default ElectronicDealsPage;