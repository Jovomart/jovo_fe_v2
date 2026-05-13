'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from "react";
import Footer from "@/components/layout/Footer";
import {
  FiMail, FiPhone, FiMessageCircle, FiMapPin, FiClock,
  FiSend, FiCheck, FiAlertCircle, FiArrowRight,
  FiChevronRight, FiGlobe, FiTwitter, FiFacebook, FiInstagram,
  FiLinkedin, FiYoutube, FiHeadphones, FiShield, FiZap,
} from "react-icons/fi";
import {
  FaWhatsapp, FaRegClock, FaRegCheckCircle, FaHandshake,
} from "react-icons/fa";
import {
  MdVerified, MdOutlineSupportAgent, MdEmail, MdPhone,
  MdLocationOn, MdAccessTime, MdSend,
} from "react-icons/md";

// Define proper types
interface FormData {
  name: string;
  email: string;
  message: string;
}

interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

interface FaqItem {
  q: string;
  a: string;
}

interface ContactMethod {
  icon: JSX.Element;
  title: string;
  details: string;
  sub: string;
  color: string;
  bg: string;
  action: string;
}

const Contact = () => {
  const [formData, setFormData] = useState<FormData>({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): boolean => {
    const e: Errors = {};
    if (!formData.name.trim()) e.name = "Name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Enter a valid email address";
    if (!formData.message.trim()) e.message = "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: "", email: "", message: "" });
    setErrors({});
  };

  const contactMethods: ContactMethod[] = [
    { icon: <MdEmail size={20} />, title: "Email Us", details: "support@jovomarketplace.com", sub: "We respond within 24 hours", color: "#B42225", bg: "#FEF2F2", action: "mailto:support@jovomarketplace.com" },
    { icon: <FaWhatsapp size={20} />, title: "WhatsApp", details: "+234 801 234 5678", sub: "Chat with our team", color: "#25D366", bg: "#E8F5E9", action: "https://wa.me/2348012345678" },
    { icon: <MdPhone size={20} />, title: "Call Us", details: "+234 801 234 5678", sub: "Mon–Fri, 8am–6pm", color: "#2563EB", bg: "#EFF6FF", action: "tel:+2348012345678" },
    { icon: <FiGlobe size={20} />, title: "Visit Us", details: "ICT Centre, FUTO", sub: "Drop-off & pickup point", color: "#D97706", bg: "#FFFBEB", action: "#" },
  ];

  const faqs: FaqItem[] = [
    { q: "How long does it take to get a response?", a: "Our support team typically responds within 24 hours during business days. For urgent matters, please use our WhatsApp or phone line." },
    { q: "Can I return a product I bought?", a: "Yes! You can return eligible items within 7 days of delivery. Visit our Returns & Refunds page for full details." },
    { q: "How do I become a seller on Jovo?", a: "Simply click 'Become a Seller' on our homepage, fill out the application form, and our team will verify your account within 24–48 hours." },
    { q: "What payment methods are accepted?", a: "We accept debit/credit cards (Visa, Mastercard, Verve), bank transfers, USSD, and Jovo Wallet." },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.35s ease; }
      `}</style>

      <div className="min-h-screen" style={{ background: "#F4F5F9" }}>

        {/* ══════════ HERO ══════════ */}
        <div className="relative overflow-hidden" style={{
          background: "linear-gradient(135deg,#0a0a0a 0%,#1a0303 35%,#2d0808 65%,#B42225 100%)",
        }}>
          <div className="absolute -top-16 right-1/4 w-80 h-80 rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle,#B42225,transparent 70%)" }} />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle,#FF6B00,transparent 70%)" }} />
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
            backgroundSize: "30px 30px",
          }} />

          <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 pt-12 pb-24">
            <div className="flex items-center gap-2 text-xs text-white/30 mb-8">
              <Link href="/shop" className="hover:text-white/60 transition-colors">Shop</Link>
              <FiChevronRight size={11} />
              <span className="text-white/60">Contact Us</span>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 mt-1"
                style={{ background: "rgba(180,34,37,0.25)", border: "1px solid rgba(252,165,165,0.3)" }}>
                <MdOutlineSupportAgent size={26} className="text-red-300" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-300/70 px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(180,34,37,0.2)", border: "1px solid rgba(252,165,165,0.2)" }}>
                    We're Here to Help
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight"
                  style={{ fontFamily: "'Georgia', serif", textShadow: "0 4px 30px rgba(180,34,37,0.4)" }}>
                  Get in<br />
                  <span style={{ background: "linear-gradient(90deg,#fca5a5,#fdba74,#fca5a5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Touch
                  </span>
                </h1>
                <p className="text-white/45 text-sm leading-relaxed max-w-lg">
                  Have questions, feedback, or need assistance? Our support team is ready to help you. Reach out through any of the channels below.
                </p>

                <div className="flex flex-wrap gap-3 mt-6">
                  {[
                    { icon: <FiClock size={11} />, text: "24/7 Support" },
                    { icon: <FiShield size={11} />, text: "100% Secure" },
                    { icon: <FaHandshake size={11} />, text: "Dedicated Team" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-1.5 text-xs font-semibold text-white/70 px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                      <span className="text-red-300">{icon}</span> {text}
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

          {/* ══════════ CONTACT METHODS ══════════ */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-7 rounded-full" style={{ background: "linear-gradient(#B42225,#FF6B00)" }} />
              <div>
                <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
                  Ways to Reach Us
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Choose the channel that works best for you</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {contactMethods.map(({ icon, title, details, sub, color, bg, action }) => (
                <a
                  key={title}
                  href={action}
                  target={title === "Visit Us" ? "_self" : "_blank"}
                  rel="noopener noreferrer"
                  className="group bg-white rounded-2xl p-4 hover:-translate-y-1 transition-all duration-300 block"
                  style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    style={{ background: bg, color }}>
                    {icon}
                  </div>
                  <h3 className="text-sm font-black text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm font-bold text-gray-800">{details}</p>
                  <p className="text-xs text-gray-400 mt-1">{sub}</p>
                </a>
              ))}
            </div>
          </div>

          {/* ══════════ CONTACT FORM + FAQ SIDEBAR LAYOUT ══════════ */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
                <div className="px-6 md:px-8 pt-7 pb-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-7 rounded-full bg-[#B42225]" />
                    <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
                      Send us a Message
                    </h2>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 ml-4">Fill out the form and we'll get back to you within 24 hours</p>
                </div>

                <div className="p-6 md:p-8">
                  {submitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                        <FaRegCheckCircle size={32} className="text-green-500" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 mb-2">Message Sent!</h3>
                      <p className="text-sm text-gray-500">Thank you for reaching out. Our team will respond within 24 hours.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-black uppercase tracking-wide text-gray-500 mb-2">
                            Your Name <span className="text-[#B42225]">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            className={`w-full rounded-2xl border px-4 py-3 text-sm text-gray-700 outline-none transition-all ${
                              errors.name ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-[#B42225] focus:bg-white focus:shadow-[0_0_0_3px_rgba(180,34,37,0.08)]"
                            }`}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-black uppercase tracking-wide text-gray-500 mb-2">
                            Email Address <span className="text-[#B42225]">*</span>
                          </label>
                          <input
                            type="email"
                            placeholder="hello@jovo.com"
                            className={`w-full rounded-2xl border px-4 py-3 text-sm text-gray-700 outline-none transition-all ${
                              errors.email ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-[#B42225] focus:bg-white focus:shadow-[0_0_0_3px_rgba(180,34,37,0.08)]"
                            }`}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>
                      </div>
                      <div className="mb-5">
                        <label className="block text-xs font-black uppercase tracking-wide text-gray-500 mb-2">
                          Your Message <span className="text-[#B42225]">*</span>
                        </label>
                        <textarea
                          rows={5}
                          placeholder="How can we help you?"
                          className={`w-full rounded-2xl border px-4 py-3 text-sm text-gray-700 outline-none resize-none transition-all ${
                            errors.message ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-[#B42225] focus:bg-white focus:shadow-[0_0_0_3px_rgba(180,34,37,0.08)]"
                          }`}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                        {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                      </div>
                      <button
                        onClick={handleSubmit}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
                        style={{ background: "linear-gradient(135deg,#B42225,#FF6B00)", boxShadow: "0 6px 24px rgba(180,34,37,0.35)" }}>
                        <FiSend size={16} /> Send Message
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Office Hours & Quick Info */}
            <div>
              <div className="bg-white rounded-3xl p-6 mb-5" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                    <FiClock size={16} className="text-purple-600" />
                  </div>
                  <h3 className="font-black text-gray-900">Office Hours</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Monday – Friday</span>
                    <span className="font-semibold text-gray-800">8:00 AM – 6:00 PM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Saturday</span>
                    <span className="font-semibold text-gray-800">10:00 AM – 2:00 PM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sunday</span>
                    <span className="font-semibold text-gray-800">Closed</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-start gap-3">
                    <FiZap size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500">Response time for emails: <strong className="text-gray-700">within 24 hours</strong></p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                    <FaWhatsapp size={16} className="text-green-600" />
                  </div>
                  <h3 className="font-black text-gray-900">Emergency Support</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">For urgent issues, reach us on WhatsApp for faster response.</p>
                <a href="https://wa.me/2348012345678" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-sm text-white transition-all hover:scale-105"
                  style={{ background: "#25D366", boxShadow: "0 4px 16px rgba(37,211,102,0.3)" }}>
                  <FaWhatsapp size={16} /> Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* ══════════ FAQs ══════════ */}
          <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
            <div className="px-6 md:px-8 pt-7 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-1 h-7 rounded-full bg-[#B42225]" />
                <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
                  Frequently Asked Questions
                </h2>
              </div>
            </div>
            <div className="p-5 md:p-7 space-y-3 fade-up">
              {faqs.map(({ q, a }, i) => (
                <div key={i} className="rounded-2xl border border-gray-100 p-5 hover:border-gray-200 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#B42225]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <FiMessageCircle size={12} className="text-[#B42225]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 mb-2">{q}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══════════ LOCATION / MAP CTA ══════════ */}
          <div className="relative rounded-3xl overflow-hidden p-7 md:p-10 text-white"
            style={{ background: "linear-gradient(135deg,#0a0a0a 0%,#1a0303 50%,#B42225 100%)" }}>
            <div className="absolute inset-0 opacity-[0.05]" style={{
              backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
              backgroundSize: "26px 26px",
            }} />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MdLocationOn size={18} className="text-red-300" />
                  <span className="text-xs font-bold text-red-300 uppercase tracking-widest">Visit Our Location</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black mb-2" style={{ fontFamily: "'Georgia', serif" }}>
                  ICT Centre, FUTO
                </h3>
                <p className="text-white/40 text-sm max-w-md">
                  For product drop-offs, pickups, or in-person support, visit our ICT Centre location on campus.
                </p>
              </div>
              <a href="#" className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white bg-white/15 border border-white/20 hover:bg-white/25 transition-all">
                Get Directions <FiArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* bottom note */}
          <div className="flex flex-wrap items-center justify-center gap-4 py-2 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><MdVerified size={12} className="text-green-400" /> Verified Support Team</span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1.5"><FiShield size={11} /> Secure & Confidential</span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1.5"><FaRegClock size={11} /> 24hr Response Guarantee</span>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;