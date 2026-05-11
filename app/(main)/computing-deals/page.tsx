"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
// src/pages/ComputingDealsPage.jsx
import { useState, useMemo } from "react";
import { products } from "@/data/products";
import {
  FiHeart,
  FiShoppingBag,
  FiArrowLeft,
  FiZap,
  FiCpu,
  FiMonitor,
  FiHardDrive,
} from "react-icons/fi";
import { FaHeart, FaStar, FaLaptop, FaKeyboard } from "react-icons/fa";
import {
  MdOutlineMemory,
  MdOutlineSpeed,
  MdOutlineDeveloperBoard,
} from "react-icons/md";
import Footer from "@/components/layout/Footer";

// ─── Computing Badge ──────────────────────────────────────────────────────
const ComputingBadge = () => (
  <div
    className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black text-white"
    style={{
      background: "linear-gradient(135deg,#1e293b,#475569)",
      boxShadow: "0 2px 8px rgba(71,85,105,0.6)",
    }}
  >
    <FiCpu size={9} /> PRO
  </div>
);

// ─── Stars ────────────────────────────────────────────────────────────────
const Stars = ({ count = 4 }) => {
  const randomCount = useMemo(() => Math.floor(Math.random() * 800) + 100, []);
  return (
    <div className="flex items-center gap-0.5 mt-2">
      {[1, 2, 3, 4, 5].map((s) => (
        <FaStar
          key={s}
          size={10}
          style={{ color: s <= count ? "#94a3b8" : "#e5e7eb" }}
        />
      ))}
      <span className="text-[10px] text-gray-400 ml-1">({randomCount})</span>
    </div>
  );
};

// ─── Spec Tag ─────────────────────────────────────────────────────────────
const SpecTag = ({ label }) => (
  <span
    className="text-[9px] font-bold px-1.5 py-0.5 rounded"
    style={{ background: "#f1f5f9", color: "#475569" }}
  >
    {label}
  </span>
);

const specSets = [
  ["Intel i9", "32GB RAM"],
  ["M3 Pro", "16GB RAM"],
  ["RTX 4080", "64GB RAM"],
  ["AMD R9", "16GB RAM"],
  ["Intel i7", "16GB RAM"],
  ["M2 Ultra", "96GB RAM"],
];

