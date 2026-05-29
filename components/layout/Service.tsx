'use client'
import Link from 'next/link'
// src/components/home/ServicesSection.jsx
import { FiArrowRight } from "react-icons/fi";

const ServicesSection = () => {
  return (
    <div className="w-full px-0 md:px-1 py-8">
      <Link
        href="/services"
        className="relative overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1 block"
        style={{
          background: "linear-gradient(135deg,#0a0a0a 0%,#1a0a00 50%,#2a1500 100%)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
        }}
      >
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }} />

        {/* Glow orbs */}
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full pointer-events-none opacity-20"
          style={{ background: "radial-gradient(circle,#FF8C00,transparent 65%)" }} />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full pointer-events-none opacity-10"
          style={{ background: "radial-gradient(circle,#B42225,transparent 65%)" }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 md:px-10 py-7 md:py-9">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/10 text-white/40 text-[10px] font-bold px-3 py-1 rounded-full mb-3 tracking-[3px] uppercase">
              ⚙️ Campus Services
            </div>
            <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-white mb-1.5"
              style={{ fontFamily: "'arial',serif" }}>
              Need a Service?{" "}
              <span style={{ background: "linear-gradient(90deg,#FF8C00,#FFB347)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                We've Got You.
              </span>
            </h3>
            <p className="text-white/35 text-xs md:text-sm max-w-md leading-relaxed">
              Cleaning, barbing, laundry, repairs, tutoring and more — book trusted campus service providers instantly via WhatsApp.
            </p>
          </div>

          <div
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-sm text-white shrink-0 transition-all group-hover:scale-105"
            style={{ background: "linear-gradient(135deg,#B42225,#FF8C00)", boxShadow: "0 6px 24px rgba(180,34,37,0.4)" }}
          >
            Visit Services <FiArrowRight size={15} />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ServicesSection;