"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { FiArrowRight, FiStar } from "react-icons/fi";
import { FaTrophy } from "react-icons/fa";
import apiService from "@/services/apiService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TopProduct {
  id: string;
  product_name: string;
  product_images: string[];
  product_original_price: number;
  current_price: number;
  discount_percentage: number;
  is_in_stock: boolean;
  sold_count?: number;
  checkout_count?: number;
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

// ─── Component ────────────────────────────────────────────────────────────────

const TopSellers = () => {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchTopSellers = useCallback(async () => {
    try {
      const data = await apiService.getTopSellingProducts({ limit: 4, days: 7 });
      const raw = data?.data ?? data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.products)
        ? raw.products
        : Array.isArray(raw?.items)
        ? raw.items
        : [];

      const normalised: TopProduct[] = list.map((p: any) => ({
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
        is_in_stock: p.is_in_stock ?? true,
        sold_count: p.sold_count ?? p.checkout_count ?? 0,
        checkout_count: p.checkout_count ?? p.sold_count ?? 0,
      }));

      setProducts(normalised);
    } catch {
      // silently fail on homepage
    } finally {
      setLoading(false);
    }
  }, []);

  // FIXED: Wrapped fetchTopSellers call in an async function to avoid set-state-in-effect warning
  useEffect(() => {
    const loadTopSellers = async () => {
      await fetchTopSellers();
    };
    loadTopSellers();
    
  }, [fetchTopSellers]);

  // Auto-scroll
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
  }, [products]);

  if (!loading && products.length === 0) return null;

  return (
    <div className="w-full bg-[#F5F6F7]">
      {/* HEADER */}
      <div
        className="flex items-center justify-between px-4 md:px-6 py-4 mb-6 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,#e67e22 0%,#f39c12 50%,#f1c40f 100%)",
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
          style={{ background: "radial-gradient(circle,#FFD700,transparent 65%)" }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <FaTrophy size={16} className="text-yellow-300" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-black text-white tracking-tight leading-none">
              Top Sellers
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <FiStar size={10} className="text-yellow-300" />
              <span className="text-xs font-bold text-white/70">Best rated</span>
            </div>
          </div>
        </div>

        <Link
          href="/top-sellers"
          className="relative z-10 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-white/15 hover:bg-white/25 border border-white/20 transition-all active:scale-95"
        >
          See All <FiArrowRight size={12} />
        </Link>
      </div>

      {/* PRODUCTS */}
      {loading ? (
        <div className="flex gap-6 px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="min-w-[180px] md:min-w-[240px] h-[300px] bg-white rounded-xl animate-pulse shrink-0"
            />
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto px-4 snap-x snap-mandatory scroll-smooth no-scrollbar"
        >
          {products.map((product) => {
            const discount =
              product.discount_percentage > 0
                ? Math.round(product.discount_percentage)
                : product.product_original_price > product.current_price
                ? Math.round(
                    ((product.product_original_price - product.current_price) /
                      product.product_original_price) *
                      100,
                  )
                : 0;

            const imgUrl = imgErrors[product.id]
              ? PLACEHOLDER_IMAGE
              : getValidImageUrl(product.product_images?.[0]);

            return (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="min-w-[180px] md:min-w-[240px] snap-start bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer block shrink-0"
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
                    <div className="absolute top-2 left-2 bg-[#FF8C00] text-white text-xs px-2 py-1 rounded-full font-bold">
                      -{discount}%
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <p className="font-semibold text-sm md:text-base truncate">
                    {product.product_name}
                  </p>
                  <div className="mt-2">
                    <span className="text-[#FF8C00] font-bold text-lg">
                      ₦{product.current_price.toLocaleString()}
                    </span>
                    {product.product_original_price > product.current_price && (
                      <span className="text-gray-400 line-through ml-2 text-sm">
                        ₦{product.product_original_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {(product.sold_count ?? 0) > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      {(product.sold_count ?? 0).toLocaleString()} sold
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopSellers;