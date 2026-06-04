"use client";

/**
 * SellerProfilePage — Public-facing seller profile page
 * Route: /seller/[seller_id]  (e.g. /seller/abc123)
 */

import { useState, useEffect } from "react";
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
} from "react-icons/fa";
import { MdVerified, MdOutlineLocalShipping } from "react-icons/md";
import { HiOutlineShieldCheck } from "react-icons/hi";
import Footer from "@/components/layout/Footer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SellerProfile {
  id: string;
  business_name: string;
  business_bio: string;
  logo_url: string | null;
  seller_since: string;
  is_verified: boolean;
  rating: number;
  review_count: number;
  total_products: number;
  total_sales: number;
  response_rate: number;
  response_time_hours: number;
  location: string;
  badges: string[];
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
}

interface SellerReview {
  id: string;
  buyer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  helpful_count: number;
  product_name: string;
}

// ─── Product Images (Unsplash URLs) ──────────────────────────────────────────

const PRODUCT_IMAGES = [
  "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1605464315542-bda3e2f4e605?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1544244015-0df4b3ff0b6e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1606225457115-9b0de873c5db?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop",
];

// ─── Mock Data (replace with API calls) ──────────────────────────────────────

const MOCK_SELLER: SellerProfile = {
  id: "seller-001",
  business_name: "TechZone Nigeria",
  business_bio:
    "Your trusted source for premium electronics, gadgets, and accessories. We stock only genuine products with manufacturer warranty. Fast delivery across Nigeria. Customer satisfaction is our #1 priority.",
  logo_url: null,
  seller_since: "2022-03-15",
  is_verified: true,
  rating: 4.8,
  review_count: 342,
  total_products: 89,
  total_sales: 1247,
  response_rate: 98,
  response_time_hours: 1,
  location: "Lagos, Nigeria",
  badges: [
    "Top Seller",
    "Fast Shipper",
    "Verified ID",
    "Quality Assured",
    "5★ Service",
  ],
};

const MOCK_PRODUCTS: SellerProduct[] = Array.from({ length: 12 }, (_, i) => ({
  id: `prod-${i}`,
  product_name: [
    "iPhone 14 Pro Max 256GB Deep Purple",
    "Samsung Galaxy S24 Ultra 512GB",
    "Sony WH-1000XM5 Headphones",
    "MacBook Air M2 8GB 256GB",
    "Apple AirPods Pro 2nd Gen",
    "PlayStation 5 Console Disc Edition",
    "iPad Pro 12.9-inch M2 WiFi",
    "Logitech MX Master 3 Mouse",
    'Samsung 65" QLED 4K Smart TV',
    "JBL Charge 5 Bluetooth Speaker",
    "Dell XPS 15 Intel i7 RTX 4060",
    "Canon EOS R50 Mirrorless Camera",
  ][i],
  product_original_price: [
    650000, 720000, 180000, 850000, 120000, 580000, 780000, 45000, 920000,
    95000, 780000, 340000,
  ][i],
  current_price: [
    580000, 680000, 160000, 799000, 110000, 550000, 750000, 40000, 850000,
    85000, 730000, 299000,
  ][i],
  product_images: [PRODUCT_IMAGES[i % PRODUCT_IMAGES.length]],
  is_on_sale: i % 3 === 0,
  average_rating: +(4.2 + Math.random() * 0.7).toFixed(1),
  review_count: Math.floor(Math.random() * 80) + 5,
  sold_count: Math.floor(Math.random() * 60) + 2,
  is_in_stock: i !== 7,
  subcategory_name: [
    "Smartphones",
    "Smartphones",
    "Audio",
    "Laptops",
    "Audio",
    "Gaming",
    "Tablets",
    "Peripherals",
    "TVs",
    "Audio",
    "Laptops",
    "Cameras",
  ][i],
}));

