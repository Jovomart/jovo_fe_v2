'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useMemo, useEffect, Suspense } from "react";
import Footer from "@/components/layout/Footer";
import {
  FiSearch, FiX, FiPhone, FiStar, FiMapPin,
  FiCheckCircle, FiFilter, FiChevronDown, FiUsers,
  FiGrid, FiUserCheck, FiTool,
} from "react-icons/fi";
import { FaWhatsapp, FaStar, FaStarHalfAlt, FaRegStar, FaBroom, FaCut, FaTshirt, FaBolt, FaWrench, FaLightbulb, FaChalkboardTeacher, FaCamera } from "react-icons/fa";

// Service Categories Data (moved inline to avoid missing module)
const serviceCategories = [
  { id: "cleaning", name: "Cleaning", icon: "FaBroom", gradient: "linear-gradient(135deg,#0E0E10,#FF6B00)" },
  { id: "salon", name: "Salon & Barber", icon: "FaCut", gradient: "linear-gradient(135deg,#7C3AED,#A78BFA)" },
  { id: "laundry", name: "Laundry", icon: "FaTshirt", gradient: "linear-gradient(135deg,#0891B2,#06B6D4)" },
  { id: "electrical", name: "Electrical", icon: "FaBolt", gradient: "linear-gradient(135deg,#D97706,#F59E0B)" },
  { id: "repair", name: "Repairs", icon: "FaWrench", gradient: "linear-gradient(135deg,#059669,#10B981)" },
  { id: "tutoring", name: "Tutoring", icon: "FaChalkboardTeacher", gradient: "linear-gradient(135deg,#2563EB,#60A5FA)" },
  { id: "photography", name: "Photography", icon: "FaCamera", gradient: "linear-gradient(135deg,#DB2777,#F472B6)" },
];

// Service Providers Data (moved inline to avoid missing module)
const serviceProviders = [
  {
    id: "1",
    name: "Sparkle Clean",
    providerName: "Sparkle Clean",
    category: "cleaning",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500",
    location: "FUTO Campus, Umuduru",
    rating: 4.8,
    reviews: 156,
    tags: ["Deep Cleaning", "Residential", "Pet-friendly"],
    description: "Professional cleaning services for hostels, apartments, and offices. Fully equipped and insured.",
    priceLabel: "From ₦2,500",
    price: 2500,
    whatsapp: "2348000000000",
    phone: "+2348000000000",
    available: true,
  },
  {
    id: "2",
    name: "Cutting Edge Barbers",
    providerName: "Cutting Edge Barbers",
    category: "salon",
    image: "https://images.unsplash.com/photo-1503951914875-3fe63d2b7d5e?w=500",
    location: "FUTO Main Gate",
    rating: 4.9,
    reviews: 89,
    tags: ["Haircut", "Beard Trim", "Student Discount"],
    description: "Premium barber services with experienced stylists. Walk-ins welcome.",
    priceLabel: "From ₦1,000",
    price: 1000,
    whatsapp: "2348000000001",
    phone: "+2348000000001",
    available: true,
  },
  {
    id: "3",
    name: "Wash & Fold Express",
    providerName: "Wash & Fold Express",
    category: "laundry",
    image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500",
    location: "Umuduru, near Bodega",
    rating: 4.7,
    reviews: 234,
    tags: ["Wash & Fold", "Ironing", "Pickup/Delivery"],
    description: "Same-day laundry and dry cleaning services. Free pickup within campus.",
    priceLabel: "From ₦1,500/load",
    price: 1500,
    whatsapp: "2348000000002",
    phone: "+2348000000002",
    available: true,
  },
  {
    id: "4",
    name: "BrightSpark Electricals",
    providerName: "BrightSpark Electricals",
    category: "electrical",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a26a5?w=500",
    location: "FUTO Staff Quarters",
    rating: 4.6,
    reviews: 67,
    tags: ["Wiring", "Repairs", "Installation"],
    description: "Certified electrician for all electrical issues. Emergency calls available.",
    priceLabel: "From ₦3,000",
    price: 3000,
    whatsapp: "2348000000003",
    phone: "+2348000000003",
    available: true,
  },
  {
    id: "5",
    name: "Tech Rescue",
    providerName: "Tech Rescue",
    category: "repair",
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500",
    location: "Futo Junction, Opposite Bank",
    rating: 4.9,
    reviews: 312,
    tags: ["Phone Repair", "Laptop Fix", "Data Recovery"],
    description: "Fast and affordable gadget repairs. Free diagnosis.",
    priceLabel: "From ₦2,000",
    price: 2000,
    whatsapp: "2348000000004",
    phone: "+2348000000004",
    available: false,
  },
  {
    id: "6",
    name: "Smart Tutors Hub",
    providerName: "Smart Tutors Hub",
    category: "tutoring",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500",
    location: "Online / FUTO Library",
    rating: 4.8,
    reviews: 145,
    tags: ["Maths", "Physics", "Programming", "Exam Prep"],
    description: "Expert tutors for university courses and professional certifications.",
    priceLabel: "From ₦4,000/session",
    price: 4000,
    whatsapp: "2348000000005",
    phone: "+2348000000005",
    available: true,
  },
  {
    id: "7",
    name: "Pixels & Portraits",
    providerName: "Pixels & Portraits",
    category: "photography",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500",
    location: "FUTO Campus & Events",
    rating: 4.9,
    reviews: 98,
    tags: ["Graduation", "Events", "Portraits", "Editing"],
    description: "Professional photography for all occasions. Creative and affordable.",
    priceLabel: "From ₦15,000",
    price: 15000,
    whatsapp: "2348000000006",
    phone: "+2348000000006",
    available: true,
  },
];

