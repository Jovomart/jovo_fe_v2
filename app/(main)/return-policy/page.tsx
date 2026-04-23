'use client'
import { useRouter } from 'next/navigation'
// src/pages/ReturnPolicy.jsx
import { useState } from "react";
import Footer from "@/components/layout/Footer";
import { 
  FiChevronDown, FiCheck, FiPackage, FiTruck, FiRefreshCw, 
  FiDollarSign, FiAlertCircle, FiX, FiMail, FiHelpCircle,
  FiClock, FiCalendar, FiPercent, FiShield, FiBox,
} from "react-icons/fi";
import { FaWhatsapp, FaRegLightbulb, FaEnvelope, FaHeadset } from "react-icons/fa";

const eligibilitySections = [
  {
    icon: <FiCheck size={18} />,
    color: "bg-green-50 text-green-600",
    title: "Eligible for Return",
    items: [
      "Product received in damaged or defective condition",
      "Wrong item delivered (different from what was ordered)",
      "Product is unused and in its original condition",
      "All original packaging, accessories, and manuals included",
      "Return requested within 7 days of delivery",
      "Valid proof of purchase or order ID provided",
    ],
    type: "success",
  },
  {
    icon: <FiX size={18} />,
    color: "bg-red-50 text-red-600",
    title: "Not Eligible for Return",
    items: [
      "Products returned after the 7-day return window",
      "Items that have been used, worn, or altered",
      "Products with removed or damaged serial number labels",
      "Digital products, software, or downloadable content",
      "Perishable goods, food items, or personal care products",
      "Items marked as 'Final Sale' or 'Non-Returnable' at purchase",
    ],
    type: "error",
  },
];

const faqs = [
  {
    question: "How long does the refund take after my return is approved?",
    answer: "Once we receive and inspect your returned item, refunds are processed within 5–10 business days. The time it takes to appear in your account depends on your bank or payment provider.",
  },
  {
    question: "Who pays for return shipping?",
    answer: "If the return is due to a defective product or our error, we cover the return shipping costs and provide a prepaid label. For change-of-mind returns, the customer is responsible for shipping costs.",
  },
  {
    question: "Can I exchange an item instead of returning it?",
    answer: "Yes! If you'd like a different size, colour, or variant, contact our support team and we'll arrange an exchange subject to stock availability. Exchanges follow the same 7-day eligibility window.",
  },
  {
    question: "What happens if my return is rejected?",
    answer: "If your return does not meet our eligibility criteria, we will notify you by email with the reason. The item will be shipped back to you at no additional cost within 3–5 business days.",
  },
  {
    question: "How do I track my return shipment?",
    answer: "Once you drop off your return package, use the tracking number on your prepaid label to monitor its progress. You'll also receive email updates when we receive and inspect your item.",
  },
];

const tips = [
  { icon: <FiPackage size={18} />, text: "Keep the original packaging until you're completely satisfied with your order." },
  { icon: <FiCamera size={18} />, text: "Take photos of the product immediately upon delivery if it appears damaged." },
  { icon: <FiFileText size={18} />, text: "Save your order confirmation email — you'll need the order ID to initiate a return." },
  { icon: <FiTruck size={18} />, text: "Track your return shipment to confirm it reaches us safely before the deadline." },
];

// Add FiCamera if not already imported
import { FiCamera, FiFileText } from "react-icons/fi";

