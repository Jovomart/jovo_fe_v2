'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
// src/pages/BecomeSeller.jsx
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import {
  FiCheck,
  FiArrowRight,
  FiChevronRight,
  FiUpload,
  FiPackage,
  FiTrendingUp,
  FiDollarSign,
  FiShield,
  FiUsers,
  FiBarChart2,
  FiStar,
  FiZap,
  FiClock,
  FiGlobe,
  FiSmartphone,
  FiHeadphones,
  FiAward,
} from "react-icons/fi";
import {
  FaStore,
  FaWhatsapp,
  FaCheckCircle,
  FaBoxOpen,
  FaChartLine,
  FaHandshake,
  FaRocket,
  FaRegStar,
} from "react-icons/fa";
import {
  MdVerified,
  MdStorefront,
  MdOutlineInventory2,
  MdPayment,
  MdSupportAgent,
  MdCampaign,
} from "react-icons/md";
import {
  GiTShirt,
  GiElectric,
  GiCoffeeCup,
  GiLipstick,
  GiBookCover,
  GiSofa,
  GiComputerFan,
  GiSportMedal,
} from "react-icons/gi";
import Footer from "@/components/layout/Footer";

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const steps = [
  {
    number: "01",
    icon: <FiUsers size={22} />,
    color: "#B42225",
    title: "Create Your Seller Account",
    subtitle: "2 minutes to get started",
    desc: "Sign up with your business name, email, and phone number. Existing Jovo buyers can upgrade their account instantly — no new registration needed.",
    details: [
      "Business name & contact info",
      "Valid passport for verification",
      "Select your product categories",
      "Profile photo or business logo",
    ],
  },
  {
    number: "02",
    icon: <FiUpload size={22} />,
    color: "#FF6B00",
    title: "List Your Products",
    subtitle: "Start with just 1 item",
    desc: "Upload product photos, write your description, set your price, and choose a category. Our smart listing tools help you go live in minutes.",
    details: [
      "Upload up to 5 product images",
      "Set your own pricing & stock levels",
      "Bulk upload via spreadsheet",
      "Products reviewed & live within 2 hrs",
    ],
  },
  {
    number: "03",
    icon: <FiPackage size={22} />,
    color: "#D97706",
    title: "Receive & Fulfil Orders",
    subtitle: "We notify you instantly",
    desc: "Get real-time notifications when orders come in. Pack your item and hand it off to our logistics partner or the customer at our ICT pickup station.",
    details: [
      "Instant order notifications",
      "Print shipping labels from dashboard",
      "Jovo logistics partner access",
      "Free pickup station at ICT Centre FUTO",
    ],
  },
  {
    number: "04",
    icon: <FiDollarSign size={22} />,
    color: "#059669",
    title: "Get Paid Every Week",
    subtitle: "Reliable weekly payouts",
    desc: "Sit back and earn. Payouts for confirmed and delivered orders are disbursed directly to your bank account every Monday, with zero hidden charges.",
    details: [
      "Weekly Monday disbursements",
      "Real-time earnings dashboard",
      "Commission: 5%–10% per sale",
      "No listing or subscription fees",
    ],
  },
];

const benefits = [
  {
    icon: <FiUsers size={20} />,
    color: "#B42225",
    bg: "#FEF2F2",
    title: "30,000+ Buyers",
    desc: "Reach a ready audience of FUTO students, staff, and the wider Owerri community actively shopping on Jovo.",
  },
  {
    icon: <MdPayment size={20} />,
    color: "#2563EB",
    bg: "#EFF6FF",
    title: "Secure Weekly Payouts",
    desc: "Your earnings are protected and disbursed every Monday directly to your Nigerian bank account, guaranteed.",
  },
  {
    icon: <MdCampaign size={20} />,
    color: "#D97706",
    bg: "#FFFBEB",
    title: "Free Promotions",
    desc: "Get featured in Flash Sales, Top Sellers, and sponsored slots to give your products maximum visibility.",
  },
  {
    icon: <FiBarChart2 size={20} />,
    color: "#059669",
    bg: "#F0FDF4",
    title: "Seller Dashboard",
    desc: "Track sales, monitor inventory, view customer analytics, and manage everything from one clean dashboard.",
  },
  {
    icon: <MdSupportAgent size={20} />,
    color: "#7C3AED",
    bg: "#F5F3FF",
    title: "Dedicated Support",
    desc: "A dedicated seller success team is available Mon–Sat 9am–6pm via WhatsApp, email, and the Jovo seller hotline.",
  },
  {
    icon: <FiShield size={20} />,
    color: "#0891B2",
    bg: "#F0F9FF",
    title: "Fraud Protection",
    desc: "Jovo's buyer-seller protection system shields you from chargebacks and fraudulent returns with our verified buyer network.",
  },
  {
    icon: <FiSmartphone size={20} />,
    color: "#9333EA",
    bg: "#FAF5FF",
    title: "Mobile-Ready Tools",
    desc: "Manage your store, respond to orders, and update listings directly from your phone on the Jovo mobile app.",
  },
  {
    icon: <FiGlobe size={20} />,
    color: "#B45309",
    bg: "#FFFBEB",
    title: "Nationwide Delivery",
    desc: "Jovo's logistics network delivers to all 36 Nigerian states, expanding your reach far beyond your physical location.",
  },
];

