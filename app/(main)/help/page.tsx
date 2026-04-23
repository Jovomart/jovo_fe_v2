'use client'
import Link from 'next/link'  // ✅ Added missing import
import { useRouter } from 'next/navigation'
import { useState, useMemo, useRef, useEffect } from "react";
import {
  FiSearch,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiChevronRight,
  FiMail,
  FiPhone,
  FiMessageCircle,
  FiPackage,
  FiTruck,
  FiRefreshCw,
  FiShield,
  FiCreditCard,
  FiUser,
  FiStar,
  FiCheck,
  FiClock,
  FiAlertCircle,
  FiArrowRight,
  FiZap,
  FiSmile,
  FiBookOpen,
  FiHash,
  FiBell,
} from "react-icons/fi";
import { FaWhatsapp, FaBoxOpen, FaRegSmile, FaHeadset, FaRegLightbulb } from "react-icons/fa";
import {
  MdOutlineLocalShipping,
  MdPayment,
  MdVerified,
  MdStorefront,
  MdOutlineSecurity,
  MdOutlineAccountCircle,
} from "react-icons/md";
import { GiMagnifyingGlass } from "react-icons/gi";
import Footer from "@/components/layout/Footer";

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const faqCategories = [
  {
    key: "orders",
    label: "Orders & Checkout",
    icon: <FaBoxOpen size={18} />,
    color: "#B42225",
    faqs: [
      {
        q: "How do I place an order on Jovo?",
        a: "Browse any category or search for a product, then click 'Add to Cart'. When ready, go to your cart, review your items, select a delivery option, confirm your address, and complete payment. You'll receive an order confirmation immediately.",
      },
      {
        q: "Can I edit or cancel an order after placing it?",
        a: "Yes — but only before the order is processed by the seller. Go to Profile → My Orders, find the order, and click 'Cancel' or 'Edit'. Once the order is marked as 'Processing' or 'Shipped', cancellation is no longer possible and you would need to initiate a return.",
      },
      {
        q: "Why was my order cancelled automatically?",
        a: "Orders may be auto-cancelled if payment is not confirmed within 24 hours, the item goes out of stock, or there's a verification issue with your account. You'll always receive a notification with the reason.",
      },
      {
        q: "Can I add items to an existing order?",
        a: "Unfortunately, you cannot add items to an order that has already been placed. Please place a new order for additional items.",
      },
      {
        q: "What happens if a seller runs out of stock after I order?",
        a: "If stock is unavailable after your order is confirmed, you will receive a full refund within 3–5 business days and a notification explaining the situation. We apologise for any inconvenience.",
      },
    ],
  },
  {
    key: "delivery",
    label: "Delivery & Shipping",
    icon: <MdOutlineLocalShipping size={18} />,
    color: "#0891B2",
    faqs: [
      {
        q: "How do I track my order?",
        a: "Go to Profile → My Orders and select your order. You'll find real-time tracking status, estimated delivery date, and courier information. You can also check your email for tracking updates sent automatically.",
      },
      {
        q: "What delivery options does Jovo offer?",
        a: "Jovo offers three delivery methods: Standard Delivery (2–4 business days, ₦1,500), Express Delivery (same or next day within select cities, ₦3,500), and Free Pickup at our ICT Centre, FUTO (ready within 24 hours, no charge).",
      },
      {
        q: "What areas does Jovo deliver to?",
        a: "Jovo delivers to all states in Nigeria. Delivery timelines and fees vary by location. Within Owerri and Port Harcourt, same-day delivery may be available. You can check coverage when entering your address at checkout.",
      },
      {
        q: "Can I change my delivery address after ordering?",
        a: "You can update your address before the order is dispatched. Visit My Orders, select your order, and click 'Change Address'. Once the order has been handed to a courier, address changes are no longer possible.",
      },
      {
        q: "What do I do if my order hasn't arrived on time?",
        a: "First, check the tracking page for the latest update. If your estimated delivery date has passed with no update, contact our support team via WhatsApp or the live chat with your order number and we'll investigate within 24 hours.",
      },
    ],
  },
  {
    key: "returns",
    label: "Returns & Refunds",
    icon: <FiRefreshCw size={18} />,
    color: "#059669",
    faqs: [
      {
        q: "How do I return a product?",
        a: "Go to Profile → My Orders, select the item, and click 'Request Return'. Fill in the reason, upload a photo if needed (for damaged items), and submit. Our team will approve within 24 hours and arrange a free pickup for eligible items.",
      },
      {
        q: "What is Jovo's return policy?",
        a: "You can return eligible items within 7 days of delivery. Items must be unused, in their original packaging with all accessories. Perishables, opened beauty items, and customised products are non-returnable unless defective.",
      },
      {
        q: "How long does a refund take?",
        a: "Refunds are processed within 3–5 business days once we receive and inspect the returned item. The amount is returned to your original payment method — bank transfer, card, or Jovo wallet.",
      },
      {
        q: "What if I receive a damaged or wrong item?",
        a: "Take a photo immediately and contact support within 48 hours. Go to My Orders → Report Issue. For defective or wrong items, we offer a free replacement or full refund, no return required in most cases.",
      },
      {
        q: "Can I exchange a product instead of returning it?",
        a: "Currently, Jovo does not offer direct exchanges. To swap a product, return the original item and place a new order. Once your refund is processed, you'll receive the funds to complete your new purchase.",
      },
    ],
  },
  {
    key: "payment",
    label: "Payments & Security",
    icon: <MdPayment size={18} />,
    color: "#7C3AED",
    faqs: [
      {
        q: "What payment methods does Jovo accept?",
        a: "Jovo accepts debit and credit cards (Visa, Mastercard, Verve), bank transfers, USSD payments, and Jovo Wallet. All payments are secured by SSL encryption and processed through verified payment gateways.",
      },
      {
        q: "Is my payment information safe?",
        a: "Absolutely. Jovo never stores your full card details. All transactions are processed through PCI-DSS compliant payment partners. Look for the padlock icon in your browser to confirm the connection is secure.",
      },
      {
        q: "I was charged but my order wasn't placed. What do I do?",
        a: "This can happen due to network issues. Check your order history first — the order may have gone through. If no order appears, the charge will automatically reverse within 24–48 hours. Contact support if it persists beyond 48 hours.",
      },
      {
        q: "How does the Jovo Wallet work?",
        a: "The Jovo Wallet is a prepaid balance stored on your account. You can fund it via bank transfer and use it for instant, fee-free checkout. Refunds can also be deposited into your wallet for faster access.",
      },
      {
        q: "Can I pay on delivery?",
        a: "Pay-on-delivery is available in select areas for eligible orders. This option will appear at checkout if available for your location. Note that express delivery orders do not support pay-on-delivery.",
      },
    ],
  },
  {
    key: "account",
    label: "Account & Profile",
    icon: <MdOutlineAccountCircle size={18} />,
    color: "#D97706",
    faqs: [
      {
        q: "How do I create a Jovo account?",
        a: "Click 'Create Account' on the homepage or app. Enter your name, email, and password, or sign up with Google for instant access. Verify your email to complete registration and unlock all features.",
      },
      {
        q: "I forgot my password. How do I reset it?",
        a: "On the login page, click 'Forgot Password'. Enter your registered email and we'll send a reset link. The link expires after 30 minutes. If you don't see the email, check your spam folder.",
      },
      {
        q: "How do I update my personal information?",
        a: "Go to Profile → Settings. From there you can update your name, phone number, address book, and profile photo. Email changes require re-verification for security.",
      },
      {
        q: "Can I have multiple delivery addresses saved?",
        a: "Yes! Go to Profile → Address Book to save multiple addresses. At checkout, simply select the address you want to use. You can save up to 5 addresses on your account.",
      },
      {
        q: "How do I delete my Jovo account?",
        a: "Go to Settings → Account → Delete Account. Please note this is permanent and will erase all your data including order history. Outstanding orders must be completed or cancelled before deletion.",
      },
    ],
  },
  {
    key: "sellers",
    label: "Selling on Jovo",
    icon: <MdStorefront size={18} />,
    color: "#9333EA",
    faqs: [
      {
        q: "How do I become a seller on Jovo?",
        a: "Visit the 'Become a Seller' page and complete the vendor registration form with your business details, passport, and bank account information. Once verified (usually within 48 hours), you can start listing products.",
      },
      {
        q: "What fees does Jovo charge sellers?",
        a: "Jovo charges a small commission per sale (typically 5–10% depending on category). There are no listing fees or monthly charges. You only pay when you make a sale.",
      },
      {
        q: "When do sellers get paid?",
        a: "Payments are disbursed to your registered bank account every Monday for the previous week's completed orders. You can view your earnings breakdown in the Seller Dashboard.",
      },
      {
        q: "Can students sell on Jovo from campus?",
        a: "Absolutely! Jovo's Student Ambassador and Campus Seller programme lets FUTO students list and sell products directly. Pickup can be arranged through the ICT Centre. Contact us to join the campus seller programme.",
      },
    ],
  },
];

