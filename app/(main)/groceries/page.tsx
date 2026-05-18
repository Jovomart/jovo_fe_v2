"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
// src/pages/GroceriesPage.jsx
import { useState, useMemo } from "react";
import { useWishlist } from "@/context/WishlistContext";
import { products } from "@/data/products";
import { FiHeart, FiShoppingBag, FiSearch, FiX, FiZap } from "react-icons/fi";
import { FaHeart, FaStar, FaLeaf } from "react-icons/fa";
import Footer from "@/components/layout/Footer";

const groceryKeywords = [
  "food",
  "snack",
  "drink",
  "beverage",
  "grocery",
  "fruit",
  "water",
  "juice",
  "biscuit",
  "chocolate",
  "rice",
  "pasta",
  "cereal",
];

const GroceryBadge = () => (
  <div
    className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black text-white"
    style={{
      background: "linear-gradient(135deg,#15803d,#16a34a)",
      boxShadow: "0 2px 8px rgba(22,163,74,0.45)",
    }}
  >
    <FaLeaf size={9} /> GROCERY
  </div>
);

const Stars = ({ count = 4 }) => (
  <div className="flex items-center gap-0.5 mt-1.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <FaStar
        key={s}
        size={10}
        style={{ color: s <= count ? "#16a34a" : "#e5e7eb" }}
      />
    ))}
  </div>
);

const ProductCard = ({ product, wishlisted, onWishlist }) => {
  const router = useRouter();
  const navigate = (p: string) => router.push(p);
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  return (
    <div
      className="group relative bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
      style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.07)" }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-0.5 z-10"
        style={{
          background: "linear-gradient(90deg,transparent,#16a34a,transparent)",
        }}
      />
      <div
        className="relative overflow-hidden cursor-pointer"
        style={{ aspectRatio: "1/1" }}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <Image
          src={product.image}
          alt={product.name}
          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 20vw"
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <GroceryBadge />
        {discount && (
          <div
            className="absolute bottom-3 left-3 flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-black text-white"
            style={{ background: "linear-gradient(135deg,#15803d,#16a34a)" }}
          >
            <FiZap size={9} /> -{discount}%
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWishlist(product.id);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center transition-transform hover:scale-110 shadow-md"
        >
          {wishlisted ? (
            <FaHeart size={14} className="text-green-600" />
          ) : (
            <FiHeart size={14} className="text-gray-400" />
          )}
        </button>
      </div>
      <div className="p-3 md:p-4">
        <p className="text-[10px] text-green-600 font-bold uppercase tracking-wide">
          {product.brand || "Fresh"}
        </p>
        <h3 className="text-xs md:text-sm font-bold text-gray-800 mt-0.5 line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <Stars count={Math.round(product.rating || 4)} />
        <div className="flex items-center justify-between mt-2.5">
          <div>
            <span className="text-sm md:text-base font-black text-gray-900">
              ₦{product.price?.toLocaleString()}
            </span>
            {product.oldPrice && (
              <span className="text-xs text-gray-400 line-through ml-1.5">
                ₦{product.oldPrice?.toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={() => navigate(`/product/${product.id}`)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#15803d,#16a34a)" }}
          >
            <FiShoppingBag size={11} /> Add
          </button>
        </div>
      </div>
    </div>
  );
};

const GroceriesPage = () => {
  const [search, setSearch] = useState("");
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();

  const groceryProducts = useMemo(() => {
    const base = products.filter((p) => {
      const text =
        `${p.name} ${p.category} ${p.description || ""}`.toLowerCase();
      return (
        groceryKeywords.some((k) => text.includes(k)) ||
        p.category === "drinks" ||
        p.category === "food" ||
        p.category === "groceries"
      );
    });
    // fallback to first 20 if none match
    return base.length > 0 ? base : products.slice(0, 20);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return groceryProducts;
    const q = search.toLowerCase();
    return groceryProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q),
    );
  }, [search, groceryProducts]);

  return (
    <>
      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,#052e16 0%,#14532d 50%,#16a34a 100%)",
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
            background: "radial-gradient(circle,#4ade80,transparent 65%)",
          }}
        />
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/70 text-[10px] md:text-xs font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-4 tracking-widest uppercase">
            🛒 Groceries & Snacks
          </div>
          <h1
            className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight"
            style={{ fontFamily: "'Georgia',serif" }}
          >
            Fresh Groceries &<br />
            <span
              style={{
                background: "linear-gradient(90deg,#86efac,#4ade80)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Daily Essentials
            </span>
          </h1>
          <p className="text-white/50 text-sm md:text-base max-w-xl mb-6">
            Stock up on groceries, snacks, beverages and everyday essentials
            delivered right to your doorstep.
          </p>
          <div
            className="flex items-center gap-3 bg-white rounded-2xl px-4 md:px-5 py-3 md:py-4 max-w-xl"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}
          >
            <FiSearch size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search groceries, snacks, beverages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-400 bg-transparent min-w-0"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-gray-400 hover:text-gray-600 shrink-0"
              >
                <FiX size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      <div style={{ background: "#F4F5F9" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-bold text-gray-700">
              <span className="text-gray-900 font-black">
                {filtered.length}
              </span>{" "}
              items found
            </p>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🛒</div>
              <p className="font-black text-gray-700 text-lg">No items found</p>
              <button
                onClick={() => setSearch("")}
                className="mt-4 px-6 py-2.5 rounded-xl text-sm font-black text-white"
                style={{
                  background: "linear-gradient(135deg,#15803d,#16a34a)",
                }}
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  wishlisted={isWishlisted(p.id)}
                  onWishlist={(id) => {
                    const product = products.find((p) => p.id === id);
                    if (!product) return;
                    if (isWishlisted(id)) removeFromWishlist(id);
                    else addToWishlist(product);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default GroceriesPage;