const categories = [
  { label: "Fashion & Apparel", icon: <GiTShirt size={20} />, count: "2,400+" },
  { label: "Electronics & Gadgets", icon: <GiElectric size={20} />, count: "1,800+" },
  { label: "Food & Drinks", icon: <GiCoffeeCup size={20} />, count: "900+" },
  { label: "Health & Beauty", icon: <GiLipstick size={20} />, count: "1,200+" },
  { label: "Books & Stationery", icon: <GiBookCover size={20} />, count: "600+" },
  { label: "Home & Living", icon: <GiSofa size={20} />, count: "750+" },
  { label: "Computing & IT", icon: <GiComputerFan size={20} />, count: "1,100+" },
  { label: "Sports & Fitness", icon: <GiSportMedal size={20} />, count: "400+" },
];

const testimonials = [
  {
    name: "Chidinma O.",
    role: "Fashion Seller · FUTO Alumni",
    avatar: "C",
    color: "#B42225",
    text: "I started selling on Jovo with just 5 dresses. Within 3 months I had over 200 orders and hired two assistants. The weekly payouts are always on time.",
    rating: 5,
    sales: "₦1.2M+ in sales",
  },
  {
    name: "Emeka T.",
    role: "Phone Accessories · 200-Level Student",
    avatar: "E",
    color: "#FF6B00",
    text: "As a student, I needed something I could run from my hostel. Jovo's pickup system at the ICT Centre makes it so easy. I process orders between lectures.",
    rating: 5,
    sales: "420+ orders",
  },
  {
    name: "Adaeze N.",
    role: "Food & Snacks Vendor · Owerri",
    avatar: "A",
    color: "#059669",
    text: "The promotional tools are what sold me. My products appeared in two Flash Sales and I sold out both times. Nothing beats the Jovo platform for campus sellers.",
    rating: 5,
    sales: "Sold out 3× in a row",
  },
];

const stats = [
  { value: "5,000+", label: "Active Sellers" },
  { value: "30,000+", label: "Monthly Buyers" },
  { value: "₦500M+", label: "GMV Processed" },
  { value: "98%", label: "Payout Reliability" },
];

const faqs = [
  {
    q: "Is there a fee to register as a seller?",
    a: "No. Creating a seller account on Jovo is completely free. You only pay a small commission (5–10%) when you make a sale.",
  },
  {
    q: "How long does account verification take?",
    a: "Most accounts are verified within 24–48 hours of submitting your documents. You'll receive an email confirmation once approved.",
  },
  {
    q: "Can students sell on Jovo from campus?",
    a: "Absolutely. Jovo was built with FUTO students in mind. Our ICT Centre pickup station makes fulfilment seamless from campus.",
  },
  {
    q: "When and how do I receive my payments?",
    a: "Payouts are disbursed every Monday to your registered Nigerian bank account for all orders confirmed and delivered the previous week.",
  },
  {
    q: "What products am I not allowed to sell?",
    a: "Counterfeit goods, stolen items, weapons, controlled substances, and any item prohibited under Nigerian law are strictly banned.",
  },
];

