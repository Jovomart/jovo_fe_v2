"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
// src/pages/AppliancesDealsPage.jsx
import { useState, useMemo } from "react";
import { products } from "@/data/products";
import {
  FiHeart,
  FiShoppingBag,
  FiArrowLeft,
  FiZap,
  FiSettings,
  FiTruck,
} from "react-icons/fi";
import { FaHeart, FaStar, FaBolt, FaPlug } from "react-icons/fa";
import {
  MdOutlineElectricalServices,
  MdOutlineLocalLaundryService,
} from "react-icons/md";
import Footer from "@/components/layout/Footer";
import Image from "next/image";

// ─── Appliance Badge ──────────────────────────────────────────────────────
const ApplianceBadge = () => (
  <div
    className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black text-white"
    style={{
      background: "linear-gradient(135deg,#e67e22 0%,#f39c12 50%,#ffb347 100%)",
      boxShadow: "0 2px 8px rgba(230, 126, 34, 0.45)",
    }}
  >
    <FaPlug size={8} /> ELECTRIC
  </div>
);

// ─── Energy Rating ────────────────────────────────────────────────────────
const EnergyRating = ({ rating = "A++" }) => {
  const colors = {
    "A++": "#e67e22",
    "A+": "#f39c12",
    A: "#ffb347",
    B: "#facc15",
  };
  return (
    <div className="mt-2 flex items-center gap-1.5">
      <span
        className="text-[9px] font-black px-1.5 py-0.5 rounded text-white"
        style={{ background: colors[rating] || "#e67e22" }}
      >
        {rating}
      </span>
      <span className="text-[10px] text-gray-400">Energy rating</span>
    </div>
  );
};

