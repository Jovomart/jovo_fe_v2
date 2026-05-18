"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
// src/pages/LogisticsPage.jsx
import { useState } from "react";
import Footer from "@/components/layout/Footer";
import {
  FiMapPin,
  FiPackage,
  FiPhone,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiStar,
  FiArrowRight,
  FiAlertCircle,
} from "react-icons/fi";
import { FaWhatsapp, FaStar, FaMotorcycle } from "react-icons/fa";
import { MdVerified, MdSpeed } from "react-icons/md";

const zones = [
  { label: "Within FUTO Campus", price: 500, eta: "10–20 min", icon: "🏫" },
  { label: "Ihiagwa / Nekede", price: 800, eta: "20–35 min", icon: "🏘️" },
  { label: "Owerri Town", price: 1500, eta: "35–55 min", icon: "🏙️" },
  { label: "Outside Owerri", price: 2500, eta: "1–2 hrs", icon: "🗺️" },
];

const riders = [
  {
    id: 1,
    name: "Chukwuma Eze",
    nickname: "Speedy",
    rating: 4.9,
    trips: 312,
    available: true,
    bike: "Bajaj Boxer",
    phone: "+2348011111111",
    whatsapp: "2348011111111",
    image:
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&auto=format&fit=crop&q=60",
    tags: ["Fast", "Reliable", "On-campus"],
  },
  {
    id: 2,
    name: "Emeka Okonkwo",
    nickname: "Flash",
    rating: 4.8,
    trips: 245,
    available: true,
    bike: "Honda CG 125",
    phone: "+2348022222222",
    whatsapp: "2348022222222",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=60",
    tags: ["Documents", "Food", "Electronics"],
  },
  {
    id: 3,
    name: "Tunde Adeyemi",
    nickname: "Swift",
    rating: 4.7,
    trips: 189,
    available: false,
    bike: "Yamaha Crux",
    phone: "+2348033333333",
    whatsapp: "2348033333333",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=60",
    tags: ["Parcels", "Long Distance", "Safe"],
  },
  {
    id: 4,
    name: "Ifeanyi Nwosu",
    nickname: "Bolt",
    rating: 4.9,
    trips: 401,
    available: true,
    bike: "Bajaj Boxer",
    phone: "+2348044444444",
    whatsapp: "2348044444444",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=60",
    tags: ["Express", "Fragile Items", "FUTO Specialist"],
  },
  {
    id: 5,
    name: "Blessing Okeke",
    nickname: "Angel",
    rating: 4.8,
    trips: 156,
    available: true,
    bike: "Honda CG 125",
    phone: "+2348055555555",
    whatsapp: "2348055555555",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=60",
    tags: ["Female Rider", "Safe", "Hostels"],
  },
  {
    id: 6,
    name: "Obinna Obi",
    nickname: "King",
    rating: 4.6,
    trips: 278,
    available: false,
    bike: "Suzuki GD 110",
    phone: "+2348066666666",
    whatsapp: "2348066666666",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=60",
    tags: ["Bulk Items", "Market Runs", "Reliable"],
  },
];

const steps = [
  {
    icon: <FiPhone size={20} />,
    title: "Contact a Rider",
    desc: "WhatsApp or call any available rider directly. Share your pickup and drop-off location.",
  },
  {
    icon: <FiPackage size={20} />,
    title: "Package Picked Up",
    desc: "Your rider confirms and heads to your location. Estimated pickup time is 5–15 minutes.",
  },
  {
    icon: <FiCheckCircle size={20} />,
    title: "Item Delivered",
    desc: "Your package is delivered safely. Confirm receipt and pay the rider directly.",
  },
];

