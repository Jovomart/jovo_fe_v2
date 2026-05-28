"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useMemo, ReactNode } from "react";
import { useWishlist } from "@/context/WishlistContext";
import { products } from "@/data/products";
import {
  FiHeart,
  FiShoppingBag,
  FiArrowLeft,
  FiZap,
  FiTv,
  FiVolume2,
  FiWifi,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiSliders,
  FiX,
} from "react-icons/fi";
import { FaHeart, FaStar, FaVolumeUp } from "react-icons/fa";
import { MdSurroundSound } from "react-icons/md";
import Footer from "@/components/layout/Footer";

// ─── Type Definitions ──────────────────────────────────────────────────────────

interface Product {
  id: number;
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
  selectedSizes: string[];
  toggleSize: (size: string) => void;
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

interface TvBadgeProps {
  resolution?: string;
}

interface ProductCardProps {
  product: Product;
  wishlisted: boolean;
  onWishlist: (id: number) => void;
}

interface SuggestedCardProps {
  product: Product;
}

// ─── Filter Data ──────────────────────────────────────────────────────────
const SUBCATEGORIES: string[] = [
  "All TV & Audio",
  "Smart TVs",
  "OLED & QLED TVs",
  "Soundbars",
  "Home Theatre Systems",
  "Bluetooth Speakers",
  "Headphones",
  "Projectors",
  "Streaming Devices",
  "Amplifiers",
];

const BRANDS: string[] = [
  "Samsung",
  "LG",
  "Sony",
  "Hisense",
  "TCL",
  "Panasonic",
  "Philips",
  "JBL",
  "Bose",
  "Polystar",
];

const SCREEN_SIZES: string[] = [
  '32"',
  '40" – 43"',
  '50" – 55"',
  '65" +',
  '75" +',
];

const PRICE_RANGES: PriceRange[] = [
  { label: "Under ₦100,000", min: 0, max: 100000 },
  { label: "₦100,000 – ₦250,000", min: 100000, max: 250000 },
  { label: "₦250,000 – ₦500,000", min: 250000, max: 500000 },
  { label: "₦500,000 – ₦1,000,000", min: 500000, max: 1000000 },
  { label: "Above ₦1,000,000", min: 1000000, max: Infinity },
];

const SORT_OPTIONS: string[] = [
  "Popularity",
  "Price: Low to High",
  "Price: High to Low",
  "Newest First",
  "Discount",
];

// ─── FilterSection ─────────────────────────────────────────────────────────
const FilterSection = ({
  title,
  children,
  defaultOpen = true,
}: FilterSectionProps) => {
  const [open, setOpen] = useState<boolean>(defaultOpen);
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

// ─── Sidebar ──────────────────────────────────────────────────────────────
const Sidebar = ({
  selectedSub,
  setSelectedSub,
  selectedBrands,
  toggleBrand,
  selectedSizes,
  toggleSize,
  selectedPrice,
  setSelectedPrice,
  showDiscounted,
  setShowDiscounted,
  brandSearch,
  setBrandSearch,
  onClearAll,
}: SidebarProps) => {
  const filteredBrands: string[] = BRANDS.filter((b) =>
    b.toLowerCase().includes(brandSearch.toLowerCase()),
  );

  return (
    <aside className="w-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
          Filters
        </h2>
        <button
          onClick={onClearAll}
          className="text-[11px] text-red-600 font-semibold hover:underline"
        >
          Clear All
        </button>
      </div>

      <FilterSection title="Category">
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setSelectedSub(null)}
              className={`w-full text-left text-xs py-1.5 px-2 rounded-lg font-semibold transition-colors ${!selectedSub ? "bg-red-50 text-red-700" : "text-gray-700 hover:bg-gray-50"}`}
            >
              TV & Audio
            </button>
          </li>
          {SUBCATEGORIES.map((sub) => (
            <li key={sub}>
              <button
                onClick={() =>
                  setSelectedSub(sub === "All TV & Audio" ? null : sub)
                }
                className={`w-full text-left text-xs py-1.5 px-2 rounded-lg transition-colors ${selectedSub === sub ? "bg-red-50 text-red-700 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
              >
                {sub}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="Brand">
        <div className="relative mb-2">
          <FiSearch
            size={11}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search brands"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-red-300"
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
                  className="w-3.5 h-3.5 accent-red-600 rounded"
                />
                <span className="text-xs text-gray-700 group-hover/item:text-red-600 transition-colors">
                  {brand}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="Screen Size" defaultOpen={false}>
        <ul className="space-y-1.5">
          {SCREEN_SIZES.map((size) => (
            <li key={size}>
              <label className="flex items-center gap-2 cursor-pointer group/item">
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(size)}
                  onChange={() => toggleSize(size)}
                  className="w-3.5 h-3.5 accent-red-600 rounded"
                />
                <span className="text-xs text-gray-700 group-hover/item:text-red-600 transition-colors">
                  {size}
                </span>
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
                <input
                  type="radio"
                  name="price"
                  checked={selectedPrice?.label === range.label}
                  onChange={() => setSelectedPrice(range)}
                  className="w-3.5 h-3.5 accent-red-600"
                />
                <span className="text-xs text-gray-700 group-hover/item:text-red-600 transition-colors">
                  {range.label}
                </span>
              </label>
            </li>
          ))}
          {selectedPrice && (
            <li>
              <button
                onClick={() => setSelectedPrice(null)}
                className="text-[11px] text-red-500 hover:underline mt-1"
              >
                Clear price filter
              </button>
            </li>
          )}
        </ul>
      </FilterSection>

      <FilterSection title="Discount" defaultOpen={false}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showDiscounted}
            onChange={() => setShowDiscounted(!showDiscounted)}
            className="w-3.5 h-3.5 accent-red-600 rounded"
          />
          <span className="text-xs text-gray-700">
            Show only discounted items
          </span>
        </label>
      </FilterSection>
    </aside>
  );
};

// ─── Stars ────────────────────────────────────────────────────────────────
const getStableReviewCount = (
  seed: string = "",
  min: number = 100,
  range: number = 900,
): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  return min + (hash % range);
};

const Stars = ({ count = 4, seed = "stars" }: StarsProps) => {
  const randomCount: number = useMemo(
    () => getStableReviewCount(seed, 100, 900),
    [seed],
  );
  return (
    <div className="flex items-center gap-0.5 mt-2">
      {[1, 2, 3, 4, 5].map((s) => (
        <FaStar
          key={s}
          size={10}
          style={{ color: s <= count ? "#B42225" : "#e5e7eb" }}
        />
      ))}
      <span className="text-[10px] text-gray-400 ml-1">({randomCount})</span>
    </div>
  );
};

// ─── TV Badge ─────────────────────────────────────────────────────────────
const TvBadge = ({ resolution = "4K" }: TvBadgeProps) => (
  <div
    className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black text-white"
    style={{
      background: "linear-gradient(135deg,#8B0000,#B42225,#cd5c5c)",
      boxShadow: "0 2px 8px rgba(180,34,37,0.5)",
    }}
  >
    <FiTv size={9} /> {resolution}
  </div>
);

// ─── Product Card ─────────────────────────────────────────────────────────
const ProductCard = ({ product, wishlisted, onWishlist }: ProductCardProps) => {
  const router = useRouter();
  const discount: number | null = product.oldPrice
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
          background: "linear-gradient(90deg,transparent,#B42225,transparent)",
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
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width:639px) 50vw,(max-width:1023px) 33vw,25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <TvBadge />
        {discount && (
          <div
            className="absolute top-3 right-10 px-2 py-1 rounded-full text-[10px] font-black text-white"
            style={{ background: "linear-gradient(135deg,#8B0000,#B42225)" }}
          >
            -{discount}%
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWishlist(product.id);
          }}
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
              background: "linear-gradient(135deg,#8B0000,#B42225,#cd5c5c)",
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
          <span className="text-sm font-black text-red-700">
            ₦{product.price.toLocaleString()}
          </span>
          {product.oldPrice && (
            <span className="text-[11px] text-gray-400 line-through">
              ₦{product.oldPrice.toLocaleString()}
            </span>
          )}
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
    <div
      onClick={() => router.push(`/product/${product.id}`)}
      className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{ boxShadow: "0 2px 14px rgba(0,0,0,0.06)" }}
    >
      <div
        className="relative overflow-hidden bg-gray-50"
        style={{ aspectRatio: "1/1" }}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width:639px) 50vw,25vw"
        />
      </div>
      <div className="p-3">
        <h3 className="text-xs font-semibold text-gray-800 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-red-700 font-black mt-1.5 text-sm">
          ₦{product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────
const TvAudioDealsPage = () => {
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();

  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<PriceRange | null>(null);
  const [showDiscounted, setShowDiscounted] = useState<boolean>(false);
  const [brandSearch, setBrandSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("Popularity");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const toggleBrand = (b: string): void =>
    setSelectedBrands((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
    );
  const toggleSize = (s: string): void =>
    setSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  const clearAll = (): void => {
    setSelectedSub(null);
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSelectedPrice(null);
    setShowDiscounted(false);
  };

  const tvAudio: Product[] = useMemo(
    () => products.filter((p) => p.category === "tv-audio"),
    [],
  );

  const filtered: Product[] = useMemo(() => {
    let list = [...tvAudio];
    if (showDiscounted) list = list.filter((p) => p.oldPrice);
    if (selectedPrice)
      list = list.filter(
        (p) => p.price >= selectedPrice.min && p.price <= selectedPrice.max,
      );
    if (sortBy === "Price: Low to High") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "Price: High to Low")
      list.sort((a, b) => b.price - a.price);
    else if (sortBy === "Discount")
      list.sort((a, b) => {
        const da = a.oldPrice ? (a.oldPrice - a.price) / a.oldPrice : 0;
        const db = b.oldPrice ? (b.oldPrice - b.price) / b.oldPrice : 0;
        return db - da;
      });
    return list;
  }, [tvAudio, showDiscounted, selectedPrice, sortBy]);

  const suggestedProducts: Product[] = useMemo(
    () => products.filter((p) => p.category !== "tv-audio").slice(0, 8),
    [],
  );

  const activeFilterCount: number =
    selectedBrands.length +
    selectedSizes.length +
    (selectedPrice ? 1 : 0) +
    (showDiscounted ? 1 : 0) +
    (selectedSub ? 1 : 0);

  return (
    <div className="min-h-screen" style={{ background: "#F5F6F7" }}>
      {/* ══ HERO ══ */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,#8B0000 0%,#B42225 50%,#cd5c5c 100%)",
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
        <div
          className="absolute -top-20 -left-10 w-80 h-80 rounded-full opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle,#FF6347,transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-10 right-10 w-72 h-72 rounded-full opacity-15 pointer-events-none"
          style={{
            background: "radial-gradient(circle,#cd5c5c,transparent 70%)",
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
                <FiVolume2 size={11} className="text-yellow-300" />
                <span className="text-white/75 text-xs font-semibold tracking-widest uppercase">
                  Sight & Sound
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
                  <MdSurroundSound className="text-yellow-300 text-2xl" />
                </div>
                <div>
                  <h1
                    className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight"
                    style={{ fontFamily: "'Georgia',serif" }}
                  >
                    TV &
                  </h1>
                  <h1
                    className="text-3xl md:text-5xl font-black leading-none tracking-tight"
                    style={{
                      fontFamily: "'Georgia',serif",
                      background:
                        "linear-gradient(90deg,#FFB347,#FFD699,#FFB347)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    AUDIO
                  </h1>
                </div>
              </div>
              <p className="mt-2 text-white/70 text-sm max-w-sm">
                Immersive displays and crystal-clear sound. Upgrade your
                entertainment experience.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {[
                {
                  icon: <FiTv size={13} />,
                  label: "Resolution",
                  val: "Up to 8K",
                },
                {
                  icon: <FiWifi size={13} />,
                  label: "Connectivity",
                  val: "Smart TV",
                },
                {
                  icon: <FaVolumeUp size={12} />,
                  label: "Audio",
                  val: "Dolby+",
                },
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
                    <p className="text-white font-black text-xs leading-none">
                      {val}
                    </p>
                    <p className="text-white/40 text-[10px] mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 40"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 L0,20 Q360,0 720,20 Q1080,40 1440,20 L1440,40 Z"
            fill="#F5F6F7"
          />
        </svg>
      </div>

      {/* ══ MAIN LAYOUT ══ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-6">
        {/* Mobile filter toggle */}
        <div className="lg:hidden flex items-center gap-3 mb-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 shadow-sm"
          >
            <FiSliders size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="ml-auto text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-red-300"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Mobile Drawer */}
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
                selectedSub={selectedSub}
                setSelectedSub={(v) => {
                  setSelectedSub(v);
                  setMobileSidebarOpen(false);
                }}
                selectedBrands={selectedBrands}
                toggleBrand={toggleBrand}
                selectedSizes={selectedSizes}
                toggleSize={toggleSize}
                selectedPrice={selectedPrice}
                setSelectedPrice={setSelectedPrice}
                showDiscounted={showDiscounted}
                setShowDiscounted={setShowDiscounted}
                brandSearch={brandSearch}
                setBrandSearch={setBrandSearch}
                onClearAll={clearAll}
              />
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="w-full mt-4 py-3 rounded-xl font-bold text-sm text-white"
                style={{
                  background: "linear-gradient(135deg,#8B0000,#B42225)",
                }}
              >
                Show {filtered.length} Results
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-60 xl:w-64 shrink-0">
            <div
              className="bg-white rounded-2xl p-5 sticky top-4"
              style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
            >
              <Sidebar
                selectedSub={selectedSub}
                setSelectedSub={setSelectedSub}
                selectedBrands={selectedBrands}
                toggleBrand={toggleBrand}
                selectedSizes={selectedSizes}
                toggleSize={toggleSize}
                selectedPrice={selectedPrice}
                setSelectedPrice={setSelectedPrice}
                showDiscounted={showDiscounted}
                setShowDiscounted={setShowDiscounted}
                brandSearch={brandSearch}
                setBrandSearch={setBrandSearch}
                onClearAll={clearAll}
              />
            </div>
          </div>

          {/* Products */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-1 h-6 rounded-full"
                  style={{
                    background: "linear-gradient(180deg,#cd5c5c,#8B0000)",
                  }}
                />
                <h2 className="text-base md:text-lg font-black text-gray-900">
                  TV & Audio Deals
                </h2>
                <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                  ({filtered.length} items)
                </span>
              </div>
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-xs text-gray-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-red-300 font-semibold"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedSub && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 rounded-full text-xs text-red-700 font-semibold">
                    {selectedSub}
                    <button onClick={() => setSelectedSub(null)}>
                      <FiX size={11} />
                    </button>
                  </span>
                )}
                {selectedBrands.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 rounded-full text-xs text-red-700 font-semibold"
                  >
                    {b}
                    <button onClick={() => toggleBrand(b)}>
                      <FiX size={11} />
                    </button>
                  </span>
                ))}
                {selectedSizes.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 rounded-full text-xs text-red-700 font-semibold"
                  >
                    {s}
                    <button onClick={() => toggleSize(s)}>
                      <FiX size={11} />
                    </button>
                  </span>
                ))}
                {selectedPrice && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 rounded-full text-xs text-red-700 font-semibold">
                    {selectedPrice.label}
                    <button onClick={() => setSelectedPrice(null)}>
                      <FiX size={11} />
                    </button>
                  </span>
                )}
                {showDiscounted && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 rounded-full text-xs text-red-700 font-semibold">
                    Discounted
                    <button onClick={() => setShowDiscounted(false)}>
                      <FiX size={11} />
                    </button>
                  </span>
                )}
              </div>
            )}

            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    wishlisted={isWishlisted(product.id)}
                    onWishlist={(id) => {
                      const p = products.find((x) => x.id === id);
                      if (!p) return;
                      isWishlisted(id)
                        ? removeFromWishlist(id)
                        : addToWishlist(p);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 text-gray-400">
                <FiTv size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-semibold">No products match your filters.</p>
                <button
                  onClick={clearAll}
                  className="mt-3 text-sm text-red-500 hover:underline font-semibold"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Banner */}
            <div className="mt-8">
              <div
                className="relative overflow-hidden rounded-2xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4"
                style={{
                  background: "linear-gradient(120deg,#8B0000,#B42225,#cd5c5c)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 30% 50%,rgba(255,255,255,0.8) 1px,transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />
                <div className="relative z-10">
                  <p className="text-yellow-300/60 text-xs font-semibold tracking-widest uppercase mb-1">
                    Level up your setup
                  </p>
                  <h3 className="text-white text-lg md:text-xl font-black">
                    Sell Electronics on Jovo
                  </h3>
                  <p className="text-white/40 text-sm mt-1">
                    Reach thousands of buyers looking for the latest tech.
                  </p>
                </div>
                <Link
                  href="/become-seller"
                  className="relative z-10 shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg hover:scale-105 transition-all duration-200 whitespace-nowrap"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
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
          <div
            className="w-1 h-6 rounded-full"
            style={{ background: "linear-gradient(180deg,#cd5c5c,#8B0000)" }}
          />
          <h2 className="text-lg md:text-xl font-black text-gray-900">
            You May Also Like
          </h2>
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

export default TvAudioDealsPage;
