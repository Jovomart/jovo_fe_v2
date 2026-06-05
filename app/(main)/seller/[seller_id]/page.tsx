"use client";

/**
 * SellerProfilePage — Public-facing seller profile page
 * Route: /seller/[seller_id]  (e.g. /seller/abc123)
 *
 * Data source: GET /api/v1/seller/{seller_id}  (public, no auth required)
 * Products:    GET /api/v1/marketspace/category/{category_id} filtered by seller
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  FiStar,
  FiPackage,
  FiShoppingBag,
  FiShare2,
  FiChevronRight,
  FiSearch,
  FiGrid,
  FiList,
  FiCheck,
  FiThumbsUp,
  FiClock,
  FiAward,
  FiTrendingUp,
  FiChevronLeft,
  FiLoader,
  FiAlertCircle,
  FiGlobe,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaCopy,
  FaStore,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
import { MdVerified, MdOutlineLocalShipping } from "react-icons/md";
import { HiOutlineShieldCheck } from "react-icons/hi";
import Footer from "@/components/layout/Footer";
import apiService from "@/services/apiService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SellerProfile {
  id: string;
  business_name: string;
  short_business_description: string;
  seller_bio: string;
  business_address: string;
  business_phone_number: string;
  business_email: string;
  business_facebook: string;
  business_twitter: string;
  business_instagram: string;
  business_linkedin: string;
  business_website: string;
  business_location: string;
  business_image: string;
  cover_image: string;
  created_at: string;
  average_rating: number;
  review_count: number;
  total_listings: number;
  items_sold: number;
  response_time: string;
  response_rate: string;
  badges: string[];
  member_since: string;
}

interface SellerProduct {
  id: string;
  product_name: string;
  product_original_price: number;
  current_price: number;
  product_images: string[];
  is_on_sale: boolean;
  average_rating: number;
  review_count: number;
  sold_count: number;
  is_in_stock: boolean;
  subcategory_name: string;
  discount_percentage?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RenderStars = ({
  rating,
  size = 13,
}: {
  rating: number;
  size?: number;
}) => {
  const safeRating = typeof rating === "number" ? rating : 0;
  return (
    <div className="flex items-center gap-0.5" suppressHydrationWarning>
      {[1, 2, 3, 4, 5].map((s) => {
        if (safeRating >= s)
          return (
            <FaStar key={s} size={size} className="text-amber-400" suppressHydrationWarning />
          );
        if (safeRating >= s - 0.5)
          return (
            <FaStarHalfAlt key={s} size={size} className="text-amber-400" suppressHydrationWarning />
          );
        return (
          <FaRegStar key={s} size={size} className="text-gray-300" suppressHydrationWarning />
        );
      })}
    </div>
  );
};

const fmtPrice = (n: number) => {
  if (typeof n !== "number") return "₦0";
  return n >= 1_000_000
    ? `₦${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `₦${(n / 1_000).toFixed(0)}K`
      : `₦${n}`;
};

const getValidImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return url;
  return null;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ProductCard = ({
  product,
  view,
}: {
  product: SellerProduct;
  view: "grid" | "list";
}) => {
  const discount =
    product.discount_percentage
      ? Math.round(product.discount_percentage)
      : product.product_original_price > product.current_price
        ? Math.round(
            ((product.product_original_price - product.current_price) /
              product.product_original_price) *
              100,
          )
        : 0;

  const productLink = `/product/${product.id}`;
  const productImage = getValidImageUrl(product.product_images?.[0]);

  if (view === "list") {
    return (
      <Link
        href={productLink}
        className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all group"
      >
        <div className="w-20 h-20 rounded-xl bg-gray-50 overflow-hidden shrink-0 relative border border-gray-100">
          {productImage ? (
            <Image
              src={productImage}
              alt={product.product_name}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiPackage size={28} className="text-gray-300" />
            </div>
          )}
          {!product.is_in_stock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
              <span className="text-[9px] font-black text-red-500 uppercase">
                Sold out
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 group-hover:text-[#B42225] transition-colors truncate">
            {product.product_name}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {product.subcategory_name}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <RenderStars rating={product.average_rating} />
            <span className="text-[10px] text-gray-400">
              ({product.review_count})
            </span>
            <span className="text-[10px] text-gray-300">•</span>
            <span className="text-[10px] text-gray-400">
              {product.sold_count} sold
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-black text-[#B42225]">
            {fmtPrice(product.current_price)}
          </p>
          {discount > 0 && (
            <p className="text-[10px] text-gray-400 line-through">
              {fmtPrice(product.product_original_price)}
            </p>
          )}
          {discount > 0 && (
            <span className="text-[10px] font-bold text-white bg-[#B42225] px-1.5 py-0.5 rounded-md">
              -{discount}%
            </span>
          )}
        </div>
        <FiChevronRight
          size={15}
          className="text-gray-300 group-hover:text-[#B42225] transition-colors shrink-0"
        />
      </Link>
    );
  }

  return (
    <Link
      href={productLink}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {productImage ? (
          <Image
            src={productImage}
            alt={product.product_name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiPackage size={40} className="text-gray-300" />
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-2 left-2 text-[10px] font-black text-white bg-[#B42225] px-2 py-0.5 rounded-full z-10">
            -{discount}%
          </span>
        )}
        {!product.is_in_stock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <span className="text-xs font-black text-red-500 uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        )}
        {product.is_on_sale && product.is_in_stock && (
          <span className="absolute top-2 right-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full z-10">
            Sale
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-[#B42225] transition-colors mb-2">
          {product.product_name}
        </p>
        <div className="flex items-center gap-1 mb-2">
          <RenderStars rating={product.average_rating} size={11} />
          <span className="text-[10px] text-gray-400 ml-0.5">
            ({product.review_count})
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-black text-[#B42225]">
              {fmtPrice(product.current_price)}
            </p>
            {discount > 0 && (
              <p className="text-[10px] text-gray-400 line-through">
                {fmtPrice(product.product_original_price)}
              </p>
            )}
          </div>
          <span className="text-[10px] text-gray-400">
            {product.sold_count} sold
          </span>
        </div>
      </div>
    </Link>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SellerProfilePage = () => {
  const params = useParams();
  const sellerId = (params?.seller_id ?? params?.id ?? "") as string;

  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "about">("products");
  const [productView, setProductView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [shareOpen, setShareOpen] = useState(false);
  
  // Ref to track if data has been fetched
  const hasFetchedRef = useRef(false);

  // ── Fetch seller profile ──────────────────────────────────────────────────
  const fetchSellerData = useCallback(async () => {
    if (!sellerId) return;
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getPublicSellerProfile(sellerId);
      const sellerData: SellerProfile = response?.data ?? response;
      setSeller(sellerData);

      try {
        const productsRes = await apiService.makeRequest(
          `/seller/${encodeURIComponent(sellerId)}/products`,
          { method: "GET" },
        );
        const rawProducts = productsRes?.data?.products ?? productsRes?.data ?? productsRes ?? [];
        setProducts(Array.isArray(rawProducts) ? rawProducts : []);
      } catch {
        try {
          const homepageRes = await apiService.getShopHomepage(50, false);
          const categories = homepageRes?.data ?? homepageRes;
          const allProducts: SellerProduct[] = [];
          const categoryList = Array.isArray(categories)
            ? categories
            : categories?.categories ?? [];

          for (const cat of categoryList) {
            const catProducts: any[] = cat?.products ?? [];
            catProducts.forEach((p: any) => {
              if (p.seller_id === sellerId) allProducts.push(p);
            });
          }
          setProducts(allProducts);
        } catch {
          setProducts([]);
        }
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load seller profile.");
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  // Data fetching effect - using ref to prevent double-fetch in strict mode
  useEffect(() => {
    if (!hasFetchedRef.current && sellerId) {
      hasFetchedRef.current = true;
      fetchSellerData();
    }
  }, [sellerId, fetchSellerData]);

  // ── Derived values ────────────────────────────────────────────────────────
  const filteredProducts = products.filter(
    (p) =>
      p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      p.subcategory_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price_asc") return a.current_price - b.current_price;
    if (sortBy === "price_desc") return b.current_price - a.current_price;
    if (sortBy === "rating") return b.average_rating - a.average_rating;
    if (sortBy === "popular") return b.sold_count - a.sold_count;
    return 0;
  });

  const sellerInitials = seller?.business_name
    ? seller.business_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "JS";

  const avgRatingRounded = seller
    ? Math.round((seller.average_rating || 0) * 10) / 10
    : 0;

  const logoUrl = getValidImageUrl(seller?.business_image);
  const coverUrl = getValidImageUrl(seller?.cover_image);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiLoader
            size={36}
            className="animate-spin text-[#B42225] mx-auto mb-4"
          />
          <p className="text-gray-400 text-sm">Loading store…</p>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error || !seller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
          <FiAlertCircle size={28} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-700">Store not found</h2>
        <p className="text-gray-400 text-sm text-center max-w-xs">
          {error || "This seller's store could not be found."}
        </p>
        <Link
          href="/shop"
          className="px-6 py-2.5 bg-[#B42225] text-white rounded-xl text-sm font-semibold hover:bg-[#9e1e20] transition"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen" style={{ background: "#F7F8FC" }}>
        {/* ═══ HERO SECTION ════════════════════════════════════════════════ */}
        <div className="relative">
          {/* Cover image or gradient fallback */}
          <div
            className="w-full h-36 md:h-36 relative overflow-hidden"
            style={
              !coverUrl
                ? {
                    background:
                      "linear-gradient(135deg,#0F172A 0%,#1E293B 50%,#7F1D1D 100%)",
                  }
                : undefined
            }
          >
            {coverUrl && (
              <Image
                src={coverUrl}
                alt={`${seller.business_name} cover`}
                fill
                className="object-cover"
                priority
              />
            )}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle,#fff 1px,transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

            <Link
              href="/shop"
              className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-xs font-bold hover:bg-white/30 transition border border-white/20"
            >
              <FiChevronLeft size={14} /> Back
            </Link>

            {/* Share button */}
            <div className="absolute top-4 right-4 z-10">
              <div className="relative">
                <button
                  onClick={() => setShareOpen(!shareOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-xs font-bold hover:bg-white/30 transition border border-white/20"
                >
                  <FiShare2 size={13} /> Share Store
                </button>
                {shareOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShareOpen(false)}
                    />
                    <div className="absolute top-10 right-0 bg-white rounded-2xl border border-gray-100 p-3 flex flex-col gap-1 w-44 z-9999 shadow-xl">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-1 mb-1">
                        Share via
                      </p>
                      {[
                        {
                          icon: (
                            <FaWhatsapp className="text-green-500" size={15} />
                          ),
                          label: "WhatsApp",
                          action: () =>
                            window.open(
                              `https://wa.me/?text=${encodeURIComponent(window.location.href)}`,
                              "_blank",
                            ),
                        },
                        {
                          icon: (
                            <FaFacebook className="text-blue-600" size={15} />
                          ),
                          label: "Facebook",
                          action: () =>
                            window.open(
                              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                              "_blank",
                            ),
                        },
                        {
                          icon: (
                            <FaTwitter className="text-sky-500" size={15} />
                          ),
                          label: "Twitter",
                          action: () =>
                            window.open(
                              `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`,
                              "_blank",
                            ),
                        },
                        {
                          icon: (
                            <FaCopy className="text-gray-500" size={15} />
                          ),
                          label: "Copy Link",
                          action: () =>
                            navigator.clipboard.writeText(
                              window.location.href,
                            ),
                        },
                      ].map(({ icon, label, action }) => (
                        <button
                          key={label}
                          onClick={() => {
                            action();
                            setShareOpen(false);
                          }}
                          className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 text-xs text-gray-700 transition-colors font-medium"
                        >
                          {icon} {label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Avatar + name row */}
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <div className="relative -mt-10 flex flex-col sm:flex-row items-start sm:items-end gap-4 pb-4 z-20">
              {/* Logo / Avatar */}
              <div
                className="w-24 h-24 rounded-3xl border-4 border-white shadow-xl flex items-center justify-center text-white text-2xl font-black shrink-0 relative overflow-hidden"
                style={
                  !logoUrl
                    ? { background: "linear-gradient(135deg,#B42225,#FF4500)" }
                    : undefined
                }
              >
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={seller.business_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  sellerInitials
                )}
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                    {seller.business_name}
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#B42225]/10 text-[#B42225] border border-[#B42225]/20">
                    Verified Seller
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <div className="flex items-center gap-1">
                    <RenderStars rating={seller.average_rating || 0} size={13} />
                    <span className="text-sm font-bold text-gray-800 ml-1">
                      {avgRatingRounded}
                    </span>
                    <span className="text-sm text-gray-400">
                      ({seller.review_count || 0} reviews)
                    </span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <FiPackage size={12} /> {seller.total_listings || 0} listings
                  </span>
                  {seller.business_location && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <FiMapPin size={12} /> {seller.business_location}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex gap-2 shrink-0">
                {seller.business_phone_number && (
                  <a
                    href={`https://wa.me/${seller.business_phone_number.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-green-500 hover:bg-green-600 transition shadow-md"
                  >
                    <FaWhatsapp size={15} /> Chat
                  </a>
                )}
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 border-[#B42225] text-[#B42225] hover:bg-[#B42225] hover:text-white transition">
                  <FiAward size={15} /> Follow Store
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ STATS STRIP ══════════════════════════════════════════════════ */}
        <div className="border-y border-gray-200 bg-white">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8">
              {[
                {
                  icon: <FiShoppingBag size={16} className="text-[#B42225]" />,
                  value: (seller.items_sold || 0).toLocaleString(),
                  label: "Items Sold",
                },
                {
                  icon: <FiStar size={16} className="text-amber-400" />,
                  value: avgRatingRounded,
                  label: "Avg. Rating",
                },
                {
                  icon: <FiClock size={16} className="text-blue-500" />,
                  value: seller.response_time || "< 1h",
                  label: "Response Time",
                },
                {
                  icon: (
                    <FiTrendingUp size={16} className="text-emerald-500" />
                  ),
                  value: seller.response_rate || "—",
                  label: "Response Rate",
                },
              ].map(({ icon, value, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="text-base font-black text-gray-900">
                      {value}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ BADGES ═══════════════════════════════════════════════════════ */}
        {(seller.badges?.length > 0 || seller.member_since) && (
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-3">
            <div className="flex flex-wrap gap-2">
              {seller.badges?.map((badge) => (
                <span
                  key={badge}
                  className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 shadow-sm"
                >
                  <FiCheck size={11} className="text-emerald-500" /> {badge}
                </span>
              ))}
              {seller.member_since && (
                <span className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-400">
                  <FiClock size={11} /> Member since{" "}
                  {new Date(seller.member_since).toLocaleDateString("en-NG", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ═══ TABS + CONTENT ═══════════════════════════════════════════════ */}
        <div className="max-w-5xl mx-auto px-4 md:px-8 pb-12">
          {/* Tab bar */}
          <div className="flex items-center gap-1 border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
            {[
              {
                key: "products" as const,
                label: `Products (${seller.total_listings || products.length})`,
              },
              { key: "about" as const, label: "About Store" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`shrink-0 px-5 py-3.5 text-sm font-bold border-b-2 transition-all ${
                  activeTab === key
                    ? "border-[#B42225] text-[#B42225]"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Products Tab ── */}
          {activeTab === "products" && (
            <div>
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-gray-200 flex-1">
                  <FiSearch size={15} className="text-gray-400 shrink-0" />
                  <input
                    className="bg-transparent text-sm text-gray-700 outline-none flex-1 placeholder-gray-400"
                    placeholder="Search products in this store…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-700 outline-none cursor-pointer"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low → High</option>
                    <option value="price_desc">Price: High → Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="popular">Most Sold</option>
                  </select>

                  <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-xl">
                    <button
                      onClick={() => setProductView("grid")}
                      className={`p-2 rounded-lg transition ${
                        productView === "grid"
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <FiGrid size={15} />
                    </button>
                    <button
                      onClick={() => setProductView("list")}
                      className={`p-2 rounded-lg transition ${
                        productView === "list"
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <FiList size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {sortedProducts.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <FiPackage size={24} className="text-gray-300" />
                  </div>
                  <p className="font-bold text-gray-500">
                    No products found
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {search
                      ? "Try a different search term"
                      : "This seller has no products listed yet."}
                  </p>
                </div>
              ) : productView === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sortedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} view="grid" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} view="list" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── About Tab ── */}
          {activeTab === "about" && (
            <div className="max-w-2xl space-y-5">
              {/* Bio */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-black text-gray-900 mb-3 flex items-center gap-2">
                  <FaStore size={15} className="text-[#B42225]" />
                  About {seller.business_name}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {seller.seller_bio ||
                    seller.short_business_description ||
                    "No description provided."}
                </p>
              </div>

              {/* Store Details */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-black text-gray-900 mb-4">
                  Store Details
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      label: "Member Since",
                      value: seller.member_since
                        ? new Date(seller.member_since).toLocaleDateString(
                            "en-NG",
                            { month: "long", year: "numeric" },
                          )
                        : "—",
                    },
                    {
                      label: "Location",
                      value: seller.business_location || seller.business_address || "—",
                    },
                    {
                      label: "Total Products",
                      value: seller.total_listings
                        ? `${seller.total_listings} listings`
                        : "—",
                    },
                    {
                      label: "Total Sales",
                      value: seller.items_sold
                        ? `${seller.items_sold.toLocaleString()} orders`
                        : "—",
                    },
                    {
                      label: "Response Rate",
                      value: seller.response_rate || "—",
                    },
                    {
                      label: "Avg. Response Time",
                      value: seller.response_time || "—",
                    },
                  ]
                    .filter((row) => row.value !== "—")
                    .map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                      >
                        <span className="text-sm text-gray-400">{label}</span>
                        <span className="text-sm font-bold text-gray-800">
                          {value}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Contact info */}
              {(seller.business_email ||
                seller.business_phone_number ||
                seller.business_website) && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="text-base font-black text-gray-900 mb-4">
                    Contact Info
                  </h2>
                  <div className="space-y-3">
                    {seller.business_email && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                          <FiMail size={14} className="text-gray-400" />
                        </div>
                        <a
                          href={`mailto:${seller.business_email}`}
                          className="text-sm text-[#B42225] hover:underline"
                        >
                          {seller.business_email}
                        </a>
                      </div>
                    )}
                    {seller.business_phone_number && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                          <FiPhone size={14} className="text-gray-400" />
                        </div>
                        <a
                          href={`tel:${seller.business_phone_number}`}
                          className="text-sm text-gray-700"
                        >
                          {seller.business_phone_number}
                        </a>
                      </div>
                    )}
                    {seller.business_website && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                          <FiGlobe size={14} className="text-gray-400" />
                        </div>
                        <a
                          href={seller.business_website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-[#B42225] hover:underline"
                        >
                          {seller.business_website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Social links */}
              {(seller.business_facebook ||
                seller.business_twitter ||
                seller.business_instagram ||
                seller.business_linkedin) && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="text-base font-black text-gray-900 mb-4">
                    Social Media
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {seller.business_facebook && (
                      <a
                        href={seller.business_facebook}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-semibold border border-blue-100 hover:bg-blue-100 transition"
                      >
                        <FaFacebook size={14} /> Facebook
                      </a>
                    )}
                    {seller.business_twitter && (
                      <a
                        href={seller.business_twitter}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-50 text-sky-600 text-sm font-semibold border border-sky-100 hover:bg-sky-100 transition"
                      >
                        <FaTwitter size={14} /> Twitter
                      </a>
                    )}
                    {seller.business_instagram && (
                      <a
                        href={seller.business_instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-pink-50 text-pink-600 text-sm font-semibold border border-pink-100 hover:bg-pink-100 transition"
                      >
                        <FaInstagram size={14} /> Instagram
                      </a>
                    )}
                    {seller.business_linkedin && (
                      <a
                        href={seller.business_linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100 hover:bg-blue-100 transition"
                      >
                        <FaLinkedin size={14} /> LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Trust & Certifications */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-black text-gray-900 mb-4">
                  Trust & Certifications
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      icon: (
                        <HiOutlineShieldCheck
                          size={20}
                          className="text-emerald-500"
                        />
                      ),
                      title: "Identity Verified",
                      sub: "ID confirmed by Jovo",
                    },
                    {
                      icon: (
                        <MdVerified size={20} className="text-[#B42225]" />
                      ),
                      title: "Jovo Certified",
                      sub: "Meets quality standards",
                    },
                    {
                      icon: (
                        <FiAward size={20} className="text-amber-500" />
                      ),
                      title: "Top Seller",
                      sub: "Top 5% of sellers",
                    },
                    {
                      icon: (
                        <MdOutlineLocalShipping
                          size={20}
                          className="text-blue-500"
                        />
                      ),
                      title: "Fast Shipper",
                      sub: "Ships within 24h",
                    },
                  ].map(({ icon, title, sub }) => (
                    <div
                      key={title}
                      className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                        {icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">
                          {title}
                        </p>
                        <p className="text-[10px] text-gray-400">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div
                className="rounded-2xl overflow-hidden relative"
                style={{
                  background:
                    "linear-gradient(135deg,#0F172A 0%,#1C0A00 100%)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle,#fff 1px,transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5 p-7">
                  <div>
                    <p className="text-white font-black text-lg">
                      Ready to shop?
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      Browse all {seller.total_listings || 0} products from this
                      seller
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("products")}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90 shrink-0"
                    style={{
                      background: "linear-gradient(135deg,#B42225,#FF4500)",
                      boxShadow: "0 4px 20px rgba(180,34,37,0.4)",
                    }}
                  >
                    <FiShoppingBag size={15} /> View Products
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SellerProfilePage;