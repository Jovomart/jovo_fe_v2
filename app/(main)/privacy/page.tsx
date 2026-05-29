'use client'
// src/pages/Privacy.jsx
import { useState } from "react";
import Footer from "@/components/layout/Footer";
import { 
  FiChevronDown, FiShield, FiDatabase, FiShare2, FiUser, 
  FiLock, FiRefreshCw, FiCheck, FiMail, FiEye, FiKey,
  FiShieldOff, FiInfo, FiAlertOctagon, FiBell, FiSettings
} from "react-icons/fi";
import { MdGppGood, MdVerified, MdSecurity, MdOutlinePrivacyTip } from "react-icons/md";
import { FaShieldAlt, FaRegEye, FaHandSpock } from "react-icons/fa";

const privacySections = [
  {
    icon: <FiDatabase size={18} />,
    color: "bg-blue-50 text-blue-600",
    title: "Data We Collect",
    content: `We collect information you provide directly to us when creating an account, making a purchase, or contacting our support team. This includes:

• Personal identifiers: full name, email address, phone number, and date of birth
• Account information: username, password (encrypted), and profile photo
• Transaction data: purchase history, payment method details (stored securely via our payment partners), and delivery addresses
• Communication data: messages sent to our support team, reviews, and feedback
• Device & usage data: IP address, browser type, pages visited, and time spent on the platform

We only collect data that is necessary to provide you with a safe and seamless shopping experience on JOVO.`,
  },
  {
    icon: <FiUser size={18} />,
    color: "bg-purple-50 text-purple-600",
    title: "How We Use Your Data",
    content: `Your personal data is used to deliver, maintain, and continuously improve our services. Specifically, we use your data to:

• Process and fulfil your orders, including sending confirmations and delivery updates
• Personalise your shopping experience with relevant product recommendations
• Send important account notifications such as password resets and security alerts
• Communicate promotional offers, flash sales, and updates (only if you've opted in)
• Analyse platform usage patterns to identify bugs and improve performance
• Prevent fraudulent activity and ensure the safety of all users
• Comply with legal and regulatory obligations

We will never use your data for purposes not listed here without first obtaining your explicit consent.`,
  },
  {
    icon: <FiShare2 size={18} />,
    color: "bg-green-50 text-green-600",
    title: "Data Sharing & Disclosure",
    content: `We do not sell, rent, or trade your personal information to any third parties. However, we may share your data in the following limited circumstances:

• Service providers: Trusted partners who assist with payment processing, order delivery, customer support, and analytics. All partners are bound by strict data confidentiality agreements.
• Legal compliance: When required by law, court order, or regulatory authority, we may disclose your information to the relevant parties.
• Business transfers: In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction. We will notify you in advance.
• With your consent: We may share your information with third parties when you have given us explicit permission to do so.

All third parties we work with are required to handle your data securely and in accordance with applicable privacy laws.`,
  },
  {
    icon: <FiShield size={18} />,
    color: "bg-red-50 text-red-600",
    title: "Your Rights",
    content: `As a JOVO user, you have the following rights regarding your personal data:

• Right of Access: Request a copy of the personal data we hold about you at any time.
• Right to Rectification: Ask us to correct any inaccurate or incomplete information.
• Right to Erasure: Request that we delete your personal data, subject to certain legal obligations.
• Right to Restrict Processing: Ask us to limit how we use your data in certain circumstances.
• Right to Data Portability: Receive your data in a structured, machine-readable format.
• Right to Object: Object to our use of your data for marketing or profiling purposes.
• Right to Withdraw Consent: Withdraw any consent you've previously given at any time.

To exercise any of these rights, contact our privacy team at privacy@jovomart.com. We will respond within 30 days.`,
  },
  {
    icon: <FiLock size={18} />,
    color: "bg-yellow-50 text-yellow-600",
    title: "Data Security",
    content: `We take the security of your personal information extremely seriously and implement industry-standard measures to protect it:

• Encryption: All data transmitted between your browser and our servers is encrypted using TLS (Transport Layer Security).
• Password security: Passwords are hashed and salted using bcrypt — we never store plain-text passwords.
• Access controls: Only authorised personnel with a legitimate business need can access your personal data.
• Regular audits: We conduct periodic security reviews and penetration testing to identify and address vulnerabilities.
• Secure payment processing: Payment details are handled by PCI-DSS compliant payment providers. We never store raw card data.
• Incident response: In the unlikely event of a data breach, we will notify affected users within 72 hours in compliance with applicable law.

While we work hard to protect your data, no system is completely infallible. We encourage you to use a strong, unique password for your JOVO account.`,
  },
  {
    icon: <FiRefreshCw size={18} />,
    color: "bg-orange-50 text-orange-600",
    title: "Data Retention & Deletion",
    content: `We retain your personal data only for as long as necessary to fulfil the purposes outlined in this policy:

• Account data is retained for as long as your account is active, plus an additional 2 years for legal compliance.
• Transaction records are kept for 7 years in accordance with financial regulations.
• Support communications are retained for up to 3 years.
• Analytics data is anonymised after 26 months.

When you delete your account, we will remove or anonymise your personal data within 30 days, except where we are required by law to retain certain information. You can request account deletion at any time by contacting privacy@jovomart.com or through your account settings.`,
  },
  {
    icon: <MdOutlinePrivacyTip size={18} />,
    color: "bg-pink-50 text-pink-600",
    title: "Policy Updates",
    content: `We may update this Privacy Notice from time to time to reflect changes in our practices, technology, or legal requirements. When we make significant changes, we will:

• Send you an email notification to the address associated with your account
• Display a prominent notice on our website and app
• Update the "Last Updated" date at the top of this page

We encourage you to review this policy periodically. Your continued use of JOVO after any changes constitutes your acceptance of the updated policy. If you disagree with any changes, you may close your account at any time.

Previous versions of this Privacy Notice are available upon request by emailing privacy@jovomart.com.`,
  },
];

