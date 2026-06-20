"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { FaFire } from "react-icons/fa";
import { FiZap, FiArrowRight } from "react-icons/fi";
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
  remaining_percentage?: number | null;
  sold_quantity?: number;
  ends_at?: string;
  is_in_stock: boolean;
}

interface FlashCampaign {
  id: string;
  name: string;
  ends_at: string;
  ends_in_seconds: number | null;
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

// ─── Countdown helpers ────────────────────────────────────────────────────────

// Fallback only — prefer the server-computed `ends_in_seconds` wherever possible,
// since it avoids client clock drift. This is only used if that field is missing.
const getSecondsUntil = (isoDate: string | undefined): number => {
  if (!isoDate) return 36000;
  const diff = Math.floor((new Date(isoDate).getTime() - Date.now()) / 1000);
  return Math.max(0, diff);
};

const formatTime = (seconds: number) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return d > 0 ? `${d}d ${h}:${m}:${s}` : `${h}:${m}:${s}`;
};

// ─── Component ────────────────────────────────────────────────────────────────

const FlashSales = () => {
  const [campaign, setCampaign] = useState<FlashCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(36000);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch campaign
  const fetchCampaign = useCallback(async () => {
    try {
      const data = await apiService.getActiveFlashSaleCampaign();
      const raw = data?.data ?? data;

      if (!raw) {
        setLoading(false);
        return;
      }

      // Normalise: API may return the campaign directly or nested
      const campaignObj: FlashCampaign = {
        id: raw.id ?? "",
        // API sends "title", not "name" — keep both as fallbacks in case the
        // backend shape changes again.
        name: raw.title ?? raw.name ?? "Flash Sales",
        ends_at: raw.end_time ?? raw.ends_at ?? "",
        // Prefer the server-computed countdown — it's immune to the user's
        // device clock being wrong, unlike re-deriving from end_time.
        ends_in_seconds:
          typeof raw.ends_in_seconds === "number" ? raw.ends_in_seconds : null,
        products: Array.isArray(raw.products)
          ? raw.products.map((p: any) => {
              // Flash-sale-specific pricing/stock lives in this nested object,
              // separate from the product's general stock_quantity (which never
              // decrements for flash sale purchases).
              const fsd = p.flash_sale_details ?? {};
              return {
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
                flash_price: fsd.flash_price ?? p.current_price ?? p.price ?? 0,
                discount_percentage: p.discount_percentage ?? 0,
                stock_quantity: p.stock_quantity ?? 0,
                flash_stock: fsd.flash_stock ?? p.stock_quantity ?? 0,
                remaining_stock:
                  fsd.remaining_stock ?? fsd.flash_stock ?? p.stock_quantity ?? 0,
                remaining_percentage:
                  typeof fsd.remaining_percentage === "number"
                    ? fsd.remaining_percentage
                    : null,
                sold_quantity: fsd.sold_quantity ?? 0,
                ends_at: p.ends_at ?? raw.end_time ?? raw.ends_at ?? "",
                is_in_stock: p.is_in_stock ?? true,
              };
            })
          : [],
      };

      setCampaign(campaignObj);
      setTimeLeft(
        campaignObj.ends_in_seconds ?? getSecondsUntil(campaignObj.ends_at),
      );
    } catch {
      // No active flash sale — silently hide
    } finally {
      setLoading(false);
    }
  }, []);

  // FIXED: Wrapped fetchCampaign call in an async function to avoid set-state-in-effect warning
  useEffect(() => {
    const loadCampaign = async () => {
      await fetchCampaign();
    };
    loadCampaign();

  }, [fetchCampaign]);

  // Countdown tick
  useEffect(() => {
    const timer = setInterval(
      () => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)),
      1000,
    );
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll carousel
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    let scrollAmount = 0;
    const auto = setInterval(() => {
      scrollAmount += 250;
      if (scrollAmount >= container.scrollWidth - container.clientWidth)
        scrollAmount = 0;
      container.scrollTo({ left: scrollAmount, behavior: "smooth" });
    }, 4000);
    return () => clearInterval(auto);
  }, [campaign]);

  // Show nothing if no campaign and not loading
  if (!loading && (!campaign || campaign.products.length === 0)) return null;

  // Limit to 4 on homepage
  const displayProducts = (campaign?.products ?? []).slice(0, 4);

  return (
    <div className="w-full md:mt-0 bg-[#F5F6F7]">
      {/* HEADER */}
      <div
        className="flex items-center justify-between px-2 md:px-6 py-4 mb-6 relative overflow-hidden capitalize"
        style={{
          background:
            "linear-gradient(135deg,#7f0d0f 0%,#B42225 50%,#d63a1a 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div
          className="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none opacity-20"
          style={{ background: "radial-gradient(circle,#FF8C00,transparent 65%)" }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <FaFire size={16} className="text-yellow-300" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-black text-white tracking-tight leading-none">
              {campaign?.name ?? "Flash Sales"}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <FiZap size={10} className="text-yellow-300" />
              <span className="text-xs font-bold text-white/70">Ends in:</span>
              <span className="text-xs font-black text-yellow-300 tracking-wider">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        <Link
          href="/flash-sales"
          className="relative z-10 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-white/15 hover:bg-white/25 border border-white/20 transition-all active:scale-95"
        >
          See All <FiArrowRight size={12} />
        </Link>
      </div>

      {/* PRODUCTS */}
      {loading ? (
        <div className="flex gap-3 px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="min-w-[180px] md:min-w-[240px] h-72 bg-white rounded-xl animate-pulse shrink-0"
            />
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto px-4 snap-x snap-mandatory scroll-smooth no-scrollbar"
        >
          {displayProducts.map((product) => {
            const effectivePrice = product.flash_price ?? product.current_price;
            const originalPrice = product.product_original_price;
            const discount =
              originalPrice > effectivePrice
                ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
                : Math.round(product.discount_percentage ?? 0);

            // Prefer the server-computed remaining_percentage directly — it's
            // the source of truth and avoids any chance of inverting
            // sold-vs-remaining math on the frontend.
            const totalStock =
              (product.flash_stock ?? 0) > 0
                ? (product.flash_stock as number)
                : product.stock_quantity || 1;
            const remainingStock = Math.min(
              product.remaining_stock ?? totalStock,
              totalStock,
            );
            const stockPct =
              product.remaining_percentage != null
                ? Math.round(product.remaining_percentage)
                : totalStock > 0
                ? Math.round((remainingStock / totalStock) * 100)
                : 0;

            const imgUrl = imgErrors[product.id]
              ? PLACEHOLDER_IMAGE
              : getValidImageUrl(product.product_images?.[0]);

            return (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="min-w-[180px] md:min-w-[240px] snap-start bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer block shrink-0"
              >
                <div className="relative h-40 md:h-52 overflow-hidden rounded-t-xl bg-gray-100">
                  <Image
                    src={imgUrl}
                    alt={product.product_name}
                    fill
                    className="object-cover"
                    onError={() =>
                      setImgErrors((prev) => ({ ...prev, [product.id]: true }))
                    }
                    unoptimized={imgUrl.startsWith("data:")}
                  />
                  {discount > 0 && (
                    <div className="absolute top-2 left-2 bg-[#d60404] text-white text-xs px-2 py-1 rounded-full font-bold">
                      -{discount}%
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <p className="font-semibold truncate text-sm">
                    {product.product_name}
                  </p>
                  <div className="mt-2">
                    <span className="text-[#B42225] font-bold text-lg">
                      ₦{effectivePrice.toLocaleString()}
                    </span>
                    {originalPrice > effectivePrice && (
                      <span className="text-gray-400 line-through ml-2 text-sm">
                        ₦{originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div
                        className="bg-[#B42225] h-2 rounded-full"
                        style={{ width: `${stockPct}%` }}
                      />
                    </div>
                    <p className="text-xs mt-1 text-gray-500">
                      {stockPct}% remaining
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FlashSales;