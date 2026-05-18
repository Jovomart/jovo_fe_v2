"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { products } from "@/data/products";
import { useState } from "react";
import { useWishlist } from "@/context/WishlistContext";
import {
  FiHeart,
  FiShoppingCart,
  FiRefreshCw,
  FiShield,
  FiShare2,
  FiArrowLeft,
  FiCheck,
  FiPackage,
  FiStar,
  FiChevronRight,
  FiThumbsUp,
} from "react-icons/fi";
import {
  FaHeart,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaCopy,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  stock: number;
  category: string;
  rating: number;
  reviews: number;
  description: string;
  image: string;
  brand?: string;
  weight?: number;
  warranty?: string;
}

interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  helpful: number;
}

/* ─────────────────────────────────────────────────────────────
   MOCK REVIEW DATA
───────────────────────────────────────────────────────────── */
const mockReviews: Review[] = [
  {
    id: 1,
    name: "Temi A.",
    rating: 5,
    date: "2 days ago",
    comment:
      "Absolutely love this product! Quality is top-notch and delivery was fast. Will definitely buy again.",
    verified: true,
    helpful: 24,
  },
  {
    id: 2,
    name: "Kola B.",
    rating: 4,
    date: "1 week ago",
    comment:
      "Very good product. Matches the description exactly. Only minor thing is the packaging could be better.",
    verified: true,
    helpful: 11,
  },
  {
    id: 3,
    name: "Amara O.",
    rating: 5,
    date: "2 weeks ago",
    comment:
      "Outstanding quality! I was skeptical ordering online but this exceeded my expectations completely.",
    verified: false,
    helpful: 8,
  },
  {
    id: 4,
    name: "Chidi N.",
    rating: 3,
    date: "3 weeks ago",
    comment:
      "Decent product for the price. Delivery took a bit longer than expected but product is okay.",
    verified: true,
    helpful: 5,
  },
  {
    id: 5,
    name: "Funmi S.",
    rating: 5,
    date: "1 month ago",
    comment:
      "Best purchase I've made this year! The quality is incredible and it works exactly as described.",
    verified: true,
    helpful: 19,
  },
];

const ratingBreakdown: Record<number, number> = {
  5: 62,
  4: 20,
  3: 10,
  2: 5,
  1: 3,
};

/* ─────────────────────────────────────────────────────────────
   STAR RENDERER
───────────────────────────────────────────────────────────── */
const RenderStars = ({
  rating,
  size = 14,
  color = "#F59E0B",
}: {
  rating: number;
  size?: number;
  color?: string;
}) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        if (rating >= s)
          return <FaStar key={s} size={size} style={{ color }} />;
        if (rating >= s - 0.5)
          return <FaStarHalfAlt key={s} size={size} style={{ color }} />;
        return <FaRegStar key={s} size={size} style={{ color: "#D1D5DB" }} />;
      })}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   CATEGORY → ROUTE MAP
