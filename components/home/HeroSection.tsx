'use client'
import { useRouter } from 'next/navigation'
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import {
  FiBox,
  FiSmartphone,
  FiHeart,
  FiTv,
  FiShoppingBag,
  FiMonitor,
  FiPlay,
  FiGrid,
  FiArrowRight,
  FiCoffee,
  FiPackage,
  FiWind,
  FiDroplet,
  FiTruck,
  FiHome,
  FiBriefcase,
  FiX,
} from "react-icons/fi";
import { MdOutlineLocalOffer, MdFlashOn } from "react-icons/md";

/* Categories */
const categories = [
  {
    name: "Appliances",
    icon: <FiBox size={15} />,
    image: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=1000&auto=format&fit=crop&q=60",
    path: "/appliances-deals",
    tone: "bg-peach",
  },
  {
    name: "Phones & Tablets",
    icon: <FiSmartphone size={15} />,
    image: "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=600&auto=format&fit=crop&q=60",
    path: "/phone-deals",
    tone: "bg-sky",
  },
  {
    name: "Health & Beauty",
    icon: <FiHeart size={15} />,
    image: "https://plus.unsplash.com/premium_photo-1679134540232-c6e66ceee11c?w=600",
    path: "/beauty-deals",
    tone: "bg-mint",
  },
  {
    name: "Electronics",
    icon: <FiTv size={15} />,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=60",
    path: "/electronic-deals",
    tone: "bg-lilac",
  },
  {
    name: "Fashion",
    icon: <FiShoppingBag size={15} />,
    image: "https://images.unsplash.com/photo-1751522937993-46b83342398b?w=600&auto=format&fit=crop&q=60",
    path: "/fashion-deals",
    tone: "bg-cream-deep",
  },
  {
    name: "Computing",
    icon: <FiMonitor size={15} />,
    image: "https://images.unsplash.com/photo-1640955014216-75201056c829?w=1000&auto=format&fit=crop&q=60",
    path: "/computing-deals",
    tone: "bg-sky",
  },
  {
    name: "Gaming",
    icon: <FiPlay size={15} />,
    image: "https://images.unsplash.com/photo-1629429407756-4a7703614972?w=600&auto=format&fit=crop&q=60",
    path: "/gaming-deals",
    tone: "bg-mint",
  },
  {
    name: "All Categories",
    icon: <FiGrid size={15} />,
    image: "https://plus.unsplash.com/premium_photo-1664201889896-6a42c19e953a?w=700&auto=format&fit=crop&q=60",
    path: "#",
    tone: "bg-sand",
  },
];

const additionalCategories = [
  { name: "Drinks & Beverages", icon: <FiCoffee size={18} />, path: "/drink-deals", description: "Soft drinks, juices, energy drinks" },
  { name: "Perishables", icon: <FiPackage size={18} />, path: "/perishable", description: "Fresh food, vegetables, dairy" },
  { name: "Personal Care", icon: <FiWind size={18} />, path: "/personal-care", description: "Skincare, hygiene, grooming" },
  { name: "Cleaning & Hygiene", icon: <FiDroplet size={18} />, path: "/cleaning-hygiene", description: "Detergents, cleaning supplies" },
  { name: "Groceries", icon: <FiShoppingBag size={18} />, path: "/groceries", description: "Pantry staples, snacks, cooking essentials" },
  { name: "Services", icon: <FiBriefcase size={18} />, path: "/services", description: "Tutoring, repairs, photography" },
  { name: "Logistics", icon: <FiTruck size={18} />, path: "/logistics", description: "Delivery, shipping, courier services" },
  { name: "Accommodation", icon: <FiHome size={18} />, path: "/accommodations", description: "Hostels, apartments, short-let" },
];

const stats = [
  { icon: <MdFlashOn size={13} />, text: "Flash Sales Live" },
  { icon: <MdOutlineLocalOffer size={13} />, text: "50K+ Products" },
  { icon: <FiShoppingBag size={13} />, text: "Free Campus Pickup" },
];