// ─── Product Card ─────────────────────────────────────────────────────────
const ProductCard = ({ product, wishlisted, onWishlist, rating }) => {
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
      <div
        className="absolute top-0 left-0 right-0 h-0.5 z-10"
        style={{
          background: "linear-gradient(90deg,transparent,#f39c12,transparent)",
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
          width={300}
          height={300}
          className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-108"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <ApplianceBadge />
        {discount && (
          <div
            className="absolute bottom-3 left-3 flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-black text-white"
            style={{
              background:
                "linear-gradient(135deg,#e67e22 0%,#f39c12 50%,#ffb347 100%)",
            }}
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
            style={{
              background:
                "linear-gradient(135deg,#e67e22 0%,#f39c12 50%,#ffb347 100%)",
            }}
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
          <span className="text-sm md:text-base font-black text-orange-700">
            ₦{product.price.toLocaleString()}
          </span>
          {product.oldPrice && (
            <span className="text-[11px] text-gray-400 line-through">
              ₦{product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>
        <EnergyRating rating={rating} />
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
        <p className="text-orange-700 font-black mt-1.5 text-sm md:text-base">
          ₦{product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────
const AppliancesDealsPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const ratings = ["A++", "A+", "A++", "A+", "A", "A++"];

  const appliances = useMemo(
    () => products.filter((p) => p.category === "appliances"),
    [],
  );
  const suggestedProducts = useMemo(
    () => products.filter((p) => p.category !== "appliances").slice(0, 8),
    [],
  );
  const toggleWishlist = (id) =>
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  return (
    <div className="min-h-screen" style={{ background: "#F5F6F7" }}>
      {/* ══════════ HERO ══════════ */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,#e67e22 0%,#f39c12 50%,#ffb347 100%)",
          minHeight: "320px",
        }}
      >
        {/* Dot texture */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* Glow orbs */}
        <div
          className="absolute -top-20 -left-10 w-96 h-96 rounded-full opacity-15 pointer-events-none"
          style={{
            background: "radial-gradient(circle,#FFD700,transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-10 right-10 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle,#ffb347,transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full opacity-[0.05] pointer-events-none"
          style={{
            background: "radial-gradient(circle,#FFD700,transparent 60%)",
          }}
        />

        {/* Diagonal texture */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 18px, rgba(255,255,255,1) 18px, rgba(255,255,255,1) 19px)`,
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white/75 hover:text-white text-sm transition-colors mb-8"
          >
            <FiArrowLeft size={14} /> Back to Home
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5 mb-4">
                <FiSettings
                  size={11}
                  className="text-yellow-300 animate-spin"
                  style={{ animationDuration: "5s" }}
                />
                <span className="text-white/75 text-xs font-semibold tracking-widest uppercase">
                  High Performance
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <MdOutlineElectricalServices className="text-yellow-300 text-3xl" />
                </div>
                <div>
                  <h1
                    className="text-4xl md:text-6xl font-black text-white leading-none tracking-tight"
                    style={{
                      fontFamily: "'Georgia', serif",
                      textShadow: "0 4px 30px rgba(243,156,18,0.4)",
                    }}
                  >
                    HOME
                  </h1>
                  <h1
                    className="text-4xl md:text-6xl font-black leading-none tracking-tight"
                    style={{
                      fontFamily: "'Georgia', serif",
                      background:
                        "linear-gradient(90deg,#FFE066,#FFF5CC,#FFE066)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    APPLIANCES
                  </h1>
                </div>
              </div>
              <p className="mt-3 text-white/75 text-sm md:text-base max-w-sm">
                High-performance electric appliances engineered for modern
                living. Premium brands, better prices.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                {
                  icon: <FaBolt size={13} />,
                  label: "Energy",
                  val: "A++ Rated",
                },
                {
                  icon: <FiTruck size={14} />,
                  label: "Delivery",
                  val: "Free Install",
                },
                {
                  icon: <MdOutlineLocalLaundryService size={15} />,
                  label: "Warranty",
                  val: "2 Years",
                },
              ].map(({ icon, label, val }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <span className="text-yellow-300">{icon}</span>
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
            fill="#F5F6F7"
          />
        </svg>
      </div>

      {/* ══════════ PRODUCTS ══════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-1 h-7 rounded-full"
            style={{ background: "linear-gradient(180deg,#f39c12,#e67e22)" }}
          />
          <h2 className="text-xl md:text-2xl font-black text-gray-900">
            Appliances Deals
          </h2>
          <span className="hidden md:inline text-sm text-gray-400 font-medium">
            ({appliances.length} items)
          </span>
        </div>

        {appliances.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {appliances.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                wishlisted={wishlist.includes(product.id)}
                onWishlist={toggleWishlist}
                rating={ratings[i % ratings.length]}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <MdOutlineElectricalServices
              size={48}
              className="mx-auto mb-4 opacity-20"
            />
            <p className="font-semibold">No appliances right now.</p>
          </div>
        )}
      </div>

      {/* ══════════ BANNER ══════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{
            background:
              "linear-gradient(120deg,#e67e22 0%,#f39c12 55%,#ffb347 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `radial-gradient(circle at 30% 50%, rgba(255,255,255,0.8) 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg,transparent,#FFD700,transparent)",
            }}
          />
          <div className="relative z-10">
            <p className="text-yellow-300/60 text-xs font-semibold tracking-widest uppercase mb-1">
              Power your sales
            </p>
            <h3 className="text-white text-xl md:text-2xl font-black">
              Sell Appliances on Jovo
            </h3>
            <p className="text-white/40 text-sm mt-1">
              Reach thousands of buyers looking for quality home appliances.
            </p>
          </div>
          <Link
            href="/become-seller"
            className="relative z-10 shrink-0 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg hover:scale-105 transition-all duration-200 text-white"
            style={{
              background:
                "linear-gradient(135deg,#e67e22 0%,#f39c12 50%,#ffb347 100%)",
            }}
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
            style={{ background: "linear-gradient(180deg,#f39c12,#e67e22)" }}
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

export default AppliancesDealsPage;
