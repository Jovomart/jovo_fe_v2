"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useMemo, ReactNode } from "react";
import { useWishlist } from "@/context/WishlistContext";
import { products } from "@/data/products";
import {
  FiHeart, FiShoppingBag, FiArrowLeft, FiSmartphone,
  FiCamera, FiBattery, FiCpu, FiSearch, FiChevronDown, FiChevronUp,
  FiSliders, FiX,
} from "react-icons/fi";
import { FaHeart, FaStar, FaBolt } from "react-icons/fa";
import { MdOutlineMemory } from "react-icons/md";
import Footer from "@/components/layout/Footer";

// ─── Type Definitions ──────────────────────────────────────────────────────────

interface Product {
  id: string | number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
}

interface PriceRange {
  label: string;
  min: number;
  max: number;
}

interface FilterSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

interface SidebarProps {
  selectedSub: string | null;
  setSelectedSub: (value: string | null) => void;
  selectedBrands: string[];
  toggleBrand: (brand: string) => void;
  selectedRAM: string[];
  toggleRAM: (ram: string) => void;
  selectedPrice: PriceRange | null;
  setSelectedPrice: (range: PriceRange | null) => void;
  showDiscounted: boolean;
  setShowDiscounted: (value: boolean) => void;
  brandSearch: string;
  setBrandSearch: (value: string) => void;
  onClearAll: () => void;
}

interface StarsProps {
  count?: number;
  seed?: string;
}

interface ProductCardProps {
  product: Product;
  wishlisted: boolean;
  onWishlist: (id: string | number) => void;
}

interface SuggestedCardProps {
  product: Product;
}

// ─── Filter Data ──────────────────────────────────────────────────────────
const SUBCATEGORIES: string[] = [
  "All Phones",
  "Android Phones",
  "iPhones",
  "Budget Phones",
  "Flagship Phones",
  "Gaming Phones",
  "Foldable Phones",
  "Tablets",
  "Accessories",
];

const BRANDS: string[] = [
  "Samsung", "Apple", "Tecno", "Infinix", "itel",
  "Xiaomi", "OnePlus", "Google", "Nokia", "Oppo",
];

const RAM_OPTIONS: string[] = ["2GB", "4GB", "6GB", "8GB", "12GB", "16GB+"];

const PRICE_RANGES: PriceRange[] = [
  { label: "Under ₦50,000", min: 0, max: 50000 },
  { label: "₦50,000 – ₦150,000", min: 50000, max: 150000 },
  { label: "₦150,000 – ₦300,000", min: 150000, max: 300000 },
  { label: "₦300,000 – ₦600,000", min: 300000, max: 600000 },
  { label: "Above ₦600,000", min: 600000, max: Infinity },
];

const SORT_OPTIONS: string[] = ["Popularity", "Price: Low to High", "Price: High to Low", "Newest First", "Discount"];