const allFaqs = faqCategories.flatMap((cat) =>
  cat.faqs.map((f) => ({
    ...f,
    category: cat.key,
    categoryLabel: cat.label,
    color: cat.color,
  })),
);

const supportChannels = [
  {
    icon: <FaWhatsapp size={22} />,
    label: "WhatsApp Chat",
    sub: "Fastest response",
    detail: "Chat with us directly",
    action: "Chat Now",
    color: "#25D366",
    href: "https://wa.me/2348000000000",
  },
  {
    icon: <FiMail size={22} />,
    label: "Email Support",
    sub: "Within 24 hours",
    detail: "support@jovo.ng",
    action: "Send Email",
    color: "#B42225",
    href: "mailto:support@jovo.ng",
  },
  {
    icon: <FiPhone size={22} />,
    label: "Phone Support",
    sub: "Mon–Sat, 9am–6pm",
    detail: "+234 800 JOVO SHOP",
    action: "Call Now",
    color: "#0891B2",
    href: "tel:+2348000000000",
  },
  {
    icon: <FiMessageCircle size={22} />,
    label: "Live Chat",
    sub: "Mon–Fri, 8am–8pm",
    detail: "In-app chat available",
    action: "Open Chat",
    color: "#7C3AED",
    href: "#",
  },
];