const HeroSection = () => {
  const router = useRouter()
  const navigate = (p: string) => router.push(p)
  const { isSeller } = useContext(AuthContext);
  const [showAllCategoriesModal, setShowAllCategoriesModal] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleCategoryClick = (cat: { name: string; path: string }) => {
    if (cat.name === "All Categories") setShowAllCategoriesModal(true);
    else navigate(cat.path);
  };

  const showcase = categories.slice(0, 4);

  return (
    <>
      <section className="relative overflow-hidden bg-cream pb-10 pt-8 sm:pt-12">
        {/* Soft pastel wash */}
        <div className="pointer-events-none absolute -left-32 -top-24 h-80 w-80 rounded-full bg-lilac/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-sky/60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Copy */}
            <div className={ready ? "" : "opacity-0"}>
              <div className="hero-label inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/55 ring-1 ring-ink/[.05]">
                <MdFlashOn size={12} /> Campus marketplace
              </div>

              <h1 className="hero-title mt-5 font-display text-[clamp(2.1rem,5.2vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-ink">
                Everything your
                <br />
                campus needs,
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10">delivered.</span>
                  <span className="absolute inset-x-0 bottom-1 z-0 h-3 rounded-full bg-mint" />
                </span>
              </h1>

              <p className="hero-sub mt-5 max-w-md text-[14px] leading-relaxed text-ink/55">
                Shop phones, fashion, beauty and daily essentials from verified
                student sellers. Fair prices, fast campus delivery, no stress.
              </p>

              <div className="hero-cta mt-7 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => navigate("/shop")}
                  className="flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[13px] font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-95"
                >
                  Start shopping <FiArrowRight size={15} />
                </button>
                <button
                  onClick={() => navigate("/flash-sales")}
                  className="flex items-center gap-2 rounded-full bg-white/80 px-5 py-3.5 text-[13px] font-semibold text-ink ring-1 ring-ink/[.06] transition-colors duration-200 hover:bg-white"
                >
                  Flash sales
                </button>
                <button
                  onClick={() => navigate(isSeller ? "/seller/dashboard" : "/become-seller")}
                  className="flex items-center gap-2 rounded-full px-4 py-3.5 text-[13px] font-semibold text-ink/55 transition-colors duration-200 hover:text-ink"
                >
                  {isSeller ? "Seller dashboard" : "Sell on JOVO"} <FiArrowRight size={14} />
                </button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-2">
                {stats.map((s) => (
                  <span
                    key={s.text}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1.5 text-[10.5px] font-medium text-ink/55 ring-1 ring-ink/[.04]"
                  >
                    <span className="text-ink/45">{s.icon}</span>
                    {s.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Showcase collage */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-3">
                {showcase.map((cat, i) => (
                  <button
                    key={cat.name}
                    onClick={() => navigate(cat.path)}
                    className={`group relative overflow-hidden rounded-[24px] ${cat.tone} p-3 text-left ring-1 ring-ink/[.04] transition-transform duration-300 hover:-translate-y-1 ${
                      i % 2 === 1 ? "mt-6" : ""
                    }`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-white">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        loading={i === 0 ? "eager" : "lazy"}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      />
                    </div>
                    <div className="mt-2.5 flex items-center justify-between px-0.5">
                      <span className="font-display text-[12.5px] font-semibold text-ink">{cat.name}</span>
                      <FiArrowRight
                        size={12}
                        className="text-ink/35 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-ink"
                      />
                    </div>
                  </button>
                ))}
              </div>

              <div className="absolute -bottom-3 left-3 flex items-center gap-2 rounded-full bg-white px-3.5 py-2 shadow-soft">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mint text-ink">
                  <FiTruck size={12} />
                </span>
                <span className="text-[10.5px] font-semibold text-ink/70">30-min campus delivery</span>
              </div>
            </div>
          </div>

          {/* Category rail */}
          <div className="mt-10">
            <div className="mb-3 flex items-end justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/40">Shop by category</p>
              <button
                onClick={() => setShowAllCategoriesModal(true)}
                className="text-[11px] font-semibold text-ink/50 transition-colors hover:text-ink"
              >
                View all
              </button>
            </div>
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat)}
                  className={`cat-chip flex shrink-0 items-center gap-2 rounded-full ${cat.tone} px-3.5 py-2.5 text-[11.5px] font-medium text-ink/75 ring-1 ring-ink/[.04]`}
                >
                  <span className="text-ink/55">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* All categories modal */}
      {showAllCategoriesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm"
          onClick={() => setShowAllCategoriesModal(false)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-[28px] bg-cream-light shadow-lift"
            style={{ animation: "modalSlideUp 0.3s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ink/[.07] px-6 py-5">
              <div>
                <h2 className="font-display text-lg font-semibold text-ink">All categories</h2>
                <p className="mt-0.5 text-[11.5px] text-ink/45">Explore everything JOVO has to offer</p>
              </div>
              <button
                onClick={() => setShowAllCategoriesModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 text-ink/55 transition-colors hover:text-ink"
              >
                <FiX size={17} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {[...categories.filter((c) => c.name !== "All Categories").map((c) => ({
                  name: c.name,
                  icon: c.icon,
                  path: c.path,
                  description: `Shop ${c.name.toLowerCase()}`,
                })), ...additionalCategories].map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setShowAllCategoriesModal(false);
                      navigate(cat.path);
                    }}
                    className="group rounded-[18px] bg-white p-4 text-left ring-1 ring-ink/[.05] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft"
                  >
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[14px] bg-sand text-ink/60 transition-colors group-hover:bg-mint group-hover:text-ink">
                      {cat.icon}
                    </div>
                    <p className="text-[12.5px] font-semibold text-ink">{cat.name}</p>
                    <p className="mt-0.5 text-[10.5px] leading-relaxed text-ink/40">{cat.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-ink/[.07] bg-cream px-6 py-3.5">
              <p className="text-center text-[11px] text-ink/40">
                {categories.length - 1 + additionalCategories.length} categories available · Shop with confidence on JOVO
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeroSection;