───────────────────────────────────────────────────────────── */
const categoryRoutes: Record<string, string> = {
  // existing
  phones: "/phone-deals",
  fashion: "/fashion-deals",
  gaming: "/gaming-deals",
  home: "/home-deals",
  appliances: "/appliances-deals",
  electronics: "/electronic-deals",
  computing: "/computing-deals",
  beauty: "/beauty-deals",
  drinks: "/drink-deals",
  // added
  "flash-sales": "/flash-sales",
  "top-sellers": "/top-sellers",
  sponsored: "/sponsored",
  limited: "/limited",
  "tv-audio": "/tv-audio",
  groceries: "/groceries",
  perishable: "/perishable",
  "personal-care": "/personal-care",
  "cleaning-hygiene": "/cleaning-hygiene",
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const ProductDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState<number>(1);
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const [activeTab, setActiveTab] = useState<string>("description");
  const [returnOpen, setReturnOpen] = useState<boolean>(false);
  const [shareOpen, setShareOpen] = useState<boolean>(false);
  const [helpfulVoted, setHelpfulVoted] = useState<number[]>([]);
  const [addedToCart, setAddedToCart] = useState<boolean>(false);

  const product = products.find((p: Product) => p.id === Number(id)) as
    | Product
    | undefined;

  const wishlisted = isWishlisted(product?.id ?? -1);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
          <FiPackage size={36} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-700">Product not found</h2>
        <Link
          href="/shop"
          className="px-6 py-2.5 bg-[#B42225] text-white rounded-xl text-sm font-semibold"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const categoryPath = categoryRoutes[product.category] || "/";

  const suggestedProducts: Product[] = products
    .filter(
      (p: Product) => p.id !== product.id && p.category === product.category,
    )
    .slice(0, 6)
    .concat(
      products
        .filter(
          (p: Product) =>
            p.id !== product.id && p.category !== product.category,
        )
        .slice(0, 3),
    )
    .slice(0, 6);

  const avgRating = product.rating || 4.5;
  const totalReviews = product.reviews || mockReviews.length;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push("/cart");
  };

  const handleHelpful = (reviewId: number) => {
    if (!helpfulVoted.includes(reviewId)) {
      setHelpfulVoted([...helpfulVoted, reviewId]);
    }
  };

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
            <Link
              href={categoryPath}
              className="hover:text-[#B42225] transition-colors capitalize"
            >
              {product.category}
            </Link>
            <FiChevronRight size={12} />
            <span className="text-gray-600 truncate max-w-50">
              {product.name}
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
              {/* ── LEFT: Image Panel ── */}
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

                {/* Discount badge */}
                {discount > 0 && (
                  <div
                    className="absolute top-5 left-5 z-20 flex flex-col items-center justify-center w-14 h-14 rounded-full text-white font-black text-xs"
                    style={{
                      background: "linear-gradient(135deg,#B42225,#FF4500)",
                    }}
                  >
                    -{discount}%
                  </div>
                )}

                <div className="absolute top-5 right-5 z-40 flex flex-col gap-2">
                  <button
                    onClick={() =>
                      wishlisted
                        ? removeFromWishlist(product.id)
                        : addToWishlist(product)
                    }
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
                          style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.15)" }}
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
                            },
                            {
                              icon: (
                                <FaFacebook
                                  className="text-blue-600"
                                  size={16}
                                />
                              ),
                              label: "Facebook",
                            },
                            {
                              icon: (
                                <FaTwitter className="text-sky-500" size={16} />
                              ),
                              label: "Twitter",
                            },
                            {
                              icon: (
                                <FaCopy className="text-gray-500" size={16} />
                              ),
                              label: "Copy Link",
                            },
                          ].map(({ icon, label }) => (
                            <button
                              key={label}
                              onClick={() => setShareOpen(false)}
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

                <Image
                  src={product.image}
                  alt={product.name}
                  sizes="(max-width: 1023px) 100vw, 50vw"
                  fill
                  className="w-full h-full object-cover absolute inset-0"
                />
              </div>

              {/* RIGHT: Product Info */}
              <div className="p-6 md:p-8 lg:p-10 flex flex-col gap-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#B42225] uppercase tracking-widest">
                    {product.brand || "Jovo Verified"}
                  </span>
                  <MdVerified className="text-[#B42225]" size={14} />
                  <span className="ml-auto text-xs text-gray-400 capitalize bg-gray-100 px-2.5 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>

                <h1
                  className="text-2xl md:text-3xl font-black text-gray-900 leading-tight"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  {product.name}
                </h1>

                <div className="flex items-center gap-3 flex-wrap">
                  <RenderStars rating={avgRating} size={16} />
                  <span className="text-sm font-bold text-gray-800">
                    {avgRating}
                  </span>
                  <span className="text-sm text-gray-400">
                    ({totalReviews} reviews)
                  </span>
                  <span className="text-xs text-green-600 font-semibold bg-green-50 px-2.5 py-1 rounded-full">
                    ✓ In Stock
                  </span>
                </div>

                <div className="flex items-end gap-4 py-4 border-y border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Price</p>
                    <span className="text-4xl font-black text-gray-900">
                      ₦{product.price.toLocaleString()}
                    </span>
                  </div>
                  {product.oldPrice && (
                    <div className="mb-1">
                      <span className="text-lg text-gray-400 line-through">
                        ₦{product.oldPrice.toLocaleString()}
                      </span>
                      <p className="text-xs text-green-600 font-bold">
                        You save ₦
                        {(product.oldPrice - product.price).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Quantity</p>
                    <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition text-lg font-bold"
                      >
                        −
                      </button>
                      <span className="w-12 text-center text-sm font-bold text-gray-800">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition text-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-2 mt-5">
                    <button
                      onClick={handleAddToCart}
                      className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 ${
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
                      {addedToCart ? (
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
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm border-2 border-gray-200 text-gray-700 hover:border-[#B42225] hover:text-[#B42225] transition-all duration-200"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    {
                      icon: <FiShield size={16} className="text-green-500" />,
                      label: "Secure Payment",
                      sub: "100% Protected",
                    },
                    {
                      icon: <FiRefreshCw size={16} className="text-blue-500" />,
                      label: "Easy Returns",
                      sub: "7-day policy",
                    },
                    {
                      icon: <MdVerified size={16} className="text-[#B42225]" />,
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

        {/* RETURN & POLICY CARDS - Desktop always visible, mobile collapsible */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl">
            {/* Return Policy - Desktop always open, mobile collapsible */}
            <div
              className="bg-white rounded-3xl p-5"
              style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.06)" }}
            >
              {/* Mobile version - collapsible */}
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
                  {returnOpen ? (
                    <FiChevronRight
                      size={16}
                      className="text-gray-400 rotate-90"
                    />
                  ) : (
                    <FiChevronRight size={16} className="text-gray-400" />
                  )}
                </button>
                {returnOpen && (
                  <div className="mt-4 space-y-3">
                    {[
                      {
                        icon: "✓",
                        text: "7-day easy returns on eligible items",
                      },
                      {
                        icon: "✓",
                        text: "Item must be unused and in original packaging",
                      },
                      {
                        icon: "✓",
                        text: "Refund processed within 3–5 business days",
                      },
                      {
                        icon: "✓",
                        text: "Free return pickup for defective products",
                      },
                      {
                        icon: "✗",
                        text: "Perishables & opened beauty items non-returnable",
                      },
                    ].map(({ icon, text }) => (
                      <div
                        key={text}
                        className={`flex items-start gap-2 text-xs ${icon === "✗" ? "text-red-500" : "text-gray-600"}`}
                      >
                        <span
                          className={`font-bold shrink-0 ${icon === "✗" ? "text-red-400" : "text-green-500"}`}
                        >
                          {icon}
                        </span>
                        {text}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop version - always visible */}
              <div className="hidden md:block">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <FiRefreshCw size={18} className="text-blue-500" />
                  </div>
                  <h3 className="text-sm font-black text-gray-900">
                    Return Policy
                  </h3>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: "✓", text: "7-day easy returns on eligible items" },
                    {
                      icon: "✓",
                      text: "Item must be unused and in original packaging",
                    },
                    {
                      icon: "✓",
                      text: "Refund processed within 3–5 business days",
                    },
                    {
                      icon: "✓",
                      text: "Free return pickup for defective products",
                    },
                    {
                      icon: "✗",
                      text: "Perishables & opened beauty items non-returnable",
                    },
                  ].map(({ icon, text }) => (
                    <div
                      key={text}
                      className={`flex items-start gap-2 text-xs ${icon === "✗" ? "text-red-500" : "text-gray-600"}`}
                    >
                      <span
                        className={`font-bold shrink-0 ${icon === "✗" ? "text-red-400" : "text-green-500"}`}
                      >
                        {icon}
                      </span>
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Warranty - Always visible (same on mobile and desktop) */}
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
                  {
                    label: "Warranty",
                    value: (product as any).warranty || "1 Year",
                  },
                  { label: "Authenticity", value: "100% Genuine" },
                  { label: "Payment", value: "SSL Secured" },
                  { label: "Seller", value: "Jovo Verified" },
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
          </div>
        </div>

        {/* TABS: Description / Specs / Reviews */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div
            className="bg-white rounded-3xl overflow-hidden"
            style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.06)" }}
          >
            <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
              {[
                { key: "description", label: "Description" },
                { key: "specs", label: "Specifications" },
                { key: "reviews", label: `Reviews (${totalReviews})` },
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
                    {product.description ||
                      "This premium product has been carefully selected and verified by the Jovo team for quality and authenticity. It comes with all original accessories and a manufacturer's warranty."}
                  </p>
                  <div className="mt-6 grid sm:grid-cols-2 gap-3">
                    {[
                      "Original manufacturer product",
                      "Quality verified by Jovo team",
                      "Includes all original accessories",
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
                    {
                      label: "Category",
                      value:
                        product.category.charAt(0).toUpperCase() +
                        product.category.slice(1),
                    },
                    { label: "Condition", value: "Brand New" },
                    {
                      label: "Warranty",
                      value: (product as any).warranty || "1 Year",
                    },
                    {
                      label: "SKU",
                      value: `JVO-${product.id}-${product.category?.toUpperCase().slice(0, 3)}`,
                    },
                    { label: "In Stock", value: "Yes — Available" },
                    { label: "Seller", value: "Jovo Official Store" },
                    { label: "Ship From", value: "ICT Centre, FUTO" },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                    >
                      <span className="text-xs text-gray-400 w-24 shrink-0">
                        {label}
                      </span>
                      <span className="text-xs font-bold text-gray-800">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-6 p-6 bg-gray-50 rounded-2xl">
                    <div className="flex flex-col items-center justify-center gap-1 shrink-0">
                      <span className="text-5xl font-black text-gray-900">
                        {avgRating}
                      </span>
                      <RenderStars rating={avgRating} size={18} />
                      <span className="text-xs text-gray-400 mt-1">
                        {totalReviews} reviews
                      </span>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-3">
                            {star}
                          </span>
                          <FaStar
                            size={11}
                            className="text-yellow-400 shrink-0"
                          />
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-yellow-400 transition-all duration-700"
                              style={{
                                width: `${ratingBreakdown[star] || 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-8 text-right">
                            {ratingBreakdown[star]}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {mockReviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-5 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#B42225] to-[#FF8C00] flex items-center justify-center shrink-0">
                              <span className="text-white text-sm font-black">
                                {review.name[0]}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-gray-800">
                                  {review.name}
                                </p>
                                {review.verified && (
                                  <span className="flex items-center gap-1 text-[10px] text-green-600 font-semibold">
                                    <MdVerified size={11} /> Verified
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <RenderStars rating={review.rating} size={11} />
                                <span className="text-[11px] text-gray-400">
                                  {review.date}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                          {review.comment}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => handleHelpful(review.id)}
                            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
                              helpfulVoted.includes(review.id)
                                ? "bg-green-50 text-green-600"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            <FiThumbsUp size={11} />
                            Helpful (
                            {helpfulVoted.includes(review.id)
                              ? review.helpful + 1
                              : review.helpful}
                            )
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SUGGESTED PRODUCTS */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 pb-12">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-1 h-7 rounded-full"
              style={{ background: "linear-gradient(180deg,#FF8C00,#B42225)" }}
            />
            <h2 className="text-xl font-black text-gray-900">
              You May Also Like
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {suggestedProducts.map((item) => {
              const itemDiscount = item.oldPrice
                ? Math.round(
                    ((item.oldPrice - item.price) / item.oldPrice) * 100,
                  )
                : 0;
              return (
                <div
                  key={item.id}
                  onClick={() => router.push(`/product/${item.id}`)}
                  className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
                  style={{ boxShadow: "0 2px 14px rgba(0,0,0,0.06)" }}
                >
                  <div
                    className="relative overflow-hidden"
                    style={{ aspectRatio: "1/1" }}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 20vw"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-108"
                    />
                    {itemDiscount > 0 && (
                      <div className="absolute top-2 left-2 bg-[#B42225] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                        -{itemDiscount}%
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">
                      {item.name}
                    </p>
                    <p className="text-sm font-black text-[#B42225] mt-1">
                      ₦{item.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetails;
