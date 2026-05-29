'use client'
import Link from 'next/link'
import { useState } from "react";
import {
  FiChevronDown, FiChevronUp, FiShield, FiLock,
  FiFileText, FiAlertCircle, FiCheck, FiMail,
  FiChevronRight, FiRefreshCw, FiEye, FiGlobe,
  FiCreditCard, FiUser, FiArrowRight, FiBookOpen,
} from "react-icons/fi";
import {
  MdVerified, MdGavel, MdPrivacyTip, MdSecurity,
  MdOutlinePolicy, MdOutlineBusinessCenter, MdStorefront,
  MdWarning, MdReport, MdInfoOutline,
} from "react-icons/md";
import { FaBalanceScale, FaHandshake, FaRegFileAlt } from "react-icons/fa";
import Footer from "@/components/layout/Footer";

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const lastUpdated = "March 2025";
const effectiveDate = "1 January 2025";

interface Section {
  id: string;
  icon: React.ReactNode;
  color: string;
  title: string;
  summary: string;
  content: string[];
}

const termsSections: Section[] = [
  {
    id: "intro",
    icon: <FaRegFileAlt size={17} />,
    color: "#B42225",
    title: "Introduction & Acceptance",
    summary: "Your agreement to use Jovo Marketplace.",
    content: [
      "Welcome to Jovo Marketplace, operated by Jovo Technologies Ltd. ('Jovo', 'we', 'us', or 'our'). By accessing or using our website, mobile application, or any related services (collectively, the 'Platform'), you agree to be bound by these Terms & Conditions ('Terms').",
      "These Terms constitute a legally binding agreement between you and Jovo. If you do not agree to these Terms in full, you must immediately discontinue use of the Platform. Your continued use of the Platform after any changes to these Terms constitutes your acceptance of the updated Terms.",
      "These Terms apply to all users of the Platform including buyers, sellers, visitors, and any other individuals who access or use our services in any capacity.",
    ],
  },
  {
    id: "eligibility",
    icon: <FiUser size={17} />,
    color: "#2563EB",
    title: "Eligibility & Account Registration",
    summary: "Who can use Jovo and how accounts work.",
    content: [
      "You must be at least 18 years of age to create an account and use our services. By registering, you represent and warrant that you meet this age requirement and have the legal capacity to enter into binding contracts.",
      "When registering, you agree to provide accurate, current, and complete information. You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. Notify us immediately at support@jovo.ng if you suspect unauthorised access.",
      "Jovo reserves the right to suspend, deactivate, or permanently ban any account found to be in violation of these Terms, involved in fraudulent activity, or detrimental to the platform community — without prior notice.",
    ],
  },
  {
    id: "buying",
    icon: <FiCreditCard size={17} />,
    color: "#059669",
    title: "Buying, Payments & Checkout",
    summary: "How purchases and payments are processed.",
    content: [
      "When you place an order on Jovo, you are entering into a direct transaction with the seller. Jovo acts as a marketplace facilitator and is not the seller of record unless explicitly stated. By completing checkout, you confirm that you intend to purchase the listed item at the stated price.",
      "All payments are processed through secure, PCI-DSS compliant payment gateways. Jovo accepts debit/credit cards (Visa, Mastercard, Verve), bank transfers, USSD, and Jovo Wallet balances. All prices are displayed in Nigerian Naira (₦) and are inclusive of applicable taxes unless stated otherwise.",
      "Jovo reserves the right to cancel orders where payment is not confirmed, items become unavailable, or where fraudulent activity is detected. In such cases, any charged amounts will be fully refunded within 3–5 business days to the original payment method.",
    ],
  },
  {
    id: "selling",
    icon: <MdOutlineBusinessCenter size={17} />,
    color: "#7C3AED",
    title: "Selling & Vendor Obligations",
    summary: "Rules and responsibilities for sellers.",
    content: [
      "To sell on Jovo, you must complete vendor verification including submission of a valid passport, business details, and a valid Nigerian bank account. By listing products, you confirm that you have the legal right to sell them and that all product descriptions, images, and pricing are accurate and not misleading.",
      "Sellers are prohibited from listing counterfeit, stolen, dangerous, prohibited, or illegal goods. Jovo reserves the right to remove any listing that violates these Terms or applicable Nigerian law, and to permanently ban repeat offenders without compensation.",
      "Jovo charges a commission on each completed sale (ranging from 5% to 10% depending on product category). Seller payouts are disbursed weekly every Monday for the preceding week's confirmed and delivered orders. Detailed commission structures are available in the Seller Dashboard.",
    ],
  },
  {
    id: "returns",
    icon: <FiRefreshCw size={17} />,
    color: "#D97706",
    title: "Returns, Refunds & Disputes",
    summary: "How we handle returns and resolve issues.",
    content: [
      "Eligible items may be returned within 7 days of delivery, provided they are unused, in original packaging, and accompanied by all accessories and documentation. To initiate a return, go to My Orders → Request Return. Return eligibility is determined by the product category and seller policy.",
      "Refunds are processed within 3–5 business days of receiving and inspecting the returned item. Refunds are credited to the original payment method or your Jovo Wallet at your preference. Delivery fees are non-refundable unless the return is caused by a seller error.",
      "For disputes between buyers and sellers, Jovo provides a mediation service. Either party may raise a dispute within 14 days of delivery. Our team will review evidence from both parties and issue a binding resolution. Jovo's decision in dispute cases is final.",
    ],
  },
  {
    id: "privacy",
    icon: <MdPrivacyTip size={17} />,
    color: "#0891B2",
    title: "Privacy & Data Protection",
    summary: "How we collect and use your personal data.",
    content: [
      "Jovo collects personal data including your name, email address, phone number, delivery address, and transaction history for the purpose of providing and improving our services. By using our Platform, you consent to this data collection as described in our full Privacy Policy.",
      "We do not sell, rent, or share your personal data with third parties for their marketing purposes. Data is shared only with service providers essential to platform operations (e.g. payment processors, logistics partners) under strict confidentiality agreements.",
      "You have the right to access, correct, or request deletion of your personal data at any time. To exercise these rights, contact us at privacy@jovo.ng. We comply with the Nigeria Data Protection Regulation (NDPR) and all applicable data protection laws.",
    ],
  },
  {
    id: "conduct",
    icon: <FaHandshake size={17} />,
    color: "#9333EA",
    title: "User Conduct & Prohibited Activities",
    summary: "What you must never do on Jovo.",
    content: [
      "You agree not to use the Platform for any unlawful purpose, to violate any applicable local, national, or international law, or to engage in any form of fraud, harassment, impersonation, or abuse of other users or Jovo staff.",
      "Prohibited activities include but are not limited to: scraping or harvesting platform data, submitting false reviews, manipulating search rankings, creating duplicate accounts to circumvent bans, attempting to reverse-engineer any part of the Platform, and any activity that disrupts or degrades the performance of our systems.",
      "Violations may result in immediate account suspension, permanent ban, reversal of transactions, and where applicable, referral to law enforcement authorities. Jovo cooperates fully with Nigerian law enforcement agencies on matters of fraud and cybercrime.",
    ],
  },
  {
    id: "liability",
    icon: <MdGavel size={17} />,
    color: "#DC2626",
    title: "Limitation of Liability",
    summary: "The extent of Jovo's legal responsibility.",
    content: [
      "The Jovo Platform is provided on an 'as-is' and 'as-available' basis. We make no warranties, express or implied, regarding the accuracy, reliability, completeness, or fitness for a particular purpose of any content or services provided through the Platform.",
      "To the maximum extent permitted by applicable law, Jovo shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of profits, goodwill, or data — arising out of your use of the Platform, even if we have been advised of the possibility of such damages.",
      "Jovo's total aggregate liability to you for any cause of action shall not exceed the total amount paid by you to Jovo in the three (3) months preceding the event giving rise to the claim. Nothing in these Terms limits liability for fraud, death, or personal injury caused by gross negligence.",
    ],
  },
  {
    id: "intellectual",
    icon: <FiEye size={17} />,
    color: "#B45309",
    title: "Intellectual Property",
    summary: "Ownership of content, logos, and trademarks.",
    content: [
      "All content on the Jovo Platform — including but not limited to logos, trade names, graphics, UI designs, software, and editorial content — is the exclusive property of Jovo Technologies Ltd. or its licensed partners and is protected by Nigerian and international intellectual property law.",
      "You are granted a limited, non-exclusive, non-transferable licence to access and use the Platform for personal, non-commercial purposes only. You may not copy, reproduce, distribute, modify, create derivative works of, or publicly display any Platform content without prior written permission from Jovo.",
      "By uploading product images, descriptions, or reviews to the Platform, you grant Jovo a worldwide, royalty-free, non-exclusive licence to use, display, and distribute that content solely for the purpose of operating and improving the Platform.",
    ],
  },
  {
    id: "governing",
    icon: <FiGlobe size={17} />,
    color: "#0f766e",
    title: "Governing Law & Dispute Resolution",
    summary: "Applicable law and how conflicts are resolved.",
    content: [
      "These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to conflict of law principles. Any dispute arising out of or related to these Terms or your use of the Platform shall first be subject to good-faith negotiation between the parties.",
      "If a dispute cannot be resolved through negotiation within 30 days, it shall be submitted to binding arbitration in accordance with the Arbitration and Conciliation Act (Cap. A18, Laws of the Federation of Nigeria 2004). Arbitration shall be conducted in Owerri, Imo State, Nigeria.",
      "Notwithstanding the above, Jovo retains the right to seek injunctive or equitable relief in any competent court of law in Nigeria to protect its intellectual property rights or prevent irreparable harm.",
    ],
  },
  {
    id: "changes",
    icon: <FiRefreshCw size={17} />,
    color: "#475569",
    title: "Amendments to These Terms",
    summary: "How and when we update our Terms.",
    content: [
      "Jovo reserves the right to modify, update, or replace these Terms at any time. When we make material changes, we will notify registered users via email and display a prominent notice on the Platform for at least 14 days before the changes take effect.",
      "Your continued use of the Platform after the effective date of any changes constitutes your acceptance of the revised Terms. If you do not agree to the new Terms, you must stop using the Platform and may close your account.",
      "We recommend reviewing these Terms periodically. The 'Last Updated' date at the top of this page reflects when these Terms were most recently revised. Archived versions of previous Terms are available upon request.",
    ],
  },
];

