"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useWishlist } from "@/context/WishlistContext";
import { FiHeart, FiShoppingBag, FiArrowLeft, FiZap, FiRefreshCw, FiAlertCircle } from "react-icons/fi";
import { FaHeart, FaFire } from "react-icons/fa";
import Footer from "@/components/layout/Footer";
import apiService from "@/services/apiService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlashProduct {
  id: string;
  product_name: string;
  product_images: string[];
  product_original_price: number;
  current_price: number;
  flash_price: number;
  discount_percentage: number;
  stock_quantity: number;
  flash_stock: number;
  remaining_stock: number;
  is_in_stock: boolean;
  brand: string | null;
}

interface FlashCampaign {
  id: string;
  name: string;
  ends_at: string;
  products: FlashProduct[];
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

// ─── Countdown ────────────────────────────────────────────────────────────────

const getSecondsUntil = (isoDate: string | undefined): number => {
  if (!isoDate) return 86400;
  return Math.max(0, Math.floor((new Date(isoDate).getTime() - Date.now()) / 1000));
};

const TimeCell = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center">
    <div
      className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg,rgba(255,255,255,0.18) 0%,rgba(255,255,255,0.06) 100%)",
        border: "1px solid rgba(255,255,255,0.25)",
        backdropFilter: "blur(12px)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.2)",
      }}
    >
      <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-2xl" />
      <span className="relative text-2xl md:text-3xl font-black text-white tracking-tight tabular-nums">
        {value}
      </span>
    </div>
    <span className="mt-2 text-[10px] md:text-xs font-bold tracking-[0.2em] text-white/60 uppercase">
      {label}
    </span>
  </div>
);

const Sep = () => (
  <span className="text-2xl md:text-3xl font-black text-white/40 mb-5 select-none">
    :
  </span>
);

// ─── Product Card ─────────────────────────────────────────────────────────────