// ─── FilterSection ─────────────────────────────────────────────────────────
const FilterSection = ({ title, children, defaultOpen = true }: FilterSectionProps) => {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center justify-between w-full text-left mb-3">
        <span className="text-[11px] font-black tracking-widest text-gray-500 uppercase">{title}</span>
        {open ? <FiChevronUp size={14} className="text-gray-400" /> : <FiChevronDown size={14} className="text-gray-400" />}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────
const Sidebar = ({
  selectedSub, setSelectedSub,
  selectedBrands, toggleBrand,
  selectedRAM, toggleRAM,
  selectedPrice, setSelectedPrice,
  showDiscounted, setShowDiscounted,
  brandSearch, setBrandSearch,
  onClearAll,
}: SidebarProps) => {
  const filteredBrands: string[] = BRANDS.filter((b) =>
    b.toLowerCase().includes(brandSearch.toLowerCase())
  );
  return (
    <aside className="w-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Filters</h2>
        <button onClick={onClearAll} className="text-[11px] text-cyan-600 font-semibold hover:underline">Clear All</button>
      </div>

      <FilterSection title="Category">
        <ul className="space-y-1">
          <li>
            <button onClick={() => setSelectedSub(null)} className={`w-full text-left text-xs py-1.5 px-2 rounded-lg font-semibold transition-colors ${!selectedSub ? "bg-cyan-50 text-cyan-700" : "text-gray-700 hover:bg-gray-50"}`}>
              Phones & Tablets
            </button>
          </li>
          {SUBCATEGORIES.map((sub) => (
            <li key={sub}>
              <button
                onClick={() => setSelectedSub(sub === "All Phones" ? null : sub)}
                className={`w-full text-left text-xs py-1.5 px-2 rounded-lg transition-colors ${selectedSub === sub ? "bg-cyan-50 text-cyan-700 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
              >
                {sub}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="Brand">
        <div className="relative mb-2">
          <FiSearch size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search brands" value={brandSearch} onChange={(e) => setBrandSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-300"
          />
        </div>
        <ul className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {filteredBrands.map((brand) => (
            <li key={brand}>
              <label className="flex items-center gap-2 cursor-pointer group/item">
                <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} className="w-3.5 h-3.5 accent-cyan-500 rounded" />
                <span className="text-xs text-gray-700 group-hover/item:text-cyan-600 transition-colors">{brand}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="RAM" defaultOpen={false}>
        <ul className="space-y-1.5">
          {RAM_OPTIONS.map((r) => (
            <li key={r}>
              <label className="flex items-center gap-2 cursor-pointer group/item">
                <input type="checkbox" checked={selectedRAM.includes(r)} onChange={() => toggleRAM(r)} className="w-3.5 h-3.5 accent-cyan-500 rounded" />
                <span className="text-xs text-gray-700 group-hover/item:text-cyan-600 transition-colors">{r}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="Price Range">
        <ul className="space-y-1.5">
          {PRICE_RANGES.map((range) => (
            <li key={range.label}>
              <label className="flex items-center gap-2 cursor-pointer group/item">
                <input type="radio" name="price" checked={selectedPrice?.label === range.label} onChange={() => setSelectedPrice(range)} className="w-3.5 h-3.5 accent-cyan-500" />
                <span className="text-xs text-gray-700 group-hover/item:text-cyan-600 transition-colors">{range.label}</span>
              </label>
            </li>
          ))}
          {selectedPrice && <li><button onClick={() => setSelectedPrice(null)} className="text-[11px] text-cyan-500 hover:underline mt-1">Clear price filter</button></li>}
        </ul>
      </FilterSection>

      <FilterSection title="Discount" defaultOpen={false}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showDiscounted} onChange={() => setShowDiscounted(!showDiscounted)} className="w-3.5 h-3.5 accent-cyan-500 rounded" />
          <span className="text-xs text-gray-700">Show only discounted items</span>
        </label>
      </FilterSection>
    </aside>
  );
};

// ─── Stars ────────────────────────────────────────────────────────────────
const getStableReviewCount = (seed: string = "", min: number = 100, range: number = 900): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  return min + (hash % range);
};

const Stars = ({ count = 4, seed = "stars" }: StarsProps) => {
  const randomCount: number = useMemo(() => getStableReviewCount(seed, 100, 900), [seed]);
  return (
    <div className="flex items-center gap-0.5 mt-2">
      {[1, 2, 3, 4, 5].map((s) => (
        <FaStar key={s} size={10} style={{ color: s <= count ? "#00B4D8" : "#e5e7eb" }} />
      ))}
      <span className="text-[10px] text-gray-400 ml-1">({randomCount})</span>
    </div>
  );
};

// ─── Phone Badge ──────────────────────────────────────────────────────────
const PhoneBadge = () => (
  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black text-white" style={{ background: "linear-gradient(135deg,#00B4D8,#0077B6)", boxShadow: "0 2px 12px rgba(0,180,216,0.3)" }}>
    <FiSmartphone size={9} /> 5G
  </div>
);

// ─── Product Card ─────────────────────────────────────────────────────────
const ProductCard = ({ product, wishlisted, onWishlist }: ProductCardProps) => {
  const router = useRouter();
  const discount: number | null = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : null;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-cyan-500/10" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
      <div className="absolute top-0 left-0 right-0 h-0.5 z-10" style={{ background: "linear-gradient(90deg,transparent,#00B4D8,transparent)" }} />
      <div className="relative overflow-hidden cursor-pointer bg-gray-50" style={{ aspectRatio: "1/1" }} onClick={() => router.push(`/product/${product.id}`)}>
        <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:639px) 50vw,25vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <PhoneBadge />
        {discount && (
          <div className="absolute top-3 right-10 px-2 py-1 rounded-full text-[10px] font-black text-white" style={{ background: "linear-gradient(135deg,#00B4D8,#0077B6)" }}>-{discount}%</div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onWishlist(product.id); }}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm border border-gray-100 flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-110"
        >
          {wishlisted ? <FaHeart className="text-red-500" size={12} /> : <FiHeart className="text-gray-400" size={12} />}
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white shadow-lg" style={{ background: "linear-gradient(135deg,#00B4D8,#0077B6)" }}>
            <FiShoppingBag size={12} /> Add to Cart
          </button>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug min-h-[2.5rem]">{product.name}</h3>
        <div className="mt-1.5 flex items-end gap-2 flex-wrap">
          <span className="text-sm font-black text-cyan-600">₦{product.price.toLocaleString()}</span>
          {product.oldPrice && <span className="text-[11px] text-gray-400 line-through">₦{product.oldPrice.toLocaleString()}</span>}
        </div>
        <Stars count={4} seed={String(product.id) || product.name} />
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-[9px] text-cyan-500 flex items-center gap-1"><FaBolt size={8} /> Fast Shipping</span>
          <span className="text-[9px] text-gray-300">•</span>
          <span className="text-[9px] text-gray-400">2-Yr Warranty</span>
        </div>
      </div>
    </div>
  );
};

// ─── Suggested Card ───────────────────────────────────────────────────────
const SuggestedCard = ({ product }: SuggestedCardProps) => {
  const router = useRouter();
  return (
    <div onClick={() => router.push(`/product/${product.id}`)} className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-gray-100" style={{ boxShadow: "0 2px 14px rgba(0,0,0,0.04)" }}>
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1/1" }}>
        <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:639px) 50vw,25vw" />
      </div>
      <div className="p-3">
        <h3 className="text-xs font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
        <p className="text-cyan-600 font-black mt-1.5 text-sm">₦{product.price.toLocaleString()}</p>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────
const PhoneDealsPage = () => {
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();

  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRAM, setSelectedRAM] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<PriceRange | null>(null);
  const [showDiscounted, setShowDiscounted] = useState<boolean>(false);
  const [brandSearch, setBrandSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("Popularity");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const toggleBrand = (b: string): void => setSelectedBrands((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]);
  const toggleRAM = (r: string): void => setSelectedRAM((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);
  const clearAll = (): void => { setSelectedSub(null); setSelectedBrands([]); setSelectedRAM([]); setSelectedPrice(null); setShowDiscounted(false); };

  const phones: Product[] = useMemo(() => products.filter((p) => p.category === "phones"), []);
  const filtered: Product[] = useMemo(() => {
    let list = [...phones];
    if (showDiscounted) list = list.filter((p) => p.oldPrice);
    if (selectedPrice) list = list.filter((p) => p.price >= selectedPrice.min && p.price <= selectedPrice.max);
    if (sortBy === "Price: Low to High") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "Price: High to Low") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "Discount") list.sort((a, b) => { const da = a.oldPrice ? (a.oldPrice - a.price) / a.oldPrice : 0; const db = b.oldPrice ? (b.oldPrice - b.price) / b.oldPrice : 0; return db - da; });
    return list;
  }, [phones, showDiscounted, selectedPrice, sortBy]);

  const suggestedProducts: Product[] = useMemo(() => products.filter((p) => p.category !== "phones").slice(0, 8), []);
  const activeFilterCount: number = selectedBrands.length + selectedRAM.length + (selectedPrice ? 1 : 0) + (showDiscounted ? 1 : 0) + (selectedSub ? 1 : 0);

  return (
    <div className="min-h-screen bg-white">
      {/* ══ HERO ══ */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#00B4D8,#0077B6,#023E8A)", minHeight: "240px" }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.2) 1px,transparent 1px)", backgroundSize: "50px 50px" }} />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.6) 1.5px,transparent 1.5px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -top-20 -left-10 w-96 h-96 rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle,#00f2fe,transparent 70%)" }} />
        <div className="absolute -bottom-10 right-0 w-80 h-80 rounded-full opacity-15 pointer-events-none" style={{ background: "radial-gradient(circle,#0096c7,transparent 70%)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-14">
          <Link href="/shop" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors mb-6">
            <FiArrowLeft size={14} /> Back to Shop
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 mb-3">
                <FaBolt size={11} className="text-cyan-200" />
                <span className="text-white/80 text-xs font-semibold tracking-widest uppercase">Next-Gen Power</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}>
                  <FiSmartphone className="text-white" size={26} />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight" style={{ fontFamily: "'Georgia',serif" }}>PHONE</h1>
                  <h1 className="text-3xl md:text-5xl font-black leading-none tracking-tight" style={{ fontFamily: "'Georgia',serif", background: "linear-gradient(90deg,#FFFFFF,#e0f7fa,#FFFFFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>DEALS</h1>
                </div>
              </div>
              <p className="mt-2 text-white/60 text-sm max-w-sm">The hottest smartphones at the best prices. Latest models, unbeatable deals, lightning-fast delivery.</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {[
                { icon: <FiCamera size={13} />, label: "Camera", val: "Up to 200MP" },
                { icon: <FiBattery size={13} />, label: "Battery", val: "5000mAh+" },
                { icon: <MdOutlineMemory size={14} />, label: "Storage", val: "Up to 1TB" },
                { icon: <FiCpu size={12} />, label: "Chip", val: "Latest Gen" },
              ].map(({ icon, label, val }) => (
                <div key={label} className="flex items-center gap-2 px-3.5 py-2 rounded-2xl" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}>
                  <span className="text-white/70">{icon}</span>
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
          <path d="M0,40 L0,20 Q360,0 720,20 Q1080,40 1440,20 L1440,40 Z" fill="#FFFFFF" />
        </svg>
      </div>

      {/* ══ MAIN LAYOUT ══ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-6">
        <div className="lg:hidden flex items-center gap-3 mb-4">
          <button onClick={() => setMobileSidebarOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 shadow-sm">
            <FiSliders size={15} /> Filters
            {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] font-black flex items-center justify-center">{activeFilterCount}</span>}
          </button>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="ml-auto text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-cyan-300">
            {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>

        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
            <div className="relative z-10 w-80 max-w-[85vw] bg-white h-full overflow-y-auto p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="font-black text-gray-900">Filters</span>
                <button onClick={() => setMobileSidebarOpen(false)}><FiX size={20} className="text-gray-500" /></button>
              </div>
              <Sidebar
                selectedSub={selectedSub} setSelectedSub={(v) => { setSelectedSub(v); setMobileSidebarOpen(false); }}
                selectedBrands={selectedBrands} toggleBrand={toggleBrand}
                selectedRAM={selectedRAM} toggleRAM={toggleRAM}
                selectedPrice={selectedPrice} setSelectedPrice={setSelectedPrice}
                showDiscounted={showDiscounted} setShowDiscounted={setShowDiscounted}
                brandSearch={brandSearch} setBrandSearch={setBrandSearch}
                onClearAll={clearAll}
              />
              <button onClick={() => setMobileSidebarOpen(false)} className="w-full mt-4 py-3 rounded-xl font-bold text-sm text-white" style={{ background: "linear-gradient(135deg,#00B4D8,#0077B6)" }}>
                Show {filtered.length} Results
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          <div className="hidden lg:block w-60 xl:w-64 shrink-0">
            <div className="bg-white rounded-2xl p-5 sticky top-4" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
              <Sidebar
                selectedSub={selectedSub} setSelectedSub={setSelectedSub}
                selectedBrands={selectedBrands} toggleBrand={toggleBrand}
                selectedRAM={selectedRAM} toggleRAM={toggleRAM}
                selectedPrice={selectedPrice} setSelectedPrice={setSelectedPrice}
                showDiscounted={showDiscounted} setShowDiscounted={setShowDiscounted}
                brandSearch={brandSearch} setBrandSearch={setBrandSearch}
                onClearAll={clearAll}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg,#00B4D8,#0077B6)" }} />
                <h2 className="text-base md:text-lg font-black text-gray-900">Phone Deals</h2>
                <span className="text-xs text-gray-400 font-medium hidden sm:inline">({filtered.length} items)</span>
              </div>
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-xs text-gray-500">Sort by:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-cyan-300 font-semibold">
                  {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedSub && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-50 border border-cyan-200 rounded-full text-xs text-cyan-700 font-semibold">{selectedSub}<button onClick={() => setSelectedSub(null)}><FiX size={11} /></button></span>}
                {selectedBrands.map((b) => <span key={b} className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-50 border border-cyan-200 rounded-full text-xs text-cyan-700 font-semibold">{b}<button onClick={() => toggleBrand(b)}><FiX size={11} /></button></span>)}
                {selectedRAM.map((r) => <span key={r} className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-50 border border-cyan-200 rounded-full text-xs text-cyan-700 font-semibold">{r} RAM<button onClick={() => toggleRAM(r)}><FiX size={11} /></button></span>)}
                {selectedPrice && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-50 border border-cyan-200 rounded-full text-xs text-cyan-700 font-semibold">{selectedPrice.label}<button onClick={() => setSelectedPrice(null)}><FiX size={11} /></button></span>}
                {showDiscounted && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-50 border border-cyan-200 rounded-full text-xs text-cyan-700 font-semibold">Discounted<button onClick={() => setShowDiscounted(false)}><FiX size={11} /></button></span>}
              </div>
            )}

            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {filtered.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    wishlisted={isWishlisted(Number(product.id))}
                    onWishlist={(id) => { 
                      const p = products.find((x) => x.id === id); 
                      if (!p) return; 
                      const numericId = Number(id);
                      isWishlisted(numericId) ? removeFromWishlist(numericId) : addToWishlist(p); 
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 text-gray-400">
                <FiSmartphone size={48} className="mx-auto mb-4 opacity-20 text-gray-300" />
                <p className="font-semibold">No products match your filters.</p>
                <button onClick={clearAll} className="mt-3 text-sm text-cyan-500 hover:underline font-semibold">Clear all filters</button>
              </div>
            )}

            <div className="mt-8">
              <div className="relative overflow-hidden rounded-2xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: "linear-gradient(120deg,#00B4D8,#0077B6,#023E8A)" }}>
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 30% 50%,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "22px 22px" }} />
                <div className="relative z-10">
                  <p className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-1 flex items-center gap-1"><FaBolt size={10} /> Sell smarter</p>
                  <h3 className="text-white text-lg md:text-xl font-black">List Your Phones on Jovo</h3>
                  <p className="text-white/50 text-sm mt-1">Reach millions of buyers searching for their next device.</p>
                </div>
                <Link href="/become-seller" className="relative z-10 shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg hover:scale-105 transition-all duration-200 whitespace-nowrap bg-white/20 backdrop-blur-sm border border-white/30">
                  Start Selling →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ SUGGESTED ══ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg,#00B4D8,#0077B6)" }} />
          <h2 className="text-lg md:text-xl font-black text-gray-900">You May Also Like</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {suggestedProducts.map((product) => <SuggestedCard key={product.id} product={product} />)}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PhoneDealsPage;