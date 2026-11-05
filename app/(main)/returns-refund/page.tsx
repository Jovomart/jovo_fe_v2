'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
// src/pages/ReturnsRefund.jsx
import { useState } from "react";
import {
  FiChevronDown, FiChevronUp, FiChevronRight, FiCheck,
  FiPackage, FiTruck, FiRefreshCw, FiDollarSign,
  FiShield, FiClock, FiAlertCircle, FiMail, FiPhone,
  FiArrowRight, FiX, FiCamera, FiTag, FiBell,
} from "react-icons/fi";
import {
  FaWhatsapp, FaBoxOpen, FaRegCheckCircle, FaRegTimesCircle,
  FaRegLightbulb, FaRegClock,
} from "react-icons/fa";
import {
  MdVerified, MdLocalShipping, MdOutlineInventory2,
  MdOutlineSupportAgent, MdPayment, MdOutlinePhotoCamera,
} from "react-icons/md";
import Footer from "@/components/layout/Footer";

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const returnSteps = [
  {
    number: "01", color: "#0E0E10", icon: <FaBoxOpen size={20} />,
    title: "Request a Return",
    subtitle: "Within 7 days of delivery",
    desc: "Go to Profile → My Orders, select the item, and click 'Request Return'. Fill in your reason and upload a photo if the item is damaged or incorrect.",
    details: ["Visit My Orders in your profile", "Select the specific item", "Choose return reason", "Upload photo for damaged items"],
  },
  {
    number: "02", color: "#FF6B00", icon: <MdLocalShipping size={20} />,
    title: "Ship the Product Back",
    subtitle: "Free pickup for eligible returns",
    desc: "For approved returns, Jovo arranges a free pickup from your address or drop-off point. Pack the item securely in its original box with all accessories included.",
    details: ["Original packaging required", "Include all accessories & manuals", "Free pickup arranged within 24hrs", "Or drop off at ICT Centre, FUTO"],
  },
  {
    number: "03", color: "#D97706", icon: <MdOutlineInventory2 size={20} />,
    title: "Inspection & Approval",
    subtitle: "1–2 business days",
    desc: "Our quality team inspects your returned item upon receipt. You'll be notified by email and SMS once the inspection is complete and the refund is approved.",
    details: ["Item received & logged", "Quality inspection within 24hrs", "Email & SMS notification sent", "Approved refunds fast-tracked"],
  },
  {
    number: "04", color: "#059669", icon: <MdPayment size={20} />,
    title: "Receive Your Refund",
    subtitle: "3–5 business days",
    desc: "Approved refunds are credited back to your original payment method - card, bank transfer, or Jovo Wallet. Wallet refunds are instant once approved.",
    details: ["Original payment method credited", "Jovo Wallet refunds: instant", "Bank/card: 3–5 business days", "Email confirmation with receipt"],
  },
];

const eligibleItems = [
  "Items returned within 7 days of delivery",
  "Unused products in original condition",
  "Items with original packaging and all accessories",
  "Defective, damaged, or wrong items (any time)",
  "Products that don't match the listing description",
];

const ineligibleItems = [
  "Items returned after 7 days (unless defective)",
  "Opened beauty, skincare, or hygiene products",
  "Perishable goods (food, drinks, fresh produce)",
  "Customised or personalised items",
  "Products without original packaging or accessories",
  "Items showing signs of use or damage by buyer",
];

const faqData = [
  {
    q: "Can I return an item after 7 days?",
    a: "Generally, returns are accepted within 7 days of delivery. However, if the item is defective, damaged, or significantly different from its description, you can raise a return request at any time. Contact our support team with evidence and we'll review your case.",
  },
  {
    q: "Do I have to pay for return shipping?",
    a: "No. For all approved returns - whether due to defects, wrong items, or seller error - Jovo provides a free pickup from your location. Simply schedule the pickup through your order page and our logistics partner will collect the item.",
  },
  {
    q: "How will I know when my refund is processed?",
    a: "You'll receive an email and SMS notification at each stage: when your return is approved, when the item is received, when inspection is complete, and when the refund is issued. You can also track refund status in My Orders.",
  },
  {
    q: "Can I exchange an item instead of getting a refund?",
    a: "Jovo doesn't currently offer direct exchanges. To swap a product, return the original and place a new order. Once your refund is processed, the funds will be available to use immediately - or we can credit your Jovo Wallet for instant access.",
  },
  {
    q: "What if I received a damaged or wrong item?",
    a: "Take a clear photo of the issue and report it via My Orders → Report Issue within 48 hours of delivery. For defective or wrong items, we offer a free replacement or full refund. In most cases, you won't even need to return the item.",
  },
  {
    q: "How long does the full return process take?",
    a: "From requesting a return to receiving your refund typically takes 5–8 business days: 1 day for approval, 1–2 days for pickup and transit, 1–2 days for inspection, and 3–5 days for the refund to reflect depending on your bank.",
  },
];

