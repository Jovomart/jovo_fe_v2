"use client";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  FiHeart,
  FiShoppingCart,
  FiRefreshCw,
  FiShield,
  FiShare2,
  FiCheck,
  FiPackage,
  FiChevronRight,
  FiThumbsUp,
  FiLoader,
  FiAlertCircle,
  FiStar,
  FiMail,
  FiGlobe,
  FiPhone,
  FiZap,
  FiTrendingUp,
  FiXCircle,
} from "react-icons/fi";
import {
  FaHeart,
  FaStar,
  FaStore,
  FaStarHalfAlt,
  FaRegStar,
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaCopy,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import apiService from "@/services/apiService";
import { getCategoryTheme } from "@/categoryConfig";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface SellerInfo {
  id: string;
  business_name: string;
  short_business_description?: string;
  seller_bio?: string;
  business_address?: string;
  business_phone_number?: string;
  business_email?: string;
  business_facebook?: string;
  business_twitter?: string;
  business_instagram?: string;
  business_linkedin?: string;
  business_website?: string;
  business_location?: string;
  business_image?: string;
  cover_image?: string;
  created_at?: string;
  average_rating?: number;
  review_count?: number;
  total_listings?: number;
  items_sold?: number;
  response_time?: string;
  response_rate?: string;
  badges?: string[];
  member_since?: string;
}

interface Product {
  id: string;
  seller_id: string;
  business_name: string;
  business_image?: string;
  subcategory_id?: string;
  subcategory_name?: string;
  product_name: string;
  product_description: string;
  product_condition: string;
  attributes?: Record<string, unknown>;
  product_original_price: number;
  product_discount_price: number | null;
  is_on_sale: boolean;
  current_price: number;
  discount_percentage: number;
  stock_quantity?: number;
  is_in_stock: boolean;
  is_digital: boolean;
  is_limited_stock?: boolean;
  remaining_stock?: number;
  product_images: string[];
  product_videos?: string[];
  brand: string | null;
  model: string | null;
  average_rating: number;
  review_count: number;
  view_count?: number;
  sold_count: number;
  is_active?: boolean;
  is_featured?: boolean;
  tags?: string[];
  product_warranty?: string;
  warranty_months?: number;
  return_policy?: string;
  return_days?: number;
  seo_title?: string;
  seo_description?: string;
  created_at?: string;
  updated_at?: string;
  // Embedded seller from API response
  seller?: SellerInfo;
  // Legacy fields kept for compatibility
  category_id?: string;
  category_name?: string;
}

interface Review {
  id: number;
  user_name?: string;
  rating: number;
  created_at: string;
  comment: string;
  is_verified: boolean;
  helpful_count: number;
}

// Placeholder image (valid data URL)
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ccircle cx='200' cy='150' r='50' fill='%239ca3af'/%3E%3Crect x='100' y='220' width='200' height='120' rx='10' fill='%239ca3af'/%3E%3Crect x='140' y='250' width='120' height='15' rx='5' fill='%23d1d5db'/%3E%3Crect x='160' y='275' width='80' height='10' rx='5' fill='%23d1d5db'/%3E%3C/svg%3E";

const getValidImageUrl = (url: string | undefined | null): string => {
  if (!url) return PLACEHOLDER_IMAGE;
  if (url.startsWith("data:")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (url.includes("api.yourstore.com")) return PLACEHOLDER_IMAGE;
    return url;
  }
  if (url.startsWith("/")) return url;
  return PLACEHOLDER_IMAGE;
};

// ─────────────────────────────────────────────────────────────
// STARS COMPONENT
// ─────────────────────────────────────────────────────────────

const RenderStars = ({
  rating,
  size = 14,
  color = "#F59E0B",
}: {
  rating: number;
  size?: number;
  color?: string;
}) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => {
      if (rating >= s) return <FaStar key={s} size={size} style={{ color }} />;
      if (rating >= s - 0.5)
        return <FaStarHalfAlt key={s} size={size} style={{ color }} />;
      return <FaRegStar key={s} size={size} style={{ color: "#D1D5DB" }} />;
    })}
  </div>
);

// ─────────────────────────────────────────────────────────────
// SELLER CARD COMPONENT
// ─────────────────────────────────────────────────────────────