const LogisticsPage = () => {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [item, setItem] = useState("");
  const [estimated, setEstimated] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleEstimate = (e) => {
    e.preventDefault();
    if (!pickup.trim() || !dropoff.trim()) return;
    // Simple mock — pick a zone based on dropoff keyword
    const d = dropoff.toLowerCase();
    let zone = zones[0];
    if (d.includes("owerri") && !d.includes("ihiagwa")) zone = zones[2];
    else if (d.includes("ihiagwa") || d.includes("nekede")) zone = zones[1];
    else if (
      d.includes("outside") ||
      d.includes("enugu") ||
      d.includes("lagos")
    )
      zone = zones[3];
    setEstimated(zone);
    setSubmitted(true);
  };

  const availableRiders = riders.filter((r) => r.available);

  return (
    <>
      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,#0a0a0f 0%,#0f0f1a 40%,#0a1a0a 80%,#0a0a0f 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle,rgba(255,255,255,0.8) 1px,transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 rounded-full opacity-15 pointer-events-none"
          style={{
            background: "radial-gradient(circle,#22c55e,transparent 65%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle,#FF8C00,transparent 65%)",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16 lg:py-20">
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 text-white/60 text-[10px] md:text-xs font-bold px-3 md:px-4 py-1.5 rounded-full mb-4 tracking-widest uppercase">
            🏍️ Campus Logistics
          </div>
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 leading-tight"
            style={{ fontFamily: "'Georgia',serif" }}
          >
            Send Anything,
            <br />
            <span
              style={{
                background: "linear-gradient(90deg,#86efac,#22c55e)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Anywhere on Campus
            </span>
          </h1>
          <p className="text-white/40 text-sm md:text-base max-w-xl mb-8 leading-relaxed">
            Fast, affordable dispatch riders ready to pick up and deliver your
            packages within FUTO and across Owerri. No app needed — just
            WhatsApp.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-2 md:gap-4">
            {[
              { icon: "🏍️", num: `${riders.length}`, label: "Riders" },
              {
                icon: "✅",
                num: `${availableRiders.length}`,
                label: "Available Now",
              },
              { icon: "⚡", num: "10 min", label: "Avg Pickup" },
              { icon: "📦", num: "500+", label: "Deliveries" },
            ].map(({ icon, num, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <span>{icon}</span>
                <span className="text-green-400 font-black text-xs md:text-sm">
                  {num}
                </span>
                <span className="text-white/40 text-[10px] md:text-xs">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "#F4F5F9" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10 space-y-10 md:space-y-14">
          {/* ── How it works ── */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-4">
              How It Works
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-5 flex gap-4 items-start"
                  style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{
                      background: "linear-gradient(135deg,#15803d,#22c55e)",
                    }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 mb-1">
                      {s.title}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Price Estimator ── */}
          <div className="grid md:grid-cols-2 gap-6">
            <div
              className="bg-white rounded-3xl p-6 md:p-7"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
            >
              <p className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-4">
                Price Estimator
              </p>
              <h3
                className="text-lg font-black text-gray-900 mb-1"
                style={{ fontFamily: "'Georgia',serif" }}
              >
                Get a Quick Quote
              </h3>
              <p className="text-xs text-gray-500 mb-5">
                Enter your locations to estimate the delivery cost.
              </p>

              <form onSubmit={handleEstimate} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[2px] text-gray-400 mb-1.5">
                    Pickup Location
                  </label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100 transition-all">
                    <FiMapPin size={15} className="text-green-500 shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. SEET Building, FUTO"
                      value={pickup}
                      onChange={(e) => {
                        setPickup(e.target.value);
                        setSubmitted(false);
                      }}
                      className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-400 bg-transparent min-w-0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[2px] text-gray-400 mb-1.5">
                    Drop-off Location
                  </label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100 transition-all">
                    <FiMapPin size={15} className="text-[#B42225] shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. Female Hostel / Owerri Town"
                      value={dropoff}
                      onChange={(e) => {
                        setDropoff(e.target.value);
                        setSubmitted(false);
                      }}
                      className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-400 bg-transparent min-w-0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[2px] text-gray-400 mb-1.5">
                    Item Description{" "}
                    <span className="text-gray-300 font-normal normal-case">
                      (optional)
                    </span>
                  </label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-green-400 transition-all">
                    <FiPackage size={15} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. Documents, food, phone"
                      value={item}
                      onChange={(e) => setItem(e.target.value)}
                      className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-400 bg-transparent min-w-0"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:opacity-90 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg,#15803d,#22c55e)",
                    boxShadow: "0 6px 20px rgba(34,197,94,0.3)",
                  }}
                >
                  Estimate Price
                </button>
              </form>

              {submitted && estimated && (
                <div
                  className="mt-4 rounded-2xl p-4"
                  style={{
                    background: "rgba(34,197,94,0.06)",
                    border: "1px solid rgba(34,197,94,0.2)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-black text-gray-900">
                      {estimated.label}
                    </p>
                    <span className="text-xl font-black text-green-600">
                      ₦{estimated.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiClock size={11} className="text-green-500" /> ETA:{" "}
                      {estimated.eta}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiCheckCircle size={11} className="text-green-500" /> Pay
                      on delivery
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">
                    💡 Contact any available rider below to proceed with your
                    delivery.
                  </p>
                </div>
              )}
            </div>

            {/* ── Pricing table ── */}
            <div
              className="bg-white rounded-3xl p-6 md:p-7"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
            >
              <p className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-4">
                Pricing Zones
              </p>
              <h3
                className="text-lg font-black text-gray-900 mb-5"
                style={{ fontFamily: "'Georgia',serif" }}
              >
                Flat Rate Delivery
              </h3>
              <div className="space-y-3">
                {zones.map((z, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100"
                  >
                    <span className="text-2xl shrink-0">{z.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800">
                        {z.label}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <FiClock size={10} /> {z.eta}
                      </p>
                    </div>
                    <span className="text-base font-black text-green-600 shrink-0">
                      ₦{z.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <FiAlertCircle
                  size={13}
                  className="text-amber-500 shrink-0 mt-0.5"
                />
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Prices are estimates. Actual cost may vary based on distance
                  and item size. Agree on price with your rider before dispatch.
                </p>
              </div>
            </div>
          </div>

          {/* ── Available Riders ── */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[3px] text-gray-400">
                  Dispatch Riders
                </p>
                <h3
                  className="text-xl font-black text-gray-900 mt-0.5"
                  style={{ fontFamily: "'Georgia',serif" }}
                >
                  Available Now
                </h3>
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                {availableRiders.length} riders online
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {riders.map((rider) => (
                <div
                  key={rider.id}
                  className={`bg-white rounded-2xl p-5 flex gap-4 border transition-all ${
                    rider.available
                      ? "border-gray-100 hover:border-green-200 hover:shadow-md"
                      : "border-gray-100 opacity-60"
                  }`}
                  style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                >
                  <div className="relative shrink-0 w-14 h-14 rounded-2xl overflow-hidden">
                    <Image
                      src={rider.image}
                      alt={rider.name}
                      sizes="56px"
                      fill
                      className="rounded-2xl object-cover"
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${rider.available ? "bg-green-500" : "bg-gray-400"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-sm font-black text-gray-900 truncate">
                        {rider.name}
                      </p>
                      <MdVerified
                        size={14}
                        className="text-[#B42225] shrink-0"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">
                      "{rider.nickname}" · {rider.bike}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <FaStar size={10} className="text-yellow-400" />
                      <span className="text-xs font-bold text-gray-700">
                        {rider.rating}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        · {rider.trips} trips
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2 mb-3">
                      {rider.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="text-[9px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <a
                        href={`https://wa.me/${rider.whatsapp}?text=Hi ${rider.name}, I found you on JOVO Logistics. I need a dispatch rider.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-black text-white transition-all ${
                          rider.available
                            ? "hover:opacity-90"
                            : "pointer-events-none opacity-50"
                        }`}
                        style={{ background: "#25D366" }}
                      >
                        <FaWhatsapp size={11} /> Chat
                      </a>
                      <a
                        href={`tel:${rider.phone}`}
                        className={`flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-[10px] font-black text-gray-700 bg-gray-100 transition-all ${
                          rider.available
                            ? "hover:bg-gray-200"
                            : "pointer-events-none opacity-50"
                        }`}
                      >
                        <FiPhone size={11} /> Call
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Bottom CTA ── */}
          <div
            className="rounded-3xl p-7 md:p-10 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg,#052e16,#14532d,#15803d)",
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "radial-gradient(circle,rgba(255,255,255,0.8) 1px,transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div className="relative z-10">
              <FaMotorcycle size={40} className="text-green-300 mx-auto mb-4" />
              <h3
                className="text-2xl md:text-3xl font-black text-white mb-2"
                style={{ fontFamily: "'Georgia',serif" }}
              >
                Become a JOVO Rider
              </h3>
              <p className="text-white/50 text-sm md:text-base max-w-md mx-auto mb-6">
                Earn money delivering packages on and around FUTO campus.
                Flexible hours, instant payments.
              </p>
              <a
                href="https://wa.me/2348000000000?text=I want to register as a JOVO dispatch rider"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:opacity-90"
                style={{
                  background: "#25D366",
                  boxShadow: "0 6px 20px rgba(37,211,102,0.35)",
                }}
              >
                <FaWhatsapp size={16} /> Register as a Rider
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default LogisticsPage;
