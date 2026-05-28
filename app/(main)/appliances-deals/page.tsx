"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useMemo } from "react";
import { useWishlist } from "@/context/WishlistContext";
import { products } from "@/data/products";
import {
  FiHeart,
  FiShoppingBag,
  FiArrowLeft,
  FiZap,
  FiSettings,
  FiTruck,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiX,
} from "react-icons/fi";
const FiSlidersHorizontal = FiSettings;
import { FaHeart, FaStar, FaBolt, FaPlug } from "react-icons/fa";
import {
  MdOutlineElectricalServices,
  MdOutlineLocalLaundryService,
} from "react-icons/md";
import Footer from "@/components/layout/Footer";

// ─── Filter Data ──────────────────────────────────────────────────────────
const SUBCATEGORIES = [
  "All Appliances",
  "Washing Machines",
  "Refrigerators",
  "Air Conditioners",
  "Microwaves",
  "Dishwashers",
  "Vacuum Cleaners",
  "Water Dispensers",
  "Electric Cookers",
  "Irons & Steamers",
];

const BRANDS = [
  "LG", "Samsung", "Hisense", "Midea", "Thermocool",
  "Scanfrost", "Polystar", "Nexus", "Haier", "Binatone",
];

const ENERGY_RATINGS = ["A++", "A+", "A", "B", "C"];

const PRICE_RANGES = [
  { label: "Under ₦50,000", min: 0, max: 50000 },
  { label: "₦50,000 – ₦150,000", min: 50000, max: 150000 },
  { label: "₦150,000 – ₦300,000", min: 150000, max: 300000 },
  { label: "₦300,000 – ₦500,000", min: 300000, max: 500000 },
  { label: "Above ₦500,000", min: 500000, max: Infinity },
];

const SORT_OPTIONS = [
  "Popularity",
  "Price: Low to High",
  "Price: High to Low",
  "Newest First",
  "Discount",
];

// ─── FilterSection ─────────────────────────────────────────────────────────
const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <span className="text-[11px] font-black tracking-widest text-gray-500 uppercase">
          {title}
        </span>
        {open ? (
          <FiChevronUp size={14} className="text-gray-400" />
        ) : (
          <FiChevronDown size={14} className="text-gray-400" />
        )}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
};

// ─── Appliance Badge ──────────────────────────────────────────────────────
const ApplianceBadge = () => (
  <div
    className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black text-white"
    style={{
      background: "linear-gradient(135deg,#e67e22 0%,#f39c12 50%,#ffb347 100%)",
      boxShadow: "0 2px 8px rgba(230, 126, 34, 0.45)",
    }}
  >
    <FaPlug size={8} /> ELECTRIC
  </div>
);

// ─── Energy Rating ────────────────────────────────────────────────────────
const EnergyRating = ({ rating = "A++" }) => {
  const colors = {
    "A++": "#e67e22", "A+": "#f39c12", A: "#ffb347", B: "#facc15",
  };
  return (
    <div className="mt-2 flex items-center gap-1.5">
      <span
        className="text-[9px] font-black px-1.5 py-0.5 rounded text-white"
        style={{ background: colors[rating] || "#e67e22" }}
      >
        {rating}
      </span>
      <span className="text-[10px] text-gray-400">Energy rating</span>
    </div>
  );
};