// Icon mapping for category icons
const iconMap: Record<string, React.ReactNode> = {
  FaBroom: <FaBroom size={14} />,
  FaCut: <FaCut size={14} />,
  FaTshirt: <FaTshirt size={14} />,
  FaBolt: <FaBolt size={14} />,
  FaWrench: <FaWrench size={14} />,
  FaLightbulb: <FaLightbulb size={14} />,
  FaChalkboardTeacher: <FaChalkboardTeacher size={14} />,
  FaCamera: <FaCamera size={14} />,
};

// Types
interface Provider {
  id: string;
  name: string;
  providerName: string;
  category: string;
  image: string;
  location: string;
  rating: number;
  reviews: number;
  tags: string[];
  description: string;
  priceLabel: string;
  price: number;
  whatsapp: string;
  phone: string;
  available: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  gradient: string;
}

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => {
      if (rating >= s) return <FaStar key={s} size={11} className="text-yellow-400" />;
      if (rating >= s - 0.5) return <FaStarHalfAlt key={s} size={11} className="text-yellow-400" />;
      return <FaRegStar key={s} size={11} className="text-ink/25" />;
    })}
  </div>
);

const ProviderCard = ({ provider }: { provider: Provider }) => {
  const cat = serviceCategories.find((c) => c.id === provider.category);

  return (
    <div className="bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>

      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <img src={provider.image} alt={provider.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: cat?.gradient || "#0E0E10" }}>
          <span>{iconMap[cat?.icon as keyof typeof iconMap]}</span> {cat?.name}
        </div>

        {/* Availability */}
        <div className={`absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-1 rounded-full ${
          provider.available ? "bg-green-500 text-white" : "bg-gray-400 text-white"
        }`}>
          {provider.available ? "● Available" : "● Busy"}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 md:p-5 flex flex-col flex-1 gap-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-ink text-sm md:text-base leading-tight"
              style={{ fontFamily: "'Instrument Sans',sans-serif" }}>
              {provider.name}
            </h3>
          </div>
          <p className="text-xs text-ink/50 mt-0.5 flex items-center gap-1">
            <FiMapPin size={10} className="text-[#0E0E10] shrink-0" /> {provider.location}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <Stars rating={provider.rating} />
          <span className="text-xs font-semibold text-ink">{provider.rating}</span>
          <span className="text-xs text-ink/40">({provider.reviews} reviews)</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {provider.tags.map((t) => (
            <span key={t} className="text-[10px] font-semibold text-ink/50 bg-sand px-2 py-0.5 rounded-full">{t}</span>
          ))}
        </div>

        {/* Description */}
        <p className="text-xs text-ink/50 leading-relaxed line-clamp-2">{provider.description}</p>

        {/* Price */}
        <p className="text-sm font-semibold text-[#0E0E10]">{provider.priceLabel}</p>

        {/* CTA buttons */}
        <div className="flex gap-2 mt-auto pt-2 border-t border-ink/10">
          <a href={`https://wa.me/${provider.whatsapp}?text=Hi, I found you on JOVO and I'd like to book your ${cat?.name} service.`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "#25D366" }}>
            <FaWhatsapp size={14} /> WhatsApp
          </a>
          <a href={`tel:${provider.phone}`}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-ink/70 bg-sand hover:bg-ink/10 transition-all">
            <FiPhone size={13} /> Call
          </a>
        </div>
      </div>
    </div>
  );
};

const ServicesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [activeCategory, setCategory] = useState(searchParams?.get("category") || "all");
  const [showAvailable, setShowAvailable] = useState(false);
  const [sortBy, setSortBy] = useState("rating");
  const [showSort, setShowSort] = useState(false);

  useEffect(() => {
    const cat = searchParams?.get("category");
    if (cat) setCategory(cat);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = [...serviceProviders];
    if (activeCategory !== "all") list = list.filter((p) => p.category === activeCategory);
    if (showAvailable) list = list.filter((p) => p.available);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.providerName.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.location.toLowerCase().includes(q)
      );
    }
    if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "reviews") list.sort((a, b) => b.reviews - a.reviews);
    else if (sortBy === "price") list.sort((a, b) => a.price - b.price);
    return list;
  }, [activeCategory, showAvailable, search, sortBy]);

  return (
    <>
      {/* ── Hero ── */}
      <div className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#0a0a0a 0%,#111 40%,#1a0a00 70%,#2a1500 100%)" }}>
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.8) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 rounded-full opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle,#B42225,transparent 65%)" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16 lg:py-20">
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 text-white/60 text-[10px] md:text-xs font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-4 tracking-widest uppercase">
            <FiTool size={12} /> Campus Services
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-3 leading-tight"
            style={{ fontFamily: "'Instrument Sans',sans-serif" }}>
            Trusted Services,<br />
            <span style={{ background: "linear-gradient(90deg,#B42225,#FFB347)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Booked Instantly
            </span>
          </h1>
          <p className="text-white/40 text-sm md:text-base max-w-xl mb-6 leading-relaxed">
            Connect directly with verified service providers on and around FUTO campus. Book via WhatsApp or call in seconds.
          </p>

          {/* Search */}
          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 md:px-5 py-3 md:py-4 max-w-xl"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
            <FiSearch size={16} className="text-ink/40 shrink-0" />
            <input type="text" placeholder="Search services, providers, skills..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm text-ink/70 outline-none placeholder-gray-400 bg-transparent min-w-0" />
            {search && <button onClick={() => setSearch("")} className="text-ink/40 hover:text-ink shrink-0"><FiX size={15} /></button>}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-2 md:gap-4 mt-6">
            {[
              { num: `${serviceProviders.length}+`, label: "Providers", icon: <FiUsers size={10} /> },
              { num: `${serviceCategories.length}`, label: "Categories", icon: <FiGrid size={10} /> },
              { num: `${serviceProviders.filter((p) => p.available).length}`, label: "Available Now", icon: <FiUserCheck size={10} /> },
            ].map(({ num, label, icon }) => (
              <div key={label} className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span className="text-[#B42225] text-xs">{icon}</span>
                <span className="text-[#B42225] font-semibold text-xs md:text-sm">{num}</span>
                <span className="text-white/40 text-[10px] md:text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ background: "#F4F5F9" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap mb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <button onClick={() => setCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                activeCategory === "all" ? "text-white" : "bg-white text-ink/60 hover:bg-ink/5 border border-ink/10"
              }`}
              style={activeCategory === "all" ? { background: "linear-gradient(135deg,#0E0E10,#B42225)", boxShadow: "0 4px 12px rgba(180,34,37,0.3)" } : {}}>
              <FiGrid size={12} className="inline mr-1" /> All Services
            </button>
            {serviceCategories.map((cat) => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  activeCategory === cat.id ? "text-white" : "bg-white text-ink/60 hover:bg-ink/5 border border-ink/10"
                }`}
                style={activeCategory === cat.id ? { background: cat.gradient, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" } : {}}>
                {iconMap[cat.icon as keyof typeof iconMap]} {cat.name}
              </button>
            ))}
          </div>

          {/* Filters row */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs text-ink/50 font-semibold">
                <span className="text-ink font-semibold">{filtered.length}</span> provider{filtered.length !== 1 ? "s" : ""} found
              </p>
              <button onClick={() => setShowAvailable(!showAvailable)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  showAvailable ? "border-green-400 bg-green-50 text-green-700" : "border-ink/10 bg-white text-ink/50 hover:border-ink/20"
                }`}>
                <FiCheckCircle size={12} /> Available Now
              </button>
            </div>

            {/* Sort */}
            <div className="relative">
              <button onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-ink/10 text-ink/60 hover:border-ink/20 transition-all">
                <FiFilter size={12} />
                <span className="hidden sm:inline">
                  {sortBy === "rating" ? "Top Rated" : sortBy === "reviews" ? "Most Reviewed" : "Lowest Price"}
                </span>
                <FiChevronDown size={12} className={`transition-transform ${showSort ? "rotate-180" : ""}`} />
              </button>
              {showSort && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl border border-ink/10 overflow-hidden z-20 w-44"
                  style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}>
                  {[
                    { key: "rating",  label: "Top Rated" },
                    { key: "reviews", label: "Most Reviewed" },
                    { key: "price",   label: "Lowest Price" },
                  ].map(({ key, label }) => (
                    <button key={key} onClick={() => { setSortBy(key); setShowSort(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors hover:bg-ink/5 ${sortBy === key ? "text-[#0E0E10] bg-red-50" : "text-ink/60"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 md:py-20">
              <div className="text-5xl mb-4 flex justify-center">
                <FiSearch size={48} className="text-ink/25" />
              </div>
              <p className="font-semibold text-ink/70 text-lg">No providers found</p>
              <p className="text-ink/40 text-sm mt-1">Try adjusting your filters or search term</p>
              <button onClick={() => { setSearch(""); setCategory("all"); setShowAvailable(false); }}
                className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg,#0E0E10,#B42225)" }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {filtered.map((p) => <ProviderCard key={p.id} provider={p} />)}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default function ServicesPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F5F9]" />}>
      <ServicesPage />
    </Suspense>
  );
}