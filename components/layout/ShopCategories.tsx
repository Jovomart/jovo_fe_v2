"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { FiArrowRight, FiGrid, FiRefreshCw, FiAlertCircle, FiHeart } from "react-icons/fi";
import { getCategoryTheme } from "@/categoryConfig";
import apiService from "@/services/apiService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  product_name: string;
  product_original_price: number;
  product_discount_price: number | null;
  current_price: number;
  discount_percentage: number;
  is_on_sale: boolean;
  product_images: string[];
  brand: string | null;
  is_in_stock: boolean;
  average_rating: number;
  business_name: string;
}

interface CategoryCarouselProps {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  products: Product[];
}

// Placeholder image
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ccircle cx='200' cy='150' r='50' fill='%239ca3af'/%3E%3Crect x='100' y='220' width='200' height='120' rx='10' fill='%239ca3af'/%3E%3Crect x='140' y='250' width='120' height='15' rx='5' fill='%23d1d5db'/%3E%3Crect x='160' y='275' width='80' height='10' rx='5' fill='%23d1d5db'/%3E%3C/svg%3E";

// ─── Single Category Grid View ─────────────────────────────────────────────────

const CategoryGrid = ({
  categoryId,
  categoryName,
  categorySlug,
  products,
}: CategoryCarouselProps) => {
  const theme = getCategoryTheme(categorySlug || categoryName);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (productId: string) => {
    setImgErrors(prev => ({ ...prev, [productId]: true }));
  };

  const isValidImageUrl = (url: string) => {
    if (!url) return false;
    if (url.includes('api.yourstore.com')) return false;
    return true;
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="w-full mt-5 overflow-hidden" style={{ background: theme.bgColor }}>
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 md:px-6 py-4 mb-6 relative overflow-hidden"
        style={{ background: theme.gradient }}
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div
          className="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none opacity-20"
          style={{ background: `radial-gradient(circle,${theme.glowColor},transparent 65%)` }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <FiGrid size={16} className={theme.iconColor} />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-black text-white tracking-tight leading-none">
              {categoryName}
            </h2>
            <span className="text-xs font-bold text-white/70 mt-0.5 block">
              {products.length} product{products.length !== 1 ? "s" : ""} available
            </span>
          </div>
        </div>

        <Link
          href={`/category/${categorySlug || categoryId}`}
          className="relative z-10 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-white/15 hover:bg-white/25 border border-white/20 transition-all active:scale-95"
        >
          See All <FiArrowRight size={12} />
        </Link>
      </div>

      {/* ── Responsive Grid Products ── */}
      <div className="px-4 md:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {products.map((product) => {
            const discount = product.discount_percentage
              ? Math.round(product.discount_percentage)
              : product.product_original_price > product.current_price
              ? Math.round(
                  ((product.product_original_price - product.current_price) /
                    product.product_original_price) *
                    100
                )
              : 0;

            const imageUrl = imgErrors[product.id] || !isValidImageUrl(product.product_images?.[0])
              ? PLACEHOLDER_IMAGE
              : product.product_images[0];

            return (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer block"
              >
                <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-100">
                  <Image
                    src={imageUrl}
                    alt={product.product_name}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                    onError={() => handleImageError(product.id)}
                    unoptimized={imageUrl.includes('data:image')}
                  />
                  
                  {discount > 0 && (
                    <div
                      className="absolute top-2 left-2 text-white text-xs px-2 py-1 rounded-full font-bold shadow"
                      style={{ background: theme.badgeBg }}
                    >
                      -{discount}%
                    </div>
                  )}
                  
                  {!product.is_in_stock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-t-xl">
                      <span className="text-white text-xs font-bold bg-black/60 px-2 py-1 rounded">
                        Out of stock
                      </span>
                    </div>
                  )}

                  {/* Wishlist button */}
                  <button 
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log("Add to wishlist:", product.id);
                    }}
                  >
                    <FiHeart className="text-gray-600 text-sm" />
                  </button>
                </div>

                <div className="p-3">
                  <p className="font-semibold text-sm truncate text-gray-800">
                    {product.product_name}
                  </p>
                  {product.brand && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{product.brand}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span
                      className="font-bold text-base md:text-lg"
                      style={{ color: theme.accentColor }}
                    >
                      ₦{product.current_price.toLocaleString()}
                    </span>
                    {product.product_original_price > product.current_price && (
                      <span className="text-gray-400 line-through text-xs md:text-sm">
                        ₦{product.product_original_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton Loader for Grid ──────────────────────────────────────────────────

const CategoryGridSkeleton = () => (
  <div className="w-full mt-5">
    <div className="h-[72px] bg-gray-300 animate-pulse mb-6" />
    <div className="px-4 md:px-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 rounded-xl animate-pulse"
            style={{ aspectRatio: "1/1" }}
          />
        ))}
      </div>
    </div>
  </div>
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShopCategoryData {
  category: {
    id: string;
    name: string;
    slug: string;
  };
  products: Product[];
}

interface ShopCategoriesProps {
  limitPerCategory?: number;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ShopCategories = ({ limitPerCategory = 5 }: ShopCategoriesProps) => {
  const [categories, setCategories] = useState<ShopCategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchShopHomepage = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getShopHomepage(limitPerCategory, false);

      if (process.env.NODE_ENV === "development") {
        console.log("[ShopCategories] raw API response:", JSON.stringify(data, null, 2));
      }

      const rawList: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.categories)
        ? data.categories
        : Array.isArray(data?.data?.categories)
        ? data.data.categories
        : Array.isArray(data?.results)
        ? data.results
        : [];

      const normalised: ShopCategoryData[] = rawList
        .map((item: any) => {
          if (!item) return null;

          if (item?.category?.id) {
            return {
              category: {
                id: String(item.category.id),
                name: String(item.category.name ?? ""),
                slug: String(item.category.slug ?? item.category.id),
              },
              products: Array.isArray(item.products) ? item.products : [],
            };
          }

          if (item?.id && (item?.name || item?.category_name)) {
            return {
              category: {
                id: String(item.id),
                name: String(item.name ?? item.category_name ?? ""),
                slug: String(item.slug ?? item.category_slug ?? item.id),
              },
              products: Array.isArray(item.products) ? item.products : [],
            };
          }

          if (item?.category_id) {
            return {
              category: {
                id: String(item.category_id),
                name: String(item.category_name ?? ""),
                slug: String(item.category_slug ?? item.category_id),
              },
              products: Array.isArray(item.products) ? item.products : [],
            };
          }

          console.warn("[ShopCategories] Unrecognised item shape, skipping:", item);
          return null;
        })
        .filter(
          (item): item is ShopCategoryData =>
            item !== null &&
            item.category.id !== "" &&
            item.products.length > 0
        );

      setCategories(normalised);
    } catch (err: any) {
      const message: string = err?.message ?? "Failed to load categories";

      const is404 =
        message.toLowerCase().includes("not found") ||
        message.includes("404");

      const is500 =
        message.includes("500") ||
        message.toLowerCase().includes("server error");

      const isNetwork =
        message.toLowerCase().includes("network") ||
        message.toLowerCase().includes("fetch") ||
        message.toLowerCase().includes("failed to fetch");

      if (is404) {
        console.error(
          "[ShopCategories] 404: The shop-homepage endpoint was not found.\n" +
            "Check that /api/v1/marketspace/shop-homepage exists on your backend\n" +
            "or update the endpoint URL in apiService.getShopHomepage()."
        );
        setError("ENDPOINT_NOT_FOUND");
      } else if (is500) {
        setError("SERVER_ERROR");
      } else if (isNetwork) {
        setError("NETWORK_ERROR");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [limitPerCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchShopHomepage();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchShopHomepage]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        {Array.from({ length: 3 }).map((_, i) => (
          <CategoryGridSkeleton key={i} />
        ))}
      </>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    const isEndpointMissing = error === "ENDPOINT_NOT_FOUND";
    const isServerError = error === "SERVER_ERROR";

    const title = isEndpointMissing
      ? "Shop categories unavailable"
      : isServerError
      ? "Something went wrong on our end"
      : "Could not load categories";

    const description = isEndpointMissing
      ? "The categories endpoint could not be reached. Please check your API configuration."
      : isServerError
      ? "Our server encountered an error. Please try again in a moment."
      : "Please check your connection and try again.";

    return (
      <div className="w-full py-12 flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <FiAlertCircle size={22} className="text-red-400" />
        </div>
        <div>
          <p className="text-gray-700 font-semibold text-sm">{title}</p>
          <p className="text-gray-400 text-xs mt-1 max-w-xs">{description}</p>
          {process.env.NODE_ENV === "development" &&
            !isEndpointMissing &&
            !isServerError && (
              <p className="text-xs mt-2 text-red-300 font-mono">{error}</p>
            )}
        </div>
        {!isEndpointMissing && (
          <button
            onClick={() => setRetryCount((c) => c + 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold transition-all active:scale-95"
          >
            <FiRefreshCw size={13} />
            Try again
          </button>
        )}
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (categories.length === 0) {
    return (
      <div className="w-full py-10 text-center text-gray-400 text-sm">
        No categories available right now.
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {categories.map((item) => (
        <CategoryGrid
          key={item.category.id}
          categoryId={item.category.id}
          categoryName={item.category.name}
          categorySlug={item.category.slug}
          products={item.products}
        />
      ))}
    </>
  );
};

export default ShopCategories;