// ─── Product Card ─────────────────────────────────────────────────────────
const ProductCard = ({ product, wishlisted, onWishlist, rating }) => {
  const router = useRouter();
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-0.5 z-10"
        style={{
          background: "linear-gradient(90deg,transparent,#f39c12,transparent)",
        }}
      />

      <div
        className="relative overflow-hidden cursor-pointer bg-gray-50"
        style={{ aspectRatio: "1/1" }}
        onClick={() => router.push(`/product/${product.id}`)}
      >
        <Image
          src={product.image}
          alt={product.name}
          width={300}
          height={300}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <ApplianceBadge />
        {discount && (
          <div
            className="absolute top-3 right-10 flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-black text-white"
            style={{
              background: "linear-gradient(135deg,#e67e22,#f39c12)",
            }}
          >
            -{discount}%
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onWishlist(product.id); }}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-110"
        >
          {wishlisted ? (
            <FaHeart className="text-red-500" size={12} />
          ) : (
            <FiHeart className="text-gray-400" size={12} />
          )}
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white shadow-lg"
            style={{
              background: "linear-gradient(135deg,#e67e22,#f39c12,#ffb347)",
            }}
          >
            <FiShoppingBag size={12} /> Add to Cart
          </button>
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="mt-1.5 flex items-end gap-2 flex-wrap">
          <span className="text-sm font-black text-orange-700">
            ₦{product.price.toLocaleString()}
          </span>
          {product.oldPrice && (
            <span className="text-[11px] text-gray-400 line-through">
              ₦{product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>
        <EnergyRating rating={rating} />
      </div>
    </div>
  );
};

// ─── Suggested Card ───────────────────────────────────────────────────────
const SuggestedCard = ({ product }) => {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/product/${product.id}`)}
      className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{ boxShadow: "0 2px 14px rgba(0,0,0,0.06)" }}
    >
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1/1" }}>
        <Image
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          width={200}
          height={200}
        />
      </div>
      <div className="p-3">
        <h3 className="text-xs font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
        <p className="text-orange-700 font-black mt-1.5 text-sm">
          ₦{product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────
const Sidebar = ({
  selectedSub, setSelectedSub,
  selectedBrands, toggleBrand,
  selectedRatings, toggleRating,
  selectedPrice, setSelectedPrice,
  showDiscounted, setShowDiscounted,
  brandSearch, setBrandSearch,
  onClearAll,
}) => {
  const filteredBrands = BRANDS.filter((b) =>
    b.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <aside className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Filters</h2>
        <button
          onClick={onClearAll}
          className="text-[11px] text-orange-600 font-semibold hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* Category */}
      <FilterSection title="Category">
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setSelectedSub(null)}
              className={`w-full text-left text-xs py-1.5 px-2 rounded-lg font-semibold transition-colors ${
                !selectedSub
                  ? "bg-orange-50 text-orange-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Home Appliances
            </button>
          </li>
          {SUBCATEGORIES.map((sub) => (
            <li key={sub}>
              <button
                onClick={() => setSelectedSub(sub === "All Appliances" ? null : sub)}
                className={`w-full text-left text-xs py-1.5 px-2 rounded-lg transition-colors ${
                  selectedSub === sub
                    ? "bg-orange-50 text-orange-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {sub}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Brand */}
      <FilterSection title="Brand">
        <div className="relative mb-2">
          <FiSearch size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search brands"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-orange-300"
          />
        </div>
        <ul className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {filteredBrands.map((brand) => (
            <li key={brand}>
              <label className="flex items-center gap-2 cursor-pointer group/item">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="w-3.5 h-3.5 accent-orange-500 rounded"
                />
                <span className="text-xs text-gray-700 group-hover/item:text-orange-600 transition-colors">
                  {brand}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <ul className="space-y-1.5">
          {PRICE_RANGES.map((range) => (
            <li key={range.label}>
              <label className="flex items-center gap-2 cursor-pointer group/item">
                <input
                  type="radio"
                  name="price"
                  checked={selectedPrice?.label === range.label}
                  onChange={() => setSelectedPrice(range)}
                  className="w-3.5 h-3.5 accent-orange-500"
                />
                <span className="text-xs text-gray-700 group-hover/item:text-orange-600 transition-colors">
                  {range.label}
                </span>
              </label>
            </li>
          ))}
          {selectedPrice && (
            <li>
              <button
                onClick={() => setSelectedPrice(null)}
                className="text-[11px] text-orange-500 hover:underline mt-1"
              >
                Clear price filter
              </button>
            </li>
          )}
        </ul>
      </FilterSection>

      {/* Energy Rating */}
      <FilterSection title="Energy Rating">
        <ul className="space-y-1.5">
          {ENERGY_RATINGS.map((r) => (
            <li key={r}>
              <label className="flex items-center gap-2 cursor-pointer group/item">
                <input
                  type="checkbox"
                  checked={selectedRatings.includes(r)}
                  onChange={() => toggleRating(r)}
                  className="w-3.5 h-3.5 accent-orange-500 rounded"
                />
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded text-white"
                  style={{ background: r === "A++" ? "#e67e22" : r === "A+" ? "#f39c12" : r === "A" ? "#ffb347" : "#facc15" }}
                >
                  {r}
                </span>
                <span className="text-xs text-gray-600">Rated</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Discount */}
      <FilterSection title="Discount" defaultOpen={false}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showDiscounted}
            onChange={() => setShowDiscounted((v) => !v)}
            className="w-3.5 h-3.5 accent-orange-500 rounded"
          />
          <span className="text-xs text-gray-700">Show only discounted items</span>
        </label>
      </FilterSection>
    </aside>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────
const AppliancesDealsPage = () => {
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const ratings = ["A++", "A+", "A++", "A+", "A", "A++"];

  // Filter state
  const [selectedSub, setSelectedSub] = useState(null);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [showDiscounted, setShowDiscounted] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [sortBy, setSortBy] = useState("Popularity");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleBrand = (b) =>
    setSelectedBrands((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
    );
  const toggleRating = (r) =>
    setSelectedRatings((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  const clearAll = () => {
    setSelectedSub(null);
    setSelectedBrands([]);
    setSelectedRatings([]);
    setSelectedPrice(null);
    setShowDiscounted(false);
  };

  const appliances = useMemo(
    () => products.filter((p) => p.category === "appliances"),
    []
  );

  const filteredAppliances = useMemo(() => {
    let list = [...appliances];
    if (showDiscounted) list = list.filter((p) => p.oldPrice);
    if (selectedPrice)
      list = list.filter(
        (p) => p.price >= selectedPrice.min && p.price <= selectedPrice.max
      );
    if (sortBy === "Price: Low to High") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "Price: High to Low") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "Discount")
      list.sort((a, b) => {
        const da = a.oldPrice ? (a.oldPrice - a.price) / a.oldPrice : 0;
        const db = b.oldPrice ? (b.oldPrice - b.price) / b.oldPrice : 0;
        return db - da;
      });
    return list;
  }, [appliances, showDiscounted, selectedPrice, sortBy]);

  const suggestedProducts = useMemo(
    () => products.filter((p) => p.category !== "appliances").slice(0, 8),
    []
  );

  const activeFilterCount =
    selectedBrands.length +
    selectedRatings.length +
    (selectedPrice ? 1 : 0) +
    (showDiscounted ? 1 : 0) +
    (selectedSub ? 1 : 0);

  return (
    <div className="min-h-screen" style={{ background: "#F5F6F7" }}>
      {/* ══════════ HERO ══════════ */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#e67e22 0%,#f39c12 55%,#ffb347 100%)",
          minHeight: "240px",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg,transparent,transparent 18px,rgba(255,255,255,1) 18px,rgba(255,255,255,1) 19px)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-14">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-white/75 hover:text-white text-sm transition-colors mb-6"
          >
            <FiArrowLeft size={14} /> Back to Shop
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5 mb-3">
                <FiSettings
                  size={11}
                  className="text-yellow-300 animate-spin"
                  style={{ animationDuration: "5s" }}
                />
                <span className="text-white/75 text-xs font-semibold tracking-widest uppercase">
                  High Performance
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <MdOutlineElectricalServices className="text-yellow-300 text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
                    HOME
                  </h1>
                  <h1
                    className="text-3xl md:text-5xl font-black leading-none tracking-tight"
                    style={{
                      fontFamily: "'Georgia', serif",
                      background: "linear-gradient(90deg,#FFE066,#FFF5CC,#FFE066)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    APPLIANCES
                  </h1>
                </div>
              </div>
              <p className="mt-2 text-white/70 text-sm max-w-sm">
                High-performance electric appliances engineered for modern living.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {[
                { icon: <FaBolt size={12} />, label: "Energy", val: "A++ Rated" },
                { icon: <FiTruck size={13} />, label: "Delivery", val: "Free Install" },
                { icon: <MdOutlineLocalLaundryService size={14} />, label: "Warranty", val: "2 Years" },
              ].map(({ icon, label, val }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <span className="text-yellow-300">{icon}</span>
                  <div>
                    <p className="text-white font-black text-xs leading-none">{val}</p>
                    <p className="text-white/40 text-[10px] mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path d="M0,40 L0,20 Q360,0 720,20 Q1080,40 1440,20 L1440,40 Z" fill="#F5F6F7" />
        </svg>
      </div>

      {/* ══════════ MAIN LAYOUT ══════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-6">

        {/* Mobile filter toggle */}
        <div className="lg:hidden flex items-center gap-3 mb-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 shadow-sm"
          >
            <FiSlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="ml-auto text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-orange-300"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Mobile Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative z-10 w-80 max-w-[85vw] bg-white h-full overflow-y-auto p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="font-black text-gray-900">Filters</span>
                <button onClick={() => setMobileSidebarOpen(false)}>
                  <FiX size={20} className="text-gray-500" />
                </button>
              </div>
              <Sidebar
                selectedSub={selectedSub} setSelectedSub={(v) => { setSelectedSub(v); setMobileSidebarOpen(false); }}
                selectedBrands={selectedBrands} toggleBrand={toggleBrand}
                selectedRatings={selectedRatings} toggleRating={toggleRating}
                selectedPrice={selectedPrice} setSelectedPrice={setSelectedPrice}
                showDiscounted={showDiscounted} setShowDiscounted={setShowDiscounted}
                brandSearch={brandSearch} setBrandSearch={setBrandSearch}
                onClearAll={clearAll}
              />
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="w-full mt-4 py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: "linear-gradient(135deg,#e67e22,#f39c12)" }}
              >
                Show {filteredAppliances.length} Results
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* ── Desktop Sidebar ── */}
          <div className="hidden lg:block w-60 xl:w-64 shrink-0">
            <div className="bg-white rounded-2xl p-5 sticky top-4" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
              <Sidebar
                selectedSub={selectedSub} setSelectedSub={setSelectedSub}
                selectedBrands={selectedBrands} toggleBrand={toggleBrand}
                selectedRatings={selectedRatings} toggleRating={toggleRating}
                selectedPrice={selectedPrice} setSelectedPrice={setSelectedPrice}
                showDiscounted={showDiscounted} setShowDiscounted={setShowDiscounted}
                brandSearch={brandSearch} setBrandSearch={setBrandSearch}
                onClearAll={clearAll}
              />
            </div>
          </div>

          {/* ── Products ── */}
          <div className="flex-1 min-w-0">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg,#f39c12,#e67e22)" }} />
                <h2 className="text-base md:text-lg font-black text-gray-900">
                  Appliances Deals
                </h2>
                <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                  ({filteredAppliances.length} items)
                </span>
              </div>

              {/* Desktop sort */}
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-xs text-gray-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-orange-300 font-semibold"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filters chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedSub && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs text-orange-700 font-semibold">
                    {selectedSub}
                    <button onClick={() => setSelectedSub(null)}><FiX size={11} /></button>
                  </span>
                )}
                {selectedBrands.map((b) => (
                  <span key={b} className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs text-orange-700 font-semibold">
                    {b}
                    <button onClick={() => toggleBrand(b)}><FiX size={11} /></button>
                  </span>
                ))}
                {selectedPrice && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs text-orange-700 font-semibold">
                    {selectedPrice.label}
                    <button onClick={() => setSelectedPrice(null)}><FiX size={11} /></button>
                  </span>
                )}
                {selectedRatings.map((r) => (
                  <span key={r} className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs text-orange-700 font-semibold">
                    {r} Rated
                    <button onClick={() => toggleRating(r)}><FiX size={11} /></button>
                  </span>
                ))}
                {showDiscounted && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs text-orange-700 font-semibold">
                    Discounted
                    <button onClick={() => setShowDiscounted(false)}><FiX size={11} /></button>
                  </span>
                )}
              </div>
            )}

            {/* Grid */}
            {filteredAppliances.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {filteredAppliances.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    wishlisted={isWishlisted(product.id)}
                    onWishlist={(id) => {
                      const p = products.find((x) => x.id === id);
                      if (!p) return;
                      isWishlisted(id) ? removeFromWishlist(id) : addToWishlist(p);
                    }}
                    rating={ratings[i % ratings.length]}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 text-gray-400">
                <MdOutlineElectricalServices size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-semibold">No appliances match your filters.</p>
                <button onClick={clearAll} className="mt-3 text-sm text-orange-500 hover:underline font-semibold">
                  Clear all filters
                </button>
              </div>
            )}

            {/* ══ BANNER ══ */}
            <div className="mt-8">
              <div
                className="relative overflow-hidden rounded-2xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4"
                style={{ background: "linear-gradient(120deg,#e67e22 0%,#f39c12 55%,#ffb347 100%)" }}
              >
                <div
                  className="absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.8) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />
                <div className="relative z-10">
                  <p className="text-yellow-300/60 text-xs font-semibold tracking-widest uppercase mb-1">
                    Power your sales
                  </p>
                  <h3 className="text-white text-lg md:text-xl font-black">
                    Sell Appliances on Jovo
                  </h3>
                  <p className="text-white/40 text-sm mt-1">
                    Reach thousands of buyers looking for quality home appliances.
                  </p>
                </div>
                <Link
                  href="/become-seller"
                  className="relative z-10 shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg hover:scale-105 transition-all duration-200 whitespace-nowrap"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
                >
                  Start Selling →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ SUGGESTED ══════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg,#f39c12,#e67e22)" }} />
          <h2 className="text-lg md:text-xl font-black text-gray-900">You May Also Like</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {suggestedProducts.map((product) => (
            <SuggestedCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AppliancesDealsPage;