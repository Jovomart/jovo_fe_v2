"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import {
  FiShoppingCart,
  FiTrash2,
  FiChevronRight,
  FiCheck,
  FiShoppingBag,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import Footer from "@/components/layout/Footer";

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState<number[]>([]);
  const [removingIds, setRemovingIds] = useState<number[]>([]);

  const handleAddToCart = (product: (typeof wishlist)[0]) => {
    // Pass the product ID as string and quantity
    addToCart(String(product.id), 1);
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(
      () => setAddedIds((prev) => prev.filter((id) => id !== product.id)),
      2500,
    );
  };

  const handleRemove = (id: number) => {
    setRemovingIds((prev) => [...prev, id]);
    setTimeout(() => {
      removeFromWishlist(id);
      setRemovingIds((prev) => prev.filter((r) => r !== id));
    }, 300);
  };

  // Fixed: Handle adding all to cart by passing product IDs
  const handleAddAllToCart = () => {
    wishlist.forEach((product) => {
      addToCart(String(product.id), 1);
    });
    router.push("/cart");
  };

  return (
    <>
      <div className="min-h-screen" style={{ background: "#F4F5F9" }}>
        {/* ── HERO BANNER ── */}
        <div
          className="relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #1a0a0a 0%, #2d0f0f 40%, #B42225 100%)",
          }}
        >
          {/* decorative dot grid */}
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* decorative large circle */}
          <div
            className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-10 pointer-events-none"
            style={{
              background: "radial-gradient(circle, #FF6B35, transparent 70%)",
            }}
          />
          <div
            className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full opacity-10 pointer-events-none"
            style={{
              background: "radial-gradient(circle, #FF4500, transparent 70%)",
            }}
          />

          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-white/40 mb-6">
              <Link
                href="/shop"
                className="hover:text-white/70 transition-colors"
              >
                Home
              </Link>
              <FiChevronRight size={11} />
              <span className="text-white/60">Wishlist</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <FaHeart className="text-white" size={22} />
                </div>
                <div>
                  <h1
                    className="text-3xl font-black text-white leading-tight"
                    style={{ fontFamily: "'Georgia', serif" }}
                  >
                    My Wishlist
                  </h1>
                  <p className="text-white/50 text-sm mt-0.5">
                    {wishlist.length === 0
                      ? "No saved items yet"
                      : `${wishlist.length} ${wishlist.length === 1 ? "item" : "items"} saved for later`}
                  </p>
                </div>
              </div>

              {wishlist.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={clearWishlist}
                    className="flex items-center gap-2 text-xs text-white/50 hover:text-white font-semibold px-4 py-2.5 rounded-xl transition-all"
                    style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                  >
                    <FiTrash2 size={13} />
                    Clear all
                  </button>
                  <button
                    onClick={handleAddAllToCart}
                    className="flex items-center gap-2 text-xs text-white font-bold px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <FiShoppingCart size={13} />
                    Add all to Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── EMPTY STATE ── */}
        {wishlist.length === 0 ? (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 flex flex-col items-center justify-center gap-6 text-center">
            <div className="relative">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #fff0f0, #ffe5e5)",
                  boxShadow: "0 0 0 12px rgba(180,34,37,0.06)",
                }}
              >
                <FaHeart size={44} style={{ color: "#e8a0a0" }} />
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white flex items-center justify-center"
                style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
              >
                <FiShoppingBag size={16} className="text-gray-400" />
              </div>
            </div>

            <div>
              <h2
                className="text-2xl font-black text-gray-800 mb-2"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Your wishlist is empty
              </h2>
              <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
                Tap the heart icon on any product to save it here for later.
                Your saved items will appear here.
              </p>
            </div>

            <Link
              href="/shop"
              className="mt-1 px-8 py-3.5 rounded-2xl text-white text-sm font-bold transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, #B42225, #FF4500)",
                boxShadow: "0 8px 28px rgba(180,34,37,0.35)",
              }}
            >
              <FiShoppingBag size={15} />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 pb-20">
            {/* ── STATS ROW ── */}
            <div className="grid grid-cols-3 gap-3 mb-8 max-w-sm">
              {[
                { label: "Saved Items", value: wishlist.length },
                {
                  label: "Total Value",
                  value: `₦${wishlist.reduce((s, p) => s + p.price, 0).toLocaleString()}`,
                },
                {
                  label: "You Save",
                  value: `₦${wishlist
                    .reduce(
                      (s, p) => s + ((p.oldPrice ?? p.price) - p.price),
                      0,
                    )
                    .toLocaleString()}`,
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl p-3 text-center"
                  style={{
                    background: "white",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                  }}
                >
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">
                    {label}
                  </p>
                  <p className="text-sm font-black text-gray-900 truncate">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* ── PRODUCT GRID ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {wishlist.map((product) => {
                const discount = product.oldPrice
                  ? Math.round(
                      ((product.oldPrice - product.price) / product.oldPrice) *
                        100,
                    )
                  : 0;
                const added = addedIds.includes(product.id);
                const removing = removingIds.includes(product.id);

                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-3xl overflow-hidden flex flex-col transition-all duration-300"
                    style={{
                      boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                      opacity: removing ? 0 : 1,
                      transform: removing ? "scale(0.95)" : "scale(1)",
                      transition:
                        "opacity 0.3s, transform 0.3s, box-shadow 0.3s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.boxShadow =
                        "0 12px 40px rgba(0,0,0,0.13)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.boxShadow =
                        "0 4px 24px rgba(0,0,0,0.07)")
                    }
                  >
                    {/* Image area */}
                    <div
                      className="relative overflow-hidden cursor-pointer bg-gray-50"
                      style={{ aspectRatio: "1/1" }}
                      onClick={() => router.push(`/product/${product.id}`)}
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 20vw"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      {/* Overlay on hover */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.18)" }}
                      >
                        <span
                          className="text-white text-xs font-bold px-3 py-1.5 rounded-full"
                          style={{ background: "rgba(0,0,0,0.45)" }}
                        >
                          View Product
                        </span>
                      </div>

                      {/* Discount badge */}
                      {discount > 0 && (
                        <div
                          className="absolute top-2.5 left-2.5 text-white text-[10px] font-black px-2 py-0.5 rounded-full z-10"
                          style={{
                            background:
                              "linear-gradient(135deg,#B42225,#FF4500)",
                          }}
                        >
                          -{discount}%
                        </div>
                      )}

                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(product.id);
                        }}
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white flex items-center justify-center z-10 transition-transform hover:scale-110"
                        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
                        title="Remove from wishlist"
                      >
                        <FaHeart className="text-red-500" size={13} />
                      </button>
                    </div>

                    {/* Card body */}
                    <div className="p-3 flex flex-col gap-2.5 flex-1">
                      {/* Brand badge */}
                      {(product as any).brand && (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold text-[#B42225] uppercase tracking-widest">
                            {(product as any).brand}
                          </span>
                          <MdVerified size={10} className="text-[#B42225]" />
                        </div>
                      )}

                      <p
                        className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug cursor-pointer hover:text-[#B42225] transition-colors"
                        onClick={() => router.push(`/product/${product.id}`)}
                      >
                        {product.name}
                      </p>

                      {/* Pricing */}
                      <div className="flex items-center gap-2 mt-auto">
                        <span className="text-sm font-black text-gray-900">
                          ₦{product.price.toLocaleString()}
                        </span>
                        {product.oldPrice && (
                          <span className="text-[11px] text-gray-400 line-through">
                            ₦{product.oldPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-gray-100" />

                      {/* Add to cart */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300"
                        style={{
                          background: added
                            ? "linear-gradient(135deg, #22c55e, #16a34a)"
                            : "linear-gradient(135deg, #B42225, #FF4500)",
                          color: "white",
                          boxShadow: added
                            ? "0 4px 16px rgba(34,197,94,0.35)"
                            : "0 4px 16px rgba(180,34,37,0.3)",
                          transform: added ? "scale(0.96)" : "scale(1)",
                        }}
                      >
                        {added ? (
                          <>
                            <FiCheck size={12} /> Added to Cart!
                          </>
                        ) : (
                          <>
                            <FiShoppingCart size={12} /> Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── BOTTOM CTA ── */}
            <div
              className="mt-10 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{
                background:
                  "linear-gradient(135deg, #1a0a0a 0%, #2d0f0f 50%, #B42225 100%)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <FiShoppingBag className="text-white" size={18} />
                </div>
                <div>
                  <p className="text-white font-black text-sm">
                    Ready to check out?
                  </p>
                  <p className="text-white/50 text-xs">
                    Move all your saved items to cart in one tap.
                  </p>
                </div>
              </div>
              <button
                onClick={handleAddAllToCart}
                className="shrink-0 px-6 py-3 rounded-2xl text-sm font-black transition-all hover:scale-105 active:scale-95"
                style={{
                  background: "white",
                  color: "#B42225",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                }}
              >
                Add All to Cart →
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}