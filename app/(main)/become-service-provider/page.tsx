"use client";
import Link from "next/link";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { 
  FiCheck, FiArrowRight, FiDollarSign, FiUsers, FiClock,
  FiShield, FiBarChart2, FiStar, FiZap, FiHeadphones, FiTool, FiPhone,
} from "react-icons/fi";
import { 
  FaWhatsapp, FaHandshake, FaRocket, FaRegStar, FaTools, 
  FaBroom, FaCut, FaTshirt, FaBolt, FaWrench, FaChalkboardTeacher, FaCamera,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import Footer from "@/components/layout/Footer";

/* ─── DATA ──────────────────────────────────────────────────────── */
const steps = [
  {
    number: "01",
    icon: <FiUsers size={22} />,
    color: "#B42225",
    title: "Create Your Provider Profile",
    subtitle: "2 minutes to apply",
    desc: "Fill in your business name, a short bio, and your WhatsApp number. Select the service categories you specialise in and submit — no documents, no waiting.",
    details: [
      "Business / brand name",
      "Short bio about your expertise",
      "Active WhatsApp number",
      "Service category selection",
    ],
  },
  {
    number: "02",
    icon: <FiPhone size={22} />,
    color: "#FF6B00",
    title: "Verify via WhatsApp OTP",
    subtitle: "Instant activation",
    desc: "A 6-digit OTP is sent to your WhatsApp right after you apply. Enter it and your provider account activates immediately — no waiting period, no manual review.",
    details: [
      "OTP delivered in seconds",
      "Account goes live on verification",
      "No manual review or delays",
      "Re-request OTP anytime if needed",
    ],
  },
  {
    number: "03",
    icon: <FiTool size={22} />,
    color: "#D97706",
    title: "Create Your Service Listing",
    subtitle: "Go live in minutes",
    desc: "Build your service card — set your price type, availability schedule, location, and booking mode. Your listing appears on the campus marketplace immediately.",
    details: [
      "Fixed, negotiable, or 'starting at' pricing",
      "Define your weekly availability hours",
      "Instant or request-based booking mode",
      "Visible to 30,000+ students right away",
    ],
  },
  {
    number: "04",
    icon: <FiDollarSign size={22} />,
    color: "#059669",
    title: "Get Booked & Earn",
    subtitle: "0% commission forever",
    desc: "Students find your listing and contact you directly via WhatsApp. No middlemen, zero commission — every naira you earn is yours. Build reviews and grow.",
    details: [
      "Direct WhatsApp contact from customers",
      "0% commission on your earnings",
      "Collect reviews to rank higher",
      "Manage everything from your dashboard",
    ],
  },
];

const benefits = [
  {
    icon: <FiDollarSign size={20} />,
    color: "#B42225",
    bg: "#FEF2F2",
    title: "Zero Commission",
    desc: "JOVO takes nothing from your service earnings. Every payment goes directly to you — no cuts, no hidden fees, ever.",
  },
  {
    icon: <FaWhatsapp size={20} />,
    color: "#25D366",
    bg: "#F0FDF4",
    title: "WhatsApp Bookings",
    desc: "Customers reach you directly on WhatsApp — the fastest way to confirm bookings and close deals without any extra apps.",
  },
  {
    icon: <FiClock size={20} />,
    color: "#D97706",
    bg: "#FFFBEB",
    title: "Flexible Schedule",
    desc: "You set your own hours. Work between lectures, on weekends, or whenever suits you — no manager, no fixed shifts.",
  },
  {
    icon: <MdVerified size={20} />,
    color: "#2563EB",
    bg: "#EFF6FF",
    title: "Verified Badge",
    desc: "Get a verified service provider badge that builds customer trust and makes your listing stand out in search results.",
  },
  {
    icon: <FiUsers size={20} />,
    color: "#7C3AED",
    bg: "#F5F3FF",
    title: "30,000+ Reach",
    desc: "Your service is instantly visible to FUTO students, staff, and the wider Owerri community browsing JOVO — day and night.",
  },
  {
    icon: <FiBarChart2 size={20} />,
    color: "#059669",
    bg: "#F0FDF4",
    title: "Provider Dashboard",
    desc: "Update your service, adjust your schedule, toggle availability, and manage your profile — all from one clean dashboard.",
  },
  {
    icon: <FiShield size={20} />,
    color: "#0891B2",
    bg: "#F0F9FF",
    title: "Free Forever",
    desc: "No registration fee. No monthly charge. No commission. Apply in 2 minutes and start earning — it costs absolutely nothing.",
  },
  {
    icon: <FiStar size={20} />,
    color: "#B45309",
    bg: "#FFFBEB",
    title: "Review System",
    desc: "Satisfied customers leave verified reviews on your profile. More good reviews means higher ranking and more bookings.",
  },
];

const serviceCategories = [
  { label: "Cleaning", icon: <FaBroom size={20} />, count: "40+" },
  { label: "Salon & Barber", icon: <FaCut size={20} />, count: "25+" },
  { label: "Laundry", icon: <FaTshirt size={20} />, count: "30+" },
  { label: "Electrical", icon: <FaBolt size={20} />, count: "15+" },
  { label: "Repairs & Handyman", icon: <FaWrench size={20} />, count: "20+" },
  { label: "Tutoring", icon: <FaChalkboardTeacher size={20} />, count: "50+" },
  { label: "Photography", icon: <FaCamera size={20} />, count: "18+" },
  { label: "Other Skills", icon: <FaTools size={20} />, count: "35+" },
];

const testimonials = [
  {
    name: "Amaka C.",
    role: "Cleaning Services · FUTO 300-Level",
    avatar: "A",
    color: "#B42225",
    text: "I started with just my hostel block. Within a month I had 12 regulars. JOVO made finding clients easy — no flyers, no cold calls, just a listing and WhatsApp messages rolling in.",
    rating: 5,
    metric: "₦45k+ earned monthly",
  },
  {
    name: "Tunde B.",
    role: "Tutoring · FUTO Postgraduate",
    avatar: "T",
    color: "#FF6B00",
    text: "Listed my service on a Tuesday. Had 3 students booked by Thursday. The WhatsApp booking system is perfect — no apps to install, just a message and we're set.",
    rating: 5,
    metric: "15+ students tutored",
  },
  {
    name: "Sandra E.",
    role: "Salon & Hair · Owerri",
    avatar: "S",
    color: "#059669",
    text: "I was doing hair from my room with zero online presence. JOVO gave me the visibility I never had. I now have a waiting list every weekend and have grown into a proper space.",
    rating: 5,
    metric: "Fully booked weekends",
  },
];

const stats = [
  { value: "200+", label: "Active Providers" },
  { value: "30,000+", label: "Students Reached" },
  { value: "₦0", label: "Commission Fee" },
  { value: "2 min", label: "To Apply" },
];

const faqs = [
  {
    q: "Is it free to become a service provider on JOVO?",
    a: "Yes, completely free. No registration fee, no monthly charge, no commission on what you earn. You apply, verify your WhatsApp, and start earning — JOVO never takes a cut from service providers.",
  },
  {
    q: "How do customers pay me for my services?",
    a: "Customers contact you directly via WhatsApp and you agree on payment terms between yourselves. JOVO doesn't process service payments — you have full control over how and when you get paid.",
  },
  {
    q: "How long does the verification process take?",
    a: "Verification is instant. You submit your application, receive a 6-digit OTP on WhatsApp, enter it, and your account is live immediately — the whole process takes under 5 minutes.",
  },
  {
    q: "Can I offer services in multiple categories?",
    a: "Yes. During the application you can select multiple service categories that match your skills. This increases your visibility across different searches on the marketplace.",
  },
  {
    q: "Do I need to be a FUTO student to apply?",
    a: "No. While JOVO was built for the FUTO community, any skilled individual in Owerri and surrounding areas is welcome. What matters is that you can serve our campus community.",
  },
];

/* ─── STEP CARD ──────────────────────────────────────────────────── */
const StepCard = ({ step, isLast }: { step: (typeof steps)[0]; isLast: boolean }) => (
  <div className="relative flex gap-6 md:gap-8">
    {!isLast && (
      <div className="absolute left-7 top-14 w-0.5 h-[calc(100%+8px)] bg-gradient-to-b from-gray-200 to-transparent z-0" />
    )}
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
    <div
      className="flex-1 bg-white rounded-3xl p-6 mb-6 hover:-translate-y-1 transition-all duration-300"
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
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: step.color + "18", color: step.color }}
        >
          {step.icon}
        </div>
      </div>
      <p className="text-sm text-gray-500 leading-relaxed mb-4">{step.desc}</p>
      <div className="grid sm:grid-cols-2 gap-2">
        {step.details.map((d) => (
          <div key={d} className="flex items-center gap-2 text-xs text-gray-600">
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

/* ─── MAIN PAGE ──────────────────────────────────────────────────── */
const BecomeServiceProvider = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user, isServiceProvider, isLoading } = useContext(AuthContext) as any;

  // Redirect if already a service provider
  useEffect(() => {
    if (!isLoading && isServiceProvider) {
      window.location.href = "/service-dashboard";
    }
  }, [isLoading, isServiceProvider]);

  const handleApply = () => {
    if (!user) {
      window.location.href = "/login?redirect=/services/apply";
      return;
    }
    if (isServiceProvider) {
      window.location.href = "/service-dashboard";
      return;
    }
    window.location.href = "/services/apply";
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F4F5F9" }}>
        <div className="w-8 h-8 border-2 border-[#B42225]/20 border-t-[#B42225] rounded-full animate-spin" />
      </div>
    );
  }

  // If already a service provider, don't render the page (redirect will happen)
  if (isServiceProvider) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .float { animation: float 5s ease-in-out infinite; }
      `}</style>

      <div className="min-h-screen" style={{ background: "#F4F5F9" }}>
        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <div
          className="relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#0a0a0a 0%,#111 40%,#1a0a00 70%,#2a1500 100%)",
            minHeight: "560px",
          }}
        >
          <div
            className="absolute -top-24 right-0 w-[500px] h-[500px] rounded-full opacity-15 pointer-events-none"
            style={{ background: "radial-gradient(circle,#FF6B00,transparent 65%)" }}
          />
          <div
            className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle,#B42225,transparent 70%)" }}
          />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-12 pb-28">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left copy */}
              <div>
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-orange-200 mb-6"
                  style={{
                    background: "rgba(255,107,0,0.2)",
                    border: "1px solid rgba(255,107,0,0.3)",
                  }}
                >
                  <FaRocket size={11} /> Open to All Skill Providers — Free to Join
                </div>
                <h1
                  className="text-4xl md:text-6xl font-black text-white leading-tight mb-5"
                  style={{
                    fontFamily: "'Georgia', serif",
                    textShadow: "0 4px 40px rgba(180,34,37,0.5)",
                  }}
                >
                  Offer Services.
                  <br />
                  <span
                    style={{
                      background: "linear-gradient(90deg,#fca5a5,#fdba74,#fca5a5)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Earn Every Day.
                  </span>
                </h1>
                <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-md mb-8">
                  Turn your skills into income on campus. Join 200+ verified providers already
                  earning through JOVO — zero commission, direct WhatsApp bookings, free forever.
                </p>
                <div className="flex flex-wrap gap-3 mb-8">
                  {["Zero commission", "WhatsApp bookings", "Instant verification", "Free to join"].map((t) => (
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
                    onClick={handleApply}
                    className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: "linear-gradient(135deg,#B42225,#FF6B00)",
                      boxShadow: "0 8px 30px rgba(180,34,37,0.4)",
                    }}
                  >
                    <FiTool size={15} /> Apply as Provider — Free
                  </button>
                  <a
                    href="https://wa.me/2348000000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white/80 hover:text-white border border-white/15 hover:border-white/30 transition-all"
                  >
                    <FaWhatsapp size={15} className="text-green-400" /> Ask via WhatsApp
                  </a>
                </div>
              </div>

              {/* Floating stats — desktop */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative w-80 h-80">
                  <div
                    className="absolute inset-1/4 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(180,34,37,0.15)",
                      border: "2px solid rgba(180,34,37,0.3)",
                    }}
                  >
                    <FiTool size={40} className="text-orange-300 float" />
                  </div>
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
                        <p className="text-base font-black text-gray-900">{value}</p>
                        <p className="text-[10px] text-gray-400 whitespace-nowrap">{label}</p>
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

          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 56" preserveAspectRatio="none">
            <path d="M0,56 L0,28 Q360,0 720,28 Q1080,56 1440,28 L1440,56 Z" fill="#F4F5F9" />
          </svg>
        </div>

        {/* Rest of your content remains the same... */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-14">
          {/* HOW IT WORKS */}
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
                  From application to first booking in under 10 minutes
                </p>
              </div>
            </div>
            <div>
              {steps.map((step, i) => (
                <StepCard key={step.number} step={step} isLast={i === steps.length - 1} />
              ))}
            </div>
          </div>

          {/* BENEFITS */}
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#B42225] bg-red-50 px-4 py-2 rounded-full mb-3">
                <FiStar size={11} /> Why Providers Choose JOVO
              </div>
              <h2
                className="text-2xl md:text-3xl font-black text-gray-900"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Everything you need to grow
              </h2>
              <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
                Built for campus providers who want to turn their skills into a real income stream — with no upfront cost.
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
                  <h3 className="text-sm font-black text-gray-900 mb-2">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SERVICE CATEGORIES */}
          <div
            className="bg-white rounded-3xl p-6 md:p-8"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-1 h-7 rounded-full"
                style={{ background: "linear-gradient(#D97706,#F59E0B)" }}
              />
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#B42225,#FF6B00)" }}
              >
                <FiTool size={16} className="text-white" />
              </div>
              <div>
                <h2
                  className="text-xl font-black text-gray-900"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  What Can You Offer?
                </h2>
                <p className="text-[11px] text-gray-400">In-demand categories on JOVO</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {serviceCategories.map(({ label, icon, count }) => (
                <div
                  key={label}
                  className="group flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-[#B42225]/4 hover:border-[#B42225]/20 border border-transparent transition-all cursor-pointer"
                >
                  <span className="text-gray-600 shrink-0">{icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 group-hover:text-[#B42225] transition-colors leading-tight">
                      {label}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{count} providers</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">
              + many more skills accepted — if you have a marketable skill, you qualify
            </p>
          </div>

          {/* TESTIMONIALS */}
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#B42225] bg-red-50 px-4 py-2 rounded-full mb-3">
                <FaHandshake size={12} /> Provider Stories
              </div>
              <h2
                className="text-2xl md:text-3xl font-black text-gray-900"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Real providers, real results
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {testimonials.map(({ name, role, avatar, color, text, rating, metric }) => (
                <div
                  key={name}
                  className="bg-white rounded-3xl p-6 flex flex-col gap-4"
                  style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
                      style={{ background: `linear-gradient(135deg,${color},${color}99)` }}
                    >
                      {avatar}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">{name}</p>
                      <p className="text-[10px] text-gray-400">{role}</p>
                    </div>
                    <MdVerified size={16} className="ml-auto text-blue-400 shrink-0" />
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(rating)].map((_, i) => (
                      <FaRegStar key={i} size={12} style={{ fill: "#FBBF24", color: "#FBBF24" }} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1">"{text}"</p>
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
                    style={{ background: color + "12", color }}
                  >
                    <FiZap size={12} /> {metric}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
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
                  Provider FAQs
                </h2>
              </div>
            </div>
            <div className="p-5 md:p-7 space-y-3">
              {faqs.map(({ q, a }, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border overflow-hidden transition-all ${
                    openFaq === i ? "border-[#B42225]/25" : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className={`w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors ${
                      openFaq === i ? "bg-[#B42225]/3" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <p className={`text-sm font-bold ${openFaq === i ? "text-[#B42225]" : "text-gray-800"}`}>
                      {q}
                    </p>
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        openFaq === i ? "bg-[#B42225] text-white" : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <span className="text-sm font-black">{openFaq === i ? "−" : "+"}</span>
                    </div>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 bg-white border-t border-gray-50">
                      <div className="w-8 h-0.5 rounded-full bg-[#B42225] mt-3 mb-3" />
                      <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FINAL CTA */}
          <div
            className="relative rounded-3xl overflow-hidden p-8 md:p-12 text-white text-center"
            style={{
              background: "linear-gradient(135deg,#0a0a0a 0%,#150505 40%,#B42225 100%)",
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div
              className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(circle,#FF6B00,transparent 65%)" }}
            />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-orange-300 bg-orange-400/20 border border-orange-400/30 px-4 py-2 rounded-full mb-5">
                <FiZap size={11} /> Provider spots open — apply in 2 minutes
              </div>
              <h2
                className="text-3xl md:text-5xl font-black mb-4 leading-tight"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Ready to start earning?
              </h2>
              <p className="text-white/50 text-sm max-w-md mx-auto mb-8">
                Join 200+ providers already earning on JOVO. Zero commission, zero fees, free forever.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={handleApply}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm text-white transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg,#B42225,#FF6B00)",
                    boxShadow: "0 8px 30px rgba(180,34,37,0.5)",
                  }}
                >
                  <FiTool size={16} /> Apply as Service Provider — Free
                  <FiArrowRight size={15} />
                </button>
                <Link
                  href="/help"
                  className="flex items-center gap-2 px-7 py-4 rounded-2xl font-bold text-sm text-white/70 hover:text-white border border-white/15 hover:border-white/30 transition-all"
                >
                  <FiHeadphones size={15} /> Talk to Support
                </Link>
              </div>
              <p className="text-white/25 text-xs mt-6 flex items-center justify-center gap-1.5">
                <FiShield size={11} /> Free to join · No commission · WhatsApp bookings · Instant verification
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BecomeServiceProvider;