const ReturnPolicy = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0a0a0a 0%,#1a0303 40%,#B42225 100%)" }}>
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle,#FF6B00,transparent 65%)" }} />
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/70 text-xs font-semibold px-4 py-2 rounded-full mb-6 tracking-widest uppercase">
            <FiPackage size={12} /> Return Policy
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight" style={{ fontFamily: "'Georgia',serif" }}>
            Hassle-Free <span style={{ background: "linear-gradient(90deg,#fca5a5,#fdba74)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Returns</span>
          </h1>
          <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Not satisfied with your order? We make returns simple, fast, and stress-free. Return eligible items within 7 days for a full refund.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              { label: "7-Day Return Window", icon: <FiCalendar size={11} /> },
              { label: "Fast Refunds", icon: <FiRefreshCw size={11} /> },
              { label: "Free Return Shipping", icon: <FiTruck size={11} /> },
              { label: "No Hidden Fees", icon: <FiShield size={11} /> },
            ].map(({ label, icon }) => (
              <span key={label} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {icon} {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { num: "7", unit: "Days", label: "Return window", icon: <FiCalendar size={16} /> },
            { num: "5–10", unit: "Days", label: "Refund processing", icon: <FiClock size={16} /> },
            { num: "100%", unit: "", label: "Free on defective items", icon: <FiPercent size={16} /> },
            { num: "24/7", unit: "", label: "Support available", icon: <FaHeadset size={16} /> },
          ].map(({ num, unit, label, icon }) => (
            <div key={label} className="bg-white rounded-2xl p-5 text-center border border-gray-100"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <div className="text-[#B42225] flex justify-center mb-2">{icon}</div>
              <p className="font-black text-2xl text-[#B42225]" style={{ fontFamily: "'Georgia',serif" }}>
                {num}<span className="text-base ml-0.5">{unit}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Return process timeline */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Georgia',serif" }}>How to Return an Item</h2>
          <p className="text-gray-500 text-sm mb-10">Follow these 4 simple steps to complete your return.</p>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-linear-to-b from-[#B42225] to-[#FF6B00] hidden md:block" />

            <div className="space-y-6">
              {[
                {
                  icon: <FiPackage size={20} />,
                  step: "01",
                  title: "Request a Return",
                  desc: "Contact our support team within 7 days of receiving your order. Have your order ID ready. You can reach us via the Help Center, email, or WhatsApp.",
                  time: "Within 7 days of delivery",
                },
                {
                  icon: <FiCheck size={20} />,
                  step: "02",
                  title: "Get Approval & Shipping Label",
                  desc: "Our team will review your request within 24 hours. If approved, we'll send you a prepaid return shipping label and instructions via email.",
                  time: "Within 24 hours",
                },
                {
                  icon: <FiTruck size={20} />,
                  step: "03",
                  title: "Pack & Ship the Product",
                  desc: "Pack the item securely in its original packaging with all accessories and documentation. Attach the prepaid label and drop it off at the nearest courier point.",
                  time: "Within 3 days of approval",
                },
                {
                  icon: <FiDollarSign size={20} />,
                  step: "04",
                  title: "Receive Your Refund",
                  desc: "Once we receive and inspect your return, we'll process your refund to the original payment method. You'll receive a confirmation email when the refund is issued.",
                  time: "5–10 business days after receipt",
                },
              ].map((step, i) => (
                <div key={i} className="flex gap-5">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white z-10 shrink-0"
                      style={{ background: "linear-gradient(135deg,#B42225,#FF6B00)", boxShadow: "0 4px 16px rgba(180,34,37,0.35)" }}>
                      {step.icon}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 flex-1 border border-gray-100"
                    style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <span className="text-[10px] font-black text-[#B42225] tracking-widest uppercase">Step {step.step}</span>
                        <h3 className="font-black text-gray-900 text-base mt-0.5" style={{ fontFamily: "'Georgia',serif" }}>{step.title}</h3>
                      </div>
                      <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">{step.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed mt-2">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Eligibility */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Georgia',serif" }}>Return Eligibility</h2>
          <p className="text-gray-500 text-sm mb-8">Check if your item qualifies for a return before submitting a request.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {eligibilitySections.map(({ icon, color, title, items, type }) => (
              <div key={title} className={`bg-white rounded-2xl border p-6 ${type === "success" ? "border-green-100" : "border-red-100"}`}
                style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
                  <h3 className="font-black text-gray-900 text-base" style={{ fontFamily: "'Georgia',serif" }}>{title}</h3>
                </div>
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        type === "success" ? "bg-green-100" : "bg-red-100"
                      }`}>
                        {type === "success"
                          ? <FiCheck size={11} className="text-green-600" />
                          : <FiX size={11} className="text-red-500" />}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Georgia',serif" }}>Frequently Asked Questions</h2>
          <p className="text-gray-500 text-sm mb-8">Everything you need to know about returns and refunds.</p>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                style={{ boxShadow: openFaq === index ? "0 8px 32px rgba(180,34,37,0.1)" : "0 2px 8px rgba(0,0,0,0.04)" }}>
                <button onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-[#B42225]/10 flex items-center justify-center shrink-0">
                    <FiHelpCircle size={15} className="text-[#B42225]" />
                  </div>
                  <span className="flex-1 font-bold text-gray-800 text-sm">{faq.question}</span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${
                    openFaq === index ? "rotate-180 bg-[#B42225] text-white" : "bg-gray-100 text-gray-400"
                  }`}>
                    <FiChevronDown size={15} />
                  </div>
                </button>
                <div className={`transition-all duration-300 overflow-hidden ${openFaq === index ? "max-h-60" : "max-h-0"}`}>
                  <div className="px-5 pb-5 pt-1 border-t border-gray-50">
                    <p className="text-sm text-gray-600 leading-relaxed pl-12">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-3xl p-8 mb-16" style={{ background: "linear-gradient(135deg,#0a0a0a,#1a0303,#2d0808)" }}>
          <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2" style={{ fontFamily: "'Georgia',serif" }}>
            <FaRegLightbulb size={20} /> Tips for a Smooth Return
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tips.map(({ icon, text }, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                <span className="text-white/60 shrink-0">{icon}</span>
                <p className="text-sm text-white/60 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact banner */}
        <div className="rounded-3xl p-8 text-center" style={{ background: "linear-gradient(135deg,#B42225,#FF6B00)", boxShadow: "0 8px 32px rgba(180,34,37,0.3)" }}>
          <h2 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "'Georgia',serif" }}>Need Help With a Return?</h2>
          <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">
            Our support team is available 24/7 to assist you with returns, refunds, and exchanges.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="mailto:support@jovomart.com"
              className="inline-flex items-center gap-2 bg-white text-[#B42225] font-black text-sm px-6 py-3.5 rounded-full hover:shadow-lg transition-all">
              <FiMail size={16} /> Email Support
            </a>
            <a href="/help"
              className="inline-flex items-center gap-2 bg-white/15 border border-white/30 text-white font-black text-sm px-6 py-3.5 rounded-full hover:bg-white/20 transition-all">
              <FiHelpCircle size={16} /> Help Center
            </a>
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
};

export default ReturnPolicy;