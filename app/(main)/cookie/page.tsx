'use client'
// src/pages/CookieNotice.jsx
import { useState } from "react";
import Footer from "@/components/layout/Footer";
import { 
  FiChevronDown, FiShield, FiSettings, FiBarChart2, 
  FiTarget, FiRefreshCw, FiInfo, FiCheck, FiMail,
  FiEye, FiLock, FiTool, FiMessageCircle
} from "react-icons/fi";
import { MdGppGood, MdVerified, MdSecurity } from "react-icons/md";
import { FaCookieBite, FaShieldAlt } from "react-icons/fa";

const cookieSections = [
  {
    icon: <FiInfo size={18} />,
    color: "bg-blue-50 text-blue-600",
    title: "What Are Cookies?",
    content: `Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work more efficiently, improve user experience, and provide information to site owners.

Cookies contain data such as your preferences, login information, and browsing activity. They are stored locally on your device and sent back to the website on each subsequent visit, helping the site remember you and your settings.`,
  },
  {
    icon: <FiShield size={18} />,
    color: "bg-green-50 text-green-600",
    title: "Essential Cookies",
    content: `Essential cookies are strictly necessary for the website to function properly. Without these cookies, certain parts of our site won't work. They include:

• Session cookies that keep you logged in as you navigate pages
• Security cookies that help detect and prevent fraudulent activity  
• Load balancing cookies that ensure a smooth, stable experience
• Cart and checkout cookies that remember your items

These cookies cannot be disabled as they are fundamental to how JOVO operates. They do not store any personally identifiable information beyond what is necessary for the site to function.`,
  },
  {
    icon: <FiBarChart2 size={18} />,
    color: "bg-purple-50 text-purple-600",
    title: "Analytics & Performance Cookies",
    content: `Analytics cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve how our site works. These include:

• Page visit tracking to understand which content is most popular
• Error reporting to identify and fix broken pages or features
• Performance monitoring to ensure fast load times
• User journey analysis to improve the checkout and browsing experience

We use tools like Google Analytics for this purpose. All data collected is aggregated and anonymised — we cannot identify individual users from this data.`,
  },
  {
    icon: <FiTarget size={18} />,
    color: "bg-orange-50 text-orange-600",
    title: "Marketing & Advertising Cookies",
    content: `Marketing cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for individual users. These cookies:

• Remember what products you've viewed or added to your cart
• Allow us to show you personalised deals and recommendations  
• Help measure the effectiveness of our advertising campaigns
• Enable retargeting so you can see JOVO ads on partner sites

You can opt out of marketing cookies at any time through your browser settings or by contacting our support team. Opting out will not affect your ability to use JOVO, but ads shown may be less relevant to you.`,
  },
  {
    icon: <FiSettings size={18} />,
    color: "bg-yellow-50 text-yellow-600",
    title: "Functional & Preference Cookies",
    content: `Functional cookies allow us to remember choices you make and provide enhanced, more personalised features. They may be set by us or by third-party providers whose services we use. These include:

• Language and region preferences
• Your preferred currency display
• Saved addresses and payment methods (in encrypted form)
• Notification and display preferences
• Recently viewed products

Disabling functional cookies may affect how the website behaves and may limit the personalisation features available to you.`,
  },
  {
    icon: <FiRefreshCw size={18} />,
    color: "bg-red-50 text-red-600",
    title: "Managing & Updating Cookie Preferences",
    content: `You have full control over how cookies are used when you visit JOVO. Here's how you can manage them:

Browser Settings: Most browsers allow you to block or delete cookies through their privacy settings. Check your browser's help section for instructions specific to your browser.

Opt-Out Tools: You can use tools like the Network Advertising Initiative opt-out page or Google's Ads Settings to control advertising cookies.

Our Cookie Settings: We provide a cookie consent banner when you first visit JOVO, where you can choose which categories of cookies to accept.

Please note that if you choose to block all cookies, some features of our website may not function correctly. We recommend keeping essential cookies enabled for the best experience.`,
  },
];

const tips = [
  { icon: <FiCheck size={16} />, text: "Always allow essential cookies for a smooth shopping experience on JOVO." },
  { icon: <FiLock size={16} />, text: "We never sell your cookie data to third parties. Your privacy is our priority." },
  { icon: <FiTool size={16} />, text: "Review your browser's privacy settings regularly to stay in control of your data." },
  { icon: <FiMail size={16} />, text: "Contact us at privacy@jovomart.com if you have any concerns about cookies." },
];

const CookieNotice = () => {
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
            <FaCookieBite size={12} /> Cookie Policy
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight" style={{ fontFamily: "'Georgia',serif" }}>
            Our Cookie <span style={{ background: "linear-gradient(90deg,#fca5a5,#fdba74)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Notice</span>
          </h1>
          <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            We use cookies to give you the best shopping experience on JOVO. Here's everything you need to know about how we use them and how you can control them.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              { label: "Transparent", icon: <FiEye size={12} /> },
              { label: "GDPR Compliant", icon: <MdGppGood size={12} /> },
              { label: "Your Choice", icon: <FiCheck size={12} /> },
              { label: "Secure", icon: <MdSecurity size={12} /> }
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
            { icon: <FiEye size={24} />, title: "What we collect", desc: "Browsing preferences, session data, and anonymised analytics to improve your experience." },
            { icon: <FaShieldAlt size={24} />, title: "How we protect it", desc: "All cookie data is encrypted and stored securely. We never sell your data to third parties." },
            { icon: <FiSettings size={24} />, title: "You're in control", desc: "Manage, update, or withdraw your cookie preferences at any time through your browser settings." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <div className="text-3xl mb-4 text-[#B42225]">{icon}</div>
              <h3 className="font-black text-gray-900 text-base mb-2" style={{ fontFamily: "'Georgia',serif" }}>{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Accordion sections */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Georgia',serif" }}>Cookie Categories</h2>
          <p className="text-gray-500 text-sm mb-8">Click on each section to learn more about the different types of cookies we use.</p>

          <div className="space-y-3">
            {cookieSections.map((section, index) => (
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

                <div className={`transition-all duration-300 overflow-hidden ${openSection === index ? "max-h-150" : "max-h-0"}`}>
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
            <FaCookieBite size={20} /> Cookie Tips & Best Practices
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
            <MdVerified size={22} className="text-[#B42225]" /> Your Rights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Right to know what cookies we collect and why",
              "Right to opt out of non-essential cookies at any time",
              "Right to request deletion of your cookie data",
              "Right to withdraw consent without affecting past usage",
              "Right to lodge a complaint with your local data authority",
              "Right to access a copy of the data we hold about you",
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
          <h2 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "'Georgia',serif" }}>Have Questions About Cookies?</h2>
          <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">
            Our privacy team is happy to help. Reach out to us and we'll get back to you within 24 hours.
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

export default CookieNotice;