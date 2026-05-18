"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
// src/pages/SponsoredProductsPage.jsx
import { products } from "@/data/products";
import { useState, useMemo } from "react";
import { useWishlist } from "@/context/WishlistContext";
import {
  FiHeart,
  FiShoppingBag,
  FiArrowLeft,
  FiZap,
  FiStar,
  FiShield,
} from "react-icons/fi";
import { FaHeart, FaGem, FaBolt } from "react-icons/fa";
import Footer from "@/components/layout/Footer";
import Image from "next/image";

// ─── Sponsored Star Icon ──────────────────────────────────────────────────
const SponsoredBadge = () => (
  <div
    className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black"
    style={{
      background: "linear-gradient(135deg, #854d0e, #ca8a04, #fde68a)",
      color: "#1c0a00",
      boxShadow: "0 2px 8px rgba(202,138,4,0.4)",
    }}
  >
    <FaGem size={8} /> AD
  </div>
);

// ─── Product Card ─────────────────────────────────────────────────────────
const ProductCard = ({ product, wishlisted, onWishlist }) => {
  const router = useRouter();
  const navigate = (p: string) => router.push(p);
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  return (
    <div
      className="group relative bg-white rounded-3xl overflow-hidden transition-all duration-400 hover:-translate-y-2"
      style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.07)" }}
    >
      {/* Gold top border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 z-10"
        style={{
          background:
            "linear-gradient(90deg, transparent, #ca8a04, transparent)",
        }}
      />

      {/* Image */}
      <div
        className="relative overflow-hidden cursor-pointer"
        style={{ aspectRatio: "1/1" }}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <Image
          src={product.image}
          alt={product.name}
          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 20vw"
          fill
          className="object-cover transition-transform duration-600 group-hover:scale-108"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <SponsoredBadge />

        {discount && (
          <div
            className="absolute bottom-3 left-3 flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-black text-white"
            style={{ background: "linear-gradient(135deg,#111,#333)" }}
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

        {/* Slide-up CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-colors duration-200"
            style={{
              background: "linear-gradient(135deg,#ca8a04,#854d0e)",
              color: "white",
            }}
          >
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
          <span className="text-sm md:text-base font-black text-gray-900">
            ₦{product.price.toLocaleString()}
          </span>
          {product.oldPrice && (
            <span className="text-[11px] text-gray-400 line-through">
              ₦{product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Star rating */}
        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <FiStar
              key={s}
              size={10}
              className={
                s <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
              }
              style={s <= 4 ? { fill: "#facc15" } : {}}
            />
          ))}
          <span className="text-[10px] text-gray-400 ml-1">4.0 (200+)</span>
        </div>
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
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-3">
        <h3 className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-gray-900 font-black mt-1.5 text-sm md:text-base">
          ₦{product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────
const SponsoredProductsPage = () => {
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();

  const sponsored = useMemo(
    () => products.filter((p) => p.category === "sponsored"),
    [],
  );
  const suggestedProducts = useMemo(
    () => products.filter((p) => p.category !== "sponsored").slice(0, 8),
    [],
  );

  return (
    <div className="min-h-screen" style={{ background: "#F3F4F8" }}>
      {/* ══════════ HERO ══════════ */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #1c1407 40%, #44300a 75%, #854d0e 100%)",
          minHeight: "320px",
        }}
      >
        {/* Glow orbs */}
        <div
          className="absolute -top-20 -left-10 w-80 h-80 rounded-full opacity-15 pointer-events-none"
          style={{
            background: "radial-gradient(circle,#ca8a04,transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-10 right-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle,#fde68a,transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full opacity-[0.06] pointer-events-none"
          style={{
            background: "radial-gradient(circle,#ca8a04,transparent 60%)",
          }}
        />

        {/* Dot grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-16">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors mb-8"
          >
            <FiArrowLeft size={14} /> Back to Shop
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            {/* Title */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5 mb-4">
                <FaGem size={11} className="text-yellow-400" />
                <span className="text-white/70 text-xs font-semibold tracking-widest uppercase">
                  Handpicked for You
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg,rgba(202,138,4,0.3),rgba(133,77,14,0.3))",
                    border: "1px solid rgba(202,138,4,0.3)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <FaBolt className="text-yellow-400 text-2xl" />
                </div>
                <div>
                  <h1
                    className="text-4xl md:text-6xl font-black text-white leading-none tracking-tight"
                    style={{
                      fontFamily: "'Georgia', serif",
                      textShadow: "0 4px 30px rgba(202,138,4,0.3)",
                    }}
                  >
                    FEATURED
                  </h1>
                  <h1
                    className="text-4xl md:text-6xl font-black leading-none tracking-tight"
                    style={{
                      fontFamily: "'Georgia', serif",
                      background:
                        "linear-gradient(90deg,#ca8a04,#fde68a,#ca8a04)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    PICKS
                  </h1>
                </div>
              </div>

              <p className="mt-3 text-white/45 text-sm md:text-base max-w-sm">
                Premium sponsored deals, handcrafted and curated for the best
                shopping experience.
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              {[
                {
                  icon: <FiShield size={14} />,
                  label: "Verified Sellers",
                  val: "100%",
                },
                {
                  icon: <FaGem size={13} />,
                  label: "Premium Picks",
                  val: "Curated",
                },
                {
                  icon: <FiStar size={14} />,
                  label: "Avg Rating",
                  val: "4.8★",
                },
              ].map(({ icon, label, val }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(202,138,4,0.25)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <span className="text-yellow-400">{icon}</span>
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
            style={{ background: "linear-gradient(180deg,#fde68a,#ca8a04)" }}
          />
          <h2 className="text-xl md:text-2xl font-black text-gray-900">
            Sponsored Products
          </h2>
          <span className="hidden md:inline text-sm text-gray-400 font-medium">
            ({sponsored.length} items)
          </span>
        </div>

        {sponsored.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {sponsored.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wishlisted={isWishlisted(product.id)}
                onWishlist={(id) => {
                  const product = products.find((p) => p.id === id);
                  if (!product) return;
                  if (isWishlisted(id)) removeFromWishlist(id);
                  else addToWishlist(product);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <FaGem size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-semibold">No sponsored products right now.</p>
          </div>
        )}
      </div>

      {/* ══════════ ADVERTISE BANNER ══════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{
            background:
              "linear-gradient(120deg,#0a0a0a 0%,#44300a 55%,#854d0e 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `radial-gradient(circle at 30% 50%, rgba(202,138,4,0.6) 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />
          {/* Gold shimmer line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg,transparent,#ca8a04,transparent)",
            }}
          />

          <div className="relative z-10">
            <p className="text-yellow-400/70 text-xs font-semibold tracking-widest uppercase mb-1">
              Grow your brand
            </p>
            <h3 className="text-white text-xl md:text-2xl font-black">
              Advertise on Jovo
            </h3>
            <p className="text-white/45 text-sm mt-1">
              Put your products in front of millions. Premium placement
              available.
            </p>
          </div>
          <Link
            href="/advertise"
            className="relative z-10 shrink-0 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-200 shadow-lg hover:scale-105"
            style={{
              background: "linear-gradient(135deg,#ca8a04,#854d0e)",
              color: "white",
            }}
          >
            Get Featured →
          </Link>
        </div>
      </div>

      {/* ══════════ SUGGESTED ══════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-1 h-7 rounded-full"
            style={{ background: "linear-gradient(180deg,#fde68a,#ca8a04)" }}
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

export default SponsoredProductsPage;
