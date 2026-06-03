"use client";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  FiHeart, FiShoppingBag, FiArrowLeft, FiSearch,
  FiChevronDown, FiChevronUp, FiSliders, FiX, FiGrid,
  FiRefreshCw, FiAlertCircle, FiTruck, FiShield, FiAward, FiTrendingUp,
} from "react-icons/fi";
import { FaHeart, FaStar } from "react-icons/fa";
import Footer from "@/components/layout/Footer";
import { getCategoryTheme } from "@/categoryConfig";
import apiService from "@/services/apiService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  product_name: string;
  product_description: string;
  product_condition: string;
  product_original_price: number;
  product_discount_price: number | null;
  current_price: number;
  discount_percentage: number;
  is_on_sale: boolean;
  is_in_stock: boolean;
  is_digital: boolean;
  product_images: string[];
  brand: string | null;
  model: string | null;
  average_rating: number;
  review_count: number;
  sold_count: number;
  business_name: string;
  subcategory_name: string;
  seller_id: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

interface FiltersMetadata {
  brands: string[];
  conditions: string[];
  min_price: number;
  max_price: number;
}

interface PriceRange {
  label: string;
  min: number;
  max: number;
}

// Placeholder image as data URL (gray gradient with product icon)
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ccircle cx='200' cy='150' r='50' fill='%239ca3af'/%3E%3Crect x='100' y='220' width='200' height='120' rx='10' fill='%239ca3af'/%3E%3Crect x='140' y='250' width='120' height='15' rx='5' fill='%23d1d5db'/%3E%3Crect x='160' y='275' width='80' height='10' rx='5' fill='%23d1d5db'/%3E%3C/svg%3E";

// ─── Filter Section ───────────────────────────────────────────────────────────

