"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useWishlist } from "@/context/WishlistContext";
import {
  FiHeart, FiShoppingBag, FiArrowLeft, FiZap, FiClock,
  FiAlertTriangle, FiRefreshCw, FiAlertCircle,
} from "react-icons/fi";
import { FaHeart, FaExclamationTriangle } from "react-icons/fa";
import { MdOutlineInventory2 } from "react-icons/md";
import Footer from "@/components/layout/Footer";
import apiService from "@/services/apiService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LimitedProduct {
  id: string;
  product_name: string;
  product_images: string[];
  product_original_price: number;
  current_price: number;
  discount_percentage: number;
  stock_quantity: number;
  is_in_stock: boolean;
  brand: string | null;
  average_rating: number;
}

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ccircle cx='200' cy='150' r='50' fill='%239ca3af'/%3E%3Crect x='100' y='220' width='200' height='120' rx='10' fill='%239ca3af'/%3E%3C/svg%3E";

const getValidImageUrl = (url: string | undefined): string => {
  if (!url) return PLACEHOLDER_IMAGE;
  if (url.startsWith("data:") || url.startsWith("/")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (url.includes("api.yourstore.com")) return PLACEHOLDER_IMAGE;
    return url;
  }
  return PLACEHOLDER_IMAGE;
};

// ─── Stock Bar ────────────────────────────────────────────────────────────────

