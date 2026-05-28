"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useMemo, ReactNode } from "react";
import { useWishlist } from "@/context/WishlistContext";
import { products } from "@/data/products";
import {
  FiHeart, FiShoppingBag, FiArrowLeft, FiDroplet, FiFeather,
  FiSearch, FiChevronDown, FiChevronUp, FiSliders, FiX,
} from "react-icons/fi";
import { FaHeart, FaStar, FaLeaf, FaRegGem } from "react-icons/fa";
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
  selectedSkinTypes: string[];
  toggleSkinType: (type: string) => void;
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
  "All Beauty",
  "Skincare",
  "Makeup & Cosmetics",
  "Haircare",
  "Fragrances",
  "Nail Care",
  "Body Care",
  "Men's Grooming",
  "Organic & Natural",
];

const BRANDS: string[] = [
  "L'Oréal", "Maybelline", "Neutrogena", "Nivea", "Dove",
  "Olay", "MAC", "Fenty Beauty", "Black Opal",
];

const SKIN_TYPES: string[] = ["All Skin Types", "Oily Skin", "Dry Skin", "Combination", "Sensitive"];

const PRICE_RANGES: PriceRange[] = [
  { label: "Under ₦5,000", min: 0, max: 5000 },
  { label: "₦5,000 – ₦15,000", min: 5000, max: 15000 },
  { label: "₦15,000 – ₦30,000", min: 15000, max: 30000 },
  { label: "₦30,000 – ₦60,000", min: 30000, max: 60000 },
  { label: "Above ₦60,000", min: 60000, max: Infinity },
];

const SORT_OPTIONS: string[] = ["Popularity", "Price: Low to High", "Price: High to Low", "Newest First", "Discount"];