const SellerCard = ({
  sellerId,
  seller,
  productBusinessName,
  sellerProducts,
  isLoadingSellerProducts,
}: {
  sellerId: string;
  seller: SellerInfo | null | undefined;
  productBusinessName: string;
  sellerProducts: Array<{
    id: string;
    product_name: string;
    current_price: number;
    product_images: string[];
  }>;
  isLoadingSellerProducts: boolean;
}) => {
  // Pull all data from the embedded seller object; fall back to product-level fields
  const businessName =
    seller?.business_name || productBusinessName || "Jovo Seller";
  const bio =
    seller?.seller_bio ||
    seller?.short_business_description ||
    "Verified merchant on Jovo Marketplace";
  const logoUrl = seller?.business_image;
  const whatsappNumber = seller?.business_phone_number;
  const email = seller?.business_email;
  const website = seller?.business_website;
  const facebook = seller?.business_facebook;
  const twitter = seller?.business_twitter;
  const instagram = seller?.business_instagram;
  const linkedin = seller?.business_linkedin;
  const badges = seller?.badges || [];
  const memberSince = seller?.member_since || seller?.created_at;
  const responseTime = seller?.response_time;
  const responseRate = seller?.response_rate;

  const itemsSold = seller?.items_sold ?? 0;
  const rating = seller?.average_rating ?? 0;
  const reviewCount = seller?.review_count ?? 0;
  const totalListings = seller?.total_listings ?? 0;

  const initials = businessName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberYear = memberSince
    ? new Date(memberSince).getFullYear()
    : null;

  return (
    <div
      className="bg-white rounded-3xl overflow-hidden"
      style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.07)" }}
    >
      {/* Header gradient band */}
      <div
        className="h-20 relative"
        style={{
          background:
            "linear-gradient(135deg,#0F172A 0%,#1E293B 60%,#B42225 100%)",
        }}
      >
        {/* Cover image if available */}
        {seller?.cover_image && (
          <Image
            src={getValidImageUrl(seller.cover_image)}
            alt="Store cover"
            fill
            className="object-cover opacity-40"
          />
        )}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle,#fff 1px,transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
      </div>

      <div className="px-5 pb-5">
        {/* Avatar + View Store link */}
        <div className="flex items-end justify-between -mt-8 mb-3">
          <div className="relative">
            {logoUrl && getValidImageUrl(logoUrl) !== PLACEHOLDER_IMAGE ? (
              <div className="w-16 h-16 rounded-2xl border-4 border-white overflow-hidden shadow-lg bg-white">
                <Image
                  src={getValidImageUrl(logoUrl)}
                  alt={businessName}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = document.createElement("div");
                      fallback.className =
                        "w-full h-full flex items-center justify-center text-white text-lg font-black";
                      fallback.style.background =
                        "linear-gradient(135deg,#B42225,#FF4500)";
                      fallback.textContent = initials;
                      parent.appendChild(fallback);
                      target.remove();
                    }
                  }}
                />
              </div>
            ) : (
              <div
                className="w-16 h-16 rounded-2xl border-4 border-white flex items-center justify-center text-white text-lg font-black shadow-lg"
                style={{
                  background: "linear-gradient(135deg,#B42225,#FF4500)",
                }}
              >
                {initials}
              </div>
            )}
          </div>
          <Link
            href={`/seller/${sellerId}`}
            className="text-[11px] font-bold text-[#B42225] hover:underline flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full"
          >
            View Store <FiChevronRight size={11} />
          </Link>
        </div>

        {/* Seller name + bio */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <p className="text-base font-black text-gray-900">{businessName}</p>
            <MdVerified size={16} className="text-[#B42225]" />
            {memberYear && (
              <span className="text-[9px] text-gray-400 font-semibold bg-gray-100 px-1.5 py-0.5 rounded-full">
                Since {memberYear}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 line-clamp-2">{bio}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            {
              label: "Items Sold",
              value: itemsSold.toLocaleString(),
            },
            {
              label: "Rating",
              value: rating > 0 ? rating.toFixed(1) : "—",
            },
            {
              label: "Reviews",
              value: reviewCount.toLocaleString(),
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center py-2.5 rounded-xl bg-gray-50 border border-gray-100"
            >
              <p className="text-base font-black text-gray-900">{value}</p>
              <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Response stats */}
        {(responseTime || responseRate || totalListings > 0) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {totalListings > 0 && (
              <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
                <FiPackage size={10} /> {totalListings} listings
              </span>
            )}
            {responseTime && (
              <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1">
                <FiZap size={10} /> Responds in {responseTime}
              </span>
            )}
            {responseRate && (
              <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-100 flex items-center gap-1">
                <FiTrendingUp size={10} /> {responseRate} response rate
              </span>
            )}
          </div>
        )}

        {/* Contact channels */}
        <div className="flex flex-wrap gap-2 mb-4">
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-100 flex items-center gap-1"
            >
              <FaWhatsapp size={11} /> WhatsApp
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1"
            >
              <FiMail size={11} /> Email
            </a>
          )}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-50 text-gray-700 border border-gray-100 flex items-center gap-1"
            >
              <FiGlobe size={11} /> Website
            </a>
          )}
          {instagram && (
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-pink-50 text-pink-700 border border-pink-100 flex items-center gap-1"
            >
              <FaInstagram size={11} /> Instagram
            </a>
          )}
          {facebook && (
            <a
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1"
            >
              <FaFacebook size={11} /> Facebook
            </a>
          )}
          {twitter && (
            <a
              href={twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-100 flex items-center gap-1"
            >
              <FaTwitter size={11} /> Twitter
            </a>
          )}
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-100 flex items-center gap-1"
            >
              <FaLinkedin size={11} /> LinkedIn
            </a>
          )}
        </div>

        {/* Badges from API */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {badges.map((badge) => (
              <span
                key={badge}
                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-100 flex items-center gap-1"
              >
                <FiCheck size={9} /> {badge}
              </span>
            ))}
          </div>
        )}

        {/* Fallback trust badges if API returns none */}
        {badges.length === 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {["Verified ID", "Quality Assured", "Secure Payments"].map(
              (badge) => (
                <span
                  key={badge}
                  className="text-[10px] font-bold px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-100 flex items-center gap-1"
                >
                  <FiCheck size={9} /> {badge}
                </span>
              )
            )}
          </div>
        )}

        {/* More from this seller */}
        {isLoadingSellerProducts ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 p-2 rounded-xl animate-pulse"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : sellerProducts.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                More from this seller
              </p>
              <span className="text-[9px] text-gray-300">
                {sellerProducts.length} items
              </span>
            </div>
            <div className="space-y-2">
              {sellerProducts.map((p) => {
                const imgSrc = p.product_images?.[0]
                  ? getValidImageUrl(p.product_images[0])
                  : null;
                return (
                  <Link
                    key={p.id}
                    href={`/product/${p.id}`}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 relative">
                      {imgSrc && imgSrc !== PLACEHOLDER_IMAGE ? (
                        <Image
                          src={imgSrc}
                          alt={p.product_name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiPackage size={14} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-[#B42225] transition-colors">
                        {p.product_name}
                      </p>
                      <p className="text-[11px] font-black text-[#B42225]">
                        ₦{p.current_price.toLocaleString()}
                      </p>
                    </div>
                    <FiChevronRight
                      size={12}
                      className="text-gray-300 group-hover:text-[#B42225] transition-colors shrink-0"
                    />
                  </Link>
                );
              })}
            </div>
          </>
        ) : null}

        {/* CTA */}
        <Link
          href={`/seller/${sellerId}`}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border-2 border-[#B42225] text-[#B42225] hover:bg-[#B42225] hover:text-white transition-all"
        >
          <FaStore size={13} /> Visit Full Store
        </Link>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

const ProductDetails = () => {
  const { id } = useParams();
  const productId = id as string;

  const { addToCart, isInCart, getItemQuantity } = useCart();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();

  // State
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [isLoadingSellerProducts, setIsLoadingSellerProducts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [returnOpen, setReturnOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [helpfulVoted, setHelpfulVoted] = useState<string[]>([]);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Cart states
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  // Image error handling
  const [imgError, setImgError] = useState(false);

  const rawImageUrl = product?.product_images?.[0];
  const imageUrl = imgError
    ? PLACEHOLDER_IMAGE
    : getValidImageUrl(rawImageUrl);

  const theme = getCategoryTheme(product?.category_id || "");

  // ── Fetch product details using the dedicated endpoint ──────────────────────
  const fetchProductDetails = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    setError(null);

    try {
      // Use the dedicated single-product endpoint — clean, fast, includes seller
      const response = await apiService.getProductById(productId);
      const productData: Product = response?.data ?? response;

      if (!productData || !productData.id) {
        throw new Error("Product not found");
      }

      setProduct(productData);

      // ── Fetch seller's other products (same category, same seller) ──────────
      const categoryId =
        productData.category_id || productData.subcategory_id;
      if (categoryId && productData.seller_id) {
        setIsLoadingSellerProducts(true);
        try {
          const sellerRes = await apiService.getCategoryMarketspace(categoryId, {
            limit: 10,
            offset: 0,
          });
          const d = sellerRes?.data ?? sellerRes;
          const others: Product[] = (d?.products ?? []).filter(
            (p: Product) =>
              p.seller_id === productData.seller_id && p.id !== productId
          );
          setSellerProducts(others.slice(0, 3));
        } catch {
          setSellerProducts([]);
        } finally {
          setIsLoadingSellerProducts(false);
        }
      }

      // ── Fetch reviews ───────────────────────────────────────────────────────
      try {
        const reviewsResponse = await apiService.makeRequest(
          `/reviews/product/${productId}`,
          { method: "GET" }
        );
        const reviewsData = reviewsResponse?.data || reviewsResponse;
        const reviewsList = Array.isArray(reviewsData)
          ? reviewsData
          : reviewsData?.items || reviewsData?.reviews || [];
        setReviews(reviewsList);
      } catch {
        setReviews([]);
      }

      // ── Fetch suggested products from same category ─────────────────────────
      if (categoryId) {
        try {
          const suggestedResponse = await apiService.getCategoryMarketspace(
            categoryId,
            { limit: 6, offset: 0 }
          );
          const suggestedData = suggestedResponse?.data || suggestedResponse;
          const allProducts: Product[] = Array.isArray(suggestedData?.products)
            ? suggestedData.products
            : [];
          setSuggestedProducts(
            allProducts.filter((p) => p.id !== productId).slice(0, 6)
          );
        } catch {
          setSuggestedProducts([]);
        }
      }
    } catch (err: any) {
      console.error("Error fetching product:", err);
      setError(err?.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductDetails();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProductDetails]);

  // ── Submit review ───────────────────────────────────────────────────────────
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    setSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess(false);

    try {
      await apiService.makeRequest("/user/reviews/product", {
        method: "POST",
        body: JSON.stringify({
          product_id: productId,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      setReviewSuccess(true);
      setShowReviewForm(false);
      setReviewRating(5);
      setReviewComment("");

      setTimeout(async () => {
        try {
          const reviewsResponse = await apiService.makeRequest(
            `/reviews/product/${productId}`,
            { method: "GET" }
          );
          const reviewsData = reviewsResponse?.data || reviewsResponse;
          const reviewsList = Array.isArray(reviewsData)
            ? reviewsData
            : reviewsData?.items || reviewsData?.reviews || [];
          setReviews(reviewsList);
        } catch {
          // Silent fail on refresh
        }
      }, 1000);
    } catch (err: any) {
      setReviewError(
        err?.message || "Failed to submit review. Please try again."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // ── Wishlist helpers ────────────────────────────────────────────────────────
  const wishlistProduct = product
    ? {
        id: parseInt(product.id, 10) || 0,
        name: product.product_name,
        price: product.current_price,
        oldPrice:
          product.product_original_price > product.current_price
            ? product.product_original_price
            : null,
        rating: product.average_rating,
        reviews: product.review_count,
        image: getValidImageUrl(product.product_images?.[0]),
        brand: product.brand || undefined,
      }
    : null;

  const wishlisted = wishlistProduct ? isWishlisted(wishlistProduct.id) : false;
  const alreadyInCart = isInCart(productId);
  const cartQty = getItemQuantity(productId);

  const discount = product?.discount_percentage
    ? Math.round(product.discount_percentage)
    : product?.product_original_price &&
      product?.current_price &&
      product.product_original_price > product.current_price
    ? Math.round(
        ((product.product_original_price - product.current_price) /
          product.product_original_price) *
          100
      )
    : 0;

  const handleAddToCart = async () => {
    if (cartLoading) return;
    setCartLoading(true);
    setCartError(null);
    try {
      await addToCart(productId, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    } catch (err: any) {
      setCartError(err?.message ?? "Failed to add to cart. Please try again.");
      setTimeout(() => setCartError(null), 4000);
    } finally {
      setCartLoading(false);
    }
  };

  const handleWishlistToggle = () => {
    if (!wishlistProduct) return;
    if (wishlisted) {
      removeFromWishlist(wishlistProduct.id);
    } else {
      addToWishlist(wishlistProduct);
    }
  };

  const handleBuyNow = async () => {
    if (cartLoading) return;
    setCartLoading(true);
    setCartError(null);
    try {
      await addToCart(productId, quantity);
      window.location.href = "/cart";
    } catch (err: any) {
      setCartError(err?.message ?? "Failed to add to cart. Please try again.");
      setCartLoading(false);
    }
  };

  const handleHelpful = (reviewId: number) => {
    const reviewIdStr = String(reviewId);
    if (!helpfulVoted.includes(reviewIdStr)) {
      setHelpfulVoted([...helpfulVoted, reviewIdStr]);
    }
  };

  // ── Return policy from product data or defaults ─────────────────────────────
  const returnDays = product?.return_days ?? 7;
  const warranty = product?.product_warranty || `${product?.warranty_months ?? 12} Month`;

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <FiLoader size={40} className="animate-spin text-[#B42225]" />
        <p className="text-gray-500 text-sm">Loading product details...</p>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
          <FiPackage size={36} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-700">Product not found</h2>
        <p className="text-gray-400 text-sm">
          {error || "The product you're looking for doesn't exist."}
        </p>
        <Link
          href="/shop"
          className="px-6 py-2.5 bg-[#B42225] text-white rounded-xl text-sm font-semibold"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen" style={{ background: "#F7F8FC" }}>

        {/* BREADCRUMB */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-5 pb-2">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link
              href="/shop"
              className="hover:text-[#B42225] transition-colors"
            >
              Shop
            </Link>
            <FiChevronRight size={12} />
            {product.category_id && (
              <>
                <Link
                  href={`/category/${product.category_id}`}
                  className="hover:text-[#B42225] transition-colors capitalize"
                >
                  {product.category_name || "Category"}
                </Link>
                <FiChevronRight size={12} />
              </>
            )}
            {product.subcategory_name && (
              <>
                <span className="text-gray-500 capitalize">
                  {product.subcategory_name}
                </span>
                <FiChevronRight size={12} />
              </>
            )}
            <span className="text-gray-600 truncate max-w-[200px]">
              {product.product_name}
            </span>
          </div>
        </div>

        {/* MAIN PRODUCT SECTION */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div
            className="bg-white rounded-3xl overflow-hidden"
            style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.08)" }}
          >
            <div className="grid lg:grid-cols-2 gap-0">

              {/* Image Panel */}
              <div className="relative bg-gray-50 lg:rounded-tl-3xl lg:rounded-bl-3xl aspect-square md:aspect-auto md:min-h-[500px] flex items-center justify-center p-6 md:p-10 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, #B42225 1px, transparent 1px)",
                      backgroundSize: "28px 28px",
                    }}
                  />
                </div>

                {discount > 0 && (
                  <div
                    className="absolute top-5 left-5 z-20 flex flex-col items-center justify-center w-14 h-14 rounded-full text-white font-black text-xs"
                    style={{
                      background:
                        "linear-gradient(135deg,#B42225,#FF4500)",
                    }}
                  >
                    -{discount}%
                  </div>
                )}

                {/* Limited stock badge */}
                {product.is_limited_stock && (
                  <div className="absolute top-5 left-5 z-20 mt-16">
                    <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-full">
                      🔥 Only {product.remaining_stock} left!
                    </span>
                  </div>
                )}

                <div className="absolute top-5 right-5 z-40 flex flex-col gap-2">
                  <button
                    onClick={handleWishlistToggle}
                    className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    {wishlisted ? (
                      <FaHeart className="text-red-500" size={16} />
                    ) : (
                      <FiHeart className="text-gray-400" size={16} />
                    )}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShareOpen(!shareOpen)}
                      className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <FiShare2 size={16} className="text-gray-500" />
                    </button>
                    {shareOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-55"
                          onClick={() => setShareOpen(false)}
                        />
                        <div
                          className="absolute top-12 right-0 bg-white rounded-2xl border border-gray-100 p-3 flex flex-col gap-1 w-44 z-60"
                          style={{
                            boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                          }}
                        >
                          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-1 mb-1">
                            Share via
                          </p>
                          {[
                            {
                              icon: (
                                <FaWhatsapp
                                  className="text-green-500"
                                  size={16}
                                />
                              ),
                              label: "WhatsApp",
                              action: () =>
                                window.open(
                                  `https://wa.me/?text=${encodeURIComponent(window.location.href)}`,
                                  "_blank"
                                ),
                            },
                            {
                              icon: (
                                <FaFacebook
                                  className="text-blue-600"
                                  size={16}
                                />
                              ),
                              label: "Facebook",
                              action: () =>
                                window.open(
                                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                                  "_blank"
                                ),
                            },
                            {
                              icon: (
                                <FaTwitter
                                  className="text-sky-500"
                                  size={16}
                                />
                              ),
                              label: "Twitter",
                              action: () =>
                                window.open(
                                  `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`,
                                  "_blank"
                                ),
                            },
                            {
                              icon: (
                                <FaCopy className="text-gray-500" size={16} />
                              ),
                              label: "Copy Link",
                              action: () =>
                                navigator.clipboard.writeText(
                                  window.location.href
                                ),
                            },
                          ].map(({ icon, label, action }) => (
                            <button
                              key={label}
                              onClick={() => {
                                action();
                                setShareOpen(false);
                              }}
                              className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                            >
                              {icon} {label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="relative w-full h-full">
                  <Image
                    src={imageUrl}
                    alt={product.product_name}
                    fill
                    className="object-contain"
                    onError={() => setImgError(true)}
                    priority
                    unoptimized={imageUrl.startsWith("data:")}
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 md:p-8 lg:p-10 flex flex-col gap-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#B42225] uppercase tracking-widest">
                    {product.brand || "Jovo Verified"}
                  </span>
                  <MdVerified className="text-[#B42225]" size={14} />
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {product.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="ml-auto text-xs text-gray-400 capitalize bg-gray-100 px-2.5 py-1 rounded-full">
                    {product.product_condition || "New"}
                  </span>
                </div>

                <h1
                  className="text-2xl md:text-3xl font-black text-gray-900 leading-tight"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  {product.product_name}
                </h1>

                <div className="flex items-center gap-3 flex-wrap">
                  <RenderStars rating={product.average_rating || 0} size={16} />
                  <span className="text-sm font-bold text-gray-800">
                    {product.average_rating?.toFixed(1) || "0"}
                  </span>
                  <span className="text-sm text-gray-400">
                    ({product.review_count || 0} reviews)
                  </span>
                  {product.sold_count > 0 && (
                    <span className="text-xs text-gray-400">
                      · {product.sold_count.toLocaleString()} sold
                    </span>
                  )}
                  {alreadyInCart && (
                    <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-full">
                      {cartQty} in cart
                    </span>
                  )}
                  {product.is_in_stock ? (
                    <span className="text-xs text-green-600 font-semibold bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <FiCheck size={10} /> In Stock
                    </span>
                  ) : (
                    <span className="text-xs text-red-600 font-semibold bg-red-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <FiXCircle size={10} /> Out of Stock
                    </span>
                  )}
                </div>

                <div className="flex items-end gap-4 py-4 border-y border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Price</p>
                    <span className="text-4xl font-black text-gray-900">
                      ₦{product.current_price.toLocaleString()}
                    </span>
                  </div>
                  {product.product_original_price > product.current_price && (
                    <div className="mb-1">
                      <span className="text-lg text-gray-400 line-through">
                        ₦{product.product_original_price.toLocaleString()}
                      </span>
                      <p className="text-xs text-green-600 font-bold">
                        You save ₦
                        {(
                          product.product_original_price - product.current_price
                        ).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Cart error */}
                {cartError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                    <FiAlertCircle size={13} className="shrink-0" />
                    {cartError}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Quantity</p>
                    <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={cartLoading || !product.is_in_stock}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition text-lg font-bold disabled:opacity-50"
                      >
                        −
                      </button>
                      <span className="w-12 text-center text-sm font-bold text-gray-800">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        disabled={cartLoading || !product.is_in_stock}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition text-lg font-bold disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-2 mt-5">
                    <button
                      onClick={handleAddToCart}
                      disabled={cartLoading || !product.is_in_stock}
                      className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 disabled:cursor-not-allowed ${
                        addedToCart
                          ? "bg-green-500 text-white scale-95"
                          : "bg-[#B42225] hover:bg-[#9e1e20] text-white hover:scale-[1.02] active:scale-95"
                      }`}
                      style={{
                        boxShadow: addedToCart
                          ? "0 4px 20px rgba(34,197,94,0.4)"
                          : "0 4px 20px rgba(180,34,37,0.3)",
                      }}
                    >
                      {cartLoading ? (
                        <>
                          <FiLoader size={16} className="animate-spin" />{" "}
                          Adding…
                        </>
                      ) : addedToCart ? (
                        <>
                          <FiCheck size={16} /> Added to Cart!
                        </>
                      ) : (
                        <>
                          <FiShoppingCart size={16} /> Add to Cart
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleBuyNow}
                      disabled={cartLoading || !product.is_in_stock}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm border-2 border-gray-200 text-gray-700 hover:border-[#B42225] hover:text-[#B42225] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    {
                      icon: (
                        <FiShield size={16} className="text-green-500" />
                      ),
                      label: "Secure Payment",
                      sub: "100% Protected",
                    },
                    {
                      icon: (
                        <FiRefreshCw size={16} className="text-blue-500" />
                      ),
                      label: "Easy Returns",
                      sub: `${returnDays}-day policy`,
                    },
                    {
                      icon: (
                        <MdVerified size={16} className="text-[#B42225]" />
                      ),
                      label: "Verified Seller",
                      sub: "Jovo Assured",
                    },
                  ].map(({ icon, label, sub }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 text-center"
                    >
                      {icon}
                      <p className="text-[11px] font-bold text-gray-700 leading-tight">
                        {label}
                      </p>
                      <p className="text-[10px] text-gray-400">{sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RETURN & WARRANTY CARDS + SELLER CARD */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="grid md:grid-cols-3 gap-4">

            {/* Return Policy Card */}
            <div
              className="bg-white rounded-3xl p-5"
              style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.06)" }}
            >
              <div className="md:hidden">
                <button
                  className="w-full flex items-center justify-between"
                  onClick={() => setReturnOpen(!returnOpen)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                      <FiRefreshCw size={18} className="text-blue-500" />
                    </div>
                    <h3 className="text-sm font-black text-gray-900">
                      Return Policy
                    </h3>
                  </div>
                  <FiChevronRight
                    size={16}
                    className={`text-gray-400 transition-transform ${
                      returnOpen ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {returnOpen && <PolicyList product={product} />}
              </div>
              <div className="hidden md:block">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <FiRefreshCw size={18} className="text-blue-500" />
                  </div>
                  <h3 className="text-sm font-black text-gray-900">
                    Return Policy
                  </h3>
                </div>
                <PolicyList product={product} />
              </div>
            </div>

            {/* Warranty & Security Card */}
            <div
              className="bg-white rounded-3xl p-5"
              style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center">
                  <FiShield size={18} className="text-green-500" />
                </div>
                <h3 className="text-sm font-black text-gray-900">
                  Warranty & Security
                </h3>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Warranty", value: warranty },
                  { label: "Authenticity", value: "100% Genuine" },
                  { label: "Payment", value: "SSL Secured" },
                  {
                    label: "Seller",
                    value: product.business_name || "Jovo Verified",
                  },
                  ...(product.return_days
                    ? [
                        {
                          label: "Returns",
                          value: `${product.return_days}-day window`,
                        },
                      ]
                    : []),
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-gray-400">{label}</span>
                    <span className="font-bold text-gray-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Seller Card — data comes from product.seller (embedded in API response) */}
            <SellerCard
              sellerId={product.seller_id}
              seller={product.seller}
              productBusinessName={product.business_name}
              sellerProducts={sellerProducts}
              isLoadingSellerProducts={isLoadingSellerProducts}
            />
          </div>
        </div>

        {/* TABS */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div
            className="bg-white rounded-3xl overflow-hidden"
            style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.06)" }}
          >
            <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
              {[
                { key: "description", label: "Description" },
                { key: "specs", label: "Specifications" },
                {
                  key: "reviews",
                  label: `Reviews (${product.review_count || 0})`,
                },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`shrink-0 px-6 py-4 text-sm font-bold transition-all border-b-2 ${
                    activeTab === key
                      ? "border-[#B42225] text-[#B42225]"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-6 md:p-8">
              {activeTab === "description" && (
                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                  <p>
                    {product.product_description ||
                      "This premium product has been carefully selected and verified by the Jovo team for quality and authenticity."}
                  </p>
                  <div className="mt-6 grid sm:grid-cols-2 gap-3">
                    {[
                      "Original manufacturer product",
                      "Quality verified by Jovo team",
                      product.is_digital
                        ? "Instant digital delivery"
                        : "Includes all original accessories",
                      "Compatible manufacturer warranty",
                      "Secure packaging guaranteed",
                      "Authentic and brand new",
                    ].map((feat) => (
                      <div
                        key={feat}
                        className="flex items-center gap-2.5 text-sm text-gray-700"
                      >
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <FiCheck size={11} className="text-green-600" />
                        </div>
                        {feat}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "specs" && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { label: "Brand", value: product.brand || "—" },
                    { label: "Model", value: product.model || "—" },
                    {
                      label: "Category",
                      value:
                        product.category_name ||
                        product.subcategory_name ||
                        "—",
                    },
                    {
                      label: "Condition",
                      value: product.product_condition || "New",
                    },
                    {
                      label: "Warranty",
                      value: warranty,
                    },
                    {
                      label: "Return Window",
                      value: `${returnDays} days`,
                    },
                    {
                      label: "In Stock",
                      value: product.is_in_stock
                        ? "Yes — Available"
                        : "No — Out of Stock",
                    },
                    ...(product.remaining_stock != null
                      ? [
                          {
                            label: "Remaining Stock",
                            value: `${product.remaining_stock} units`,
                          },
                        ]
                      : []),
                    {
                      label: "Seller",
                      value:
                        product.business_name || "Jovo Official Store",
                    },
                    {
                      label: "Product Type",
                      value: product.is_digital
                        ? "Digital Product"
                        : "Physical Product",
                    },
                    ...(product.view_count != null
                      ? [
                          {
                            label: "Views",
                            value: product.view_count.toLocaleString(),
                          },
                        ]
                      : []),
                    {
                      label: "Total Sold",
                      value: product.sold_count.toLocaleString(),
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                    >
                      <span className="text-xs text-gray-400 w-28 shrink-0">
                        {label}
                      </span>
                      <span className="text-xs font-bold text-gray-800">
                        {value}
                      </span>
                    </div>
                  ))}

                  {/* Dynamic attributes from API */}
                  {product.attributes &&
                    Object.keys(product.attributes).length > 0 &&
                    Object.entries(product.attributes).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                      >
                        <span className="text-xs text-gray-400 w-28 shrink-0 capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs font-bold text-gray-800">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-6">
                  {/* Write Review Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#B42225] text-white rounded-xl text-sm font-semibold hover:bg-[#9e1e20] transition"
                    >
                      <FiStar size={14} />
                      Write a Review
                    </button>
                  </div>

                  {/* Review Form */}
                  {showReviewForm && (
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Write a Review
                      </h3>
                      <form
                        onSubmit={handleSubmitReview}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating
                          </label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                className="focus:outline-none"
                              >
                                {star <= reviewRating ? (
                                  <FaStar
                                    size={24}
                                    className="text-yellow-400"
                                  />
                                ) : (
                                  <FaRegStar
                                    size={24}
                                    className="text-gray-300"
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Review
                          </label>
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B42225] focus:border-transparent"
                            placeholder="Share your experience with this product..."
                            required
                          />
                        </div>

                        {reviewError && (
                          <p className="text-red-500 text-sm">{reviewError}</p>
                        )}

                        {reviewSuccess && (
                          <p className="text-green-500 text-sm">
                            Review submitted successfully!
                          </p>
                        )}

                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={submittingReview}
                            className="px-6 py-2 bg-[#B42225] text-white rounded-xl text-sm font-semibold hover:bg-[#9e1e20] transition disabled:opacity-50"
                          >
                            {submittingReview ? (
                              <FiLoader className="animate-spin" />
                            ) : (
                              "Submit Review"
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowReviewForm(false)}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Reviews List */}
                  {reviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p>
                        No reviews yet. Be the first to review this product!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="p-5 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B42225] to-[#FF8C00] flex items-center justify-center shrink-0">
                              <span className="text-white text-sm font-black">
                                {review.user_name?.[0] || "U"}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-bold text-gray-800">
                                  {review.user_name || "Anonymous"}
                                </p>
                                {review.is_verified && (
                                  <span className="flex items-center gap-1 text-[10px] text-green-600 font-semibold">
                                    <MdVerified size={11} /> Verified Purchase
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <RenderStars
                                  rating={review.rating}
                                  size={11}
                                />
                                <span className="text-[11px] text-gray-400">
                                  {new Date(
                                    review.created_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                                {review.comment}
                              </p>
                              <div className="mt-3">
                                <button
                                  onClick={() => handleHelpful(review.id)}
                                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
                                    helpfulVoted.includes(String(review.id))
                                      ? "bg-green-50 text-green-600"
                                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                  }`}
                                >
                                  <FiThumbsUp size={11} />
                                  Helpful (
                                  {helpfulVoted.includes(String(review.id))
                                    ? (review.helpful_count || 0) + 1
                                    : review.helpful_count || 0}
                                  )
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SUGGESTED PRODUCTS */}
        {suggestedProducts.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 pb-12">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-1 h-7 rounded-full"
                style={{
                  background: "linear-gradient(180deg,#FF8C00,#B42225)",
                }}
              />
              <h2 className="text-xl font-black text-gray-900">
                You May Also Like
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {suggestedProducts.map((item) => {
                const d = item.discount_percentage
                  ? Math.round(item.discount_percentage)
                  : item.product_original_price > item.current_price
                  ? Math.round(
                      ((item.product_original_price - item.current_price) /
                        item.product_original_price) *
                        100
                    )
                  : 0;

                const imgSrc = getValidImageUrl(item.product_images?.[0]);

                return (
                  <Link
                    key={item.id}
                    href={`/product/${item.id}`}
                    className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
                    style={{ boxShadow: "0 2px 14px rgba(0,0,0,0.06)" }}
                  >
                    <div
                      className="relative overflow-hidden"
                      style={{ aspectRatio: "1/1" }}
                    >
                      <Image
                        src={imgSrc}
                        alt={item.product_name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized={imgSrc.startsWith("data:")}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            PLACEHOLDER_IMAGE;
                        }}
                      />
                      {d > 0 && (
                        <div className="absolute top-2 left-2 bg-[#B42225] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                          -{d}%
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">
                        {item.product_name}
                      </p>
                      <p className="text-sm font-black text-[#B42225] mt-1">
                        ₦{item.current_price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

// ─── Return policy list ───────────────────────────────────────
function PolicyList({ product }: { product: Product | null }) {
  const returnDays = product?.return_days ?? 7;
  const returnPolicy = product?.return_policy;

  // If the API returned a custom return policy string, show it
  if (returnPolicy) {
    return (
      <div className="mt-4">
        <p className="text-xs text-gray-600 leading-relaxed">{returnPolicy}</p>
      </div>
    );
  }

  // Otherwise fall back to the default policy list
  return (
    <div className="mt-4 space-y-3">
      {[
        { ok: true,  text: `${returnDays}-day easy returns on eligible items` },
        { ok: true,  text: "Item must be unused and in original packaging" },
        { ok: true,  text: "Refund processed within 3–5 business days" },
        { ok: true,  text: "Free return pickup for defective products" },
        { ok: false, text: "Perishables & opened beauty items non-returnable" },
      ].map(({ ok, text }) => (
        <div
          key={text}
          className={`flex items-start gap-2 text-xs ${ok ? "text-gray-600" : "text-red-500"}`}
        >
          {ok ? (
            <FiCheck size={12} className="text-green-500 mt-0.5 shrink-0" />
          ) : (
            <FiXCircle size={12} className="text-red-400 mt-0.5 shrink-0" />
          )}
          {text}
        </div>
      ))}
    </div>
  );
}

export default ProductDetails;