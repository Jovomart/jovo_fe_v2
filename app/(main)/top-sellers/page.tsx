"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
// src/pages/TopSellersPage.jsx
import { products } from "@/data/products";
import { useState, useMemo } from "react";
import { useWishlist } from "@/context/WishlistContext";
import {
  FiHeart,
  FiShoppingBag,
  FiArrowLeft,
  FiZap,
  FiAward,
  FiTrendingUp,
} from "react-icons/fi";
import { FaHeart, FaCrown, FaMedal, FaTrophy } from "react-icons/fa";
import Footer from "@/components/layout/Footer";
import Image from "next/image";

// ─── Product Card ──────────────────────────────────────────────────────────
const getStableSoldCount = (seed = "", min = 100, range = 900) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  return (min + (hash % range)).toLocaleString();
};

const ProductCard = ({ product, rank, wishlisted, onWishlist }) => {
  const router = useRouter();
  const navigate = (p: string) => router.push(p);
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;
  const soldCount = useMemo(
    () => getStableSoldCount(product.id || product.name || `rank-${rank}`),
    [product.id, product.name, rank],
  );

  const rankConfig = {
    1: {
      icon: <FaCrown size={11} />,
      bg: "linear-gradient(135deg,#FFD700,#FFA500)",
      label: "#1",
    },
    2: {
      icon: <FaMedal size={11} />,
      bg: "linear-gradient(135deg,#C0C0C0,#A8A8A8)",
      label: "#2",
    },
    3: {
      icon: <FaMedal size={11} />,
      bg: "linear-gradient(135deg,#CD7F32,#A0522D)",
      label: "#3",
    },
  };
  const rankStyle = rankConfig[rank];

  return (
    <div
      className="group relative bg-white rounded-3xl overflow-hidden transition-all duration-400 hover:-translate-y-2"
      style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.07)" }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden cursor-pointer"
        style={{ aspectRatio: "1/1" }}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-600 group-hover:scale-108"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rank badge */}
        {rankStyle && (
          <div
            className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-white text-[10px] font-black shadow-lg"
            style={{ background: rankStyle.bg }}
          >
            {rankStyle.icon} {rankStyle.label}
          </div>
        )}

        {/* Discount badge */}
        {discount && (
          <div
            className="absolute top-3 right-10 flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-black text-white"
            style={{ background: "linear-gradient(135deg,#ea580c,#c2410c)" }}
          >
            <FiZap size={9} /> -{discount}%
          </div>
        )}

        {/* Wishlist */}
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

        {/* Slide-up add to cart */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 py-2.5 rounded-xl text-xs font-bold shadow-lg hover:bg-orange-600 hover:text-white transition-colors duration-200">
            <FiShoppingBag size={13} /> Add to Cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3 className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-sm md:text-base font-black text-orange-600">
            ₦{product.price.toLocaleString()}
          </span>
          {product.oldPrice && (
            <span className="text-[11px] text-gray-400 line-through">
              ₦{product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Sold count */}
        <div className="mt-2 flex items-center gap-1.5">
          <FiTrendingUp size={11} className="text-orange-500" />
          <span className="text-[10px] text-gray-400 font-medium">
            {soldCount} sold this week
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Suggested Card ────────────────────────────────────────────────────────
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
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-3">
        <h3 className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-orange-600 font-black mt-1.5 text-sm md:text-base">
          ₦{product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────
const TopSellersPage = () => {
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();

  const topProducts = useMemo(
    () => products.filter((p) => p.category === "top-sellers"),
    [],
  );
  const suggestedProducts = useMemo(
    () => products.filter((p) => p.category !== "top-sellers").slice(0, 8),
    [],
  );

  
  return (
    <div className="min-h-screen" style={{ background: "#F3F4F8" }}>
      {/* ══════════ HERO ══════════ */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0f0f0f 0%, #1c0a00 40%, #7c2d12 75%, #ea580c 100%)",
          minHeight: "320px",
        }}
      >
        {/* Glow orbs */}
        <div
          className="absolute -top-16 -left-16 w-80 h-80 rounded-full opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle,#fb923c,transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-10 right-10 w-72 h-72 rounded-full opacity-15 pointer-events-none"
          style={{
            background: "radial-gradient(circle,#ea580c,transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full opacity-5 pointer-events-none"
          style={{
            background: "radial-gradient(circle,#FFA500,transparent 60%)",
          }}
        />

        {/* Diagonal lines texture */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 18px, rgba(255,255,255,1) 18px, rgba(255,255,255,1) 19px)`,
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-16">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors mb-8"
          >
            <FiArrowLeft size={14} /> Back to Shop
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            {/* Title */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 mb-4">
                <FiTrendingUp size={12} className="text-orange-400" />
                <span className="text-white/80 text-xs font-semibold tracking-widest uppercase">
                  Trending This Week
                </span>
              </div>

              <div className="flex items-center gap-4">
                <FaTrophy className="text-[#FFD700] text-4xl md:text-5xl drop-shadow-lg" />
                <div>
                  <h1
                    className="text-4xl md:text-6xl font-black text-white leading-none tracking-tight"
                    style={{
                      fontFamily: "'Georgia', serif",
                      textShadow: "0 4px 30px rgba(234,88,12,0.4)",
                    }}
                  >
                    TOP
                  </h1>
                  <h1
                    className="text-4xl md:text-6xl font-black leading-none tracking-tight"
                    style={{
                      fontFamily: "'Georgia', serif",
                      background: "linear-gradient(90deg,#fb923c,#fde68a)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    SELLERS
                  </h1>
                </div>
              </div>

              <p className="mt-3 text-white/50 text-sm md:text-base max-w-sm">
                The products everyone's buying. Tried, loved, and trusted by
                thousands.
              </p>
            </div>

            {/* Stats pills */}
            <div className="flex flex-wrap gap-3">
              {[
                {
                  icon: <FiAward size={14} />,
                  label: "Best Rated",
                  val: "4.8★",
                },
                {
                  icon: <FiShoppingBag size={14} />,
                  label: "Items Sold",
                  val: "12K+",
                },
                {
                  icon: <FiTrendingUp size={14} />,
                  label: "This Week",
                  val: "+38%",
                },
              ].map(({ icon, label, val }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <span className="text-orange-300">{icon}</span>
                  <div>
                    <p className="text-white font-black text-sm leading-none">
                      {val}
                    </p>
                    <p className="text-white/50 text-[10px] mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave */}
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

      {/* ══════════ PRODUCTS ══════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-1 h-7 rounded-full"
            style={{ background: "linear-gradient(180deg,#fb923c,#ea580c)" }}
          />
          <h2 className="text-xl md:text-2xl font-black text-gray-900">
            Best Selling Products
          </h2>
          <span className="hidden md:inline text-sm text-gray-400 font-medium">
            ({topProducts.length} items)
          </span>
        </div>

        {topProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {topProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                rank={i + 1}
                wishlisted={isWishlisted(product.id)}
                onWishlist={(id) => { const product = products.find((p) => p.id === id); if (!product) return; if (isWishlisted(id)) removeFromWishlist(id); else addToWishlist(product); }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <FaTrophy size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-semibold">No top sellers yet.</p>
          </div>
        )}
      </div>

      {/* ══════════ BANNER ══════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{
            background:
              "linear-gradient(120deg,#0f0f0f 0%,#7c2d12 55%,#ea580c 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 50%, white 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative z-10">
            <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-1">
              Sell more
            </p>
            <h3 className="text-white text-xl md:text-2xl font-black">
              Join Jovo's Seller Network
            </h3>
            <p className="text-white/55 text-sm mt-1">
              List your products and reach millions of buyers today.
            </p>
          </div>
          <Link
            href="/become-seller"
            className="relative z-10 shrink-0 bg-white text-gray-900 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-orange-500 hover:text-white transition-colors duration-200 shadow-lg"
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
            style={{ background: "linear-gradient(180deg,#fb923c,#ea580c)" }}
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

export default TopSellersPage;
