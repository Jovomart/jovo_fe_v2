'use client'
import { useRouter } from 'next/navigation'
// src/pages/PerishablePage.jsx
import { useState, useMemo } from "react";
import { products } from "@/data/products";
import { FiHeart, FiShoppingBag, FiSearch, FiX, FiZap, FiClock } from "react-icons/fi";
import { FaHeart, FaStar } from "react-icons/fa";
import { MdFoodBank } from "react-icons/md";
import Footer from "@/components/layout/Footer";

const perishableKeywords = ["fresh", "dairy", "milk", "egg", "meat", "fish", "vegetable", "fruit", "bread", "yogurt", "cheese", "butter", "cream"];

const PerishBadge = () => (
  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black text-white"
    style={{ background: "linear-gradient(135deg,#b45309,#d97706)", boxShadow: "0 2px 8px rgba(217,119,6,0.45)" }}>
    <FiClock size={9} /> FRESH
  </div>
);

const Stars = ({ count = 4 }) => (
  <div className="flex items-center gap-0.5 mt-1.5">
    {[1,2,3,4,5].map((s) => (
      <FaStar key={s} size={10} style={{ color: s <= count ? "#d97706" : "#e5e7eb" }} />
    ))}
  </div>
);

const ProductCard = ({ product, wishlisted, onWishlist }) => {
  const router = useRouter()
  const navigate = (p: string) => router.push(p)
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : null;

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
      style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.07)" }}>
      <div className="absolute top-0 left-0 right-0 h-0.5 z-10"
        style={{ background: "linear-gradient(90deg,transparent,#d97706,transparent)" }} />
      <div className="relative overflow-hidden cursor-pointer" style={{ aspectRatio: "1/1" }}
        onClick={() => navigate(`/product/${product.id}`)}>
        <img src={product.image} alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <PerishBadge />
        {discount && (
          <div className="absolute bottom-3 left-3 flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-black text-white"
            style={{ background: "linear-gradient(135deg,#b45309,#d97706)" }}>
            <FiZap size={9} /> -{discount}%
          </div>
        )}
        <button onClick={(e) => { e.stopPropagation(); onWishlist(product.id); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition shadow-md">
          {wishlisted ? <FaHeart size={14} className="text-amber-600" /> : <FiHeart size={14} className="text-gray-400" />}
        </button>
      </div>
      <div className="p-3 md:p-4">
        <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wide">{product.brand || "Fresh"}</p>
        <h3 className="text-xs md:text-sm font-bold text-gray-800 mt-0.5 line-clamp-2 leading-snug">{product.name}</h3>
        <Stars count={Math.round(product.rating || 4)} />
        <div className="flex items-center justify-between mt-2.5">
          <div>
            <span className="text-sm md:text-base font-black text-gray-900">₦{product.price?.toLocaleString()}</span>
            {product.oldPrice && <span className="text-xs text-gray-400 line-through ml-1.5">₦{product.oldPrice?.toLocaleString()}</span>}
          </div>
          <button onClick={() => navigate(`/product/${product.id}`)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#b45309,#d97706)" }}>
            <FiShoppingBag size={11} /> Add
          </button>
        </div>
      </div>
    </div>
  );
};

const PerishablePage = () => {
  const [search, setSearch]     = useState("");
  const [wishlist, setWishlist] = useState([]);

  const perishableProducts = useMemo(() => {
    const base = products.filter((p) => {
      const text = `${p.name} ${p.category} ${p.description || ""}`.toLowerCase();
      return perishableKeywords.some((k) => text.includes(k)) || p.category === "perishable";
    });
    return base.length > 0 ? base : products.slice(0, 16);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return perishableProducts;
    const q = search.toLowerCase();
    return perishableProducts.filter((p) => p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
  }, [search, perishableProducts]);

  const toggleWishlist = (id) =>
    setWishlist((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  return (
    <>
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#431407 0%,#7c2d12 50%,#d97706 100%)" }}>
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.8) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 rounded-full opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle,#fbbf24,transparent 65%)" }} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/70 text-[10px] md:text-xs font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-4 tracking-widest uppercase">
            🥩 Perishable Items
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight" style={{ fontFamily: "'Georgia',serif" }}>
            Fresh & Perishable<br />
            <span style={{ background: "linear-gradient(90deg,#fde68a,#fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Quality Items
            </span>
          </h1>
          <p className="text-white/50 text-sm md:text-base max-w-xl mb-6">
            Freshly sourced dairy, meats, fruits, vegetables and more — delivered fast to keep them fresh.
          </p>
          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 md:px-5 py-3 md:py-4 max-w-xl"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <FiSearch size={16} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Search fresh items..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-400 bg-transparent min-w-0" />
            {search && <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 shrink-0"><FiX size={15} /></button>}
          </div>
        </div>
      </div>

      <div style={{ background: "#F4F5F9" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-bold text-gray-700">
              <span className="text-gray-900 font-black">{filtered.length}</span> fresh items
            </p>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🥩</div>
              <p className="font-black text-gray-700 text-lg">No items found</p>
              <button onClick={() => setSearch("")} className="mt-4 px-6 py-2.5 rounded-xl text-sm font-black text-white"
                style={{ background: "linear-gradient(135deg,#b45309,#d97706)" }}>Clear Search</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} wishlisted={wishlist.includes(p.id)} onWishlist={toggleWishlist} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PerishablePage;