// ─── Product Card ─────────────────────────────────────────────────────────
const ProductCard = ({ product, idx, wishlisted, onWishlist }) => {
  const router = useRouter();
  const navigate = (p: string) => router.push(p);
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;
  const specs = specSets[idx % specSets.length];

  return (
    <div
      className="group relative bg-white rounded-3xl overflow-hidden transition-all duration-400 hover:-translate-y-2"
      style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.07)" }}
    >
      {/* Silver top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 z-10"
        style={{
          background: "linear-gradient(90deg,transparent,#94a3b8,transparent)",
        }}
      />

      <div
        className="relative overflow-hidden cursor-pointer"
        style={{ aspectRatio: "1/1" }}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <Image
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-108"
          width={200}
          height={200}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <ComputingBadge />

        {discount && (
          <div
            className="absolute bottom-3 left-3 flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-black text-white"
            style={{ background: "linear-gradient(135deg,#1e293b,#334155)" }}
          >
            <FiZap size={9} /> -{discount}%
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onWishlist(product.id);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-110"
        >
          {wishlisted ? (
            <FaHeart className="text-red-500" size={13} />
          ) : (
            <FiHeart className="text-gray-400" size={13} />
          )}
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold shadow-lg text-white"
            style={{ background: "linear-gradient(135deg,#1e293b,#475569)" }}
          >
            <FiShoppingBag size={13} /> Add to Cart
          </button>
        </div>
      </div>

      <div className="p-3.5">
        <h3 className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
          {product.name}
        </h3>
        {/* Spec tags */}
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {specs.map((s) => (
            <SpecTag key={s} label={s} />
          ))}
        </div>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-sm md:text-base font-black text-slate-700">
            ₦{product.price.toLocaleString()}
          </span>
          {product.oldPrice && (
            <span className="text-[11px] text-gray-400 line-through">
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
  const router = useRouter();
  const navigate = (p: string) => router.push(p);
  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
      style={{ boxShadow: "0 2px 14px rgba(0,0,0,0.06)" }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
        <Image
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          width={200}
          height={200}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-3">
        <h3 className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-slate-700 font-black mt-1.5 text-sm md:text-base">
          ₦{product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────
const ComputingDealsPage = () => {
  const [wishlist, setWishlist] = useState([]);

  const computingProducts = useMemo(
    () => products.filter((p) => p.category === "computing"),
    [],
  );
  const suggestedProducts = useMemo(
    () => products.filter((p) => p.category !== "computing").slice(0, 8),
    [],
  );

  const toggleWishlist = (id) =>
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      {/* ══════════ HERO ══════════ */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #020617 0%, #0f172a 35%, #1e293b 65%, #334155 100%)",
          minHeight: "320px",
        }}
      >
        {/* Cool silver glow orbs */}
        <div
          className="absolute -top-20 left-1/3 w-96 h-96 rounded-full opacity-15 pointer-events-none"
          style={{
            background: "radial-gradient(circle,#94a3b8,transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-10 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle,#64748b,transparent 70%)",
          }}
        />
        <div
          className="absolute top-10 left-10 w-56 h-56 rounded-full opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle,#e2e8f0,transparent 70%)",
          }}
        />

        {/* Terminal / code-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.4) 19px, rgba(255,255,255,0.4) 20px),
            repeating-linear-gradient(90deg, transparent, transparent 7px, rgba(255,255,255,0.15) 7px, rgba(255,255,255,0.15) 8px)
          `,
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors mb-8"
          >
            <FiArrowLeft size={14} /> Back to Home
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5 mb-4">
                {/* Blinking cursor */}
                <span className="font-mono text-slate-300 text-xs tracking-wider flex items-center gap-1">
                  <span className="text-green-400">›</span> ./computing --deals
                  <span className="inline-block w-1.5 h-3 bg-slate-300 ml-0.5 animate-pulse" />
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(71,85,105,0.3)",
                    border: "1px solid rgba(148,163,184,0.3)",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 0 20px rgba(100,116,139,0.2)",
                  }}
                >
                  <FaLaptop className="text-slate-300 text-2xl md:text-3xl" />
                </div>
                <div>
                  <h1
                    className="text-4xl md:text-6xl font-black text-white leading-none tracking-tight"
                    style={{
                      fontFamily: "'Georgia', serif",
                      textShadow: "0 4px 30px rgba(148,163,184,0.3)",
                    }}
                  >
                    COMPUTING
                  </h1>
                  <h1
                    className="text-4xl md:text-6xl font-black leading-none tracking-tight"
                    style={{
                      fontFamily: "'Georgia', serif",
                      background:
                        "linear-gradient(90deg,#cbd5e1,#f8fafc,#cbd5e1)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    DEALS
                  </h1>
                </div>
              </div>

              <p className="mt-3 text-white/45 text-sm md:text-base max-w-sm">
                Laptops, desktops, peripherals and accessories. Professional
                grade at accessible prices.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3">
              {[
                {
                  icon: <MdOutlineDeveloperBoard size={15} />,
                  label: "Processor",
                  val: "Latest Gen",
                },
                {
                  icon: <MdOutlineMemory size={15} />,
                  label: "RAM",
                  val: "Up to 96GB",
                },
                {
                  icon: <FiHardDrive size={14} />,
                  label: "Storage",
                  val: "Up to 4TB",
                },
              ].map(({ icon, label, val }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(148,163,184,0.2)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <span className="text-slate-300">{icon}</span>
                  <div>
                    <p className="text-white font-black text-sm leading-none">
                      {val}
                    </p>
                    <p className="text-white/40 text-[10px] mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 40"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 L0,20 Q360,0 720,20 Q1080,40 1440,20 L1440,40 Z"
            fill="#F8FAFC"
          />
        </svg>
      </div>

      {/* ══════════ PRODUCTS ══════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-1 h-7 rounded-full"
            style={{ background: "linear-gradient(180deg,#cbd5e1,#475569)" }}
          />
          <h2 className="text-xl md:text-2xl font-black text-gray-900">
            Computing Deals
          </h2>
          <span className="hidden md:inline text-sm text-gray-400 font-medium">
            ({computingProducts.length} items)
          </span>
        </div>

        {computingProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {computingProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                idx={i}
                wishlisted={wishlist.includes(product.id)}
                onWishlist={toggleWishlist}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <FaLaptop size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-semibold">No computing deals right now.</p>
          </div>
        )}
      </div>

      {/* ══════════ BANNER ══════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{
            background:
              "linear-gradient(120deg,#020617 0%,#1e293b 55%,#334155 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.3) 19px, rgba(255,255,255,0.3) 20px), repeating-linear-gradient(90deg, transparent, transparent 7px, rgba(255,255,255,0.1) 7px, rgba(255,255,255,0.1) 8px)`,
            }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg,transparent,#94a3b8,transparent)",
            }}
          />
          <div className="relative z-10">
            <p className="text-slate-300/60 text-xs font-semibold tracking-widest uppercase mb-1 font-mono">
              {/* sell.your.tech */}
            </p>
            <h3 className="text-white text-xl md:text-2xl font-black">
              Sell Computing Products on Jovo
            </h3>
            <p className="text-white/40 text-sm mt-1">
              Reach professionals and enthusiasts looking to upgrade their
              setup.
            </p>
          </div>
          <Link
            href="/become-seller"
            className="relative z-10 shrink-0 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg hover:scale-105 transition-all duration-200 text-white"
            style={{ background: "linear-gradient(135deg,#475569,#1e293b)" }}
          >
            Start Selling →
          </Link>
        </div>
      </div>

      {/* ══════════ SUGGESTED ══════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-1 h-7 rounded-full"
            style={{ background: "linear-gradient(180deg,#cbd5e1,#475569)" }}
          />
          <h2 className="text-xl md:text-2xl font-black text-gray-900">
            You May Also Like
          </h2>
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

export default ComputingDealsPage;
