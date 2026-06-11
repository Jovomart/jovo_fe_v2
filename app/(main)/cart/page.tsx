"use client";
import { useState, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FiShoppingCart,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiChevronRight,
  FiTruck,
  FiX,
  FiAlertCircle,
  FiLock,
  FiZap,
  FiArrowLeft,
  FiLoader,
} from "react-icons/fi";
import { useCart, CartItem } from "@/context/CartContext";
import { AuthContext } from "@/context/AuthContext";
import Footer from "@/components/layout/Footer";

const fmt = (n: number) => `₦${n.toLocaleString()}`;

function CartItemCard({
  item,
  index,
  onQty,
  onRemove,
  disabled,
}: {
  item: CartItem;
  index: number;
  onQty: (product_id: string, qty: number) => Promise<void>;
  onRemove: (product_id: string) => Promise<void>;
  disabled: boolean;
}) {
  const [exiting, setExiting]         = useState(false);
  const [qtyAnim, setQtyAnim]         = useState<"up" | "down" | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  const busy = disabled || localLoading;

  const handleRemove = async () => {
    setExiting(true);
    setLocalLoading(true);
    try {
      await onRemove(item.product_id);
    } catch {
      setExiting(false);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleQty = async (dir: "up" | "down") => {
    if (busy) return;
    const newQty = dir === "up" ? item.quantity + 1 : item.quantity - 1;
    if (newQty < 1) return;
    setQtyAnim(dir);
    setTimeout(() => setQtyAnim(null), 280);
    setLocalLoading(true);
    try {
      await onQty(item.product_id, newQty);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div
      className="group relative bg-white rounded-3xl overflow-hidden"
      style={{
        boxShadow: "0 2px 20px rgba(0,0,0,0.055)",
        animation: exiting
          ? "cartItemOut 0.34s cubic-bezier(.4,0,.6,1) forwards"
          : `cartItemIn 0.45s cubic-bezier(.34,1.06,.64,1) ${index * 70}ms both`,
        opacity: localLoading ? 0.6 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <div className="flex gap-4 p-4 sm:p-5">
        {/* Image */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
            <Image
              src={item.image_url || "/placeholder.png"}
              alt={item.name}
              width={112}
              height={112}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="eager"
            />
          </div>
          {!item.is_in_stock && (
            <span className="absolute -top-1.5 -left-1.5 text-[9px] font-black text-white px-1.5 py-0.5 rounded-full bg-gray-500">
              Out of stock
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug">
              {item.name}
            </h3>
            <button
              onClick={handleRemove}
              disabled={busy}
              className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-gray-300
                         hover:text-red-500 hover:bg-red-50 transition-all duration-200
                         opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:cursor-not-allowed"
            >
              {localLoading
                ? <FiLoader size={13} className="animate-spin" />
                : <FiTrash2 size={14} />}
            </button>
          </div>

          {/* Price — straight from backend, no manipulation */}
          <div className="flex items-center gap-2 mt-auto">
            <span className="text-base font-black text-gray-900">
              {fmt(item.price)}
            </span>
          </div>

          {/* Quantity controls + subtotal */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center rounded-2xl border border-gray-200 overflow-hidden bg-gray-50">
              <button
                onClick={() => handleQty("down")}
                disabled={busy}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
              >
                <FiMinus size={12} />
              </button>
              <span
                className="w-9 text-center text-sm font-black text-gray-800 select-none transition-all duration-200"
                style={{
                  transform:
                    qtyAnim === "up" ? "scale(1.35)"
                    : qtyAnim === "down" ? "scale(0.75)"
                    : "scale(1)",
                  color: qtyAnim ? "#B42225" : undefined,
                }}
              >
                {item.quantity}
              </span>
              <button
                onClick={() => handleQty("up")}
                disabled={busy || item.quantity >= item.stock_available}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-green-50 hover:text-green-600 transition-colors disabled:opacity-30"
              >
                <FiPlus size={12} />
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Total:{" "}
              <span className="text-[#B42225] font-bold">
                {fmt(item.subtotal)}
              </span>
            </p>
          </div>

          {!item.is_in_stock && (
            <p className="text-xs text-red-500 font-medium flex items-center gap-1">
              <FiAlertCircle size={11} /> Out of stock
            </p>
          )}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
        style={{ background: "linear-gradient(90deg,#B42225,#FF8C00)" }}
      />
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-4 text-center col-span-full">
      <div className="w-32 h-32 rounded-full flex items-center justify-center mb-6 bg-gradient-to-br from-red-50 to-orange-50">
        <FiShoppingCart size={52} className="text-[#B42225] opacity-60" />
      </div>
      <h2 className="text-2xl font-black text-gray-800 mb-2">Your cart is empty</h2>
      <p className="text-gray-400 text-sm max-w-xs mb-8">
        Looks like you haven't added anything yet.
      </p>
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-white text-sm bg-gradient-to-r from-[#B42225] to-[#FF8C00] hover:scale-105 transition"
      >
        <FiZap size={16} /> Shop Now
      </Link>
    </div>
  );
}

function AuthPrompt({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-8 text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <FiX size={16} />
        </button>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-r from-[#B42225] to-[#FF8C00]">
          <FiLock size={28} className="text-white" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">Sign in to continue</h3>
        <p className="text-gray-400 text-sm mb-6">
          Create an account or sign in to complete your purchase.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/login?redirect=/checkout"
            className="w-full py-3.5 rounded-2xl font-black text-white text-sm bg-gradient-to-r from-[#B42225] to-[#FF8C00]"
          >
            Sign In
          </Link>
          <Link
            href="/register?redirect=/checkout"
            className="w-full py-3.5 rounded-2xl font-black text-[#B42225] text-sm border-2 border-[#B42225] hover:bg-[#B42225] hover:text-white transition"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Cart() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    itemCount,
    loading,
    operationLoading,
    error,
  } = useCart();
  const { user } = useContext(AuthContext);

  const [showClear, setShowClear] = useState(false);
  const [showAuth, setShowAuth]   = useState(false);
  const [clearing, setClearing]   = useState(false);

  const handleClearCart = async () => {
    setClearing(true);
    await clearCart();
    setClearing(false);
    setShowClear(false);
  };

  const handleCheckout = () => {
    if (!user) { setShowAuth(true); return; }
    window.location.href = "/cart/checkout";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#B42225] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!user && itemCount === 0) return null;

  return (
    <>
      <style>{`
        @keyframes cartItemIn  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cartItemOut { to{opacity:0;transform:translateX(30px) scale(.96);max-height:0;padding:0;margin:0} }
      `}</style>

      {showAuth && <AuthPrompt onClose={() => setShowAuth(false)} />}

      <div className="min-h-screen bg-[#F7F8FC]">
        {/* Header */}
        <div className="relative overflow-hidden py-8 md:py-11 bg-gradient-to-r from-[#0d0d0d] via-[#1c0202] to-[#B42225]">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <Link href="/shop" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-4">
              <FiArrowLeft size={14} /> Continue Shopping
            </Link>
            <div className="flex items-end gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white">My Cart</h1>
                <p className="text-white/50 text-sm mt-1">
                  {itemCount > 0 ? `${itemCount} item${itemCount > 1 ? "s" : ""}` : "Your cart is empty"}
                </p>
              </div>
              {itemCount > 0 && (
                <div className="ml-auto">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold text-white bg-white/20 backdrop-blur">
                    <FiShoppingCart size={16} /> {fmt(subtotal)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4">
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">
              <FiAlertCircle size={15} /> {error}
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
          {itemCount === 0 ? (
            <EmptyCart />
          ) : (
            <div className="grid lg:grid-cols-[1fr_380px] gap-6">
              {/* Items */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black text-gray-800">Cart Items ({itemCount})</h2>
                  <button
                    onClick={() => setShowClear(true)}
                    disabled={operationLoading || clearing}
                    className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1"
                  >
                    <FiTrash2 size={12} /> Clear all
                  </button>
                </div>

                {showClear && (
                  <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-red-100">
                    <FiAlertCircle size={18} className="text-red-500 shrink-0" />
                    <p className="text-sm text-gray-700 flex-1 font-medium">
                      Remove all items from your cart?
                    </p>
                    <button
                      onClick={() => setShowClear(false)}
                      className="text-xs font-bold text-gray-500 px-3 py-1.5 rounded-xl hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearCart}
                      disabled={clearing}
                      className="text-xs font-bold text-white px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#B42225] to-[#FF6B00]"
                    >
                      {clearing ? <FiLoader size={11} className="animate-spin" /> : "Clear Cart"}
                    </button>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {items.map((item, i) => (
                    <CartItemCard
                      key={item.product_id}
                      item={item}
                      index={i}
                      onQty={updateQuantity}
                      onRemove={removeFromCart}
                      disabled={operationLoading}
                    />
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="flex flex-col gap-4 lg:sticky lg:top-24">
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                  <h3 className="text-base font-black text-gray-900 mb-5">Order Summary</h3>
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Subtotal ({itemCount} items)</span>
                      <span className="font-bold text-gray-800">{fmt(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1.5">
                        <FiTruck size={13} /> Delivery fee
                      </span>
                      <span className="text-gray-400 text-xs">Calculated at checkout</span>
                    </div>
                    <div className="border-t border-dashed border-gray-200 pt-3 flex items-center justify-between">
                      <span className="font-black text-gray-900">Estimated Total</span>
                      <span className="text-xl font-black text-[#B42225]">{fmt(subtotal)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={operationLoading || loading}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white text-sm bg-gradient-to-r from-[#B42225] to-[#FF8C00] hover:scale-105 transition disabled:opacity-50"
                  >
                    <FiLock size={15} /> Proceed to Checkout <FiChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}