const tips = [
  { icon: <FiPackage size={18} />, title: "Keep Original Packaging", tip: "Don't discard the box or packaging until you're sure you're keeping the item. Returns without original packaging may not be accepted." },
  { icon: <MdOutlinePhotoCamera size={18} />, title: "Document Before Unpacking", tip: "If your delivery looks damaged, photograph the sealed package before opening. This is your best evidence for a damage claim." },
  { icon: <FiTag size={18} />, title: "Include All Accessories", tip: "Missing cables, manuals, warranty cards, or accessories can delay or void your return. Pack everything that came in the original box." },
  { icon: <FiBell size={18} />, title: "Act Within 48 Hours", tip: "For damaged or wrong items, report the issue within 48 hours of delivery for the smoothest resolution. The earlier, the better." },
];

/* ─────────────────────────────────────────────────────────────
   STEP CARD COMPONENT
───────────────────────────────────────────────────────────── */
const StepCard = ({ step, isLast }) => (
  <div className="relative flex gap-5 md:gap-7">
    {!isLast && (
      <div className="absolute left-6.5 top-14 w-0.5 h-[calc(100%+4px)] bg-linear-to-b from-gray-200 to-transparent z-0" />
    )}
    <div className="relative z-10 shrink-0">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-semibold text-lg shadow-lift"
        style={{ background: `linear-gradient(135deg,${step.color},${step.color}bb)`, boxShadow: `0 8px 24px ${step.color}33` }}>
        {step.number}
      </div>
    </div>
    <div className="flex-1 bg-white rounded-3xl p-5 md:p-6 mb-5 hover:-translate-y-0.5 transition-all duration-300"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
              style={{ background: step.color }}>
              Step {step.number}
            </span>
            <span className="text-[10px] text-ink/40 flex items-center gap-1">
              <FiClock size={9} /> {step.subtitle}
            </span>
          </div>
          <h3 className="text-base md:text-lg font-semibold text-ink leading-snug"
            style={{ fontFamily: "'Instrument Sans',sans-serif" }}>
            {step.title}
          </h3>
        </div>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: step.color + "15", color: step.color }}>
          {step.icon}
        </div>
      </div>
      <p className="text-sm text-ink/50 leading-relaxed mb-4">{step.desc}</p>
      <div className="grid sm:grid-cols-2 gap-2">
        {step.details.map((d) => (
          <div key={d} className="flex items-center gap-2 text-xs text-ink/60">
            <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
              style={{ background: step.color + "18" }}>
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
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const ReturnsRefund = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.35s ease; }
      `}</style>

      <div className="min-h-screen" style={{ background: "#F4F5F9" }}>

        {/* ══════════ HERO ══════════ */}
        <div className="relative overflow-hidden" style={{
          background: "linear-gradient(135deg,#0a0a0a 0%,#051a10 40%,#0a3d1f 70%,#059669 100%)",
        }}>
          <div className="absolute -top-20 right-1/4 w-80 h-80 rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle,#10B981,transparent 70%)" }} />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle,#059669,transparent 70%)" }} />
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
            backgroundSize: "30px 30px",
          }} />

          <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 pt-12 pb-24">
            <div className="flex items-center gap-2 text-xs text-white/30 mb-8">
              <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
              <FiChevronRight size={11} />
              <span className="text-white/60">Returns & Refunds</span>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 mt-1"
                style={{ background: "rgba(5,150,105,0.25)", border: "1px solid rgba(52,211,153,0.3)" }}>
                <FiRefreshCw size={24} className="text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-300/70 px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(5,150,105,0.2)", border: "1px solid rgba(52,211,153,0.2)" }}>
                    Customer Promise
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4 leading-tight"
                  style={{ fontFamily: "'Instrument Sans',sans-serif", textShadow: "0 4px 30px rgba(5,150,105,0.4)" }}>
                  Returns &<br />
                  <span style={{ background: "linear-gradient(90deg,#6ee7b7,#34d399,#6ee7b7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Refund Policy
                  </span>
                </h1>
                <p className="text-white/45 text-sm leading-relaxed max-w-lg">
                  Your satisfaction is guaranteed. If something isn't right, we make it easy to return products and get your money back - fast, fair, and hassle-free.
                </p>

                {/* Promise pills */}
                <div className="flex flex-wrap gap-3 mt-6">
                  {[
                    { icon: <FiRefreshCw size={12} />, text: "7-day returns" },
                    { icon: <FiTruck size={12} />, text: "Free pickup" },
                    { icon: <FiDollarSign size={12} />, text: "Full refund" },
                    { icon: <FaRegClock size={12} />, text: "3–5 day processing" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/80"
                      style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)" }}>
                      {icon} {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 48" preserveAspectRatio="none">
            <path d="M0,48 L0,24 Q360,0 720,24 Q1080,48 1440,24 L1440,48 Z" fill="#F4F5F9" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-10">

          {/* ══════════ RETURN PROCESS ══════════ */}
          <div>
            <div className="flex items-center gap-3 mb-7">
              <div className="w-1 h-7 rounded-full" style={{ background: "linear-gradient(#0E0E10,#FF6B00)" }} />
              <div>
                <h2 className="text-2xl font-semibold text-ink" style={{ fontFamily: "'Instrument Sans',sans-serif" }}>
                  How the Return Process Works
                </h2>
                <p className="text-xs text-ink/40 mt-0.5">Simple, transparent, and fully tracked</p>
              </div>
            </div>
            <div>
              {returnSteps.map((step, i) => (
                <StepCard key={step.number} step={step} isLast={i === returnSteps.length - 1} />
              ))}
            </div>
          </div>

          {/* ══════════ ELIGIBLE vs NOT ══════════ */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Eligible */}
            <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
                  <FaRegCheckCircle size={18} className="text-green-500" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-ink">Eligible for Return</h3>
                  <p className="text-[11px] text-ink/40">Items we'll accept back</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {eligibleItems.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                      <FiCheck size={10} className="text-green-600" />
                    </div>
                    <p className="text-sm text-ink/60">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Not eligible */}
            <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                  <FaRegTimesCircle size={18} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-ink">Not Eligible for Return</h3>
                  <p className="text-[11px] text-ink/40">Items we cannot accept</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {ineligibleItems.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                      <FiX size={10} className="text-red-500" />
                    </div>
                    <p className="text-sm text-ink/60">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══════════ REFUND TIMELINE VISUAL ══════════ */}
          <div className="bg-white rounded-3xl p-6 md:p-8" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 rounded-full bg-[#059669]" />
              <h2 className="text-xl font-semibold text-ink" style={{ fontFamily: "'Instrument Sans',sans-serif" }}>
                Refund Timeline
              </h2>
            </div>
            <div className="grid sm:grid-cols-4 gap-4">
              {[
                { day: "Day 1", label: "Return Approved", color: "#0E0E10", icon: <FiCheck size={14} /> },
                { day: "Day 2", label: "Item Picked Up", color: "#FF6B00", icon: <FiTruck size={14} /> },
                { day: "Day 3", label: "Inspected & Passed", color: "#D97706", icon: <FiShield size={14} /> },
                { day: "Day 5–8", label: "Refund Issued", color: "#059669", icon: <FiDollarSign size={14} /> },
              ].map(({ day, label, color, icon }, i) => (
                <div key={day} className="relative flex flex-col items-center text-center">
                  {i < 3 && (
                    <div className="hidden sm:block absolute left-[calc(50%+28px)] top-5 w-[calc(100%-56px)] h-0.5 bg-sand" />
                  )}
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white mb-3 z-10"
                    style={{ background: color, boxShadow: `0 4px 16px ${color}40` }}>
                    {icon}
                  </div>
                  <p className="text-xs font-semibold text-ink">{day}</p>
                  <p className="text-[11px] text-ink/40 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <FiAlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>Jovo Wallet refunds are instant</strong> once the inspection is complete. Bank and card refunds take 3–5 additional business days depending on your financial institution.
              </p>
            </div>
          </div>

          {/* ══════════ PRO TIPS ══════════ */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full bg-amber-400" />
              <h2 className="text-xl font-semibold text-ink flex items-center gap-2" style={{ fontFamily: "'Instrument Sans',sans-serif" }}>
                <FaRegLightbulb size={18} /> Tips for Smooth Returns
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tips.map(({ icon, title, tip }) => (
                <div key={title} className="bg-white rounded-2xl p-5 hover:-translate-y-1 transition-all duration-200"
                  style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                  <span className="text-2xl block mb-3 text-[#0E0E10]">{icon}</span>
                  <h4 className="text-sm font-semibold text-ink mb-2">{title}</h4>
                  <p className="text-xs text-ink/50 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ══════════ FAQs ══════════ */}
          <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
            <div className="px-6 md:px-8 pt-7 pb-5 border-b border-ink/10">
              <div className="flex items-center gap-3">
                <div className="w-1 h-7 rounded-full bg-[#059669]" />
                <h2 className="text-xl font-semibold text-ink" style={{ fontFamily: "'Instrument Sans',sans-serif" }}>
                  Frequently Asked Questions
                </h2>
              </div>
            </div>
            <div className="p-5 md:p-7 space-y-3 fade-up">
              {faqData.map(({ q, a }, i) => (
                <div key={i}
                  className={`rounded-2xl border overflow-hidden transition-all ${
                    openFaq === i ? "border-[#059669]/25 shadow-soft" : "border-ink/10 hover:border-ink/10"
                  }`}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className={`w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors ${
                      openFaq === i ? "bg-[#059669]/3" : "bg-white hover:bg-ink/5"
                    }`}>
                    <p className={`text-sm font-bold ${openFaq === i ? "text-[#059669]" : "text-ink"}`}>{q}</p>
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      openFaq === i ? "bg-[#059669] text-white" : "bg-sand text-ink/40"
                    }`}>
                      {openFaq === i ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
                    </div>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 bg-white border-t border-gray-50">
                      <div className="w-8 h-0.5 rounded-full bg-[#059669] mt-3 mb-3" />
                      <p className="text-sm text-ink/60 leading-relaxed">{a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ══════════ CONTACT / CTA ══════════ */}
          <div className="relative rounded-3xl overflow-hidden p-7 md:p-10 text-white"
            style={{ background: "linear-gradient(135deg,#0a0a0a 0%,#051a10 50%,#059669 100%)" }}>
            <div className="absolute inset-0 opacity-[0.05]" style={{
              backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
              backgroundSize: "26px 26px",
            }} />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MdOutlineSupportAgent size={18} className="text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Need help with a return?</span>
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-2" style={{ fontFamily: "'Instrument Sans',sans-serif" }}>
                  Our team is ready to assist
                </h3>
                <p className="text-white/40 text-sm max-w-md">
                  Can't find your answer? Reach us via WhatsApp, email, or visit the Help Centre for step-by-step guidance.
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white transition-all hover:scale-105"
                  style={{ background: "#25D366", boxShadow: "0 4px 20px rgba(37,211,102,0.35)" }}>
                  <FaWhatsapp size={16} /> Chat on WhatsApp
                </a>
                <Link href="/help"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white/70 hover:text-white border border-white/15 hover:border-white/30 transition-all">
                  Visit Help Centre <FiArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* bottom note */}
          <div className="flex flex-wrap items-center justify-center gap-4 py-2 text-xs text-ink/40">
            <span className="flex items-center gap-1.5"><FiRefreshCw size={11} /> Policy effective: January 2025</span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1.5"><MdVerified size={12} className="text-green-400" /> Jovo Buyer Protection</span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1.5"><FiShield size={11} /> Secure & Fair Returns</span>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ReturnsRefund;