const ProductCard = ({
  product,
  wishlisted,
  onWishlist,
  index,
}: {
  product: FlashProduct;
  wishlisted: boolean;
  onWishlist: (id: string) => void;
  index: number;
}) => {
  const [imgError, setImgError] = useState(false);

  const effectivePrice = product.flash_price ?? product.current_price;
  const originalPrice = product.product_original_price;
  const discount =
    originalPrice > effectivePrice
      ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
      : Math.round(product.discount_percentage ?? 0);

  const totalStock = product.flash_stock ?? product.stock_quantity ?? 100;
  const remaining = product.remaining_stock ?? totalStock;
  const soldPct = totalStock > 0 ? Math.round(((totalStock - remaining) / totalStock) * 100) : 72;

  const imgUrl = imgError
    ? PLACEHOLDER_IMAGE
    : getValidImageUrl(product.product_images?.[0]);

  return (
    <div
      className="group relative bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-1.5"
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)", animationDelay: `${index * 60}ms` }}
    >
      <Link
        href={`/product/${product.id}`}
        className="relative overflow-hidden block"
        style={{ aspectRatio: "1/1" }}
      >
        <Image
          src={imgUrl}
          alt={product.product_name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          onError={() => setImgError(true)}
          unoptimized={imgUrl.startsWith("data:")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {discount > 0 && (
          <div
            className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black text-white"
            style={{ background: "linear-gradient(135deg,#B42225,#ff4444)" }}
          >
            <FiZap size={10} />-{discount}%
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
            <FaHeart className="text-red-500" size={14} />
          ) : (
            <FiHeart className="text-gray-400" size={14} />
          )}
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Link
            href={`/product/${product.id}`}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 py-2.5 rounded-xl text-xs font-bold shadow-lg hover:bg-[#B42225] hover:text-white transition-colors duration-200"
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
          <span className="text-sm md:text-base font-black text-[#B42225]">
            ₦{effectivePrice.toLocaleString()}
          </span>
          {originalPrice > effectivePrice && (
            <span className="text-[11px] text-gray-400 line-through">
              ₦{originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        <div className="mt-2.5">
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span className="text-[#B42225] font-semibold">🔥 Selling fast</span>
            <span>{soldPct}% sold</span>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${soldPct}%`,
                background: "linear-gradient(90deg,#FF8C00,#B42225)",
              }}
            />
          </div>
        </div>
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

const FlashSalesPage = () => {
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();

  const [campaign, setCampaign] = useState<FlashCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(86400);

  const fetchCampaign = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getActiveFlashSaleCampaign();
      const raw = data?.data ?? data;

      if (!raw) throw new Error("No active flash sale");

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
              is_in_stock: p.is_in_stock ?? true,
              brand: p.brand ?? null,
            }))
          : [],
      };

      setCampaign(campaignObj);
      setTimeLeft(getSecondsUntil(campaignObj.ends_at));
    } catch (err: any) {
      setError(err?.message ?? "No active flash sale at the moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  // Countdown tick
  useEffect(() => {
    const id = setInterval(
      () => setTimeLeft((p) => (p > 0 ? p - 1 : 0)),
      1000,
    );
    return () => clearInterval(id);
  }, []);

  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  const flashProducts = campaign?.products ?? [];

  const handleWishlist = (id: string) => {
    const product = flashProducts.find((p) => p.id === id);
    if (!product) return;
    const wishlistItem = {
      id: parseInt(product.id, 10) || 0,
      name: product.product_name,
      price: product.flash_price ?? product.current_price,
      oldPrice:
        product.product_original_price > (product.flash_price ?? product.current_price)
          ? product.product_original_price
          : null,
      rating: 0,
      reviews: 0,
      image: getValidImageUrl(product.product_images?.[0]),
      brand: product.brand ?? undefined,
    };
    if (isWishlisted(wishlistItem.id)) removeFromWishlist(wishlistItem.id);
    else addToWishlist(wishlistItem);
  };

  return (
    <div className="min-h-screen" style={{ background: "#F3F4F8" }}>
      {/* HERO */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,#0f0f0f 0%,#1a0505 40%,#2d0a0a 70%,#B42225 100%)",
          minHeight: "340px",
        }}
      >
        <div
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-20 animate-pulse"
          style={{ background: "radial-gradient(circle,#FF8C00,transparent 70%)" }}
        />
        <div
          className="absolute -bottom-10 right-0 w-80 h-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle,#B42225,transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg,transparent,transparent 20px,rgba(255,255,255,1) 20px,rgba(255,255,255,1) 21px)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-14">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors mb-8"
          >
            <FiArrowLeft size={14} /> Back to Shop
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 mb-4">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-white/80 text-xs font-semibold tracking-widest uppercase">
                  Live Now
                </span>
              </div>

              <div className="flex items-center gap-3">
                <FaFire className="text-[#FF8C00] text-4xl md:text-5xl drop-shadow-lg" />
                <div>
                  <h1
                    className="text-4xl md:text-6xl font-black text-white leading-none tracking-tight"
                    style={{
                      fontFamily: "'Georgia',serif",
                      textShadow: "0 4px 30px rgba(180,34,37,0.5)",
                    }}
                  >
                    FLASH
                  </h1>
                  <h1
                    className="text-4xl md:text-6xl font-black leading-none tracking-tight"
                    style={{
                      fontFamily: "'Georgia',serif",
                      background: "linear-gradient(90deg,#FF8C00,#ffcc00)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    SALES
                  </h1>
                </div>
              </div>

              <p className="mt-3 text-white/50 text-sm md:text-base max-w-xs">
                {campaign?.name
                  ? `${campaign.name} — Unbeatable prices, limited stock.`
                  : "Unbeatable prices. Limited stock. Don't sleep on it."}
              </p>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-3">
              <p className="text-white/50 text-xs font-semibold tracking-widest uppercase">
                Ends in
              </p>
              <div className="flex items-center gap-3">
                <TimeCell value={hours} label="Hours" />
                <Sep />
                <TimeCell value={minutes} label="Mins" />
                <Sep />
                <TimeCell value={seconds} label="Secs" />
              </div>
            </div>
          </div>
        </div>

        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path d="M0,40 L0,20 Q360,0 720,20 Q1080,40 1440,20 L1440,40 Z" fill="#F3F4F8" />
        </svg>
      </div>

      {/* PRODUCTS */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-1 h-7 rounded-full"
              style={{ background: "linear-gradient(180deg,#FF8C00,#B42225)" }}
            />
            <h2 className="text-xl md:text-2xl font-black text-gray-900">
              Today's Deals
            </h2>
            {!loading && !error && (
              <span className="hidden md:inline text-sm text-gray-400 font-medium">
                ({flashProducts.length} items)
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <FiAlertCircle size={22} className="text-red-400" />
            </div>
            <div>
              <p className="text-gray-700 font-semibold text-sm">No flash sale active</p>
              <p className="text-gray-400 text-xs mt-1 max-w-xs">{error}</p>
            </div>
            <button
              onClick={fetchCampaign}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold transition-all active:scale-95"
            >
              <FiRefreshCw size={13} /> Try again
            </button>
          </div>
        ) : flashProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FaFire size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-semibold">No flash sales right now.</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {flashProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                wishlisted={isWishlisted(parseInt(product.id, 10) || 0)}
                onWishlist={handleWishlist}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      {/* BANNER */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{
            background:
              "linear-gradient(120deg,#0f0f0f 0%,#B42225 60%,#FF8C00 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%,white 1px,transparent 1px),radial-gradient(circle at 80% 50%,white 1px,transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative z-10">
            <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-1">
              Limited time
            </p>
            <h3 className="text-white text-xl md:text-2xl font-black">
              Become a Seller on Jovo
            </h3>
            <p className="text-white/60 text-sm mt-1">
              Reach millions of buyers. Zero listing fees this month.
            </p>
          </div>
          <Link
            href="/become-seller"
            className="relative z-10 shrink-0 bg-white text-gray-900 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#FF8C00] hover:text-white transition-colors duration-200 shadow-lg"
          >
            Start Selling →
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FlashSalesPage;