const quickLinks = [
  {
    icon: <FiPackage size={16} />,
    label: "Track My Order",
    href: "/orders",  // Changed from 'to' to 'href'
    color: "#0891B2",
  },
  {
    icon: <FiRefreshCw size={16} />,
    label: "Start a Return",
    href: "/orders",  // Changed from 'to' to 'href'
    color: "#059669",
  },
  {
    icon: <FiCreditCard size={16} />,
    label: "Payment Issues",
    href: "/profile",  // Changed from 'to' to 'href'
    color: "#7C3AED",
  },
  {
    icon: <FiUser size={16} />,
    label: "My Account",
    href: "/profile",  // Changed from 'to' to 'href'
    color: "#D97706",
  },
  {
    icon: <FiShield size={16} />,
    label: "Safety & Security",
    href: "/help",  // Changed from 'to' to 'href'
    color: "#B42225",
  },
  {
    icon: <MdStorefront size={16} />,
    label: "Become a Seller",
    href: "/become-seller",  // Changed from 'to' to 'href'
    color: "#9333EA",
  },
];

const stats = [
  { value: "< 2hrs", label: "Avg. response time" },
  { value: "98%", label: "Issues resolved" },
  { value: "24/7", label: "Emergency support" },
  { value: "50K+", label: "Happy customers" },
];

/* ─────────────────────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────────────────────── */