/* ─────────────────────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────────────────────── */
const StepCard = ({ step, isLast }) => (
  <div className="relative flex gap-6 md:gap-8">
    {/* Connector line */}
    {!isLast && (
      <div className="absolute left-6.5 top-14 w-0.5 h-[calc(100%+8px)] bg-linear-to-b from-gray-200 to-transparent z-0" />
    )}

    {/* Number circle */}
    <div className="relative z-10 shrink-0">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)`,
          boxShadow: `0 8px 24px ${step.color}33`,
        }}
      >
        {step.number}
      </div>
    </div>

    {/* Content card */}
    <div
      className="flex-1 bg-white rounded-3xl p-6 mb-6 group hover:-translate-y-1 transition-all duration-300"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
              style={{ background: step.color }}
            >
              Step {step.number}
            </span>
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <FiClock size={9} /> {step.subtitle}
            </span>
          </div>
          <h3
            className="text-lg md:text-xl font-black text-gray-900 leading-snug"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {step.title}
          </h3>
        </div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white"
          style={{ background: step.color + "18", color: step.color }}
        >
          {step.icon}
        </div>
      </div>
      <p className="text-sm text-gray-500 leading-relaxed mb-4">{step.desc}</p>
      <div className="grid sm:grid-cols-2 gap-2">
        {step.details.map((d) => (
          <div
            key={d}
            className="flex items-center gap-2 text-xs text-gray-600"
          >
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
              style={{ background: step.color + "18" }}
            >
              <FiCheck size={9} style={{ color: step.color }} />
            </div>
            {d}
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
const BecomeSeller = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, isSeller } = useContext(AuthContext);
  const router = useRouter()
  const navigate = (p: string) => router.push(p)

  useEffect(() => {
    // If not logged in, show message and redirect to login
    if (!user) {
      setShowAuthModal(true);
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000); // Show message for 3 seconds before redirecting
      return () => clearTimeout(timer);
    }

    // If already a seller, redirect to dashboard
    if (isSeller) {
      router.push("/seller/dashboard");
    }
  }, [user, isSeller, navigate]);

  // Modal for unauthenticated users
  if (showAuthModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center animate-bounce">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "linear-gradient(135deg,#B42225,#FF8C00)",
            }}
          >
            <FiUsers size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">
            Account Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need a user account before applying as a seller. Let's get you
            logged in!
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/login")}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg,#B42225,#FF8C00)",
              }}
            >
              Go to Login
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 rounded-xl text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
            >
              Back to Home
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Redirecting in 3 seconds...
          </p>
        </div>
      </div>
    );
  }

  if (isSeller) {
    return null; // or a loading spinner
  }

  return (
    <>
      <style>{`
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .float { animation: float 5s ease-in-out infinite; }
        .fade-up { animation: fadeUp 0.4s ease; }
      `}</style>

      <div className="min-h-screen" style={{ background: "#F4F5F9" }}>
        {/* ══════════ HERO ══════════ */}
        <div
          className="relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg,#0a0a0a 0%,#150505 30%,#2d0a0a 60%,#B42225 100%)",
            minHeight: "560px",
          }}
        >
          {/* Orbs */}
          <div
            className="absolute -top-24 right-0 w-125 h-125 rounded-full opacity-20 pointer-events-none"
            style={{
              background: "radial-gradient(circle,#FF6B00,transparent 65%)",
            }}
          />
          <div
            className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full opacity-10 pointer-events-none"
            style={{
              background: "radial-gradient(circle,#B42225,transparent 70%)",
            }}
          />
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-12 pb-28">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left */}
              <div>
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-orange-200 mb-6"
                  style={{
                    background: "rgba(255,107,0,0.2)",
                    border: "1px solid rgba(255,107,0,0.3)",
                  }}
                >
                  <FaRocket size={11} /> Open to All Sellers — Free to Join
                </div>
                <h1
                  className="text-4xl md:text-6xl font-black text-white leading-tight mb-5"
                  style={{
                    fontFamily: "'Georgia', serif",
                    textShadow: "0 4px 40px rgba(180,34,37,0.5)",
                  }}
                >
                  Sell on Jovo.
                  <br />
                  <span
                    style={{
                      background:
                        "linear-gradient(90deg,#fca5a5,#fdba74,#fca5a5)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Earn Every Week.
                  </span>
                </h1>
                <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-md mb-8">
                  Join 5,000+ sellers already growing their businesses on Jovo
                  Marketplace. No upfront fees, no monthly charges — just sales,
                  payouts, and growth.
                </p>
                <div className="flex flex-wrap gap-3 mb-8">
                  {[
                    "Free to register",
                    "Weekly payouts",
                    "ICT Centre pickup",
                    "Campus-first platform",
                  ].map((t) => (
                    <div
                      key={t}
                      className="flex items-center gap-1.5 text-xs font-semibold text-white/80 px-3 py-1.5 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                    >
                      <FiCheck size={11} className="text-green-400" /> {t}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: "linear-gradient(135deg,#B42225,#FF6B00)",
                      boxShadow: "0 8px 30px rgba(180,34,37,0.4)",
                    }}
                  >
                    <FaStore size={15} /> Start Selling Free
                  </button>
                  <a
                    href="https://wa.me/2348000000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white/80 hover:text-white border border-white/15 hover:border-white/30 transition-all"
                  >
                    <FaWhatsapp size={15} className="text-green-400" /> Ask via
                    WhatsApp
                  </a>
                </div>
              </div>

              {/* Right — floating stat cards */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative w-80 h-80">
                  {/* Centre circle */}
                  <div
                    className="absolute inset-1/4 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(180,34,37,0.15)",
                      border: "2px solid rgba(180,34,37,0.3)",
                    }}
                  >
                    <FaStore size={40} className="text-red-300 float" />
                  </div>
                  {/* Floating cards */}
                  {stats.map(({ value, label }, i) => {
                    const positions = [
                      "top-0 left-1/2 -translate-x-1/2",
                      "right-0 top-1/2 -translate-y-1/2",
                      "bottom-0 left-1/2 -translate-x-1/2",
                      "left-0 top-1/2 -translate-y-1/2",
                    ];
                    return (
                      <div
                        key={label}
                        className={`absolute ${positions[i]} bg-white rounded-2xl px-4 py-3 text-center`}
                        style={{
                          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                          animation: `float ${4 + i * 0.5}s ease-in-out ${i * 0.5}s infinite`,
                        }}
                      >
                        <p className="text-base font-black text-gray-900">
                          {value}
                        </p>
                        <p className="text-[10px] text-gray-400 whitespace-nowrap">
                          {label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile stats */}
            <div className="lg:hidden grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              {stats.map(({ value, label }) => (
                <div
                  key={label}
                  className="text-center p-3 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <p className="text-xl font-black text-white">{value}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <svg
            className="absolute bottom-0 w-full"
            viewBox="0 0 1440 56"
            preserveAspectRatio="none"
          >
            <path
              d="M0,56 L0,28 Q360,0 720,28 Q1080,56 1440,28 L1440,56 Z"
              fill="#F4F5F9"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-14">
          {/* ══════════ HOW IT WORKS ══════════ */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-1 h-8 rounded-full"
                style={{ background: "linear-gradient(#B42225,#FF6B00)" }}
              />
              <div>
                <h2
                  className="text-2xl md:text-3xl font-black text-gray-900"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  How It Works
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Start selling in under 24 hours
                </p>
              </div>
            </div>
            <div>
              {steps.map((step, i) => (
                <StepCard
                  key={step.number}
                  step={step}
                  isLast={i === steps.length - 1}
                />
              ))}
            </div>
          </div>

          {/* ══════════ BENEFITS ══════════ */}
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#B42225] bg-red-50 px-4 py-2 rounded-full mb-3">
                <FiStar size={11} /> Why Sellers Choose Jovo
              </div>
              <h2
                className="text-2xl md:text-3xl font-black text-gray-900"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Everything you need to grow
              </h2>
              <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
                Built specifically for Nigerian campus sellers and SMEs, Jovo
                gives you the tools to build a real business.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {benefits.map(({ icon, color, bg, title, desc }) => (
                <div
                  key={title}
                  className="group bg-white rounded-3xl p-5 hover:-translate-y-1 transition-all duration-300"
                  style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ background: bg, color }}
                  >
                    {icon}
                  </div>
                  <h3 className="text-sm font-black text-gray-900 mb-2">
                    {title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ══════════ CATEGORIES ══════════ */}
          <div
            className="bg-white rounded-3xl p-6 md:p-8"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-1 h-7 rounded-full"
                style={{ background: "linear-gradient(#D97706,#F59E0B)" }}
              />
              <div className="w-9 h-9 rounded-2xl bg-amber-400 flex items-center justify-center">
                <MdOutlineInventory2 size={18} className="text-white" />
              </div>
              <div>
                <h2
                  className="text-xl font-black text-gray-900"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  What Can You Sell?
                </h2>
                <p className="text-[11px] text-gray-400">
                  Popular categories on Jovo
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map(({ label, icon, count }) => (
                <div
                  key={label}
                  className="group flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-[#B42225]/4 hover:border-[#B42225]/20 border border-transparent transition-all cursor-pointer"
                >
                  <span className="text-gray-600 shrink-0">{icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 group-hover:text-[#B42225] transition-colors leading-tight">
                      {label}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {count} listings
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">
              + many more categories available
            </p>
          </div>

          {/* ══════════ TESTIMONIALS ══════════ */}
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#B42225] bg-red-50 px-4 py-2 rounded-full mb-3">
                <FaHandshake size={12} /> Seller Stories
              </div>
              <h2
                className="text-2xl md:text-3xl font-black text-gray-900"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Real sellers, real results
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {testimonials.map(
                ({ name, role, avatar, color, text, rating, sales }) => (
                  <div
                    key={name}
                    className="bg-white rounded-3xl p-6 flex flex-col gap-4"
                    style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
                        style={{
                          background: `linear-gradient(135deg,${color},${color}99)`,
                        }}
                      >
                        {avatar}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">
                          {name}
                        </p>
                        <p className="text-[10px] text-gray-400">{role}</p>
                      </div>
                      <MdVerified
                        size={16}
                        className="ml-auto text-blue-400 shrink-0"
                      />
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(rating)].map((_, i) => (
                        <FaRegStar
                          key={i}
                          size={12}
                          className="text-yellow-400 fill-yellow-400"
                          style={{ fill: "#FBBF24" }}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed flex-1">
                      "{text}"
                    </p>
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
                      style={{ background: color + "12", color }}
                    >
                      <FiTrendingUp size={12} /> {sales}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* ══════════ FAQs ══════════ */}
          <div
            className="bg-white rounded-3xl overflow-hidden"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}
          >
            <div className="px-6 md:px-8 pt-7 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-1 h-7 rounded-full bg-[#B42225]" />
                <h2
                  className="text-xl font-black text-gray-900"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  Seller FAQs
                </h2>
              </div>
            </div>
            <div className="p-5 md:p-7 space-y-3">
              {faqs.map(({ q, a }, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border overflow-hidden transition-all ${
                    openFaq === i
                      ? "border-[#B42225]/25"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className={`w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors ${
                      openFaq === i
                        ? "bg-[#B42225]/3"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <p
                      className={`text-sm font-bold ${openFaq === i ? "text-[#B42225]" : "text-gray-800"}`}
                    >
                      {q}
                    </p>
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        openFaq === i
                          ? "bg-[#B42225] text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <span className="text-sm font-black">
                        {openFaq === i ? "−" : "+"}
                      </span>
                    </div>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 bg-white border-t border-gray-50">
                      <div className="w-8 h-0.5 rounded-full bg-[#B42225] mt-3 mb-3" />
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ══════════ FINAL CTA ══════════ */}
          <div
            className="relative rounded-3xl overflow-hidden p-8 md:p-12 text-white text-center"
            style={{
              background:
                "linear-gradient(135deg,#0a0a0a 0%,#150505 40%,#B42225 100%)",
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div
              className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20 pointer-events-none"
              style={{
                background: "radial-gradient(circle,#FF6B00,transparent 65%)",
              }}
            />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-orange-300 bg-orange-400/20 border border-orange-400/30 px-4 py-2 rounded-full mb-5">
                <FiZap size={11} /> Limited seller slots available this month
              </div>
              <h2
                className="text-3xl md:text-5xl font-black mb-4 leading-tight"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Ready to start earning?
              </h2>
              <p className="text-white/50 text-sm max-w-md mx-auto mb-8">
                Join thousands of sellers already earning weekly on Jovo. Free
                to start, no commitment required.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/seller-application"
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm text-white transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg,#B42225,#FF6B00)",
                    boxShadow: "0 8px 30px rgba(180,34,37,0.5)",
                  }}
                >
                  <FaStore size={16} /> Apply to Become a Seller — Free
                  <FiArrowRight size={15} />
                </Link>
                <Link href="/help"
                  className="flex items-center gap-2 px-7 py-4 rounded-2xl font-bold text-sm text-white/70 hover:text-white border border-white/15 hover:border-white/30 transition-all"
                >
                  <FiHeadphones size={15} /> Talk to Support
                </Link>
              </div>
              <p className="text-white/25 text-xs mt-6 flex items-center justify-center gap-1.5">
                <FiShield size={11} /> Free registration · No credit card needed
                · Weekly payouts guaranteed
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BecomeSeller;