const MOCK_REVIEWS: SellerReview[] = [
  {
    id: "r1",
    buyer_name: "Adaeze Okafor",
    rating: 5,
    comment:
      "Absolutely amazing seller! Product arrived exactly as described, well packaged and delivered within 2 days. Will definitely buy again.",
    created_at: "2024-12-10",
    helpful_count: 23,
    product_name: "iPhone 14 Pro Max 256GB",
  },
  {
    id: "r2",
    buyer_name: "Emeka Chukwu",
    rating: 4,
    comment:
      "Good product, genuine item. Delivery was a day late but seller was communicative throughout. Happy with purchase overall.",
    created_at: "2024-11-28",
    helpful_count: 11,
    product_name: "Sony WH-1000XM5 Headphones",
  },
  {
    id: "r3",
    buyer_name: "Fatimah Bello",
    rating: 5,
    comment:
      "Excellent seller, responded instantly to all my questions before I ordered. Product is 100% original with all accessories.",
    created_at: "2024-11-15",
    helpful_count: 18,
    product_name: "MacBook Air M2",
  },
  {
    id: "r4",
    buyer_name: "Chidi Nwosu",
    rating: 5,
    comment:
      "Best electronics seller on Jovo hands down. Fast, reliable, and everything is authentic. TechZone is my go-to.",
    created_at: "2024-10-30",
    helpful_count: 31,
    product_name: "PlayStation 5 Console",
  },
  {
    id: "r5",
    buyer_name: "Ngozi Eze",
    rating: 4,
    comment: "Great products and fast shipping. Would recommend!",
    created_at: "2024-10-15",
    helpful_count: 9,
    product_name: "iPad Pro 12.9-inch",
  },
];

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
        if (safeRating >= s) {
          return (
            <FaStar
              key={s}
              size={size}
              className="text-amber-400"
              suppressHydrationWarning
            />
          );
        }
        if (safeRating >= s - 0.5) {
          return (
            <FaStarHalfAlt
              key={s}
              size={size}
              className="text-amber-400"
              suppressHydrationWarning
            />
          );
        }
        return (
          <FaRegStar
            key={s}
            size={size}
            className="text-gray-300"
            suppressHydrationWarning
          />
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

// ─── Sub-components ───────────────────────────────────────────────────────────

const ProductCard = ({
  product,
  view,
}: {
  product: SellerProduct;
  view: "grid" | "list";
}) => {
  const discount =
    product.product_original_price > product.current_price
      ? Math.round(
          ((product.product_original_price - product.current_price) /
            product.product_original_price) *
            100,
        )
      : 0;

  const productLink = `/product/${product.id}`;
  const productName = product.product_name;
  const subcategoryName = product.subcategory_name;
  const avgRating = product.average_rating;
  const reviewCount = product.review_count;
  const soldCount = product.sold_count;
  const currentPrice = product.current_price;
  const originalPrice = product.product_original_price;
  const isInStock = product.is_in_stock;
  const isOnSale = product.is_on_sale;
  const productImage = product.product_images?.[0];

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
              alt={productName}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiPackage size={28} className="text-gray-300" />
            </div>
          )}
          {!isInStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
              <span className="text-[9px] font-black text-red-500 uppercase">
                Sold out
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 group-hover:text-[#B42225] transition-colors truncate">
            {productName}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">{subcategoryName}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <RenderStars rating={avgRating} />
            <span className="text-[10px] text-gray-400">({reviewCount})</span>
            <span className="text-[10px] text-gray-300">•</span>
            <span className="text-[10px] text-gray-400">{soldCount} sold</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-black text-[#B42225]">
            {fmtPrice(currentPrice)}
          </p>
          {discount > 0 && (
            <p className="text-[10px] text-gray-400 line-through">
              {fmtPrice(originalPrice)}
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
            alt={productName}
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
        {!isInStock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <span className="text-xs font-black text-red-500 uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        )}
        {isOnSale && isInStock && (
          <span className="absolute top-2 right-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full z-10">
            Sale
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-[#B42225] transition-colors mb-2">
          {productName}
        </p>
        <div className="flex items-center gap-1 mb-2">
          <RenderStars rating={avgRating} size={11} />
          <span className="text-[10px] text-gray-400 ml-0.5">
            ({reviewCount})
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-black text-[#B42225]">
              {fmtPrice(currentPrice)}
            </p>
            {discount > 0 && (
              <p className="text-[10px] text-gray-400 line-through">
                {fmtPrice(originalPrice)}
              </p>
            )}
          </div>
          <span className="text-[10px] text-gray-400">{soldCount} sold</span>
        </div>
      </div>
    </Link>
  );
};

const ReviewCard = ({
  review,
  voted,
  onVote,
}: {
  review: SellerReview;
  voted: boolean;
  onVote: () => void;
}) => {
  const formattedDate = new Date(review.created_at).toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 transition-colors">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0"
          style={{ background: "linear-gradient(135deg,#B42225,#FF4500)" }}
        >
          {review.buyer_name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-sm font-bold text-gray-900">
              {review.buyer_name}
            </p>
            <MdVerified size={12} className="text-[#B42225]" />
            <span className="text-[10px] text-gray-400 ml-auto">
              {formattedDate}
            </span>
          </div>
          <RenderStars rating={review.rating} />
          <p className="text-[11px] text-gray-400 mt-0.5">
            for: {review.product_name}
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-2">
            {review.comment}
          </p>
          <button
            onClick={onVote}
            className={`mt-3 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
              voted
                ? "bg-green-50 text-green-600 border border-green-100"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100"
            }`}
          >
            <FiThumbsUp size={11} />
            Helpful ({voted ? review.helpful_count + 1 : review.helpful_count})
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SellerProfilePage = () => {
  const params = useParams();
  const sellerId = (params?.seller_id ?? params?.id ?? "") as string;

  const [seller] = useState<SellerProfile>(MOCK_SELLER);
  const [products] = useState<SellerProduct[]>(MOCK_PRODUCTS);
  const [reviews] = useState<SellerReview[]>(MOCK_REVIEWS);
  const [loading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const [activeTab, setActiveTab] = useState<"products" | "reviews" | "about">(
    "products",
  );
  const [productView, setProductView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [shareOpen, setShareOpen] = useState(false);
  const [helpfulVoted, setHelpfulVoted] = useState<string[]>([]);

  // FIXED: eslint-disable comment placed BEFORE the setState line
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      p.subcategory_name.toLowerCase().includes(search.toLowerCase()),
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price_asc") return a.current_price - b.current_price;
    if (sortBy === "price_desc") return b.current_price - a.current_price;
    if (sortBy === "rating") return b.average_rating - a.average_rating;
    if (sortBy === "popular") return b.sold_count - a.sold_count;
    return 0;
  });

  const sellerInitials = seller.business_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSince = new Date(seller.seller_since).toLocaleDateString(
    "en-NG",
    {
      month: "long",
      year: "numeric",
    },
  );

  const avgRatingRounded = Math.round(seller.rating * 10) / 10;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading store…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen" style={{ background: "#F7F8FC" }}>
        {/* ═══ HERO SECTION - Gradient Background Only ═══════════════════════ */}
        <div className="relative">
          {/* Gradient background only - NO IMAGE */}
          <div
            className="w-full h-36 md:h-36 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg,#0F172A 0%,#1E293B 50%,#7F1D1D 100%)",
            }}
          >
            {/* Dot grid overlay */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle,#fff 1px,transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            <Link
              href="/seller/dashboard"
              className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-xs font-bold hover:bg-white/30 transition border border-white/20"
            >
              <FiChevronLeft size={14} /> Back to Dashboard
            </Link>
            {/* Share button - client only */}
            {isClient && (
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
                      <div className="absolute top-10 right-0 bg-white rounded-2xl border border-gray-100 p-3 flex flex-col gap-1 w-44 z-50 shadow-xl">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-1 mb-1">
                          Share via
                        </p>
                        {[
                          {
                            icon: (
                              <FaWhatsapp
                                className="text-green-500"
                                size={15}
                              />
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
            )}
          </div>

          {/* Avatar overlapping the gradient */}
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <div className="relative -mt-8 flex flex-col sm:flex-row items-start sm:items-end gap-4 pb-4 z-20">
              {/* Logo / Avatar */}
              <div
                className="w-24 h-24 rounded-3xl border-4 border-white shadow-xl flex items-center justify-center text-white text-2xl font-black shrink-0 relative"
                style={{
                  background: "linear-gradient(135deg,#B42225,#FF4500)",
                }}
              >
                {seller.logo_url ? (
                  <Image
                    src={seller.logo_url}
                    alt={seller.business_name}
                    fill
                    className="object-cover rounded-3xl"
                  />
                ) : (
                  sellerInitials
                )}
                {seller.is_verified && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-md">
                    <MdVerified size={18} className="text-[#B42225]" />
                  </div>
                )}
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                    {seller.business_name}
                  </h1>
                  {seller.is_verified && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#B42225]/10 text-[#B42225] border border-[#B42225]/20">
                      Verified Seller
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <div className="flex items-center gap-1">
                    <RenderStars rating={seller.rating} size={13} />
                    <span className="text-sm font-bold text-gray-800 ml-1">
                      {avgRatingRounded}
                    </span>
                    <span className="text-sm text-gray-400">
                      ({seller.review_count} reviews)
                    </span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <FiPackage size={12} /> {seller.total_products} listings
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">
                    {seller.location}
                  </span>
                </div>
              </div>

              {/* CTA buttons - client only */}
              {isClient && (
                <div className="flex gap-2 shrink-0">
                  <a
                    href={`https://wa.me/?text=Hi, I saw your store on Jovo!`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-green-500 hover:bg-green-600 transition shadow-md"
                  >
                    <FaWhatsapp size={15} /> Chat
                  </a>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 border-[#B42225] text-[#B42225] hover:bg-[#B42225] hover:text-white transition">
                    <FiAward size={15} /> Follow Store
                  </button>
                </div>
              )}
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
                  value: seller.total_sales.toLocaleString(),
                  label: "Items Sold",
                },
                {
                  icon: <FiStar size={16} className="text-amber-400" />,
                  value: avgRatingRounded,
                  label: "Avg. Rating",
                },
                {
                  icon: <FiClock size={16} className="text-blue-500" />,
                  value: `< ${seller.response_time_hours}h`,
                  label: "Response Time",
                },
                {
                  icon: <FiTrendingUp size={16} className="text-emerald-500" />,
                  value: `${seller.response_rate}%`,
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
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-3">
          <div className="flex flex-wrap gap-2">
            {seller.badges.map((badge) => (
              <span
                key={badge}
                className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 shadow-sm"
              >
                <FiCheck size={11} className="text-emerald-500" /> {badge}
              </span>
            ))}
            <span className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-400">
              <FiClock size={11} /> Member since {memberSince}
            </span>
          </div>
        </div>

        {/* ═══ TABS + CONTENT ═══════════════════════════════════════════════ */}
        <div className="max-w-5xl mx-auto px-4 md:px-8 pb-12">
          {/* Tab bar */}
          <div className="flex items-center gap-1 border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
            {[
              {
                key: "products" as const,
                label: `Products (${seller.total_products})`,
              },
              {
                key: "reviews" as const,
                label: `Reviews (${seller.review_count})`,
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
              {isClient && (
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
              )}

              {!isClient && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
                    >
                      <div className="aspect-square bg-gray-100" />
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                        <div className="h-5 bg-gray-100 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isClient && (
                <>
                  {sortedProducts.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <FiPackage size={24} className="text-gray-300" />
                      </div>
                      <p className="font-bold text-gray-500">
                        No products found
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Try a different search term
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
                </>
              )}
            </div>
          )}

          {/* ── Reviews Tab ── */}
          {activeTab === "reviews" && (
            <div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="text-center px-6 py-2 shrink-0">
                    <p className="text-5xl font-black text-gray-900">
                      {avgRatingRounded}
                    </p>
                    <RenderStars rating={seller.rating} size={18} />
                    <p className="text-xs text-gray-400 mt-1">
                      {seller.review_count} reviews
                    </p>
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    {[
                      { stars: 5, pct: 71 },
                      { stars: 4, pct: 18 },
                      { stars: 3, pct: 7 },
                      { stars: 2, pct: 3 },
                      { stars: 1, pct: 1 },
                    ].map(({ stars, pct }) => (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-4 shrink-0">
                          {stars}
                        </span>
                        <FaStar size={10} className="text-amber-400 shrink-0" />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">
                          {pct}%
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 shrink-0">
                    {[
                      {
                        icon: (
                          <HiOutlineShieldCheck
                            size={16}
                            className="text-emerald-500"
                          />
                        ),
                        label: "Positive feedback",
                        value: "96%",
                      },
                      {
                        icon: (
                          <MdOutlineLocalShipping
                            size={16}
                            className="text-blue-500"
                          />
                        ),
                        label: "On-time delivery",
                        value: "94%",
                      },
                      {
                        icon: (
                          <FiPackage size={16} className="text-purple-500" />
                        ),
                        label: "Good communication",
                        value: "98%",
                      },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                          {icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">
                            {value}
                          </p>
                          <p className="text-[10px] text-gray-400">{label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    voted={helpfulVoted.includes(review.id)}
                    onVote={() => {
                      if (!helpfulVoted.includes(review.id)) {
                        setHelpfulVoted((prev) => [...prev, review.id]);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── About Tab ── */}
          {activeTab === "about" && (
            <div className="max-w-2xl space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-black text-gray-900 mb-3 flex items-center gap-2">
                  <FaStore size={15} className="text-[#B42225]" />
                  About {seller.business_name}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {seller.business_bio}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-black text-gray-900 mb-4">
                  Store Details
                </h2>
                <div className="space-y-3">
                  {[
                    { label: "Member Since", value: memberSince },
                    { label: "Location", value: seller.location },
                    {
                      label: "Total Products",
                      value: `${seller.total_products} listings`,
                    },
                    {
                      label: "Total Sales",
                      value: `${seller.total_sales.toLocaleString()} orders`,
                    },
                    {
                      label: "Response Rate",
                      value: `${seller.response_rate}%`,
                    },
                    {
                      label: "Avg. Response Time",
                      value: `Under ${seller.response_time_hours} hour`,
                    },
                    {
                      label: "Seller Status",
                      value: seller.is_verified
                        ? "Verified & Approved"
                        : "Unverified",
                    },
                  ].map(({ label, value }) => (
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
                      icon: <MdVerified size={20} className="text-[#B42225]" />,
                      title: "Jovo Certified",
                      sub: "Meets quality standards",
                    },
                    {
                      icon: <FiAward size={20} className="text-amber-500" />,
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

              <div
                className="rounded-2xl overflow-hidden relative"
                style={{
                  background: "linear-gradient(135deg,#0F172A 0%,#1C0A00 100%)",
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
                      Browse all {seller.total_products} products from this
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