const tips = [
  { icon: <FiKey size={16} />, text: "Use a strong, unique password for your JOVO account and enable two-factor authentication when available." },
  { icon: <FiMail size={16} />, text: "Be cautious of phishing emails. JOVO will never ask for your password via email or phone." },
  { icon: <FiSettings size={16} />, text: "Review your privacy settings regularly in your account dashboard to stay in control of your data." },
  { icon: <FiBell size={16} />, text: "Keep your contact details up to date so we can reach you in case of any account security issues." },
];

const Privacy = () => {
  const [openSection, setOpenSection] = useState(null);

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
            <FiLock size={12} /> Privacy Notice
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight" style={{ fontFamily: "'Georgia',serif" }}>
            Your Privacy <span style={{ background: "linear-gradient(90deg,#fca5a5,#fdba74)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Matters</span>
          </h1>
          <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            At JOVO, we are committed to protecting your personal information and being transparent about how we collect, use, and safeguard your data.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              { label: "GDPR Compliant", icon: <MdGppGood size={12} /> },
              { label: "No Data Selling", icon: <FiShieldOff size={12} /> },
              { label: "Encrypted Storage", icon: <FiLock size={12} /> },
              { label: "Your Rights Protected", icon: <FaHandSpock size={12} /> }
            ].map(({ label, icon }) => (
              <span key={label} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {icon} {label}
              </span>
            ))}
          </div>
          <p className="text-white/25 text-xs mt-8">Last updated: March 2025</p>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Intro cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {[
            { icon: <FiEye size={24} />, title: "Transparent collection", desc: "We only collect data that is necessary to provide you with a safe and seamless experience." },
            { icon: <FaShieldAlt size={24} />, title: "Secure by default", desc: "All data is encrypted in transit and at rest. We never store raw payment card details." },
            { icon: <FiShield size={24} />, title: "You're in control", desc: "Access, correct, or delete your data at any time. We'll respond within 30 days." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <div className="text-3xl mb-4 text-[#B42225]">{icon}</div>
              <h3 className="font-black text-gray-900 text-base mb-2" style={{ fontFamily: "'Georgia',serif" }}>{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Accordion */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Georgia',serif" }}>Privacy Policy Details</h2>
          <p className="text-gray-500 text-sm mb-8">Click on each section to read the full details of our privacy practices.</p>

          <div className="space-y-3">
            {privacySections.map((section, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-200"
                style={{ boxShadow: openSection === index ? "0 8px 32px rgba(180,34,37,0.1)" : "0 2px 8px rgba(0,0,0,0.04)" }}>
                <button
                  onClick={() => setOpenSection(openSection === index ? null : index)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${section.color}`}>
                    {section.icon}
                  </div>
                  <span className="flex-1 font-bold text-gray-800 text-base">{section.title}</span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${
                    openSection === index ? "rotate-180 bg-[#B42225] text-white" : "bg-gray-100 text-gray-400"
                  }`}>
                    <FiChevronDown size={15} />
                  </div>
                </button>

                <div className={`transition-all duration-300 overflow-hidden ${openSection === index ? "max-h-175" : "max-h-0"}`}>
                  <div className="px-5 pb-6 pt-1 border-t border-gray-50">
                    <div className="pl-14">
                      {section.content.split("\n\n").map((para, i) => (
                        <p key={i} className="text-sm text-gray-600 leading-relaxed mb-3 last:mb-0 whitespace-pre-line">
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-3xl p-8 mb-16" style={{ background: "linear-gradient(135deg,#0a0a0a,#1a0303,#2d0808)" }}>
          <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2" style={{ fontFamily: "'Georgia',serif" }}>
            <FiShield size={20} /> Privacy Tips & Best Practices
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

        {/* Your rights */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 mb-16" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2" style={{ fontFamily: "'Georgia',serif" }}>
            <MdVerified size={22} className="text-[#B42225]" /> Your Data Rights at a Glance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Access a copy of all personal data we hold about you",
              "Correct any inaccurate or outdated information",
              "Request complete deletion of your personal data",
              "Restrict how we process your information",
              "Receive your data in a portable, machine-readable format",
              "Object to processing for marketing or profiling purposes",
              "Withdraw consent at any time without penalty",
              "Lodge a complaint with your local data protection authority",
            ].map((right, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <FiCheck size={11} className="text-green-600" />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{right}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact banner */}
        <div className="rounded-3xl p-8 text-center" style={{ background: "linear-gradient(135deg,#B42225,#FF6B00)", boxShadow: "0 8px 32px rgba(180,34,37,0.3)" }}>
          <h2 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "'Georgia',serif" }}>Questions About Your Privacy?</h2>
          <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">
            Our dedicated privacy team is here to help. Reach out and we'll respond within 30 days.
          </p>
          <a href="mailto:privacy@jovomart.com"
            className="inline-flex items-center gap-2 bg-white text-[#B42225] font-black text-sm px-8 py-3.5 rounded-full hover:shadow-lg transition-all">
            <FiMail size={16} /> privacy@jovomart.com
          </a>
        </div>

      </div>

      <Footer />
    </>
  );
};

export default Privacy;