const highlights = [
  { icon: <FiShield size={16} />, label: "SSL Secured",      sub: "All data encrypted",          color: "#059669" },
  { icon: <MdVerified size={16} />, label: "NDPR Compliant", sub: "Nigerian data law",           color: "#2563EB" },
  { icon: <FaBalanceScale size={14} />, label: "Fair Policy", sub: "Buyer & seller protection",  color: "#7C3AED" },
  { icon: <MdSecurity size={16} />, label: "Fraud Protected", sub: "24/7 monitoring",            color: "#B42225" },
];

/* ─────────────────────────────────────────────────────────────
   SECTION COMPONENT
───────────────────────────────────────────────────────────── */
interface TermsSectionProps {
  section: Section;
  index: number;
  isOpen: boolean;
  onToggle: (index: number) => void;
}

const TermsSection = ({ section, index, isOpen, onToggle }: TermsSectionProps) => (
  <div
    id={section.id}
    className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
      isOpen ? "border-[#B42225]/25 shadow-sm" : "border-gray-100 hover:border-gray-200"
    }`}
  >
    <button
      onClick={() => onToggle(index)}
      className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${
        isOpen ? "bg-[#B42225]/3" : "bg-white hover:bg-gray-50"
      }`}
    >
      {/* Number */}
      <span className="text-xs font-black text-gray-300 w-5 shrink-0">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white transition-transform"
        style={{ background: isOpen ? section.color : "#F3F4F8", color: isOpen ? "white" : section.color }}
      >
        {section.icon}
      </div>

      {/* Title + summary */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-black leading-snug ${isOpen ? "text-[#B42225]" : "text-gray-800"}`}>
          {section.title}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5 hidden sm:block">{section.summary}</p>
      </div>

      {/* Chevron */}
      <div
        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
          isOpen ? "bg-[#B42225] text-white" : "bg-gray-100 text-gray-400"
        }`}
      >
        {isOpen ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
      </div>
    </button>

    {isOpen && (
      <div className="px-5 pb-6 bg-white border-t border-gray-50">
        <div className="w-8 h-0.5 rounded-full mt-4 mb-4" style={{ background: section.color }} />
        <div className="space-y-3 pl-0 md:pl-14">
          {section.content.map((para, i) => (
            <p key={i} className="text-sm text-gray-600 leading-relaxed">{para}</p>
          ))}
        </div>
      </div>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const Terms = () => {
  const [openSection, setOpenSection] = useState<number | string | null>(null);
  const [allOpen, setAllOpen]         = useState(false);

  const handleToggle = (index: number) => setOpenSection(openSection === index ? null : index);

  const handleExpandAll = () => {
    setAllOpen(!allOpen);
    setOpenSection(allOpen ? null : "all");
  };

  const isOpen = (index: number): boolean => openSection === "all" || openSection === index;

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.3s ease; }
      `}</style>

      <div className="min-h-screen" style={{ background: "#F4F5F9" }}>

        {/* ══════════ HERO ══════════ */}
        <div className="relative overflow-hidden" style={{
          background: "linear-gradient(135deg,#0a0a0a 0%,#0f0f1a 40%,#1a1035 70%,#2a1a55 100%)",
        }}>
          {/* Orbs */}
          <div className="absolute top-0 right-1/3 w-72 h-72 rounded-full opacity-15 pointer-events-none"
            style={{ background: "radial-gradient(circle,#7C3AED,transparent 70%)" }} />
          <div className="absolute bottom-0 left-1/4 w-56 h-56 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle,#B42225,transparent 70%)" }} />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

          <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 pt-12 pb-20">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-white/30 mb-8">
              <Link href="/shop" className="hover:text-white/60 transition-colors">Shop</Link>
              <FiChevronRight size={11} />
              <span className="text-white/60">Terms & Conditions</span>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 mt-1"
                style={{ background: "rgba(124,58,237,0.25)", border: "1px solid rgba(167,139,250,0.3)" }}>
                <MdOutlinePolicy size={26} className="text-purple-300" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-300/70 px-3 py-1 rounded-full"
                    style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(167,139,250,0.2)" }}>
                    Legal Document
                  </span>
                  <span className="text-[10px] text-white/30">Effective: {effectiveDate}</span>
                  <span className="text-[10px] text-white/30">Last updated: {lastUpdated}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-3"
                  style={{ fontFamily: "'Georgia', serif", textShadow: "0 4px 30px rgba(124,58,237,0.3)" }}>
                  Terms &<br />
                  <span style={{ background: "linear-gradient(90deg,#c4b5fd,#a78bfa,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Conditions
                  </span>
                </h1>
                <p className="text-white/45 text-sm max-w-lg leading-relaxed">
                  These Terms govern your use of Jovo Marketplace. By using our platform, you agree to these Terms in full. Please read them carefully before proceeding.
                </p>
              </div>
            </div>

            {/* Trust highlights */}
            <div className="flex flex-wrap gap-3 mt-8">
              {highlights.map(({ icon, label, sub, color }) => (
                <div key={label} className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                  <span style={{ color }}>{icon}</span>
                  <div>
                    <p className="text-white text-[11px] font-bold leading-none">{label}</p>
                    <p className="text-white/40 text-[9px] mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 48" preserveAspectRatio="none">
            <path d="M0,48 L0,24 Q360,0 720,24 Q1080,48 1440,24 L1440,48 Z" fill="#F4F5F9" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">

          {/* ══════════ TABLE OF CONTENTS ══════════ */}
          <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full bg-[#7C3AED]" />
                <h2 className="text-base font-black text-gray-900">Table of Contents</h2>
              </div>
              <button
                onClick={handleExpandAll}
                className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                style={{ color: "#B42225", background: "rgba(180,34,37,0.06)" }}>
                {allOpen ? "Collapse All" : "Expand All"}
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {termsSections.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => { setOpenSection(i); setAllOpen(false); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group text-left"
                >
                  <span className="text-[10px] font-black text-gray-300 w-5 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-white"
                    style={{ background: s.color, opacity: 0.85 }}>
                    <span style={{ transform: "scale(0.75)", display: "block" }}>{s.icon}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-700 group-hover:text-[#B42225] transition-colors flex-1 truncate">
                    {s.title}
                  </span>
                  <FiChevronRight size={12} className="text-gray-300 group-hover:text-[#B42225] shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* ══════════ TERMS ACCORDION ══════════ */}
          <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
            <div className="px-6 md:px-8 pt-7 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-1 h-7 rounded-full bg-[#B42225]" />
                <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
                  Full Terms
                </h2>
                <span className="text-sm text-gray-400 ml-1">({termsSections.length} sections)</span>
              </div>
            </div>

            <div className="p-5 md:p-7 space-y-3 fade-up">
              {termsSections.map((section, index) => (
                <TermsSection
                  key={section.id}
                  section={section}
                  index={index}
                  isOpen={isOpen(index)}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>

          {/* ══════════ KEY REMINDERS ══════════ */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 rounded-full bg-amber-400" />
              <h2 className="text-lg font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
                Key Reminders
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  icon: <FiRefreshCw size={18} />,
                  color: "bg-amber-50 border-amber-200",
                  iconColor: "#D97706",
                  title: "Terms May Change",
                  tip: "We may update these Terms periodically. Check this page regularly or watch for email notifications about material changes.",
                },
                {
                  icon: <FiLock size={18} />,
                  color: "bg-blue-50 border-blue-200",
                  iconColor: "#2563EB",
                  title: "Keep Credentials Private",
                  tip: "Never share your Jovo password with anyone. We will never ask for your password by email, phone, or chat.",
                },
                {
                  icon: <MdWarning size={18} />,
                  color: "bg-red-50 border-red-200",
                  iconColor: "#DC2626",
                  title: "Report Suspicious Activity",
                  tip: "If you notice unusual activity on your account or suspect fraud, contact support immediately at support@jovo.ng.",
                },
              ].map(({ icon, title, tip, color, iconColor }) => (
                <div key={title} className={`flex gap-4 p-5 rounded-2xl border ${color}`}>
                  <div className="shrink-0" style={{ color: iconColor }}>{icon}</div>
                  <div>
                    <p className="text-sm font-black text-gray-800 mb-1">{title}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══════════ RELATED POLICIES ══════════ */}
          <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(#B42225,#7C3AED)" }} />
              <h2 className="text-base font-black text-gray-900">Related Policies</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-4 gap-3">
              {[
                { icon: <MdPrivacyTip size={18} />,  label: "Privacy Policy",       sub: "How we use your data",           color: "#0891B2", href: "/privacy" },
                { icon: <FiRefreshCw size={16} />,   label: "Returns & Refunds",    sub: "7-day return policy",            color: "#059669", href: "/returns" },
                { icon: <FiShield size={16} />,      label: "Buyer Protection",     sub: "Your purchase is safe",          color: "#7C3AED", href: "/help" },
                { icon: <MdStorefront size={18} />,  label: "Seller Guidelines",    sub: "Rules for vendors",             color: "#D97706", href: "/become-seller" },
              ].map(({ icon, label, sub, color, href }) => (
                <Link key={label} href={href}
                  className="group flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 transition-all">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ background: color }}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 group-hover:text-[#B42225] transition-colors">{label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                  </div>
                  <FiChevronRight size={12} className="text-gray-300 group-hover:text-[#B42225] transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* ══════════ CONTACT / ACCEPTANCE ══════════ */}
          <div className="rounded-3xl p-6 md:p-8 text-white relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#0a0a0a 0%,#0f0f1a 50%,#1a1035 100%)" }}>
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.8) 1px,transparent 1px)",
              backgroundSize: "24px 24px",
            }} />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FiCheck size={16} className="text-green-400" />
                  <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Agreement</span>
                </div>
                <h3 className="text-xl font-black mb-2" style={{ fontFamily: "'Georgia', serif" }}>
                  By using Jovo, you accept these Terms
                </h3>
                <p className="text-white/40 text-sm max-w-md">
                  Continued use of the Jovo Platform constitutes acceptance of these Terms & Conditions. For legal enquiries, contact our compliance team.
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <a href="mailto:legal@jovo.ng"
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#B42225,#FF6B00)", boxShadow: "0 4px 20px rgba(180,34,37,0.4)" }}>
                  <FiMail size={15} /> legal@jovo.ng
                </a>
                <Link href="/help"
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white/70 hover:text-white transition-all border border-white/10 hover:border-white/25">
                  Visit Help Center <FiArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Doc info footer */}
          <div className="flex flex-wrap items-center justify-center gap-4 py-2 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><FaRegFileAlt size={12} /> Document version: v3.2</span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1.5"><FiRefreshCw size={11} /> Last updated: {lastUpdated}</span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1.5"><MdVerified size={12} className="text-green-400" /> NDPR Compliant</span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1.5"><FiGlobe size={11} /> Governed by Nigerian Law</span>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Terms;