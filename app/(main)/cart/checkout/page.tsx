"use client";
import { useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";
import {
  FiArrowLeft,
  FiCheck,
  FiChevronRight,
  FiTruck,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiShield,
  FiAlertCircle,
  FiLock,
  FiPackage,
  FiLoader,
  FiCreditCard,
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiHome,
  FiShoppingBag,
} from "react-icons/fi";
import { MdVerified, MdStorefront } from "react-icons/md";
import { useCart, DeliveryInfo } from "@/context/CartContext";
import { AuthContext } from "@/context/AuthContext";
import ApiService from "@/services/apiService";
import Footer from "@/components/layout/Footer";

const fmt = (n: number) => `₦${n.toLocaleString()}`;

// ─────────────────────────────────────────────────────────────
// DELIVERY OPTIONS TYPE (from API)
// ─────────────────────────────────────────────────────────────
interface DeliveryOption {
  id: string;
  delivery_type: string;
  delivery_cost: number;
  estimated_days_min: number;
  estimated_days_max: number;
  delivery_description: string;
  carrier_name: string;
  is_free_delivery: boolean;
  is_available: boolean;
}

// ─────────────────────────────────────────────────────────────
// SUCCESS MODAL WITH CONFETTI
// ─────────────────────────────────────────────────────────────
function PaymentSuccessModal({
  orderId,
  total,
  onContinue,
}: {
  orderId: string;
  total: number;
  onContinue: () => void;
}) {
  useEffect(() => {
    // Small delay to ensure DOM is painted before confetti fires
    const timeout = setTimeout(() => {
      const duration = 2500;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 1000001,
      };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: ReturnType<typeof setInterval> = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(8px)",
        zIndex: 999999,
      }}
      onClick={onContinue}
    >
      <div
        style={{
          position: "relative",
          maxWidth: "28rem",
          width: "100%",
          background: "#fff",
          borderRadius: "1.5rem",
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
          animation:
            "successSlideUp 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) both",
          zIndex: 1000000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Green header */}
        <div
          style={{
            paddingTop: "2rem",
            paddingBottom: "1.5rem",
            textAlign: "center",
            background: "linear-gradient(135deg, #22C55E, #16A34A)",
          }}
        >
          <div
            style={{
              width: "5rem",
              height: "5rem",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              animation:
                "successScaleIn 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) 0.2s both",
            }}
          >
            <FiCheckCircle size={48} color="#fff" />
          </div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 900,
              color: "#fff",
              margin: "0 0 0.25rem",
            }}
          >
            Payment Successful!
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "0.875rem",
              margin: 0,
            }}
          >
            Your order has been confirmed
          </p>
        </div>

        {/* Order info */}
        <div style={{ padding: "1.5rem" }}>
          <div
            style={{
              background: "#F9FAFB",
              borderRadius: "1rem",
              padding: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.75rem",
              }}
            >
              <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>
                Order ID
              </span>
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 900,
                  color: "#111827",
                  fontFamily: "monospace",
                }}
              >
                {orderId}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "0.75rem",
                borderTop: "1px solid #E5E7EB",
              }}
            >
              <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>
                Total Amount
              </span>
              <span
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 900,
                  color: "#B42225",
                }}
              >
                {fmt(total)}
              </span>
            </div>
          </div>

          <button
            onClick={onContinue}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.875rem",
              borderRadius: "1rem",
              fontWeight: 900,
              color: "#fff",
              fontSize: "0.875rem",
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg,#B42225,#FF8C00)",
              boxShadow: "0 8px 24px rgba(180,34,37,0.35)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLButtonElement).style.transform = "scale(1.02)")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLButtonElement).style.transform = "scale(1)")
            }
          >
            <FiShoppingBag size={16} /> Continue Shopping
          </button>
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            height: "4px",
            width: "100%",
            background: "linear-gradient(90deg, #22C55E, #16A34A, #22C55E)",
          }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STEP INDICATOR