// ─── FilterSection ─────────────────────────────────────────────────────────
const FilterSection = ({ title, children, defaultOpen = true }: FilterSectionProps) => {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  return (
    <div className="border-b border-pink-50 pb-4 mb-4">
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
  selectedSkinTypes, toggleSkinType,
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
        <button onClick={onClearAll} className="text-[11px] text-pink-600 font-semibold hover:underline">Clear All</button>
      </div>

      <FilterSection title="Category">
        <ul className="space-y-1">
          <li>
            <button onClick={() => setSelectedSub(null)} className={`w-full text-left text-xs py-1.5 px-2 rounded-lg font-semibold transition-colors ${!selectedSub ? "bg-pink-50 text-pink-700" : "text-gray-700 hover:bg-gray-50"}`}>
              Beauty & Cosmetics
            </button>
          </li>
          {SUBCATEGORIES.map((sub) => (
            <li key={sub}>
              <button
                onClick={() => setSelectedSub(sub === "All Beauty" ? null : sub)}
                className={`w-full text-left text-xs py-1.5 px-2 rounded-lg transition-colors ${selectedSub === sub ? "bg-pink-50 text-pink-700 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
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
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-pink-300"
          />
        </div>
        <ul className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {filteredBrands.map((brand) => (
            <li key={brand}>
              <label className="flex items-center gap-2 cursor-pointer group/item">
                <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} className="w-3.5 h-3.5 accent-pink-500 rounded" />
                <span className="text-xs text-gray-700 group-hover/item:text-pink-600 transition-colors">{brand}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="Skin Type" defaultOpen={false}>
        <ul className="space-y-1.5">
          {SKIN_TYPES.map((type) => (
            <li key={type}>
              <label className="flex items-center gap-2 cursor-pointer group/item">
                <input type="checkbox" checked={selectedSkinTypes.includes(type)} onChange={() => toggleSkinType(type)} className="w-3.5 h-3.5 accent-pink-500 rounded" />
                <span className="text-xs text-gray-700 group-hover/item:text-pink-600 transition-colors">{type}</span>
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
                <input type="radio" name="price" checked={selectedPrice?.label === range.label} onChange={() => setSelectedPrice(range)} className="w-3.5 h-3.5 accent-pink-500" />
                <span className="text-xs text-gray-700 group-hover/item:text-pink-600 transition-colors">{range.label}</span>
              </label>
            </li>
          ))}
          {selectedPrice && <li><button onClick={() => setSelectedPrice(null)} className="text-[11px] text-pink-500 hover:underline mt-1">Clear price filter</button></li>}
        </ul>
      </FilterSection>

      <FilterSection title="Discount" defaultOpen={false}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showDiscounted} onChange={() => setShowDiscounted(!showDiscounted)} className="w-3.5 h-3.5 accent-pink-500 rounded" />
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
        <FaStar key={s} size={10} style={{ color: s <= count ? "#ec4899" : "#e5e7eb" }} />
      ))}
      <span className="text-[10px] text-gray-400 ml-1">({randomCount})</span>
    </div>
  );
};

// ─── Beauty Badge ─────────────────────────────────────────────────────────
const BeautyBadge = () => (
  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black text-white" style={{ background: "linear-gradient(135deg,#9d174d,#db2777)", boxShadow: "0 2px 8px rgba(219,39,119,0.45)" }}>
    <FiFeather size={9} /> BEAUTY
  </div>
);

// ─── Product Card ─────────────────────────────────────────────────────────
const ProductCard = ({ product, wishlisted, onWishlist }: ProductCardProps) => {
  const router = useRouter();
  const discount: number | null = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : null;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
      <div className="absolute top-0 left-0 right-0 h-0.5 z-10" style={{ background: "linear-gradient(90deg,transparent,#db2777,transparent)" }} />
      <div className="relative overflow-hidden cursor-pointer bg-pink-50/30" style={{ aspectRatio: "1/1" }} onClick={() => router.push(`/product/${product.id}`)}>
        <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:639px) 50vw,25vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <BeautyBadge />
        {discount && (
          <div className="absolute top-3 right-10 px-2 py-1 rounded-full text-[10px] font-black text-white" style={{ background: "linear-gradient(135deg,#9d174d,#be185d)" }}>-{discount}%</div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onWishlist(product.id); }}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-110"
        >
          {wishlisted ? <FaHeart className="text-pink-500" size={12} /> : <FiHeart className="text-gray-400" size={12} />}
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white shadow-lg" style={{ background: "linear-gradient(135deg,#9d174d,#db2777)" }}>
            <FiShoppingBag size={12} /> Add to Cart
          </button>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug min-h-[2.5rem]">{product.name}</h3>
        <div className="mt-1.5 flex items-end gap-2 flex-wrap">
          <span className="text-sm font-black text-pink-700">₦{product.price.toLocaleString()}</span>
          {product.oldPrice && <span className="text-[11px] text-gray-400 line-through">₦{product.oldPrice.toLocaleString()}</span>}
        </div>
        <Stars count={4} seed={String(product.id) || product.name} />
      </div>
    </div>
  );
};

// ─── Suggested Card ───────────────────────────────────────────────────────
const SuggestedCard = ({ product }: SuggestedCardProps) => {
  const router = useRouter();
  return (
    <div onClick={() => router.push(`/product/${product.id}`)} className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" style={{ boxShadow: "0 2px 14px rgba(0,0,0,0.06)" }}>
      <div className="relative overflow-hidden bg-pink-50/20" style={{ aspectRatio: "1/1" }}>
        <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:639px) 50vw,25vw" />
      </div>
      <div className="p-3">
        <h3 className="text-xs font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
        <p className="text-pink-700 font-black mt-1.5 text-sm">₦{product.price.toLocaleString()}</p>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────
const BeautyCosmeticsDealPage = () => {
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();

  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<PriceRange | null>(null);
  const [showDiscounted, setShowDiscounted] = useState<boolean>(false);
  const [brandSearch, setBrandSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("Popularity");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const toggleBrand = (b: string): void => setSelectedBrands((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]);
  const toggleSkinType = (s: string): void => setSelectedSkinTypes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  const clearAll = (): void => { setSelectedSub(null); setSelectedBrands([]); setSelectedSkinTypes([]); setSelectedPrice(null); setShowDiscounted(false); };

  const beautyProducts: Product[] = useMemo(() => products.filter((p) => p.category === "beauty"), []);
  const filtered: Product[] = useMemo(() => {
    let list = [...beautyProducts];
    if (showDiscounted) list = list.filter((p) => p.oldPrice);
    if (selectedPrice) list = list.filter((p) => p.price >= selectedPrice.min && p.price <= selectedPrice.max);
    if (sortBy === "Price: Low to High") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "Price: High to Low") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "Discount") list.sort((a, b) => { const da = a.oldPrice ? (a.oldPrice - a.price) / a.oldPrice : 0; const db = b.oldPrice ? (b.oldPrice - b.price) / b.oldPrice : 0; return db - da; });
    return list;
  }, [beautyProducts, showDiscounted, selectedPrice, sortBy]);

  const suggestedProducts: Product[] = useMemo(() => products.filter((p) => p.category !== "beauty").slice(0, 8), []);
  const activeFilterCount: number = selectedBrands.length + selectedSkinTypes.length + (selectedPrice ? 1 : 0) + (showDiscounted ? 1 : 0) + (selectedSub ? 1 : 0);

  return (
    <div className="min-h-screen" style={{ background: "#FDF6F9" }}>
      {/* ══ HERO ══ */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#1a0010,#4a0728,#831843,#db2777)", minHeight: "240px" }}>
        <div className="absolute -top-20 -left-10 w-96 h-96 rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle,#f472b6,transparent 70%)" }} />
        <div className="absolute -bottom-10 right-0 w-80 h-80 rounded-full opacity-15 pointer-events-none" style={{ background: "radial-gradient(circle,#ec4899,transparent 70%)" }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px),radial-gradient(circle,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "30px 30px, 15px 15px", backgroundPosition: "0 0, 15px 15px" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-14">
          <Link href="/shop" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors mb-6">
            <FiArrowLeft size={14} /> Back to Shop
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5 mb-3">
                <FaRegGem size={11} className="text-pink-300" />
                <span className="text-white/70 text-xs font-semibold tracking-widest uppercase">Curated for You</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "rgba(219,39,119,0.2)", border: "1px solid rgba(249,168,212,0.3)", backdropFilter: "blur(8px)" }}>
                  <FiFeather className="text-pink-300" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight" style={{ fontFamily: "'Georgia',serif", textShadow: "0 4px 30px rgba(219,39,119,0.5)" }}>BEAUTY</h1>
                  <h1 className="text-3xl md:text-5xl font-black leading-none tracking-tight" style={{ fontFamily: "'Georgia',serif", background: "linear-gradient(90deg,#f9a8d4,#fce7f3,#f9a8d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>& GLOW</h1>
                </div>
              </div>
              <p className="mt-2 text-white/45 text-sm max-w-sm">Premium skincare, cosmetics and beauty deals — handpicked, deeply discounted.</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {[
                { icon: <FiDroplet size={13} />, label: "Skincare", val: "Top Picks" },
                { icon: <FaLeaf size={12} />, label: "Ingredients", val: "Natural+" },
                { icon: <FaStar size={12} />, label: "Avg Rating", val: "4.7★" },
              ].map(({ icon, label, val }) => (
                <div key={label} className="flex items-center gap-2 px-3.5 py-2 rounded-2xl" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(249,168,212,0.2)", backdropFilter: "blur(10px)" }}>
                  <span className="text-pink-300">{icon}</span>
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
          <path d="M0,40 L0,20 Q360,0 720,20 Q1080,40 1440,20 L1440,40 Z" fill="#FDF6F9" />
        </svg>
      </div>

      {/* ══ MAIN LAYOUT ══ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-6">
        <div className="lg:hidden flex items-center gap-3 mb-4">
          <button onClick={() => setMobileSidebarOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 shadow-sm">
            <FiSliders size={15} /> Filters
            {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] font-black flex items-center justify-center">{activeFilterCount}</span>}
          </button>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="ml-auto text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-pink-300">
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
                selectedSkinTypes={selectedSkinTypes} toggleSkinType={toggleSkinType}
                selectedPrice={selectedPrice} setSelectedPrice={setSelectedPrice}
                showDiscounted={showDiscounted} setShowDiscounted={setShowDiscounted}
                brandSearch={brandSearch} setBrandSearch={setBrandSearch}
                onClearAll={clearAll}
              />
              <button onClick={() => setMobileSidebarOpen(false)} className="w-full mt-4 py-3 rounded-xl font-bold text-sm text-white" style={{ background: "linear-gradient(135deg,#9d174d,#db2777)" }}>
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
                selectedSkinTypes={selectedSkinTypes} toggleSkinType={toggleSkinType}
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
                <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg,#f9a8d4,#db2777)" }} />
                <h2 className="text-base md:text-lg font-black text-gray-900">Beauty & Cosmetics</h2>
                <span className="text-xs text-gray-400 font-medium hidden sm:inline">({filtered.length} items)</span>
              </div>
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-xs text-gray-500">Sort by:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-pink-300 font-semibold">
                  {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedSub && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-50 border border-pink-200 rounded-full text-xs text-pink-700 font-semibold">{selectedSub}<button onClick={() => setSelectedSub(null)}><FiX size={11} /></button></span>}
                {selectedBrands.map((b) => <span key={b} className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-50 border border-pink-200 rounded-full text-xs text-pink-700 font-semibold">{b}<button onClick={() => toggleBrand(b)}><FiX size={11} /></button></span>)}
                {selectedSkinTypes.map((s) => <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-50 border border-pink-200 rounded-full text-xs text-pink-700 font-semibold">{s}<button onClick={() => toggleSkinType(s)}><FiX size={11} /></button></span>)}
                {selectedPrice && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-50 border border-pink-200 rounded-full text-xs text-pink-700 font-semibold">{selectedPrice.label}<button onClick={() => setSelectedPrice(null)}><FiX size={11} /></button></span>}
                {showDiscounted && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-50 border border-pink-200 rounded-full text-xs text-pink-700 font-semibold">Discounted<button onClick={() => setShowDiscounted(false)}><FiX size={11} /></button></span>}
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
                <FiFeather size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-semibold">No products match your filters.</p>
                <button onClick={clearAll} className="mt-3 text-sm text-pink-500 hover:underline font-semibold">Clear all filters</button>
              </div>
            )}

            <div className="mt-8">
              <div className="relative overflow-hidden rounded-2xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: "linear-gradient(120deg,#1a0010,#831843,#db2777)" }}>
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 30% 50%,rgba(249,168,212,0.6) 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
                <div className="relative z-10">
                  <p className="text-pink-300/70 text-xs font-semibold tracking-widest uppercase mb-1">Glow up season</p>
                  <h3 className="text-white text-lg md:text-xl font-black">Sell Your Beauty Brand on Jovo</h3>
                  <p className="text-white/45 text-sm mt-1">Reach beauty lovers across Nigeria. List for free this month.</p>
                </div>
                <Link href="/become-seller" className="relative z-10 shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg hover:scale-105 transition-all duration-200 whitespace-nowrap" style={{ background: "linear-gradient(135deg,#db2777,#9d174d)" }}>
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
          <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg,#f9a8d4,#db2777)" }} />
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

export default BeautyCosmeticsDealPage;