"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { FiArrowRight, FiClock } from "react-icons/fi";
import { FaExclamationTriangle } from "react-icons/fa";
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

const LimitedStockDeals = () => {
  const [products, setProducts] = useState<LimitedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const fetchLimitedStock = useCallback(async () => {
    try {
      const data = await apiService.getLimitedStockProducts({
        threshold: 100,
        limit: 4,
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
      }));

      setProducts(normalised.slice(0, 4));
    } catch {
      // silently fail on homepage
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLimitedStock();
  }, [fetchLimitedStock]);

  if (!loading && products.length === 0) return null;

  return (
    <div className="w-full mt-5 bg-[#F5F6F7] rounded-xl">
      {/* HEADER */}
      <div
        className="flex items-center justify-between px-4 md:px-6 py-4 mb-6 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,#B42225 0%,#d63a1a 50%,#e85d04 100%)",
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
          style={{ background: "radial-gradient(circle,#FF4500,transparent 65%)" }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <FaExclamationTriangle size={16} className="text-yellow-300" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-black text-white tracking-tight leading-none">
              Limited Stock Deals
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <FiClock size={10} className="text-yellow-300" />
              <span className="text-xs font-bold text-white/70">Hurry up!</span>
            </div>
          </div>
        </div>

        <Link
          href="/limited-deals"
          className="relative z-10 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-white/15 hover:bg-white/25 border border-white/20 transition-all active:scale-95"
        >
          See All <FiArrowRight size={12} />
        </Link>
      </div>

      {/* GRID PRODUCTS */}
      <div className="px-4 md:px-6 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-72 bg-white rounded-xl animate-pulse" />
            ))
          : products.map((product) => {
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

              // Stock bar: treat threshold=100 as 100% so remaining pct = stock_quantity
              const stockPercent = Math.min(
                Math.max(product.stock_quantity, 0),
                100,
              );

              const imgUrl = imgErrors[product.id]
                ? PLACEHOLDER_IMAGE
                : getValidImageUrl(product.product_images?.[0]);

              return (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer overflow-hidden block"
                >
                  <div className="relative h-36 md:h-48 overflow-hidden bg-gray-100">
                    <Image
                      src={imgUrl}
                      alt={product.product_name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                      onError={() =>
                        setImgErrors((prev) => ({
                          ...prev,
                          [product.id]: true,
                        }))
                      }
                      unoptimized={imgUrl.startsWith("data:")}
                    />
                    {discount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow">
                        -{discount}%
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black text-white text-[10px] px-2 py-1 rounded-full font-semibold shadow">
                      Limited
                    </div>
                  </div>

                  <div className="p-3 md:p-4">
                    <p className="font-semibold text-sm md:text-base truncate text-gray-800">
                      {product.product_name}
                    </p>
                    <div className="mt-2">
                      <span className="text-gray-900 font-bold text-base md:text-lg">
                        ₦{product.current_price.toLocaleString()}
                      </span>
                      {product.product_original_price > product.current_price && (
                        <span className="text-gray-400 line-through ml-2 text-xs md:text-sm">
                          ₦{product.product_original_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 h-2 rounded-full">
                        <div
                          className="bg-[#B42225] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${stockPercent}%` }}
                        />
                      </div>
                      <p className="text-xs mt-1 text-gray-500">
                        Only {product.stock_quantity} left in stock
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
      </div>
    </div>
  );
};

export default LimitedStockDeals;