// ─────────────────────────────────────────────────────────────
function StepBar({ current }: { current: number }) {
  const steps = ["Delivery", "Review", "Payment"];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300"
                style={
                  done
                    ? {
                        background: "linear-gradient(135deg,#22C55E,#16A34A)",
                        color: "#fff",
                      }
                    : active
                      ? {
                          background: "linear-gradient(135deg,#B42225,#FF8C00)",
                          color: "#fff",
                          boxShadow: "0 4px 16px rgba(180,34,37,0.4)",
                        }
                      : { background: "#F3F4F6", color: "#9CA3AF" }
                }
              >
                {done ? <FiCheck size={16} /> : idx}
              </div>
              <span
                className={`text-[10px] font-bold mt-1 ${active ? "text-[#B42225]" : done ? "text-green-600" : "text-gray-400"}`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="h-0.5 w-12 sm:w-20 mx-1 mb-4 rounded-full transition-all duration-500"
                style={{
                  background: done
                    ? "linear-gradient(90deg,#22C55E,#16A34A)"
                    : "#E5E7EB",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HELPER: Format delivery days
// ─────────────────────────────────────────────────────────────
function formatEstimatedDays(option: DeliveryOption) {
  const min = option.estimated_days_min || 2;
  const max = option.estimated_days_max || 5;
  if (min === max) return `${min} business day${min > 1 ? "s" : ""}`;
  return `${min} – ${max} business days`;
}

function getDeliveryIcon(option: DeliveryOption) {
  const type = (option.delivery_type || "").toLowerCase();
  if (type.includes("express") || type.includes("same day"))
    return <FiClock size={20} />;
  if (type.includes("pickup") || type.includes("store"))
    return <MdStorefront size={20} />;
  return <FiTruck size={20} />;
}

function isPickupOption(option: DeliveryOption) {
  const type = (option.delivery_type || "").toLowerCase();
  return (
    type.includes("pickup") ||
    type.includes("store") ||
    type.includes("collection")
  );
}

// ─────────────────────────────────────────────────────────────
// STEP 1 — DELIVERY DETAILS
// ─────────────────────────────────────────────────────────────
function StepDelivery({
  info,
  setInfo,
  selectedDeliveryId,
  setSelectedDeliveryId,
  deliveryOptions,
  deliveryLoading,
  deliveryError,
  onNext,
}: {
  info: DeliveryInfo;
  setInfo: (v: DeliveryInfo) => void;
  selectedDeliveryId: string | null;
  setSelectedDeliveryId: (v: string) => void;
  deliveryOptions: DeliveryOption[];
  deliveryLoading: boolean;
  deliveryError: string | null;
  onNext: () => void;
}) {
  const { user } = useContext(AuthContext);
  const [errors, setErrors] = useState<
    Partial<Record<keyof DeliveryInfo, string>>
  >({});
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (user && !isPrefilled) {
      setInfo({
        fullName:
          user.full_name ||
          user.name ||
          `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          "",
        phone: user.phone || user.phone_number || "",
        email: user.email || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        country: user.country || "Nigeria",
        notes: "",
      });
      setIsPrefilled(true); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [user, setInfo, isPrefilled]);

  const set =
    (k: keyof DeliveryInfo) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInfo({ ...info, [k]: e.target.value });
      setErrors((prev) => ({ ...prev, [k]: "" }));
    };

  const validate = () => {
    const e: Partial<Record<keyof DeliveryInfo, string>> = {};
    if (!info.fullName?.trim()) e.fullName = "Full name is required";
    if (!info.phone?.trim()) e.phone = "Phone number is required";
    if (!info.email?.trim()) e.email = "Email is required";
    if (!info.address?.trim()) e.address = "Address is required";
    if (!info.city?.trim()) e.city = "City is required";
    if (!info.state?.trim()) e.state = "State is required";
    if (!selectedDeliveryId)
      (e as any).delivery = "Please select a delivery method";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const field = (
    label: string,
    key: keyof DeliveryInfo,
    placeholder: string,
    icon: React.ReactNode,
    type = "text",
  ) => (
    <div>
      <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">
        {label}
      </label>
      <div
        className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 transition-all duration-200 ${
          errors[key]
            ? "border-red-400 bg-red-50"
            : "border-gray-200 bg-gray-50 focus-within:border-[#B42225] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#B42225]/15"
        }`}
      >
        <span className={errors[key] ? "text-red-400" : "text-gray-400"}>
          {icon}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          value={(info[key] as string) || ""}
          onChange={set(key)}
          className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
        />
      </div>
      {errors[key] && (
        <p className="text-xs text-red-500 mt-1 ml-1">{errors[key]}</p>
      )}
    </div>
  );

  return (
    <div
      style={{ animation: "slideIn 0.4s cubic-bezier(.34,1.06,.64,1) both" }}
    >
      <div
        className="bg-white rounded-3xl p-6 md:p-8 mb-6"
        style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.06)" }}
      >
        <h2
          className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"
          style={{ fontFamily: "'Georgia',serif" }}
        >
          <div className="w-8 h-8 rounded-xl bg-[#B42225]/10 flex items-center justify-center">
            <FiMapPin size={16} className="text-[#B42225]" />
          </div>
          Delivery Address
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            {field(
              "Full Name",
              "fullName",
              "Your full name",
              <FiUser size={15} />,
            )}
          </div>
          {field(
            "Phone Number",
            "phone",
            "08012345678",
            <FiPhone size={15} />,
            "tel",
          )}
          {field(
            "Email Address",
            "email",
            "your@email.com",
            <FiMail size={15} />,
            "email",
          )}
          <div className="sm:col-span-2">
            {field(
              "Street Address",
              "address",
              "House number, street name...",
              <FiMapPin size={15} />,
            )}
          </div>
          {field("City", "city", "e.g. Owerri", <FiMapPin size={15} />)}
          {field("State", "state", "e.g. Imo", <FiMapPin size={15} />)}
          {field("Country", "country", "Nigeria", <FiMapPin size={15} />)}
        </div>

        <div className="mt-4">
          <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">
            Delivery Notes (optional)
          </label>
          <textarea
            value={info.notes || ""}
            onChange={(e) => setInfo({ ...info, notes: e.target.value })}
            placeholder="Special delivery instructions..."
            rows={2}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:border-[#B42225] focus:ring-2 focus:ring-[#B42225]/15 transition resize-none placeholder-gray-400"
          />
        </div>
      </div>

      <div
        className="bg-white rounded-3xl p-6 md:p-8 mb-6"
        style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.06)" }}
      >
        <h2
          className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2"
          style={{ fontFamily: "'Georgia',serif" }}
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <FiTruck size={16} className="text-blue-500" />
          </div>
          Delivery Method
        </h2>

        {deliveryLoading && (
          <div className="flex items-center justify-center py-8">
            <FiLoader size={24} className="animate-spin text-[#B42225]" />
            <span className="ml-2 text-sm text-gray-500">
              Loading delivery options...
            </span>
          </div>
        )}

        {deliveryError && !deliveryLoading && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-3 rounded-xl text-sm">
            <FiAlertCircle size={16} />
            <span>{deliveryError}</span>
          </div>
        )}

        {!deliveryLoading && deliveryOptions.length === 0 && !deliveryError && (
          <div className="text-center py-8 text-gray-500">
            <FiTruck size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm">
              No delivery options available for your location.
            </p>
          </div>
        )}

        {!deliveryLoading &&
          deliveryOptions.length > 0 &&
          deliveryOptions.map((opt) => {
            const isSelected = selectedDeliveryId === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelectedDeliveryId(opt.id)}
                className={`flex gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 mb-3 ${
                  isSelected
                    ? "border-[#B42225] bg-[#B42225]/3"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-[#B42225] text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {getDeliveryIcon(opt)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="text-sm font-bold text-gray-800">
                      {opt.delivery_type}
                    </p>
                    <span
                      className={`text-sm font-black shrink-0 ${opt.is_free_delivery ? "text-green-600" : "text-gray-800"}`}
                    >
                      {opt.is_free_delivery ? "Free" : fmt(opt.delivery_cost)}
                    </span>
                  </div>
                  <p className="text-xs text-[#B42225] font-semibold mt-0.5">
                    ⏱ {formatEstimatedDays(opt)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {opt.delivery_description || "Delivery to your doorstep"}
                  </p>
                  {opt.carrier_name && (
                    <p className="text-xs text-gray-400 mt-1">
                      📦 {opt.carrier_name}
                    </p>
                  )}

                  {isPickupOption(opt) && isSelected && (
                    <div className="mt-3 bg-gray-50 rounded-xl p-3 space-y-1.5">
                      <p className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                        <MdStorefront size={13} className="text-[#B42225]" />
                        Pickup Location: ICT Centre, FUTO
                      </p>
                      <p className="text-xs text-gray-500 flex items-start gap-1.5">
                        <FiClock
                          size={11}
                          className="mt-0.5 shrink-0 text-gray-400"
                        />
                        Mon – Sat: 9:00 AM – 6:00 PM
                      </p>
                    </div>
                  )}
                </div>
                {isSelected && (
                  <div className="shrink-0 w-5 h-5 rounded-full bg-[#B42225] flex items-center justify-center self-start mt-0.5">
                    <FiCheck size={11} className="text-white" />
                  </div>
                )}
              </div>
            );
          })}
        {(errors as any).delivery && (
          <p className="text-xs text-red-500 mt-1 ml-1">
            {(errors as any).delivery}
          </p>
        )}
      </div>

      <button
        onClick={() => {
          if (validate()) onNext();
        }}
        disabled={deliveryLoading}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(135deg,#B42225,#FF8C00)",
          boxShadow: "0 8px 30px rgba(180,34,37,0.35)",
        }}
      >
        {deliveryLoading ? "Loading delivery options..." : "Review Order"}
        {!deliveryLoading && <FiChevronRight size={16} />}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STEP 2 — ORDER REVIEW
// ─────────────────────────────────────────────────────────────
function StepReview({
  info,
  selectedDelivery,
  subtotal,
  promoDiscount,
  promoCode,
  total,
  onBack,
  onPay,
}: {
  info: DeliveryInfo;
  selectedDelivery: DeliveryOption | null;
  subtotal: number;
  promoDiscount: number;
  promoCode: string;
  total: number;
  onBack: () => void;
  onPay: () => void;
}) {
  const { items } = useCart();

  if (!selectedDelivery) return null;

  return (
    <div
      style={{ animation: "slideIn 0.4s cubic-bezier(.34,1.06,.64,1) both" }}
    >
      <div
        className="bg-white rounded-3xl p-6 md:p-8 mb-5"
        style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.06)" }}
      >
        <h2
          className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2"
          style={{ fontFamily: "'Georgia',serif" }}
        >
          <FiPackage size={18} className="text-[#B42225]" /> Order Items
        </h2>
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 line-clamp-1">
                  {item.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Qty: {item.quantity}
                </p>
              </div>
              <span className="text-sm font-black text-gray-900 shrink-0">
                {fmt(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="bg-white rounded-3xl p-6 md:p-8 mb-5"
        style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.06)" }}
      >
        <h2
          className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2"
          style={{ fontFamily: "'Georgia',serif" }}
        >
          <FiFileText size={18} className="text-[#B42225]" /> Order Summary
        </h2>

        <div className="bg-gray-50 rounded-2xl p-4 mb-5 text-sm">
          <p className="font-bold text-gray-700 mb-1 flex items-center gap-1.5">
            <FiMapPin size={13} className="text-[#B42225]" /> Delivering to:
          </p>
          <p className="text-gray-600">
            {info.fullName} · {info.phone}
          </p>
          <p className="text-gray-500">
            {info.address}, {info.city}, {info.state}
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 mb-5 text-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            {getDeliveryIcon(selectedDelivery)}
          </div>
          <div>
            <p className="font-bold text-gray-700">
              {selectedDelivery.delivery_type}
            </p>
            <p className="text-gray-500 text-xs">
              {formatEstimatedDays(selectedDelivery)} ·{" "}
              <span
                className={
                  selectedDelivery.is_free_delivery
                    ? "text-green-600 font-bold"
                    : "text-gray-600"
                }
              >
                {selectedDelivery.is_free_delivery
                  ? "Free"
                  : fmt(selectedDelivery.delivery_cost)}
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-bold">{fmt(subtotal)}</span>
          </div>
          {promoDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Promo ({promoCode})</span>
              <span className="font-bold text-green-600">
                -{fmt(promoDiscount)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Delivery</span>
            <span className="font-bold">
              {selectedDelivery.is_free_delivery
                ? "Free"
                : fmt(selectedDelivery.delivery_cost)}
            </span>
          </div>
          <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between">
            <span className="font-black text-gray-900">Total</span>
            <span className="text-xl font-black text-[#B42225]">
              {fmt(total)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-gray-600 border-2 border-gray-200 hover:border-gray-300 transition-all"
        >
          <FiArrowLeft size={15} /> Back
        </button>
        <button
          onClick={onPay}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-white text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
          style={{
            background: "linear-gradient(135deg,#B42225,#FF8C00)",
            boxShadow: "0 8px 30px rgba(180,34,37,0.35)",
          }}
        >
          <FiCreditCard size={16} /> Pay {fmt(total)} with Paystack
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN CHECKOUT PAGE
// ─────────────────────────────────────────────────────────────
export default function Checkout() {
  const { items, subtotal, clearCart, saveOrder, itemCount } = useCart();
  const { user, isLoading: authLoading } = useContext(AuthContext) as any;
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [paying, setPaying] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [successTotal, setSuccessTotal] = useState<number>(0);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const paymentCompletedRef = useRef(false);

  // ─── FIX: goToStep scrolls to top on every step change ───────────────
  const goToStep = (n: number) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };
  // ─────────────────────────────────────────────────────────────────────

  const [info, setInfo] = useState<DeliveryInfo>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    notes: "",
  });

  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(
    null,
  );
  const [deliveryLoading, setDeliveryLoading] = useState<boolean>(true);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  const [promo, setPromo] = useState<{
    code: string;
    pct: number;
    label: string;
  } | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("jovo_promo");
      if (stored) setPromo(JSON.parse(stored)); // eslint-disable-line react-hooks/set-state-in-effect
    } catch {}
  }, []);

  useEffect(() => {
    if (authLoading === undefined) {
      const timer = setTimeout(() => setIsCheckingAuth(false), 2000);
      return () => clearTimeout(timer);
    }
    if (!authLoading) {
      setIsCheckingAuth(false); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [authLoading]);

  useEffect(() => {
    if (isCheckingAuth) return;
    if (paymentCompleted) return;
    if (!user) {
      sessionStorage.setItem("redirectAfterLogin", "/cart/checkout");
      router.replace("/login");
      return;
    }
    if (itemCount === 0) {
      router.replace("/cart");
      return;
    }
  }, [user, itemCount, router, isCheckingAuth, paymentCompleted]);

  useEffect(() => {
    const fetchDeliveryOptions = async () => {
      if (!user || items.length === 0) return;

      setDeliveryLoading(true);
      setDeliveryError(null);

      try {
        const totalWeight = items.reduce((total, item) => {
          const itemWeight = (item as any).weight || 1;
          return total + itemWeight * item.quantity;
        }, 0);

        const response = await ApiService.getAvailableDeliveryOptions(
          subtotal,
          totalWeight,
        );

        let availableOptions: DeliveryOption[] = [];

        if (
          response?.data?.delivery_options &&
          Array.isArray(response.data.delivery_options)
        ) {
          availableOptions = response.data.delivery_options;
        } else if (
          response?.delivery_options &&
          Array.isArray(response.delivery_options)
        ) {
          availableOptions = response.delivery_options;
        } else if (response?.data && Array.isArray(response.data)) {
          availableOptions = response.data;
        } else if (Array.isArray(response)) {
          availableOptions = response;
        }

        if (availableOptions.length === 0) {
          setDeliveryError(
            "No delivery options available. Please check your cart total and weight.",
          );
        } else {
          const filteredOptions = availableOptions.filter(
            (opt) => opt.is_available === true,
          );
          setDeliveryOptions(filteredOptions);
          if (!selectedDeliveryId && filteredOptions.length > 0) {
            setSelectedDeliveryId(filteredOptions[0].id);
          }
        }
      } catch (err: any) {
        console.error("❌ Failed to fetch delivery options:", err);
        setDeliveryError(
          err instanceof Error
            ? err.message
            : "Failed to load delivery options",
        );
      } finally {
        setDeliveryLoading(false);
      }
    };

    fetchDeliveryOptions();
  }, [items, subtotal, user, selectedDeliveryId]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      try {
        document.body.removeChild(script);
      } catch {}
    };
  }, []);

  if (isCheckingAuth || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#B42225] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user || (itemCount === 0 && !paymentCompleted)) return null;

  const selectedDelivery =
    deliveryOptions.find((d) => d.id === selectedDeliveryId) || null;
  const promoDiscount = promo ? subtotal * promo.pct : 0;
  const deliveryCost = selectedDelivery?.is_free_delivery
    ? 0
    : selectedDelivery?.delivery_cost || 0;
  const total = subtotal - promoDiscount + deliveryCost;

  const handlePay = () => {
    if (!selectedDelivery) {
      alert("Please select a delivery method");
      return;
    }

    setPaying(true);

    try {
      const paystackKey =
        process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
        "pk_test_f5ed3e79b7c217ef827ad52a481bec40e2485ddb";

      const handler = (window as any).PaystackPop.setup({
        key: paystackKey,
        email: user.email || info.email,
        amount: Math.round(total * 100),
        currency: "NGN",
        ref: `JOVO_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        metadata: {
          custom_fields: [
            {
              display_name: "Customer",
              variable_name: "customer",
              value: info.fullName,
            },
            {
              display_name: "Phone",
              variable_name: "phone",
              value: info.phone,
            },
          ],
        },

        onClose: () => {
          setPaying(false);
        },

        callback: (response: { reference: string }) => {
          try {
            paymentCompletedRef.current = true;

            const orderData = {
              reference: response.reference,
              items: [...items],
              subtotal: subtotal,
              deliveryCost: deliveryCost,
              total: total,
              deliveryInfo: { ...info, deliveryMethod: selectedDelivery.id },
              status: "confirmed" as const,
              paymentMethod: "Paystack",
            };

            const order = saveOrder(orderData);

            sessionStorage.removeItem("jovo_promo");
            clearCart();

            setPaying(false);

            setSuccessOrderId(order.id);
            setSuccessTotal(total);
            setShowSuccess(true);
            setPaymentCompleted(true);
            paymentCompletedRef.current = true;
          } catch (err) {
            console.error("❌ Error saving order:", err);
            paymentCompletedRef.current = false;
            alert(
              "Payment successful but order could not be saved. Please contact support.",
            );
            setPaying(false);
            router.push("/");
          }
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error("❌ Payment error:", error);
      setPaying(false);
      alert("Payment initialization failed. Please try again.");
    }
  };

  const handleContinueShopping = () => {
    setShowSuccess(false);
    setPaymentCompleted(false);
    paymentCompletedRef.current = false;
    router.push("/");
  };

  return (
    <>
      <style>{`
        @keyframes slideIn      { from{opacity:0;transform:translateX(20px)}        to{opacity:1;transform:translateX(0)} }
        @keyframes fadeUp       { from{opacity:0;transform:translateY(12px)}        to{opacity:1;transform:translateY(0)} }
        @keyframes successSlideUp { from{opacity:0;transform:translateY(30px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes successScaleIn { from{opacity:0;transform:scale(0)}              to{opacity:1;transform:scale(1)} }
      `}</style>

      {/* ─── SUCCESS MODAL ─────────────────────────────────────────────── */}
      {showSuccess && successOrderId && (
        <PaymentSuccessModal
          orderId={successOrderId}
          total={successTotal}
          onContinue={handleContinueShopping}
        />
      )}

      <div className="min-h-screen" style={{ background: "#F7F8FC" }}>
        {/* Header */}
        <div
          className="relative overflow-hidden py-8 md:py-11"
          style={{
            background:
              "linear-gradient(135deg,#0d0d0d 0%,#1c0202 45%,#B42225 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="max-w-3xl mx-auto px-4 md:px-8 relative z-10">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-4 transition-colors"
            >
              <FiArrowLeft size={14} /> Back to Cart
            </Link>
            <h1
              className="text-3xl md:text-4xl font-black text-white"
              style={{ fontFamily: "'Georgia',serif" }}
            >
              Checkout
            </h1>
            <p className="text-white/50 text-sm mt-1 flex items-center gap-1.5">
              <FiLock size={13} /> Secured checkout · {items.length} item
              {items.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
          <StepBar current={step} />

          {step === 1 && (
            <StepDelivery
              info={info}
              setInfo={setInfo}
              selectedDeliveryId={selectedDeliveryId}
              setSelectedDeliveryId={setSelectedDeliveryId}
              deliveryOptions={deliveryOptions}
              deliveryLoading={deliveryLoading}
              deliveryError={deliveryError}
              onNext={() => goToStep(2)}
            />
          )}

          {step === 2 && selectedDelivery && (
            <StepReview
              info={info}
              selectedDelivery={selectedDelivery}
              subtotal={subtotal}
              promoDiscount={promoDiscount}
              promoCode={promo?.code || ""}
              total={total}
              onBack={() => goToStep(1)}
              onPay={handlePay}
            />
          )}

          {/* Payment loading overlay */}
          {paying && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-8 text-center max-w-xs mx-4">
                <div className="w-16 h-16 rounded-full bg-[#B42225]/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <FiCreditCard size={28} className="text-[#B42225]" />
                </div>
                <p className="font-black text-gray-900 text-lg">
                  Opening payment...
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Complete payment in the Paystack window.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