const FAQItem = ({ faq, index, isOpen, onToggle, showCategory }) => (
  <div
    className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
      isOpen
        ? "border-[#B42225]/30 shadow-sm"
        : "border-gray-100 hover:border-gray-200"
    }`}
  >
    <button
      onClick={() => onToggle(index)}
      className={`w-full flex items-start justify-between gap-4 px-5 py-4 text-left transition-colors ${
        isOpen ? "bg-[#B42225]/3" : "bg-white hover:bg-gray-50"
      }`}
    >
      <div className="flex-1">
        {showCategory && (
          <span
            className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white mb-2 inline-block"
            style={{ background: faq.color }}
          >
            {faq.categoryLabel}
          </span>
        )}
        <p
          className={`text-sm font-bold leading-snug ${isOpen ? "text-[#B42225]" : "text-gray-800"}`}
        >
          {faq.q}
        </p>
      </div>
      <div
        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
          isOpen ? "bg-[#B42225] text-white" : "bg-gray-100 text-gray-500"
        }`}
      >
        {isOpen ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
      </div>
    </button>
    {isOpen && (
      <div className="px-5 pb-5 bg-white">
        <div className="w-8 h-0.5 rounded-full bg-[#B42225] mb-3" />
        <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
      </div>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const Help = () => {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [activeCategory, setActiveCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formSent, setFormSent] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setSearchFocused(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleToggle = (index) => setOpenFAQ(openFAQ === index ? null : index);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return allFaqs.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const displayFaqs = useMemo(() => {
    if (searchQuery.trim()) return searchResults;
    if (activeCategory === "all") return allFaqs;
    return allFaqs.filter((f) => f.category === activeCategory);
  }, [activeCategory, searchQuery, searchResults]);

  const handleSend = (e) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => setFormSent(false), 4000);
    setContactForm({ name: "", email: "", subject: "", message: "" });
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.35s ease; }
      `}</style>

      <div className="min-h-screen" style={{ background: "#F4F5F9" }}>
        {/* ══════════ HERO ══════════ */}
        <div
          className="relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg,#0a0a0a 0%,#1a0505 40%,#3d0808 70%,#B42225 100%)",
          }}
        >
          {/* Orbs */}
          <div
            className="absolute -top-16 right-1/4 w-80 h-80 rounded-full opacity-20 pointer-events-none"
            style={{
              background: "radial-gradient(circle,#FF6B00,transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full opacity-10 pointer-events-none"
            style={{
              background: "radial-gradient(circle,#B42225,transparent 70%)",
            }}
          />
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 pt-12 pb-24 text-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-bold text-red-200 uppercase tracking-widest"
              style={{
                background: "rgba(180,34,37,0.3)",
                border: "1px solid rgba(255,107,0,0.3)",
              }}
            >
              <FaHeadset size={12} /> Help Center
            </div>

            <h1
              className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight"
              style={{
                fontFamily: "'Georgia', serif",
                textShadow: "0 4px 30px rgba(180,34,37,0.5)",
              }}
            >
              How can we
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg,#fca5a5,#fdba74,#fca5a5)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                help you?
              </span>
            </h1>
            <p className="text-white/50 text-sm md:text-base mb-10 max-w-md mx-auto">
              Search our help articles, browse FAQs, or reach our support team —
              we've got you covered.
            </p>

            {/* Hero search */}
            <div className="relative max-w-xl mx-auto" ref={searchRef}>
              <div
                className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200 ${
                  searchFocused
                    ? "shadow-[0_0_0_3px_rgba(255,107,0,0.3)]"
                    : "shadow-2xl"
                }`}
                style={{ background: "rgba(255,255,255,0.98)" }}
              >
                <GiMagnifyingGlass
                  size={18}
                  className={searchFocused ? "text-[#B42225]" : "text-gray-400"}
                />
                <input
                  type="text"
                  placeholder="Search for answers e.g. 'track order', 'return item'..."
                  className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <FiX size={16} />
                  </button>
                )}
                <div
                  className="hidden sm:flex items-center justify-center px-3 py-1.5 rounded-xl text-xs font-bold text-white shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#B42225,#FF6B00)",
                  }}
                >
                  Search
                </div>
              </div>

              {/* Search dropdown */}
              {searchFocused && searchQuery.trim().length > 0 && (
                <div
                  className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl border border-gray-100 overflow-hidden z-50 text-left"
                  style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }}
                >
                  {searchResults.length > 0 ? (
                    <>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-4 pt-3 pb-1">
                        {searchResults.length} result
                        {searchResults.length > 1 ? "s" : ""}
                      </p>
                      {searchResults.slice(0, 5).map((f, i) => (
                        <div
                          key={i}
                          onMouseDown={() => {
                            setSearchFocused(false);
                            setActiveCat("all");
                          }}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-t border-gray-50"
                        >
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-white"
                            style={{ background: f.color, minWidth: "24px" }}
                          >
                            <FiZap size={10} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-800">
                              {f.q}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                              {f.a}
                            </p>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <GiMagnifyingGlass
                        size={24}
                        className="text-gray-300 mx-auto mb-2"
                      />
                      <p className="text-sm font-bold text-gray-500">
                        No results found
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Try "return", "payment", or "delivery"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-6 mt-10">
              {stats.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p
                    className="text-2xl font-black text-white"
                    style={{ fontFamily: "'Georgia', serif" }}
                  >
                    {value}
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <svg
            className="absolute bottom-0 w-full"
            viewBox="0 0 1440 48"
            preserveAspectRatio="none"
          >
            <path
              d="M0,48 L0,24 Q360,0 720,24 Q1080,48 1440,24 L1440,48 Z"
              fill="#F4F5F9"
            />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-10">
          {/* ══════════ QUICK LINKS ══════════ */}
          <div>
            <h2 className="text-base font-black text-gray-400 uppercase tracking-widest mb-4">
              Quick Access
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {quickLinks.map(({ icon, label, href, color }) => (
                <Link
                  key={label}
                  href={href}  // Changed from 'to' to 'href'
                  className="group flex flex-col items-center gap-2.5 p-4 bg-white rounded-2xl text-center hover:-translate-y-1 transition-all duration-200"
                  style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white transition-transform group-hover:scale-110"
                    style={{ background: color }}
                  >
                    {icon}
                  </div>
                  <span className="text-xs font-bold text-gray-700 leading-tight">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* ══════════ FAQ SECTION ══════════ */}
          <div
            className="bg-white rounded-3xl overflow-hidden"
            style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.07)" }}
          >
            {/* Header */}
            <div className="px-6 md:px-8 pt-7 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-7 rounded-full bg-[#B42225]" />
                <h2
                  className="text-xl font-black text-gray-900"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  Frequently Asked Questions
                </h2>
              </div>

              {/* Category tabs */}
              <div
                className="flex items-center gap-2 overflow-x-auto pb-1 flex-nowrap scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <button
                  onClick={() => {
                    setActiveCat("all");
                    setOpenFAQ(null);
                    setSearchQuery("");
                  }}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeCategory === "all" && !isSearching
                      ? "bg-[#B42225] text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All Topics
                </button>
                {faqCategories.map(({ key, label, icon, color }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveCat(key);
                      setOpenFAQ(null);
                      setSearchQuery("");
                    }}
                    className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeCategory === key && !isSearching
                        ? "text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    style={
                      activeCategory === key && !isSearching
                        ? { background: color }
                        : {}
                    }
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ list */}
            <div className="p-6 md:p-8">
              {isSearching && (
                <div className="flex items-center gap-2 mb-5 text-sm text-gray-500">
                  <GiMagnifyingGlass size={14} />
                  <span>
                    {searchResults.length} result
                    {searchResults.length !== 1 ? "s" : ""} for{" "}
                    <strong>"{searchQuery}"</strong>
                  </span>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-auto text-xs font-bold text-[#B42225] hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}

              {displayFaqs.length > 0 ? (
                <div className="space-y-3 fade-up">
                  {displayFaqs.map((faq, i) => (
                    <FAQItem
                      key={i}
                      faq={faq}
                      index={i}
                      isOpen={openFAQ === i}
                      onToggle={handleToggle}
                      showCategory={isSearching || activeCategory === "all"}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-14">
                  <GiMagnifyingGlass size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="font-bold text-gray-500">
                    No results for "{searchQuery}"
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Try different keywords or browse a category above
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ══════════ SUPPORT CHANNELS ══════════ */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-1 h-7 rounded-full"
                style={{ background: "linear-gradient(#B42225,#FF6B00)" }}
              />
              <h2
                className="text-xl font-black text-gray-900"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Still Need Help?
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {supportChannels.map(
                ({ icon, label, sub, detail, action, color, href }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-4 p-5 bg-white rounded-3xl hover:-translate-y-1 transition-all duration-300"
                    style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform"
                      style={{ background: color }}
                    >
                      {icon}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">
                        {label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{detail}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                        {sub}
                      </span>
                      <div
                        className="flex items-center gap-1 text-xs font-bold transition-colors group-hover:gap-2"
                        style={{ color }}
                      >
                        {action} <FiArrowRight size={12} />
                      </div>
                    </div>
                  </a>
                ),
              )}
            </div>
          </div>

          {/* ══════════ CONTACT FORM ══════════ */}
          <div
            className="bg-white rounded-3xl overflow-hidden"
            style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.07)" }}
          >
            <div className="grid md:grid-cols-5 gap-0">
              {/* Left info panel */}
              <div
                className="md:col-span-2 p-7 md:p-8"
                style={{
                  background: "linear-gradient(160deg,#0a0a0a,#1a0505,#2d0a0a)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center mb-6"
                  style={{
                    background: "rgba(180,34,37,0.3)",
                    border: "1px solid rgba(180,34,37,0.4)",
                  }}
                >
                  <FiMail size={18} className="text-red-300" />
                </div>
                <h3
                  className="text-xl font-black text-white mb-3"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  Send us a Message
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  Can't find your answer in the FAQs? Drop us a message and our
                  team will get back to you within 24 hours.
                </p>
                <div className="space-y-4">
                  {[
                    {
                      icon: <FiClock size={14} />,
                      label: "Response time",
                      val: "Within 24 hours",
                    },
                    {
                      icon: <FiStar size={14} />,
                      label: "Support quality",
                      val: "98% satisfaction",
                    },
                    {
                      icon: <FiShield size={14} />,
                      label: "Privacy",
                      val: "Your data is safe",
                    },
                  ].map(({ icon, label, val }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: "rgba(180,34,37,0.25)" }}
                      >
                        <span className="text-red-300">{icon}</span>
                      </div>
                      <div>
                        <p className="text-white/40 text-[10px]">{label}</p>
                        <p className="text-white text-xs font-bold">{val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right form */}
              <div className="md:col-span-3 p-7 md:p-8">
                {formSent ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4 text-center py-10 fade-up">
                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                      <FiCheck size={28} className="text-green-500" />
                    </div>
                    <h4 className="text-lg font-black text-gray-900">
                      Message Sent!
                    </h4>
                    <p className="text-sm text-gray-500 max-w-xs">
                      We've received your message and will respond within 24
                      hours. Check your email for confirmation.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSend} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        {
                          key: "name",
                          label: "Full Name",
                          placeholder: "Your name",
                          type: "text",
                        },
                        {
                          key: "email",
                          label: "Email Address",
                          placeholder: "your@email.com",
                          type: "email",
                        },
                      ].map(({ key, label, placeholder, type }) => (
                        <div key={key}>
                          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                            {label}
                          </label>
                          <input
                            type={type}
                            placeholder={placeholder}
                            value={contactForm[key]}
                            onChange={(e) =>
                              setContactForm({
                                ...contactForm,
                                [key]: e.target.value,
                              })
                            }
                            required
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none bg-gray-50 focus:border-[#B42225] focus:bg-white focus:shadow-[0_0_0_3px_rgba(180,34,37,0.08)] transition-all placeholder-gray-400"
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                        Subject
                      </label>
                      <select
                        value={contactForm.subject}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            subject: e.target.value,
                          })
                        }
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none bg-gray-50 focus:border-[#B42225] focus:bg-white transition-all"
                      >
                        <option value="">Select a topic</option>
                        {faqCategories.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.label}
                          </option>
                        ))}
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                        Message
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Describe your issue in detail..."
                        value={contactForm.message}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            message: e.target.value,
                          })
                        }
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none bg-gray-50 focus:border-[#B42225] focus:bg-white focus:shadow-[0_0_0_3px_rgba(180,34,37,0.08)] transition-all resize-none placeholder-gray-400"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:scale-[1.01] active:scale-95"
                      style={{
                        background: "linear-gradient(135deg,#B42225,#FF6B00)",
                        boxShadow: "0 4px 20px rgba(180,34,37,0.3)",
                      }}
                    >
                      <FiMail size={15} /> Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* ══════════ TIPS BANNER ══════════ */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: <FaRegLightbulb size={20} />,
                title: "Check FAQs First",
                tip: "Over 90% of questions are answered in our FAQ section above. Use the search bar for the fastest results.",
                color: "bg-amber-50 border-amber-200",
                iconColor: "#D97706",
              },
              {
                icon: <FiHash size={20} />,
                title: "Have Your Order Number Ready",
                tip: "Your order number (found in your email or order history) speeds up support dramatically.",
                color: "bg-blue-50 border-blue-200",
                iconColor: "#2563EB",
              },
              {
                icon: <FiClock size={20} />,
                title: "Best Time to Reach Us",
                tip: "For fastest response, contact us on weekday mornings between 9am–12pm via WhatsApp or live chat.",
                color: "bg-green-50 border-green-200",
                iconColor: "#059669",
              },
            ].map(({ icon, title, tip, color, iconColor }) => (
              <div
                key={title}
                className={`flex gap-4 p-5 rounded-2xl border ${color}`}
              >
                <div className="shrink-0" style={{ color: iconColor }}>{icon}</div>
                <div>
                  <p className="text-sm font-black text-gray-800 mb-1">
                    {title}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">{tip}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ══════════ FOOTER NOTE ══════════ */}
          <div className="flex items-center justify-center gap-2 py-4 text-xs text-gray-400">
            <FiSmile size={14} />
            <span>
              Jovo Support — Here for you, every step of your shopping journey.
            </span>
            <MdVerified size={14} className="text-green-400" />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Help;