const FilterSection = ({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <span className="text-[11px] font-black tracking-widest text-gray-500 uppercase">
          {title}
        </span>
        {open ? (
          <FiChevronUp size={14} className="text-gray-400" />
        ) : (
          <FiChevronDown size={14} className="text-gray-400" />
        )}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const Sidebar = ({
  subcategories,
  selectedSub,
  setSelectedSub,
  brands,
  selectedBrands,
  toggleBrand,
  conditions,
  selectedConditions,
  toggleCondition,
  priceRanges,
  selectedPrice,
  setSelectedPrice,
  showOnSale,
  setShowOnSale,
  brandSearch,
  setBrandSearch,
  onClearAll,
  accentColor,
}: {
  subcategories: Subcategory[];
  selectedSub: string | null;
  setSelectedSub: (v: string | null) => void;
  brands: string[];
  selectedBrands: string[];
  toggleBrand: (b: string) => void;
  conditions: string[];
  selectedConditions: string[];
  toggleCondition: (c: string) => void;
  priceRanges: PriceRange[];
  selectedPrice: PriceRange | null;
  setSelectedPrice: (r: PriceRange | null) => void;
  showOnSale: boolean;
  setShowOnSale: (v: boolean) => void;
  brandSearch: string;
  setBrandSearch: (v: string) => void;
  onClearAll: () => void;
  accentColor: string;
}) => {
  const filteredBrands = brands.filter((b) =>
    b.toLowerCase().includes(brandSearch.toLowerCase())
  );
  const accentStyle = { accentColor };

  return (
    <aside className="w-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Filters</h2>
        <button
          onClick={onClearAll}
          className="text-[11px] font-semibold hover:underline"
          style={{ color: accentColor }}
        >
          Clear All
        </button>
      </div>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <FilterSection title="Category">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setSelectedSub(null)}
                className="w-full text-left text-xs py-1.5 px-2 rounded-lg font-semibold transition-colors"
                style={!selectedSub ? { background: `${accentColor}15`, color: accentColor } : { color: "#374151" }}
              >
                All
              </button>
            </li>
            {subcategories.map((sub) => (
              <li key={sub.id}>
                <button
                  onClick={() => setSelectedSub(sub.id)}
                  className="w-full text-left text-xs py-1.5 px-2 rounded-lg transition-colors"
                  style={
                    selectedSub === sub.id
                      ? { background: `${accentColor}15`, color: accentColor, fontWeight: 600 }
                      : { color: "#4B5563" }
                  }
                >
                  {sub.name}
                </button>
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <FilterSection title="Brand">
          <div className="relative mb-2">
            <FiSearch size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search brands"
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none"
            />
          </div>
          <ul className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {filteredBrands.map((brand) => (
              <li key={brand}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="w-3.5 h-3.5 rounded"
                    style={accentStyle}
                  />
                  <span className="text-xs text-gray-700">{brand}</span>
                </label>
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      {/* Condition */}
      {conditions.length > 0 && (
        <FilterSection title="Condition" defaultOpen={false}>
          <ul className="space-y-1.5">
            {conditions.map((c) => (
              <li key={c}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedConditions.includes(c)}
                    onChange={() => toggleCondition(c)}
                    className="w-3.5 h-3.5 rounded"
                    style={accentStyle}
                  />
                  <span className="text-xs text-gray-700">{c}</span>
                </label>
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      {/* Price */}
      {priceRanges.length > 0 && (
        <FilterSection title="Price Range">
          <ul className="space-y-1.5">
            {priceRanges.map((range) => (
              <li key={range.label}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="price"
                    checked={selectedPrice?.label === range.label}
                    onChange={() => setSelectedPrice(range)}
                    className="w-3.5 h-3.5"
                    style={accentStyle}
                  />
                  <span className="text-xs text-gray-700">{range.label}</span>
                </label>
              </li>
            ))}
            {selectedPrice && (
              <li>
                <button
                  onClick={() => setSelectedPrice(null)}
                  className="text-[11px] hover:underline mt-1"
                  style={{ color: accentColor }}
                >
                  Clear price filter
                </button>
              </li>
            )}
          </ul>
        </FilterSection>
      )}

      {/* On Sale */}
      <FilterSection title="Deals" defaultOpen={false}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showOnSale}
            onChange={() => setShowOnSale(!showOnSale)}
            className="w-3.5 h-3.5 rounded"
            style={accentStyle}
          />
          <span className="text-xs text-gray-700">On sale only</span>
        </label>
      </FilterSection>
    </aside>
  );
};

// ─── Stars ────────────────────────────────────────────────────────────────────

const Stars = ({ rating, accentColor }: { rating: number; accentColor: string }) => (
  <div className="flex items-center gap-0.5 mt-1.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <FaStar
        key={s}
        size={10}
        style={{ color: s <= Math.round(rating) ? accentColor : "#e5e7eb" }}
      />
    ))}
  </div>
);

// ─── Product Card with better image handling ─────────────────────────────────

const ProductCard = ({
  product,
  theme,
  wishlisted,
  onWishlist,
}: {
  product: Product;
  theme: ReturnType<typeof getCategoryTheme>;
  wishlisted: boolean;
  onWishlist: (id: string) => void;
}) => {
  const [imgError, setImgError] = useState(false);
  
  const discount = product.discount_percentage
    ? Math.round(product.discount_percentage)
    : product.product_original_price > product.current_price
    ? Math.round(
        ((product.product_original_price - product.current_price) /
          product.product_original_price) *
          100
      )
    : 0;

  // Check if image URL is valid and not pointing to unresolvable domain
  const isValidImageUrl = (url: string) => {
    if (!url) return false;
    // Skip URLs that are known to fail
    if (url.includes('api.yourstore.com')) return false;
    return true;
  };

  const imageUrl = imgError || !isValidImageUrl(product.product_images?.[0]) 
    ? PLACEHOLDER_IMAGE
    : product.product_images[0];

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl cursor-pointer"
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 z-10"
        style={{ background: `linear-gradient(90deg,transparent,${theme.accentColor},transparent)` }}
      />

      {/* Image */}
      <div
        className="relative overflow-hidden bg-gray-100"
        style={{ aspectRatio: "1/1" }}
      >
        <Link href={`/product/${product.id}`}>
          <div className="relative w-full h-full">
            <Image
              src={imageUrl}
              alt={product.product_name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
              loading="lazy"
              unoptimized={imageUrl.includes('data:image')}
            />
          </div>
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Discount badge */}
        {discount > 0 && (
          <div
            className="absolute top-3 left-3 px-2 py-1 rounded-full text-[10px] font-black text-white shadow"
            style={{ background: theme.badgeBg }}
          >
            -{discount}%
          </div>
        )}

        {/* Condition badge */}
        {product.product_condition && (
          <div className="absolute top-3 right-10 px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/40 text-white backdrop-blur-sm">
            {product.product_condition}
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.stopPropagation(); onWishlist(product.id); }}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-110"
        >
          {wishlisted ? (
            <FaHeart className="text-red-500" size={12} />
          ) : (
            <FiHeart className="text-gray-400" size={12} />
          )}
        </button>

        {/* Out of stock overlay */}
        {!product.is_in_stock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-black/60 px-2 py-1 rounded">
              Out of stock
            </span>
          </div>
        )}

        {/* View Product hover CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Link
            href={`/product/${product.id}`}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white shadow-lg"
            style={{ background: theme.gradient }}
          >
            <FiShoppingBag size={12} /> View Product
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug min-h-[2.5rem]">
          {product.product_name}
        </h3>
        {product.brand && (
          <p className="text-[10px] text-gray-400 mt-0.5">{product.brand}</p>
        )}
        <div className="mt-1.5 flex items-end gap-2 flex-wrap">
          <span className="text-sm font-black" style={{ color: theme.accentColor }}>
            ₦{product.current_price.toLocaleString()}
          </span>
          {product.product_original_price > product.current_price && (
            <span className="text-[11px] text-gray-400 line-through">
              ₦{product.product_original_price.toLocaleString()}
            </span>
          )}
        </div>
        {product.average_rating > 0 && (
          <Stars rating={product.average_rating} accentColor={theme.accentColor} />
        )}
      </div>
    </div>
  );
};

// ─── Skeleton Grid ────────────────────────────────────────────────────────────

const SkeletonGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
    ))}
  </div>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Most Popular", value: "most_popular" },
  { label: "Top Rated", value: "top_rated" },
] as const;

const PAGE_LIMIT = 20;

// ─── Main Category Page ───────────────────────────────────────────────────────

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params?.category_id as string;

  // ── Data state ──────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filtersMetadata, setFiltersMetadata] = useState<FiltersMetadata>({
    brands: [],
    conditions: [],
    min_price: 0,
    max_price: 999999,
  });
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState(categoryId);
  const [total, setTotal] = useState(0);
  
  // Use refs to prevent infinite loops
  const offsetRef = useRef(0);
  const isLoadingRef = useRef(false);
  
  // State for loading UI
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Filter state ─────────────────────────────────────────────────────────────
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<PriceRange | null>(null);
  const [showOnSale, setShowOnSale] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [sortBy, setSortBy] = useState<typeof SORT_OPTIONS[number]["value"]>("newest");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const theme = getCategoryTheme(categorySlug || categoryId);

  // ── Price ranges derived from metadata ───────────────────────────────────────
  const priceRanges = useMemo<PriceRange[]>(() => {
    const max = filtersMetadata.max_price;
    if (max <= 0) return [];
    return [
      { label: `Under ₦${(max * 0.2).toLocaleString()}`, min: 0, max: max * 0.2 },
      { label: `₦${(max * 0.2).toLocaleString()} – ₦${(max * 0.5).toLocaleString()}`, min: max * 0.2, max: max * 0.5 },
      { label: `₦${(max * 0.5).toLocaleString()} – ₦${(max * 0.8).toLocaleString()}`, min: max * 0.5, max: max * 0.8 },
      { label: `Above ₦${(max * 0.8).toLocaleString()}`, min: max * 0.8, max: Infinity },
    ];
  }, [filtersMetadata.max_price]);

  // ── Fetch function with better error handling ───────────────────────────────
  const fetchProducts = useCallback(async (reset: boolean) => {
    // Prevent multiple simultaneous calls
    if (isLoadingRef.current) {
      return;
    }
    
    if (!categoryId) {
      setError("Invalid category");
      setLoading(false);
      return;
    }

    try {
      isLoadingRef.current = true;
      
      if (reset) {
        setLoading(true);
        setError(null);
        offsetRef.current = 0;
      } else {
        setLoadingMore(true);
      }

      // Build params from current state
      const currentOffset = offsetRef.current;
      const params: any = {
        limit: PAGE_LIMIT,
        offset: currentOffset,
      };
      
      if (selectedSub) params.subcategory_id = selectedSub;
      if (selectedPrice?.min !== undefined && selectedPrice.min > 0) params.min_price = selectedPrice.min;
      if (selectedPrice?.max !== undefined && selectedPrice.max !== Infinity) params.max_price = selectedPrice.max;
      if (selectedConditions.length === 1) params.condition = selectedConditions[0];
      if (selectedBrands.length === 1) params.brand = selectedBrands[0];
      if (showOnSale) params.on_sale = true;
      if (sortBy) params.sort_by = sortBy;

      const json = await apiService.getCategoryMarketspace(categoryId, params);
      const data = json?.data ?? json;

      if (!data) {
        throw new Error("No data received from API");
      }

      if (reset) {
        setCategoryName(data?.category?.name ?? "");
        setCategorySlug(data?.category?.slug ?? categoryId);
        setSubcategories(Array.isArray(data?.subcategories) ? data.subcategories : []);
        setFiltersMetadata(
          data?.filters_metadata ?? { brands: [], conditions: [], min_price: 0, max_price: 999999 }
        );
        setProducts(Array.isArray(data?.products) ? data.products : []);
        offsetRef.current = PAGE_LIMIT;
      } else {
        const newProducts = Array.isArray(data?.products) ? data.products : [];
        setProducts((prev) => [...prev, ...newProducts]);
        offsetRef.current = currentOffset + PAGE_LIMIT;
      }

      setTotal(data?.total ?? 0);
    } catch (err: any) {
      const msg: string = err?.message ?? "Failed to load products";
      console.error("[CategoryPage] fetch error:", err);
      setError(msg);
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, [categoryId, selectedSub, selectedBrands, selectedConditions, selectedPrice, showOnSale, sortBy]);

  // ── Effect for initial load and filter changes ───────────────────────────────
  useEffect(() => {
    if (!categoryId) return;
    
    // Debounce the fetch to prevent rapid successive calls
    const timeoutId = setTimeout(() => {
      fetchProducts(true);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [categoryId, selectedSub, selectedBrands, selectedConditions, selectedPrice, showOnSale, sortBy, fetchProducts]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const toggleBrand = (b: string) =>
    setSelectedBrands((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]);

  const toggleCondition = (c: string) =>
    setSelectedConditions((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const toggleWishlist = (id: string) =>
    setWishlistIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const clearAll = () => {
    setSelectedSub(null);
    setSelectedBrands([]);
    setSelectedConditions([]);
    setSelectedPrice(null);
    setShowOnSale(false);
  };

  const loadMore = () => {
    if (!isLoadingRef.current && products.length < total && !loading && !loadingMore) {
      fetchProducts(false);
    }
  };

  const activeFilterCount =
    selectedBrands.length +
    selectedConditions.length +
    (selectedPrice ? 1 : 0) +
    (showOnSale ? 1 : 0) +
    (selectedSub ? 1 : 0);

  const hasMore = products.length < total && !loading && !loadingMore;

  // ── Sidebar props ────────────────────────────────────────────────────────────
  const sidebarProps = {
    subcategories,
    selectedSub,
    setSelectedSub,
    brands: filtersMetadata.brands,
    selectedBrands,
    toggleBrand,
    conditions: filtersMetadata.conditions,
    selectedConditions,
    toggleCondition,
    priceRanges,
    selectedPrice,
    setSelectedPrice,
    showOnSale,
    setShowOnSale,
    brandSearch,
    setBrandSearch,
    onClearAll: clearAll,
    accentColor: theme.accentColor,
  };

  // If no categoryId, show error
  if (!categoryId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Invalid category</p>
          <Link href="/shop" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: theme.bgColor }}>

      {/* ── Enhanced Hero Section ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: theme.gradient, minHeight: "280px" }}
      >
        {/* Animated background patterns */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none animate-pulse"
          style={{
            backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div
          className="absolute -top-20 -left-10 w-96 h-96 rounded-full opacity-20 pointer-events-none animate-ping"
          style={{ background: `radial-gradient(circle,${theme.glowColor},transparent 70%)`, animationDuration: "3s" }}
        />
        <div
          className="absolute -bottom-32 -right-20 w-80 h-80 rounded-full opacity-10 pointer-events-none animate-pulse"
          style={{ background: `radial-gradient(circle,${theme.glowColor},transparent 70%)` }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-16">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors mb-6 group"
          >
            <FiArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Shop
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div
                className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-md transition-transform hover:scale-110 duration-300"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {/* Use theme icon instead of hardcoded FiGrid */}
                {theme.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-sm">
                    {total > 0 ? `${total.toLocaleString()} Products` : "Shop Now"}
                  </span>
                  {!loading && total > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-sm">
                      <FiTrendingUp className="inline mr-1" size={10} />
                      Top Rated
                    </span>
                  )}
                </div>
                <h1
                  className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight"
                  style={{ fontFamily: "'Georgia',serif" }}
                >
                  {loading ? "Loading..." : (categoryName || "Products")}
                </h1>
                <p className="mt-2 text-white/70 text-sm md:text-base max-w-lg">
                  Discover amazing {categoryName?.toLowerCase() || "products"} at unbeatable prices. 
                  Shop with confidence and get the best deals today!
                </p>
              </div>
            </div>

            {/* Quick stats */}
            {!loading && total > 0 && (
              <div className="flex gap-6 bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20">
                <div className="text-center">
                  <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">Products</p>
                  <p className="text-white text-xl font-black">{total.toLocaleString()}+</p>
                </div>
                <div className="w-px bg-white/20 self-stretch" />
                <div className="text-center">
                  <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">Sellers</p>
                  <p className="text-white text-xl font-black">100+</p>
                </div>
                <div className="w-px bg-white/20 self-stretch" />
                <div className="text-center">
                  <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">Happy Customers</p>
                  <p className="text-white text-xl font-black">10k+</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path d="M0,40 L0,20 Q360,0 720,20 Q1080,40 1440,20 L1440,40 Z" fill={theme.bgColor} />
        </svg>
      </div>

      {/* ── Main Layout ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-6">

        {/* Trust Badges */}
        <div className="hidden lg:grid grid-cols-3 gap-4 mb-8">
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
            <FiTruck className="text-gray-400" size={20} />
            <div>
              <p className="text-xs font-black text-gray-700">Free Shipping</p>
              <p className="text-[10px] text-gray-400">On orders over ₦50,000</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
            <FiShield className="text-gray-400" size={20} />
            <div>
              <p className="text-xs font-black text-gray-700">Secure Payment</p>
              <p className="text-[10px] text-gray-400">100% secure transactions</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
            <FiAward className="text-gray-400" size={20} />
            <div>
              <p className="text-xs font-black text-gray-700">Best Prices</p>
              <p className="text-[10px] text-gray-400">Price match guarantee</p>
            </div>
          </div>
        </div>

        {/* Mobile controls */}
        <div className="lg:hidden flex items-center gap-3 mb-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 shadow-sm"
          >
            <FiSliders size={15} /> Filters
            {activeFilterCount > 0 && (
              <span
                className="w-5 h-5 rounded-full text-white text-[10px] font-black flex items-center justify-center"
                style={{ background: theme.accentColor }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="ml-auto text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Mobile Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative z-10 w-80 max-w-[85vw] bg-white h-full overflow-y-auto p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="font-black text-gray-900">Filters</span>
                <button onClick={() => setMobileSidebarOpen(false)}>
                  <FiX size={20} className="text-gray-500" />
                </button>
              </div>
              <Sidebar {...sidebarProps} />
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="w-full mt-4 py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: theme.gradient }}
              >
                Show {total.toLocaleString()} Results
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-6">

          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-60 xl:w-64 shrink-0">
            <div
              className="bg-white rounded-2xl p-5 sticky top-4"
              style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
            >
              <Sidebar {...sidebarProps} />
            </div>
          </div>

          {/* Products Area */}
          <div className="flex-1 min-w-0">

            {/* Top bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 rounded-full" style={{ background: theme.gradient }} />
                <h2 className="text-base md:text-lg font-black text-gray-900">
                  {categoryName || "Products"}
                </h2>
                <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                  ({total.toLocaleString()} items)
                </span>
              </div>
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-xs text-gray-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none font-semibold"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedSub && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border"
                    style={{ background: `${theme.accentColor}15`, color: theme.accentColor, borderColor: `${theme.accentColor}40` }}
                  >
                    {subcategories.find((s) => s.id === selectedSub)?.name ?? "Subcategory"}
                    <button onClick={() => setSelectedSub(null)}><FiX size={11} /></button>
                  </span>
                )}
                {selectedBrands.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border"
                    style={{ background: `${theme.accentColor}15`, color: theme.accentColor, borderColor: `${theme.accentColor}40` }}
                  >
                    {b}<button onClick={() => toggleBrand(b)}><FiX size={11} /></button>
                  </span>
                ))}
                {selectedConditions.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border"
                    style={{ background: `${theme.accentColor}15`, color: theme.accentColor, borderColor: `${theme.accentColor}40` }}
                  >
                    {c}<button onClick={() => toggleCondition(c)}><FiX size={11} /></button>
                  </span>
                ))}
                {selectedPrice && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border"
                    style={{ background: `${theme.accentColor}15`, color: theme.accentColor, borderColor: `${theme.accentColor}40` }}
                  >
                    {selectedPrice.label}
                    <button onClick={() => setSelectedPrice(null)}><FiX size={11} /></button>
                  </span>
                )}
                {showOnSale && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border"
                    style={{ background: `${theme.accentColor}15`, color: theme.accentColor, borderColor: `${theme.accentColor}40` }}
                  >
                    On Sale<button onClick={() => setShowOnSale(false)}><FiX size={11} /></button>
                  </span>
                )}
              </div>
            )}

            {/* ── Content states ── */}
            {loading ? (
              <SkeletonGrid />
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                  <FiAlertCircle size={22} className="text-red-400" />
                </div>
                <div>
                  <p className="text-gray-700 font-semibold text-sm">Failed to load products</p>
                  <p className="text-gray-400 text-xs mt-1 max-w-xs">
                    {error.includes("avg(reviewrating)") 
                      ? "Database error: Please contact support. The product listing is temporarily unavailable."
                      : error}
                  </p>
                </div>
                <button
                  onClick={() => fetchProducts(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold transition-all active:scale-95"
                >
                  <FiRefreshCw size={13} /> Try again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 text-gray-400">
                <FiGrid size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-semibold">No products match your filters.</p>
                <button
                  onClick={clearAll}
                  className="mt-3 text-sm font-semibold hover:underline"
                  style={{ color: theme.accentColor }}
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      theme={theme}
                      wishlisted={wishlistIds.has(product.id)}
                      onWishlist={toggleWishlist}
                    />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-8 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-60 transition-all hover:scale-105"
                      style={{ background: theme.gradient }}
                    >
                      {loadingMore
                        ? "Loading..."
                        : `Load More (${(total - products.length).toLocaleString()} remaining)`}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Enhanced CTA Banner */}
            {!loading && !error && products.length > 0 && (
              <div className="mt-12">
                <div
                  className="relative overflow-hidden rounded-2xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6"
                  style={{ background: theme.gradient }}
                >
                  <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 30% 50%,rgba(255,255,255,0.8) 1px,transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                  <div className="relative z-10 text-center sm:text-left">
                    <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-2 flex items-center justify-center sm:justify-start gap-2">
                      <FiTrendingUp size={12} /> Grow your business
                    </p>
                    <h3 className="text-white text-xl md:text-2xl font-black mb-2">
                      Sell {categoryName} on Jovo
                    </h3>
                    <p className="text-white/70 text-sm max-w-md">
                      Join thousands of successful sellers. List your products for free and reach millions of customers.
                    </p>
                    <div className="flex gap-3 mt-4 justify-center sm:justify-start">
                      <div className="flex items-center gap-1 text-white/60 text-[10px]">
                        <FiTruck size={10} /> Free Listing
                      </div>
                      <div className="flex items-center gap-1 text-white/60 text-[10px]">
                        <FiShield size={10} /> Secure Payments
                      </div>
                      <div className="flex items-center gap-1 text-white/60 text-[10px]">
                        <FiAward size={10} /> 24/7 Support
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/become-seller"
                    className="relative z-10 shrink-0 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg hover:scale-105 transition-all duration-200 whitespace-nowrap group"
                    style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
                  >
                    Start Selling Now →
                    <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}