const StockBar = ({ stock, threshold = 100 }: { stock: number; threshold?: number }) => {
  // pct = how much stock remains relative to threshold
  const pct = Math.min(Math.round((stock / threshold) * 100), 100);
  const color =
    pct <= 20
      ? "linear-gradient(90deg,#B42225,#d63a1a)"
      : pct <= 50
      ? "linear-gradient(90deg,#d63a1a,#e85d04)"
      : "linear-gradient(90deg,#B42225,#d63a1a)";

  return (
    <div className="mt-2.5">
      <div className="flex justify-between text-[10px] mb-1">
        <span className={pct <= 20 ? "text-red-500 font-bold" : "text-gray-400"}>
          {pct <= 20 ? "⚠️ Almost gone!" : pct <= 50 ? "⏳ Selling fast" : "✅ In stock"}
        </span>
        <span className="text-gray-400">{stock} left</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
};

// ─── Product Card ─────────────────────────────────────────────────────────────

const ProductCard = ({
  product,
  wishlisted,
  onWishlist,
}: {
  product: LimitedProduct;
  wishlisted: boolean;
  onWishlist: (id: string) => void;
}) => {
  const [imgError, setImgError] = useState(false);

  const discount =
    product.discount_percentage > 0
      ? Math.round(product.discount_percentage)
      : product.product_original_price > product.current_price
      ? Math.round(
          ((product.product_original_price - product.current_price) /
            product.product_original_price) *
            100,
        )
      : null;

  const imgUrl = imgError
    ? PLACEHOLDER_IMAGE
    : getValidImageUrl(product.product_images?.[0]);

  return (
    <div
      className="group relative bg-white rounded-3xl overflow-hidden transition-all duration-400 hover:-translate-y-2"
      style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.07)" }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-0.5 z-10"
        style={{ background: "linear-gradient(90deg,transparent,#d63a1a,transparent)" }}
      />

      <Link
        href={`/product/${product.id}`}
        className="relative overflow-hidden block"
        style={{ aspectRatio: "1/1" }}
      >
        <Image
          src={imgUrl}
          alt={product.product_name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
          unoptimized={imgUrl.startsWith("data:")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Limited badge */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black text-white"
          style={{
            background:
              "linear-gradient(135deg,#B42225 0%,#d63a1a 50%,#e85d04 100%)",
            boxShadow: "0 2px 8px rgba(216,58,26,0.45)",
          }}
        >
          <FiAlertTriangle size={8} /> LIMITED
        </div>

        {discount && (
          <div
            className="absolute bottom-3 left-3 flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-black text-white"
            style={{ background: "linear-gradient(135deg,#B42225,#d63a1a)" }}
          >
            <FiZap size={9} /> -{discount}%
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
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
          <Link
            href={`/product/${product.id}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-colors duration-200 text-white"
            style={{
              background:
                "linear-gradient(135deg,#B42225 0%,#d63a1a 50%,#e85d04 100%)",
            }}
          >
            <FiShoppingBag size={13} /> View Product
          </Link>
        </div>
      </Link>

      <div className="p-3.5">
        <h3 className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
          {product.product_name}
        </h3>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-sm md:text-base font-black text-gray-900">
            ₦{product.current_price.toLocaleString()}
          </span>
          {product.product_original_price > product.current_price && (
            <span className="text-[11px] text-gray-400 line-through">
              ₦{product.product_original_price.toLocaleString()}
            </span>
          )}
        </div>
        <StockBar stock={product.stock_quantity} threshold={100} />
      </div>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="h-72 bg-gray-100 rounded-3xl animate-pulse" />
    ))}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const LimitedStockDealsPage = () => {
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();

  const [limited, setLimited] = useState<LimitedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLimited = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getLimitedStockProducts({
        threshold: 100,
        limit: 100,
      });
      const raw = data?.data ?? data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.products)
        ? raw.products
        : Array.isArray(raw?.items)
        ? raw.items
        : [];

      const normalised: LimitedProduct[] = list.map((p: any) => ({
        id: String(p.id ?? p.product_id ?? ""),
        product_name: p.product_name ?? p.name ?? "",
        product_images: Array.isArray(p.product_images)
          ? p.product_images
          : p.image
          ? [p.image]
          : [],
        product_original_price: p.product_original_price ?? p.original_price ?? 0,
        current_price: p.current_price ?? p.price ?? 0,
        discount_percentage: p.discount_percentage ?? 0,
        stock_quantity: p.stock_quantity ?? p.stock ?? 0,
        is_in_stock: p.is_in_stock ?? true,
        brand: p.brand ?? null,
        average_rating: p.average_rating ?? 0,
      }));

      setLimited(normalised);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load limited stock products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLimited();
  }, [fetchLimited]);

  const handleWishlist = (id: string) => {
    const product = limited.find((p) => p.id === id);
    if (!product) return;
    const wishlistItem = {
      id: parseInt(product.id, 10) || 0,
      name: product.product_name,
      price: product.current_price,
      oldPrice:
        product.product_original_price > product.current_price
          ? product.product_original_price
          : null,
      rating: product.average_rating,
      reviews: 0,
      image: getValidImageUrl(product.product_images?.[0]),
      brand: product.brand ?? undefined,
    };
    if (isWishlisted(wishlistItem.id)) removeFromWishlist(wishlistItem.id);
    else addToWishlist(wishlistItem);
  };

  return (
    <div className="min-h-screen" style={{ background: "#F5F6F7" }}>
      {/* HERO */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,#B42225 0%,#d63a1a 50%,#e85d04 100%)",
          minHeight: "320px",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div
          className="absolute -top-20 -left-10 w-80 h-80 rounded-full opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle,#FF4500,transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg,transparent,transparent 18px,rgba(255,255,255,1) 18px,rgba(255,255,255,1) 19px)",
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
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5 mb-4">
                <FiAlertTriangle size={11} className="text-yellow-300" />
                <span className="text-white/70 text-xs font-semibold tracking-widest uppercase">
                  While Stocks Last
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
                  <MdOutlineInventory2 className="text-yellow-300 text-2xl md:text-3xl" />
                </div>
                <div>
                  <h1
                    className="text-4xl md:text-6xl font-black text-white leading-none tracking-tight"
                    style={{ fontFamily: "'Georgia',serif", textShadow: "0 4px 30px rgba(216,58,26,0.4)" }}
                  >
                    LIMITED
                  </h1>
                  <h1
                    className="text-4xl md:text-6xl font-black leading-none tracking-tight"
                    style={{
                      fontFamily: "'Georgia',serif",
                      background: "linear-gradient(90deg,#FFB347,#FFD699,#FFB347)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    STOCK
                  </h1>
                </div>
              </div>

              <p className="mt-3 text-white/45 text-sm md:text-base max-w-sm">
                These won't last. Grab yours before stock runs out — no restocks guaranteed.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                { icon: <FiClock size={14} />, label: "Restocking", val: "Unlikely" },
                { icon: <FaExclamationTriangle size={12} />, label: "Avg Stock Left", val: "< 30%" },
                {
                  icon: <MdOutlineInventory2 size={15} />,
                  label: "Items",
                  val: loading ? "..." : `${limited.length} left`,
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
                    <p className="text-white font-black text-sm leading-none">{val}</p>
                    <p className="text-white/40 text-[10px] mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path d="M0,40 L0,20 Q360,0 720,20 Q1080,40 1440,20 L1440,40 Z" fill="#F5F6F7" />
        </svg>
      </div>

      {/* PRODUCTS */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-1 h-7 rounded-full"
            style={{ background: "linear-gradient(180deg,#d63a1a,#B42225)" }}
          />
          <h2 className="text-xl md:text-2xl font-black text-gray-900">
            Limited Stock Items
          </h2>
          {!loading && !error && (
            <span className="hidden md:inline text-sm text-gray-400 font-medium">
              ({limited.length} items)
            </span>
          )}
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <FiAlertCircle size={22} className="text-red-400" />
            </div>
            <p className="text-gray-700 font-semibold text-sm">{error}</p>
            <button
              onClick={fetchLimited}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold transition-all"
            >
              <FiRefreshCw size={13} /> Try again
            </button>
          </div>
        ) : limited.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <MdOutlineInventory2 size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-semibold">No limited stock items right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {limited.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wishlisted={isWishlisted(parseInt(product.id, 10) || 0)}
                onWishlist={handleWishlist}
              />
            ))}
          </div>
        )}
      </div>

      {/* BANNER */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-16">
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{
            background:
              "linear-gradient(120deg,#B42225 0%,#d63a1a 55%,#e85d04 100%)",
          }}
        >
          <div className="relative z-10">
            <p className="text-yellow-300/70 text-xs font-semibold tracking-widest uppercase mb-1">
              Don't miss out
            </p>
            <h3 className="text-white text-xl md:text-2xl font-black">
              Set a Restock Alert
            </h3>
            <p className="text-white/45 text-sm mt-1">
              Get notified the moment items are back in stock.
            </p>
          </div>
          <button className="relative z-10 shrink-0 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-200 shadow-lg hover:scale-105 bg-white text-gray-900 hover:bg-yellow-300">
            Notify Me →
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LimitedStockDealsPage;