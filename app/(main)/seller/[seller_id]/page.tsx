// app/(main)/seller/[seller_id]/page.tsx
"use client";

/**
 * SellerProfilePage — Public-facing seller profile page
 * Route: /seller/[seller_id]
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import {
  FiPackage,
  FiShoppingBag,
  FiShare2,
  FiChevronRight,
  FiSearch,
  FiGrid,
  FiList,
  FiCheck,
  FiClock,
  FiChevronLeft,
  FiLoader,
  FiAlertCircle,
  FiGlobe,
  FiMail,
  FiPhone,
  FiMapPin,
  FiUsers,
  FiHeart,
  FiX,
  FiEye,
} from "react-icons/fi";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaCopy,
  FaInstagram,
  FaLinkedin,
  FaCheckCircle,
} from "react-icons/fa";
import { MdVerified, MdOutlineLocalShipping } from "react-icons/md";
import { HiOutlineShieldCheck } from "react-icons/hi";
import Footer from "@/components/layout/Footer";
import { showToast } from "@/components/ui/toast";
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
  cover_image: string | null;
  created_at: string;
  average_rating: number;
  review_count: number;
  total_listings: number;
  items_sold: number;
  response_time: string;
  response_rate: string;
  badges: string[];
  member_since: string;
  follower_count: number;
  is_following: boolean;
  is_own_store?: boolean;
  business_description?: string;
  approval_status?: string;
  profile_views?: number; // Profile views from seller profile API
  view_count?: number; // Alternative field name some APIs might use
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
  product_condition?: string;
  brand?: string;
}

interface SellerReview {
  id: string;
  reviewer_name: string;
  reviewer_avatar?: string;
  rating: number;
  comment: string;
  product_name?: string;
  is_verified: boolean;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Stars = ({ rating, size = 12 }: { rating: number; size?: number }) => {
  const r = typeof rating === "number" ? rating : 0;
  return (
    <span className="inline-flex items-center gap-0.5" suppressHydrationWarning>
      {[1, 2, 3, 4, 5].map((s) =>
        r >= s ? (
          <FaStar
            key={s}
            size={size}
            className="text-orange-400"
            suppressHydrationWarning
          />
        ) : r >= s - 0.5 ? (
          <FaStarHalfAlt
            key={s}
            size={size}
            className="text-orange-400"
            suppressHydrationWarning
          />
        ) : (
          <FaRegStar
            key={s}
            size={size}
            className="text-slate-200"
            suppressHydrationWarning
          />
        ),
      )}
    </span>
  );
};

const fmtPrice = (n: number) =>
  typeof n !== "number"
    ? "₦0"
    : n >= 1_000_000
      ? `₦${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
        ? `₦${(n / 1_000).toFixed(0)}K`
        : `₦${n}`;

const validUrl = (u?: string | null) =>
  u && (u.startsWith("http") || u.startsWith("/")) ? u : null;

const timeAgo = (d: string) => {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

// ─── Product Card ─────────────────────────────────────────────────────────────

const ProductCard = ({
  product,
  view,
}: {
  product: SellerProduct;
  view: "grid" | "list";
}) => {
  const disc = product.discount_percentage
    ? Math.round(product.discount_percentage)
    : product.product_original_price > product.current_price
      ? Math.round(
          ((product.product_original_price - product.current_price) /
            product.product_original_price) *
            100,
        )
      : 0;
  const img = validUrl(product.product_images?.[0]);

  if (view === "list") {
    return (
      <Link
        href={`/product/${product.id}`}
        className="group flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border border-slate-100 hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-200"
      >
        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-50">
          {img ? (
            <Image
              src={img}
              alt={product.product_name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="64px"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiPackage size={22} className="text-slate-300" />
            </div>
          )}
          {!product.is_in_stock && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <span className="text-[8px] font-black text-orange-600 uppercase tracking-widest">
                Sold out
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 group-hover:text-orange-500 transition-colors truncate leading-tight">
            {product.product_name}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {product.subcategory_name}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <Stars rating={product.average_rating} />
            <span className="text-[10px] text-slate-400">
              ({product.review_count}) · {product.sold_count} sold
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-black text-orange-500">
            {fmtPrice(product.current_price)}
          </p>
          {disc > 0 && (
            <div className="mt-0.5 space-y-0.5">
              <p className="text-[10px] text-slate-400 line-through">
                {fmtPrice(product.product_original_price)}
              </p>
              <span className="text-[9px] font-black text-white bg-orange-500 px-1.5 py-0.5 rounded-md">
                -{disc}%
              </span>
            </div>
          )}
        </div>
        <FiChevronRight
          size={14}
          className="text-slate-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-1"
        />
      </Link>
    );
  }

  return (
    <Link
      href={`/product/${product.id}`}
      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/8 transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        {img ? (
          <Image
            src={img}
            alt={product.product_name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width:640px) 50vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiPackage size={32} className="text-slate-200" />
          </div>
        )}
        {disc > 0 && (
          <span className="absolute top-2.5 left-2.5 z-10 text-[10px] font-black text-white bg-orange-500 px-2 py-0.5 rounded-full shadow-sm">
            -{disc}%
          </span>
        )}
        {!product.is_in_stock && (
          <div className="absolute inset-0 z-10 bg-white/80 flex items-center justify-center backdrop-blur-[1px]">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Sold Out
            </span>
          </div>
        )}
        {product.is_on_sale && product.is_in_stock && (
          <span className="absolute top-2.5 right-2.5 z-10 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
            Sale
          </span>
        )}
      </div>
      <div className="p-3.5">
        <p className="text-[13px] font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-orange-500 transition-colors mb-2 min-h-[36px]">
          {product.product_name}
        </p>
        <div className="flex items-center gap-1.5 mb-2.5">
          <Stars rating={product.average_rating} size={10} />
          <span className="text-[10px] text-slate-400">
            ({product.review_count})
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-black text-orange-500 leading-tight">
              {fmtPrice(product.current_price)}
            </p>
            {disc > 0 && (
              <p className="text-[10px] text-slate-400 line-through">
                {fmtPrice(product.product_original_price)}
              </p>
            )}
          </div>
          <span className="text-[10px] text-slate-400">
            {product.sold_count} sold
          </span>
        </div>
      </div>
    </Link>
  );
};

// ─── Review Card ──────────────────────────────────────────────────────────────

const ReviewCard = ({ review }: { review: SellerReview }) => {
  const avatar = validUrl(review.reviewer_avatar);
  const initials = (review.reviewer_name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center bg-slate-900 text-white text-xs font-black">
          {avatar ? (
            <Image
              src={avatar}
              alt={review.reviewer_name}
              fill
              className="object-cover"
              sizes="36px"
              unoptimized
            />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-slate-900">
                  {review.reviewer_name}
                </p>
                {review.is_verified && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
                    <FiCheck size={8} /> Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Stars rating={review.rating} size={10} />
                {review.product_name && (
                  <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    · {review.product_name}
                  </span>
                )}
              </div>
            </div>
            <span className="text-[10px] text-slate-400 shrink-0">
              {timeAgo(review.created_at)}
            </span>
          </div>
          {review.comment && (
            <p className="text-[13px] text-slate-500 mt-2.5 leading-relaxed">
              {review.comment}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SellerProfilePage() {
  const router = useRouter();
  const params = useParams();
  const sellerId = (params?.seller_id ?? params?.id ?? "") as string;

  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"products" | "reviews" | "about">("products");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [shareOpen, setShareOpen] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsFetched, setReviewsFetched] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchedRef = useRef(false);

  const fetchSeller = useCallback(async () => {
    if (!sellerId) return;
    setLoading(true);
    try {
      const res = await apiService.getPublicSellerProfile(sellerId);
      const data: SellerProfile = res?.data ?? res;
      setSeller(data);
      setFollowing(data.is_following ?? false);
      setFollowerCount(data.follower_count ?? 0);

      try {
        const pRes = await apiService.getPublicSellerProducts(sellerId, {
          limit: 50,
        });
        const raw = pRes?.data?.products ?? pRes?.data ?? pRes ?? [];
        setProducts(Array.isArray(raw) ? raw : []);
      } catch {
        setProducts([]);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load seller.");
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  const fetchReviews = useCallback(async () => {
    if (!sellerId) return;
    setReviewsLoading(true);
    try {
      const res = await apiService.getPublicSellerReviews(sellerId, {
        per_page: 20,
      });
      const raw = res?.data?.reviews ?? res?.data ?? res ?? [];
      setReviews(Array.isArray(raw) ? raw : []);
    } catch {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
      setReviewsFetched(true);
    }
  }, [sellerId]);

  useEffect(() => {
    if (!fetchedRef.current && sellerId) {
      fetchedRef.current = true;
      queueMicrotask(() => {
        fetchSeller();
      });
    }
  }, [sellerId, fetchSeller]);

  useEffect(() => {
    if (tab === "reviews" && !reviewsFetched && !reviewsLoading) {
      queueMicrotask(() => {
        fetchReviews();
      });
    }
  }, [tab, reviewsFetched, reviewsLoading, fetchReviews]);

  const handleFollow = async () => {
    if (followLoading) return;
    if (seller?.is_own_store) {
      showToast("You cannot follow your own store.", "info");
      return;
    }

    setFollowLoading(true);

    const wasFollowing = following;
    setFollowing(!wasFollowing);
    setFollowerCount((c) => (wasFollowing ? Math.max(0, c - 1) : c + 1));
    setSeller((prev) =>
      prev ? { ...prev, is_following: !wasFollowing } : prev,
    );

    try {
      if (wasFollowing) {
        await apiService.unfollowSeller(sellerId);
      } else {
        await apiService.followSeller(sellerId);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to update follow status. Please try again.";
      const isOwnStore = /own store|follow your own/i.test(message);
      showToast(
        isOwnStore ? "You cannot follow your own store." : message,
        isOwnStore ? "info" : "error",
      );
      setFollowing(wasFollowing);
      setFollowerCount((c) => (wasFollowing ? c + 1 : Math.max(0, c - 1)));
      setSeller((prev) =>
        prev ? { ...prev, is_following: wasFollowing } : prev,
      );
    } finally {
      setFollowLoading(false);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.subcategory_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || "").toLowerCase().includes(search.toLowerCase()),
  );
  const sorted = [...filtered].sort((a, b) =>
    sort === "price_asc"
      ? a.current_price - b.current_price
      : sort === "price_desc"
        ? b.current_price - a.current_price
        : sort === "rating"
          ? b.average_rating - a.average_rating
          : sort === "popular"
            ? b.sold_count - a.sold_count
            : 0,
  );

  const initials =
    seller?.business_name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "S";
  const avgRating = seller
    ? Math.round((seller.average_rating || 0) * 10) / 10
    : 0;
  const logoUrl = validUrl(seller?.business_image);
  const coverUrl = validUrl(seller?.cover_image);
  const businessDescription = (
    seller?.seller_bio ||
    seller?.business_description ||
    seller?.short_business_description ||
    ""
  ).trim();
  // Use the same pattern as seller own profile page - check both view_count and profile_views
  const viewCount = seller?.view_count ?? seller?.profile_views ?? 0;
  const approvalStatus = seller?.approval_status;

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
            <div className="absolute inset-0 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-slate-400 font-medium">Loading store…</p>
        </div>
      </div>
    );

  if (error || !seller)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-slate-50 px-4">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
          <FiAlertCircle size={26} className="text-slate-400" />
        </div>
        <div className="text-center">
          <p className="font-black text-slate-900 text-lg">Store not found</p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            {error || "This seller's store could not be found."}
          </p>
        </div>
        <Link
          href="/shop"
          className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-orange-500 transition-colors"
        >
          Back to Shop
        </Link>
      </div>
    );

  return (
    <>
      <div className="min-h-screen bg-slate-50 pb-16">
        {/* ── HERO ── */}
        <div className="relative">
          {/* Cover */}
          <div
            className="relative h-48 sm:h-64 md:h-72 w-full overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg,#0F172A 0%,#1E293B 50%,#0F172A 100%)",
            }}
          >
            {coverUrl && (
              <Image
                src={coverUrl}
                alt="Store cover"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            )}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20" />
            <div
              className="absolute -left-16 -top-16 w-64 h-64 rounded-full opacity-30 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle,#F97316 0%,transparent 70%)",
              }}
            />
            <div
              className="absolute right-0 bottom-0 w-56 h-56 rounded-full opacity-20 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle,#6366F1 0%,transparent 70%)",
              }}
            />

            {/* Top nav row */}
            <div className="absolute top-0 inset-x-0 px-4 sm:px-6 pt-4 sm:pt-5 flex items-center justify-between z-20">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/30 backdrop-blur-md text-white text-xs font-bold hover:bg-black/45 transition-colors"
              >
                <FiChevronLeft size={14} /> Back
              </button>

              <div className="relative">
                <button
                  onClick={() => setShareOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/30 backdrop-blur-md text-white text-xs font-bold hover:bg-black/45 transition-colors"
                >
                  <FiShare2 size={12} /> Share
                </button>
                {shareOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShareOpen(false)}
                    />
                    <div className="absolute top-10 right-0 z-50 w-44 bg-white rounded-2xl border border-slate-100 shadow-xl p-2 overflow-hidden">
                      <p className="px-3 pt-1 pb-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Share via
                      </p>
                      {[
                        {
                          icon: (
                            <FaWhatsapp className="text-green-500" size={14} />
                          ),
                          label: "WhatsApp",
                          fn: () =>
                            window.open(
                              `https://wa.me/?text=${encodeURIComponent(window.location.href)}`,
                            ),
                        },
                        {
                          icon: (
                            <FaFacebook className="text-blue-600" size={14} />
                          ),
                          label: "Facebook",
                          fn: () =>
                            window.open(
                              `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                            ),
                        },
                        {
                          icon: (
                            <FaTwitter className="text-sky-500" size={14} />
                          ),
                          label: "Twitter",
                          fn: () =>
                            window.open(
                              `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`,
                            ),
                        },
                        {
                          icon: copied ? (
                            <FiCheck className="text-emerald-500" size={14} />
                          ) : (
                            <FaCopy className="text-slate-400" size={14} />
                          ),
                          label: copied ? "Copied!" : "Copy link",
                          fn: () => {
                            navigator.clipboard.writeText(window.location.href);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          },
                        },
                      ].map(({ icon, label, fn }) => (
                        <button
                          key={label}
                          onClick={() => {
                            fn();
                            if (label !== "Copy link" && label !== "Copied!")
                              setShareOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors text-left"
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

          {/* Identity card */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="relative -mt-16 sm:-mt-20 bg-white border border-slate-200 shadow-2xl shadow-slate-900/5 rounded-3xl p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-6">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-[3px] sm:border-4 border-slate-50 bg-slate-900 shadow-lg overflow-hidden flex items-center justify-center relative">
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt={seller.business_name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-2xl font-black text-white tracking-tight">
                        {initials}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center shadow-md">
                    <MdVerified size={16} className="text-orange-500" />
                  </div>
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0 pb-1 sm:pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {seller.business_name}
                    </h1>
                    {(approvalStatus === "approved" || !approvalStatus) && (
                      <MdVerified
                        className="text-orange-500 shrink-0"
                        size={20}
                        title="Verified seller"
                      />
                    )}
                  </div>
                  {businessDescription && (
                    <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl leading-relaxed">
                      {businessDescription}
                    </p>
                  )}
                  <div className="flex items-center gap-2.5 mt-2.5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Stars rating={seller.average_rating} size={11} />
                      <span className="text-xs font-bold text-slate-900">
                        {avgRating}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({seller.review_count || 0})
                      </span>
                    </div>
                    <span className="text-slate-200 text-xs">·</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <FiUsers size={11} /> {followerCount.toLocaleString()}{" "}
                      followers
                    </span>
                    <span className="text-slate-200 text-xs">·</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <FiEye size={11} /> {viewCount.toLocaleString()} views
                    </span>
                    {seller.business_location && (
                      <>
                        <span className="text-slate-200 text-xs hidden sm:inline">
                          ·
                        </span>
                        <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500">
                          <FiMapPin size={11} /> {seller.business_location}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex items-center gap-2 sm:pb-3 shrink-0">
                  {seller.business_phone_number && (
                    <a
                      href={`https://wa.me/${seller.business_phone_number.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-white bg-green-500 hover:bg-green-600 transition-colors"
                    >
                      <FaWhatsapp size={14} /> Chat
                    </a>
                  )}
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`flex w-full sm:w-auto items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 ${
                      following
                        ? "bg-slate-50 border border-slate-200 text-slate-900 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                        : "bg-slate-900 text-white hover:bg-orange-500"
                    }`}
                  >
                    {followLoading ? (
                      <FiLoader size={12} className="animate-spin" />
                    ) : following ? (
                      <FiCheck size={12} />
                    ) : (
                      <FiHeart size={12} />
                    )}
                    {following ? "Following" : "Follow"}
                  </button>
                </div>
              </div>

              {/* Approval banner — only if explicitly non-approved */}
              {approvalStatus && approvalStatus !== "approved" && (
                <div
                  className={`mt-5 rounded-2xl border px-4 py-3 flex items-start sm:items-center gap-3 ${
                    approvalStatus === "rejected"
                      ? "bg-red-50 border-red-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <FiAlertCircle
                    className={`shrink-0 mt-0.5 sm:mt-0 ${approvalStatus === "rejected" ? "text-red-500" : "text-amber-500"}`}
                    size={18}
                  />
                  <p
                    className={`text-sm font-medium ${approvalStatus === "rejected" ? "text-red-700" : "text-amber-800"}`}
                  >
                    {approvalStatus === "pending"
                      ? "This store is awaiting approval."
                      : approvalStatus === "rejected"
                        ? "This store's application was not approved."
                        : `Status: ${approvalStatus}`}
                  </p>
                </div>
              )}

              {/* Stat strip */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  {
                    icon: <FiShoppingBag size={16} />,
                    label: "Listings",
                    value: String(seller.total_listings || 0),
                    color: "#F97316",
                    bg: "#FFF7ED",
                  },
                  {
                    icon: <FiPackage size={16} />,
                    label: "Items sold",
                    value: (seller.items_sold || 0).toLocaleString(),
                    color: "#6366F1",
                    bg: "#EEF2FF",
                  },
                  {
                    icon: <FaStar size={13} />,
                    label: "Rating",
                    value: String(avgRating),
                    color: "#F59E0B",
                    bg: "#FFFBEB",
                  },
                  {
                    icon: <FiUsers size={16} />,
                    label: "Response",
                    value: seller.response_time || "—",
                    color: "#10B981",
                    bg: "#F0FDF4",
                  },
                  {
                    icon: <MdOutlineLocalShipping size={16} />,
                    label: "Rate",
                    value: seller.response_rate || "—",
                    color: "#0EA5E9",
                    bg: "#F0F9FF",
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-100 px-4 py-3.5"
                    style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
                  >
                    <div
                      className="flex items-center gap-2 mb-1.5"
                      style={{ color: stat.color }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: stat.bg }}
                      >
                        {stat.icon}
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
                        {stat.label}
                      </span>
                    </div>
                    <p className="text-base sm:text-lg font-black text-slate-900 leading-none truncate">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Badges row */}
              {(seller.badges?.length > 0 || seller.member_since) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {seller.badges?.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600"
                    >
                      <FaCheckCircle size={11} className="text-emerald-500" />{" "}
                      {badge}
                    </span>
                  ))}
                  {seller.member_since && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 px-3 py-1.5 rounded-full bg-white border border-slate-200">
                      <FiClock size={9} />
                      Member since{" "}
                      {
                        // member_since may be "May 2026" or an ISO date
                        typeof seller.member_since === "string" &&
                        seller.member_since.includes(" ")
                          ? seller.member_since
                          : new Date(seller.member_since).toLocaleDateString(
                              "en-NG",
                              { month: "long", year: "numeric" },
                            )
                      }
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── TABS + CONTENT ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-16">
          <div className="flex items-center gap-1 mb-7 overflow-x-auto no-scrollbar border-b border-slate-200">
            {(
              [
                {
                  key: "products",
                  label: "Products",
                  count: seller.total_listings || products.length,
                },
                {
                  key: "reviews",
                  label: "Reviews",
                  count: seller.review_count || 0,
                },
                { key: "about", label: "About", count: null },
              ] as const
            ).map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`shrink-0 flex items-center gap-2 px-4 sm:px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                  tab === key
                    ? "border-orange-500 text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                {label}
                {count !== null && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                      tab === key
                        ? "bg-orange-50 text-orange-600"
                        : "bg-slate-50 text-slate-400"
                    }`}
                  >
                    {count.toLocaleString()}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Products ── */}
          {tab === "products" && (
            <div>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <FiSearch
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 transition-colors"
                    placeholder="Search products…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      <FiX size={13} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-600 outline-none cursor-pointer font-medium"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price ↑</option>
                    <option value="price_desc">Price ↓</option>
                    <option value="rating">Top rated</option>
                    <option value="popular">Best selling</option>
                  </select>
                  <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-0.5">
                    {(
                      [
                        ["grid", FiGrid],
                        ["list", FiList],
                      ] as const
                    ).map(([v, Icon]) => (
                      <button
                        key={v}
                        onClick={() => setView(v as any)}
                        className={`p-2 rounded-lg transition-colors ${view === v ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-900"}`}
                      >
                        <Icon size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {search && (
                <p className="text-xs text-slate-400 mb-4 font-medium">
                  {sorted.length} result{sorted.length !== 1 ? "s" : ""} for{" "}
                  <span className="text-slate-900 font-bold">
                    &quot;{search}&quot;
                  </span>
                </p>
              )}

              {sorted.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4">
                    <FiPackage size={24} className="text-slate-300" />
                  </div>
                  <p className="font-black text-slate-900">No products found</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {search
                      ? "Try a different search"
                      : "This seller has no listed products yet."}
                  </p>
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="mt-3 text-sm text-orange-500 font-bold hover:underline"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : view === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {sorted.map((p) => (
                    <ProductCard key={p.id} product={p} view="grid" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {sorted.map((p) => (
                    <ProductCard key={p.id} product={p} view="list" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Reviews ── */}
          {tab === "reviews" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
                  <div className="text-center shrink-0">
                    <p className="text-5xl font-black text-slate-900 tabular-nums">
                      {avgRating}
                    </p>
                    <div className="flex justify-center mt-2">
                      <Stars rating={seller.average_rating} size={16} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 font-medium">
                      {(seller.review_count || 0).toLocaleString()} reviews
                    </p>
                  </div>
                  <div className="flex-1 w-full space-y-1.5">
                    {[5, 4, 3, 2, 1].map((s) => {
                      const ct = reviews.filter(
                        (r) => Math.round(r.rating) === s,
                      ).length;
                      const pct =
                        reviews.length > 0
                          ? Math.round((ct / reviews.length) * 100)
                          : s === 5
                            ? 65
                            : s === 4
                              ? 22
                              : s === 3
                                ? 8
                                : s === 2
                                  ? 3
                                  : 2;
                      return (
                        <div key={s} className="flex items-center gap-2.5">
                          <span className="text-[11px] font-bold text-slate-400 w-3 text-right tabular-nums">
                            {s}
                          </span>
                          <FaStar
                            size={9}
                            className="text-orange-400 shrink-0"
                          />
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-400 rounded-full transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 w-7 text-right tabular-nums">
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {reviewsLoading ? (
                <div className="py-12 text-center">
                  <FiLoader
                    size={22}
                    className="animate-spin text-orange-500 mx-auto mb-3"
                  />
                  <p className="text-sm text-slate-400">Loading reviews…</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-14 text-center bg-white rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                    <FaStar size={18} className="text-slate-200" />
                  </div>
                  <p className="font-bold text-slate-400 text-sm">
                    No reviews yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <ReviewCard key={r.id} review={r} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── About ── */}
          {tab === "about" && (
            <div className="max-w-2xl space-y-4">
              {/* Bio */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">
                  About the store
                </p>
                <p className="text-[13px] text-slate-500 leading-relaxed whitespace-pre-wrap">
                  {seller.seller_bio ||
                    seller.short_business_description ||
                    "No description provided."}
                </p>
              </div>

              {/* Store details */}
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="px-5 sm:px-6 pt-5 pb-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">
                    Store details
                  </p>
                  <div className="divide-y divide-slate-100">
                    {[
                      {
                        label: "Member since",
                        value: seller.member_since
                          ? typeof seller.member_since === "string" &&
                            seller.member_since.includes(" ")
                            ? seller.member_since
                            : new Date(seller.member_since).toLocaleDateString(
                                "en-NG",
                                { month: "long", year: "numeric" },
                              )
                          : null,
                      },
                      {
                        label: "Location",
                        value:
                          seller.business_location ||
                          seller.business_address ||
                          null,
                      },
                      {
                        label: "Listings",
                        value: seller.total_listings
                          ? `${seller.total_listings} products`
                          : null,
                      },
                      {
                        label: "Total sales",
                        value: seller.items_sold
                          ? `${seller.items_sold.toLocaleString()} orders`
                          : null,
                      },
                      {
                        label: "Followers",
                        value: followerCount
                          ? followerCount.toLocaleString()
                          : null,
                      },
                      {
                        label: "Profile views",
                        value: viewCount ? viewCount.toLocaleString() : null,
                      },
                      {
                        label: "Response rate",
                        value: seller.response_rate || null,
                      },
                      {
                        label: "Response time",
                        value: seller.response_time || null,
                      },
                    ]
                      .filter((r) => r.value)
                      .map(({ label, value }) => (
                        <div
                          key={label}
                          className="flex items-center justify-between py-3"
                        >
                          <span className="text-[13px] text-slate-400">
                            {label}
                          </span>
                          <span className="text-[13px] font-bold text-slate-900">
                            {value}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Contact */}
              {(seller.business_email ||
                seller.business_phone_number ||
                seller.business_website) && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">
                    Contact
                  </p>
                  <div className="space-y-3">
                    {seller.business_email && (
                      <a
                        href={`mailto:${seller.business_email}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                          <FiMail size={13} className="text-slate-400" />
                        </div>
                        <span className="text-[13px] text-orange-500 group-hover:underline">
                          {seller.business_email}
                        </span>
                      </a>
                    )}
                    {seller.business_phone_number && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                          <FiPhone size={13} className="text-slate-400" />
                        </div>
                        <span className="text-[13px] text-slate-600">
                          {seller.business_phone_number}
                        </span>
                      </div>
                    )}
                    {seller.business_website && (
                      <a
                        href={seller.business_website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                          <FiGlobe size={13} className="text-slate-400" />
                        </div>
                        <span className="text-[13px] text-orange-500 group-hover:underline truncate">
                          {seller.business_website}
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Socials */}
              {(seller.business_facebook ||
                seller.business_twitter ||
                seller.business_instagram ||
                seller.business_linkedin) && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">
                    Social
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      {
                        url: seller.business_facebook,
                        icon: <FaFacebook size={13} />,
                        label: "Facebook",
                        cls: "text-blue-600  bg-blue-50  border-blue-100",
                      },
                      {
                        url: seller.business_twitter,
                        icon: <FaTwitter size={13} />,
                        label: "Twitter",
                        cls: "text-sky-600   bg-sky-50   border-sky-100",
                      },
                      {
                        url: seller.business_instagram,
                        icon: <FaInstagram size={13} />,
                        label: "Instagram",
                        cls: "text-pink-600  bg-pink-50  border-pink-100",
                      },
                      {
                        url: seller.business_linkedin,
                        icon: <FaLinkedin size={13} />,
                        label: "LinkedIn",
                        cls: "text-blue-700  bg-blue-50  border-blue-100",
                      },
                    ]
                      .filter((s) => s.url)
                      .map(({ url, icon, label, cls }) => (
                        <a
                          key={label}
                          href={url!}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition hover:opacity-80 ${cls}`}
                        >
                          {icon} {label}
                        </a>
                      ))}
                  </div>
                </div>
              )}

              {/* Trust */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">
                  Trust &amp; safety
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      icon: (
                        <HiOutlineShieldCheck
                          size={16}
                          className="text-emerald-500"
                        />
                      ),
                      bg: "bg-emerald-50",
                      title: "Identity verified",
                      sub: "ID confirmed",
                    },
                    {
                      icon: (
                        <MdVerified size={16} className="text-orange-500" />
                      ),
                      bg: "bg-orange-50",
                      title: "Jovo certified",
                      sub: "Quality standards met",
                    },
                    {
                      icon: <FaStar size={14} className="text-orange-400" />,
                      bg: "bg-amber-50",
                      title: "Top seller",
                      sub: "Top 5% on platform",
                    },
                    {
                      icon: (
                        <MdOutlineLocalShipping
                          size={16}
                          className="text-blue-500"
                        />
                      ),
                      bg: "bg-blue-50",
                      title: "Fast shipper",
                      sub: "Ships within 24h",
                    },
                  ].map(({ icon, bg, title, sub }) => (
                    <div
                      key={title}
                      className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}
                      >
                        {icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {title}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {sub}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div
                className="rounded-2xl overflow-hidden relative p-6 sm:p-7"
                style={{
                  background: "linear-gradient(135deg,#0F172A 0%,#1E293B 100%)",
                }}
              >
                <div
                  className="absolute -right-8 -top-8 w-36 h-36 rounded-full opacity-20 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle,#F97316 0%,transparent 70%)",
                  }}
                />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-white font-black text-lg">
                      Ready to shop?
                    </p>
                    <p className="text-white/50 text-sm mt-0.5">
                      {seller.total_listings || 0} products from{" "}
                      {seller.business_name}
                    </p>
                  </div>
                  <button
                    onClick={() => setTab("products")}
                    className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white shrink-0 transition-colors"
                    style={{
                      background: "linear-gradient(135deg,#F97316,#EA580C)",
                    }}
                  >
                    <FiShoppingBag size={14} /> View products
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
}
