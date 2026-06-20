'use client'
import Link from 'next/link'
// src/components/home/ServicesSection.jsx
import { FiArrowRight, FiZap } from "react-icons/fi";
import { LuSparkles, LuScissors, LuShirt, LuWrench, LuGraduationCap } from "react-icons/lu";
import { motion } from "framer-motion";

const SERVICE_CHIPS = [
  { label: "Cleaning", icon: LuSparkles },
  { label: "Barbing", icon: LuScissors },
  { label: "Laundry", icon: LuShirt },
  { label: "Repairs", icon: LuWrench },
  { label: "Tutoring", icon: LuGraduationCap },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const chipItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const ServicesSection = () => {
  return (
    <div className="w-full px-0 md:px-1 py-8">
      <div
        className="relative overflow-hidden group rounded-none md:rounded-3xl"
        style={{
          background: "linear-gradient(135deg,#0a0a0a 0%,#1a0a00 50%,#2a1500 100%)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
        }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Glow orbs */}
        <div
          className="absolute -top-10 -right-10 w-56 h-56 rounded-full pointer-events-none opacity-20 transition-transform duration-700 ease-out group-hover:scale-125 group-hover:opacity-30"
          style={{ background: "radial-gradient(circle,#FF8C00,transparent 65%)" }}
        />
        <div
          className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full pointer-events-none opacity-10 transition-transform duration-700 ease-out group-hover:scale-110"
          style={{ background: "radial-gradient(circle,#B42225,transparent 65%)" }}
        />

        {/* Sweep highlight on hover — desktop only, subtle */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none hidden md:block"
          style={{
            background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.04) 45%, transparent 60%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-6 px-5 sm:px-8 md:px-10 py-8 md:py-10">
          {/* Top row: eyebrow + headline + CTA */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 bg-white/8 border border-white/10 text-white/40 text-[10px] font-bold px-3 py-1 rounded-full mb-3 tracking-[3px] uppercase">
                <FiZap size={10} className="text-[#FF8C00]" />
                Campus Services
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-[2.15rem] font-black text-white mb-2 leading-[1.1] tracking-tight">
                Need a service? <br />
                <span
                  style={{
                    background: "linear-gradient(90deg,#FF8C00,#FFB347)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  We've got you.
                </span>
              </h3>
              <p className="text-white/40 text-xs sm:text-sm max-w-md leading-relaxed mx-auto lg:mx-0">
                Book trusted campus providers instantly via WhatsApp — no calls, no waiting around.
              </p>
            </div>

            <Link
              href="/services"
              className="group/cta flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-sm text-white shrink-0 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_10px_32px_rgba(180,34,37,0.55)] mx-auto lg:mx-0 w-full sm:w-auto"
              style={{
                background: "linear-gradient(135deg,#B42225,#FF8C00)",
                boxShadow: "0 6px 24px rgba(180,34,37,0.4)",
              }}
            >
              Visit Services
              <FiArrowRight size={15} className="transition-transform duration-300 group-hover/cta:translate-x-1" />
            </Link>
          </div>

          {/* Service chips row — the signature element: a tangible menu preview */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-2.5"
          >
            {SERVICE_CHIPS.map(({ label, icon: Icon }) => (
              <motion.div
                key={label}
                variants={chipItem}
                className="flex items-center gap-1.5 sm:gap-2 bg-white/[0.06] border border-white/10 rounded-full px-3 py-1.5 sm:px-3.5 sm:py-2 transition-all duration-300 group-hover:border-white/20 hover:!bg-white/[0.12] hover:!border-[#FF8C00]/30"
              >
                <Icon size={13} className="text-[#FF8C00] shrink-0" />
                <span className="text-[11px] sm:text-xs font-semibold text-white/70 whitespace-nowrap">
                  {label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ServicesSection;