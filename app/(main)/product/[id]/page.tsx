'use client'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
// src/pages/ProductDetails.jsx
import { products } from "@/data/products";
import { useState, useEffect } from "react";
import {
  FiHeart,
  FiShoppingCart,
  FiTruck,
  FiRefreshCw,
  FiShield,
  FiMapPin,
  FiChevronDown,
  FiChevronUp,
  FiShare2,
  FiArrowLeft,
  FiCheck,
  FiPackage,
  FiClock,
  FiStar,
  FiChevronRight,
  FiAlertCircle,
  FiThumbsUp,
  FiLoader,
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
import { MdVerified, MdLocalShipping, MdStorefront } from "react-icons/md";
import Footer from "@/components/layout/Footer";
import ApiService from "@/services/apiService";

/* ─────────────────────────────────────────────────────────────
   MOCK REVIEW DATA
───────────────────────────────────────────────────────────── */
const mockReviews = [
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

const ratingBreakdown = { 5: 62, 4: 20, 3: 10, 2: 5, 1: 3 };

/* ─────────────────────────────────────────────────────────────
   STAR RENDERER
───────────────────────────────────────────────────────────── */
const RenderStars = ({ rating, size = 14, color = "#F59E0B" }) => {
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
const categoryRoutes = {
  phones: "/phone-deals",
  fashion: "/fashion-deals",
  gaming: "/gaming-deals",
  home: "/home-deals",
  appliances: "/appliances-deals",
  electronics: "/electronic-deals",
  computing: "/computing-deals",
  beauty: "/beauty-deals",
  drinks: "/drink-deals",
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const ProductDetails = () => {
  const { id } = useParams();
  const router = useRouter()
  const navigate = (p: string) => router.push(p)

  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [deliveryOpen, setDeliveryOpen] = useState(true);
  const [returnOpen, setReturnOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [helpfulVoted, setHelpfulVoted] = useState([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);

  // Delivery options state
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [deliveryLoading, setDeliveryLoading] = useState(true);
  const [deliveryError, setDeliveryError] = useState(null);

  const product = products.find((p) => p.id === Number(id));

  // Product weight (default 1kg if not specified)
  const productWeight = product?.weight || 1;
  const totalWeight = productWeight * quantity;

  // Fetch delivery options on component mount and when quantity/cart total changes
  useEffect(() => {
    const fetchDeliveryOptions = async () => {
      setDeliveryLoading(true);
      setDeliveryError(null);

      try {
        const cartTotal = product ? product.price * quantity : 0;

        // Get delivery options from API
        const response = await ApiService.getAvailableDeliveryOptions(
          cartTotal,
          totalWeight,
        );
        console.log("API Service Response:", response);

        // IMPORTANT: Extract the delivery_options array from the response
        let availableOptions = [];

        // Check different possible response structures
        if (
          response?.data?.delivery_options &&
          Array.isArray(response.data.delivery_options)
        ) {
          // Structure: { status: 'success', data: { delivery_options: [...] } }
          availableOptions = response.data.delivery_options;
        } else if (
          response?.delivery_options &&
          Array.isArray(response.delivery_options)
        ) {
          // Structure: { delivery_options: [...] }
          availableOptions = response.delivery_options;
        } else if (response?.data && Array.isArray(response.data)) {
          // Structure: { data: [...] }
          availableOptions = response.data;
        } else if (Array.isArray(response)) {
          // Structure: [...]
          availableOptions = response;
        }

        console.log("Extracted delivery options:", availableOptions);

        // Filter only available options
        const filteredOptions = availableOptions.filter(
          (opt) => opt.is_available === true,
        );

        console.log("Final delivery options:", filteredOptions);
        setDeliveryOptions(filteredOptions);

        // Auto-select first available option
        if (filteredOptions.length > 0 && !selectedDeliveryId) {
          setSelectedDeliveryId(filteredOptions[0].id);
        } else if (filteredOptions.length === 0) {
          // If no options from API, use fallback
          const fallbackOptions = [
            {
              id: "standard",
              delivery_type: "Standard Delivery",
              delivery_cost: 1500,
              estimated_days_min: 2,
              estimated_days_max: 4,
              delivery_description:
                "Delivered to your doorstep via our logistics partners.",
              carrier_name: "Jovo Logistics",
              is_free_delivery: false,
              is_available: true,
            },
            {
              id: "express",
              delivery_type: "Express Delivery",
              delivery_cost: 3500,
              estimated_days_min: 0,
              estimated_days_max: 1,
              delivery_description: "Priority handling. Available within FUTO.",
              carrier_name: "Jovo Express",
              is_free_delivery: false,
              is_available: true,
            },
            {
              id: "pickup",
              delivery_type: "Pickup Station",
              delivery_cost: 0,
              estimated_days_min: 1,
              estimated_days_max: 1,
              delivery_description:
                "Collect at ICT Centre, FUTO. Mon–Sat, 9am–6pm.",
              carrier_name: "Jovo Pickup",
              is_free_delivery: true,
              is_available: true,
            },
          ];
          console.log("Using fallback options");
          setDeliveryOptions(fallbackOptions);
          if (!selectedDeliveryId) {
            setSelectedDeliveryId("standard");
          }
        }
      } catch (err) {
        console.error("Failed to fetch delivery options:", err);
        setDeliveryError(err.message);
      } finally {
        setDeliveryLoading(false);
      }
    };

    if (product) {
      fetchDeliveryOptions();
    }
  }, [product, quantity, totalWeight]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
          <FiPackage size={36} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-700">Product not found</h2>
        <Link href="/"
          className="px-6 py-2.5 bg-[#B42225] text-white rounded-xl text-sm font-semibold"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const categoryPath = categoryRoutes[product.category] || "/";

  const suggestedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 6)
    .concat(
      products
        .filter((p) => p.id !== product.id && p.category !== product.category)
        .slice(0, 3),
    )
    .slice(0, 6);

  const avgRating = product.rating || 4.5;
  const totalReviews = product.reviews || mockReviews.length;

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleHelpful = (reviewId) => {
    if (!helpfulVoted.includes(reviewId)) {
      setHelpfulVoted([...helpfulVoted, reviewId]);
    }
  };

  const handleCheckPincode = () => {
    if (pincode.trim().length >= 3) setPincodeChecked(true);
  };

  // Helper functions for delivery options
  const formatDeliveryCost = (option) => {
    if (option.is_free_delivery) return "Free";
    return `₦${Number(option.delivery_cost || 0).toLocaleString()}`;
  };

  const formatEstimatedDays = (option) => {
    const min = option.estimated_days_min || 2;
    const max = option.estimated_days_max || 5;
    if (min === max) return `${min} business day${min > 1 ? "s" : ""}`;
    return `${min} – ${max} business days`;
  };

  const getDeliveryIcon = (option) => {
    const type = (option.delivery_type || "").toLowerCase();
    if (type.includes("express") || type.includes("same day"))
      return <FiClock size={20} />;
    if (type.includes("pickup") || type.includes("store"))
      return <MdStorefront size={20} />;
    return <FiTruck size={20} />;
  };

  const isPickupOption = (option) => {
    const type = (option.delivery_type || "").toLowerCase();
    return (
      type.includes("pickup") ||
      type.includes("store") ||
      type.includes("collection")
    );
  };

  return (
    <>
      <div className="min-h-screen" style={{ background: "#F7F8FC" }}>
        {/* BREADCRUMB */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-5 pb-2">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/" className="hover:text-[#B42225] transition-colors">
              Home
            </Link>
            <FiChevronRight size={12} />
            <Link href={categoryPath}
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
              <div className="relative bg-gray-50 lg:rounded-tl-3xl lg:rounded-bl-3xl min-h-95 md:min-h-130 flex items-center justify-center p-6 md:p-10 overflow-hidden">
                {/* Background pattern */}
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

                {/* Wishlist + Share buttons */}
                <div className="absolute top-5 right-5 z-40 flex flex-col gap-2">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    {isWishlisted ? (
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

                {/* Main image - NOW COVERS FULL AREA */}
                <img
                  src={product.image}
                  alt={product.name}
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

                    <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm border-2 border-gray-200 text-gray-700 hover:border-[#B42225] hover:text-[#B42225] transition-all duration-200">
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

        {/* DELIVERY & SHIPPING SECTION */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Delivery Options */}
            <div
              className="md:col-span-2 bg-white rounded-3xl p-6"
              style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.06)" }}
            >
              <button
                className="w-full flex items-center justify-between"
                onClick={() => setDeliveryOpen(!deliveryOpen)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#B42225]/10 flex items-center justify-center">
                    <MdLocalShipping size={20} className="text-[#B42225]" />
                  </div>
                  <h3 className="text-base font-black text-gray-900">
                    Delivery Options
                  </h3>
                </div>
                {deliveryOpen ? (
                  <FiChevronUp size={18} className="text-gray-400" />
                ) : (
                  <FiChevronDown size={18} className="text-gray-400" />
                )}
              </button>

              {deliveryOpen && (
                <div className="mt-5 space-y-3">
                  {/* Check delivery area */}
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 overflow-hidden">
                      <FiMapPin size={15} className="text-gray-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Enter area in FUTO e.g. Eziobodo, Ihiagwa"
                        className="flex-1 py-2.5 text-sm outline-none bg-transparent placeholder-gray-400"
                        value={pincode}
                        onChange={(e) => {
                          setPincode(e.target.value);
                          setPincodeChecked(false);
                        }}
                      />
                    </div>
                    <button
                      onClick={handleCheckPincode}
                      className="px-4 py-2.5 bg-[#B42225] text-white text-sm font-bold rounded-xl hover:bg-[#9e1e20] transition shrink-0"
                    >
                      Check
                    </button>
                  </div>

                  {pincodeChecked && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-xl text-sm">
                      <FiCheck size={14} />
                      <span className="font-medium">
                        Delivery available to <strong>{pincode}</strong>!
                      </span>
                    </div>
                  )}

                  {/* Loading state */}
                  {deliveryLoading && (
                    <div className="flex items-center justify-center py-8">
                      <FiLoader
                        size={24}
                        className="animate-spin text-[#B42225]"
                      />
                      <span className="ml-2 text-sm text-gray-500">
                        Loading delivery options...
                      </span>
                    </div>
                  )}

                  {/* Error state */}
                  {deliveryError && !deliveryLoading && (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-3 rounded-xl text-sm">
                      <FiAlertCircle size={16} />
                      <span>
                        Using default delivery options. ({deliveryError})
                      </span>
                    </div>
                  )}

                  {/* Delivery options list */}
                  {!deliveryLoading && deliveryOptions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FiTruck
                        size={32}
                        className="mx-auto mb-2 text-gray-300"
                      />
                      <p className="text-sm">
                        No delivery options available for this location.
                      </p>
                    </div>
                  )}

                  {/* Render delivery options */}
                  {!deliveryLoading &&
                    deliveryOptions.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedDeliveryId(opt.id)}
                        className={`flex gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                          selectedDeliveryId === opt.id
                            ? "border-[#B42225] bg-[#B42225]/3"
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            selectedDeliveryId === opt.id
                              ? "bg-[#B42225] text-white"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {getDeliveryIcon(opt)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold text-gray-800">
                              {opt.delivery_type}
                            </p>
                            <span
                              className={`text-sm font-black shrink-0 ${opt.is_free_delivery ? "text-green-600" : "text-gray-800"}`}
                            >
                              {formatDeliveryCost(opt)}
                            </span>
                          </div>
                          <p className="text-xs text-[#B42225] font-semibold mt-0.5">
                            ⏱ {formatEstimatedDays(opt)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {opt.delivery_description ||
                              "Delivery to your doorstep"}
                          </p>

                          {opt.carrier_name && (
                            <p className="text-xs text-gray-400 mt-1">
                              📦 {opt.carrier_name}
                            </p>
                          )}

                          {/* Pickup station details */}
                          {isPickupOption(opt) &&
                            selectedDeliveryId === opt.id && (
                              <div className="mt-3 bg-gray-50 rounded-xl p-3 space-y-1.5">
                                <p className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                                  <MdStorefront
                                    size={13}
                                    className="text-[#B42225]"
                                  />
                                  Pickup Location: ICT Centre, FUTO
                                </p>
                                <p className="text-xs text-gray-500 flex items-start gap-1.5">
                                  <FiClock
                                    size={11}
                                    className="mt-0.5 shrink-0 text-gray-400"
                                  />
                                  Mon – Sat: 9:00 AM – 6:00 PM
                                </p>
                                <p className="text-xs text-gray-500">
                                  Contact: support@jovomart.com
                                </p>
                              </div>
                            )}
                        </div>
                        {selectedDeliveryId === opt.id && (
                          <div className="shrink-0 w-5 h-5 rounded-full bg-[#B42225] flex items-center justify-center self-start mt-0.5">
                            <FiCheck size={11} className="text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Return & Policy Cards */}
            <div className="flex flex-col gap-4">
              {/* Return Policy */}
              <div
                className="bg-white rounded-3xl p-5"
                style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.06)" }}
              >
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
                    <FiChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <FiChevronDown size={16} className="text-gray-400" />
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

              {/* Warranty */}
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
                    { label: "Warranty", value: product.warranty || "1 Year" },
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

              {/* Need Help */}
              <div className="bg-linear-to-br from-[#B42225] to-[#7c1315] rounded-3xl p-5 text-white">
                <FiAlertCircle size={20} className="mb-2 opacity-80" />
                <h3 className="text-sm font-black mb-1">Need Help?</h3>
                <p className="text-xs opacity-70 mb-3">
                  Our support team is available Mon–Sat, 9am–6pm.
                </p>
                <a
                  href="tel:+2348000000000"
                  className="block text-center bg-white/20 hover:bg-white/30 transition text-xs font-bold py-2.5 rounded-xl"
                >
                  📞 Contact Support
                </a>
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
            {/* Tab Headers */}
            <div className="flex border-b border-gray-100 overflow-x-auto">
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
              {/* Description Tab */}
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

              {/* Specifications Tab */}
              {activeTab === "specs" && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { label: "Brand", value: product.brand || "—" },
                    {
                      label: "Category",
                      value: product.category
                        ? product.category.charAt(0).toUpperCase() +
                          product.category.slice(1)
                        : "—",
                    },
                    { label: "Condition", value: "Brand New" },
                    { label: "Warranty", value: product.warranty || "1 Year" },
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

              {/* Reviews Tab */}
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
                  onClick={() => navigate(`/product/${item.id}`)}
                  className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
                  style={{ boxShadow: "0 2px 14px rgba(0,0,0,0.06)" }}
                >
                  <div
                    className="relative overflow-hidden"
                    style={{ aspectRatio: "1/1" }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
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
