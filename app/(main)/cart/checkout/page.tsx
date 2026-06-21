"use client";
import { useState, useEffect, useContext, useRef, useMemo } from "react";
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
  FiShoppingBag,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { MdStorefront } from "react-icons/md";
import { useCart } from "@/context/CartContext";
import { AuthContext } from "@/context/AuthContext";
import ApiService from "@/services/apiService";
import Footer from "@/components/layout/Footer";

const fmt = (n: number) => `₦${n.toLocaleString()}`;

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
export interface DeliveryInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  notes?: string;
}

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

interface PickupStation {
  id: string;
  name: string;
  landmark?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  operating_hours?: string | null;
  is_active: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function formatEstimatedDays(opt: DeliveryOption) {
  const min = opt.estimated_days_min || 2;
  const max = opt.estimated_days_max || 5;
  return min === max
    ? `${min} business day${min > 1 ? "s" : ""}`
    : `${min} – ${max} business days`;
}

function isPickupOption(opt: DeliveryOption) {
  const t = (opt.delivery_type || "").toLowerCase();
  return (
    t.includes("pickup") || t.includes("store") || t.includes("collection")
  );
}

function unwrapEnvelope(res: any): any {
  return res?.data ?? res;
}

function extractPaystackAccessCode(paymentUrl: string): string {
  const match = paymentUrl.match(/checkout\.paystack\.com\/([a-zA-Z0-9]+)/);
  return match?.[1] ?? "";
}

// ── Determine whether a /payments/verify response actually represents a
//    *confirmed* successful payment. We never trust Paystack's inline-modal
//    "callback" firing on its own — that only means the iframe closed in a
//    way the SDK considers success. The backend's verify response is the
//    only source of truth for whether the payment was real and recorded.
//
//    This deliberately checks several possible response shapes because the
//    backend's exact schema for this endpoint isn't pinned down yet (see the
//    404 issue currently being fixed server-side) — once that's resolved,
//    this can be tightened to the single real shape it returns.
function isPaymentVerifiedSuccessful(verifyRes: any): boolean {
  if (!verifyRes) return false;
  const payload = unwrapEnvelope(verifyRes);

  // Explicit top-level status field, e.g. { status: "success" }
  if (typeof verifyRes?.status === "string") {
    if (verifyRes.status.toLowerCase() === "failure") return false;
  }

  // Common shapes for "this payment is confirmed paid":
  //   { data: { payment_status: "paid" } }
  //   { data: { status: "success" } }
  //   { data: { paid: true } }
  //   { data: { verified: true } }
  const paymentStatus = (payload?.payment_status ?? payload?.status ?? "")
    .toString()
    .toLowerCase();

  if (paymentStatus === "paid" || paymentStatus === "success" || paymentStatus === "successful") {
    return true;
  }
  if (payload?.paid === true || payload?.verified === true) {
    return true;
  }

  return false;
}

// ─────────────────────────────────────────────────────────────
// SUCCESS MODAL
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
    const t = setTimeout(() => {
      const duration = 2500;
      const end = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 1000001,
      };
      const rand = (min: number, max: number) =>
        Math.random() * (max - min) + min;
      const iv = setInterval(() => {
        const left = end - Date.now();
        if (left <= 0) return clearInterval(iv);
        const pc = 50 * (left / duration);
        confetti({
          ...defaults,
          particleCount: pc,
          origin: { x: rand(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount: pc,
          origin: { x: rand(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
      return () => clearInterval(iv);
    }, 100);
    return () => clearTimeout(t);
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
          animation: "successSlideUp 0.5s cubic-bezier(0.34,1.2,0.64,1) both",
          zIndex: 1000000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            paddingTop: "2rem",
            paddingBottom: "1.5rem",
            textAlign: "center",
            background: "linear-gradient(135deg,#22C55E,#16A34A)",
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
                "successScaleIn 0.5s cubic-bezier(0.34,1.2,0.64,1) 0.2s both",
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
                Total Paid
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
            }}
          >
            <FiShoppingBag size={16} /> View My Orders
          </button>
        </div>
        <div
          style={{
            height: "4px",
            width: "100%",
            background: "linear-gradient(90deg,#22C55E,#16A34A,#22C55E)",
          }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STEP BAR
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
// PICKUP STATION PICKER
// ─────────────────────────────────────────────────────────────
function PickupStationPicker({
  stations,
  loading,
  error,
  selectedId,
  onSelect,
}: {
  stations: PickupStation[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (station: PickupStation) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return stations;
    const q = query.toLowerCase();
    return stations.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.landmark?.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q),
    );
  }, [stations, query]);

  return (
    <div
      className="mt-4 rounded-2xl border-2 border-dashed border-[#B42225]/30 bg-[#B42225]/2 p-4"
      style={{ animation: "fadeUp 0.3s ease both" }}
    >
      <p className="text-xs font-black uppercase tracking-widest text-[#B42225] mb-3 flex items-center gap-1.5">
        <MdStorefront size={14} /> Select Your Pickup Station
      </p>

      {stations.length > 3 && (
        <div className="relative mb-3">
          <FiSearch
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name or landmark…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#B42225] focus:ring-2 focus:ring-[#B42225]/15 transition"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX size={13} />
            </button>
          )}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8 gap-2 text-sm text-gray-500">
          <FiLoader size={18} className="animate-spin text-[#B42225]" />
          Loading pickup stations…
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-2 px-3 py-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
          <FiAlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && stations.length === 0 && (
        <div className="text-center py-6 text-gray-400">
          <MdStorefront size={28} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">
            No pickup stations found for your school.
          </p>
          <p className="text-xs mt-1">
            Please choose a doorstep delivery option instead.
          </p>
        </div>
      )}

      {!loading && !error && stations.length > 0 && filtered.length === 0 && (
        <div className="text-center py-4 text-gray-400 text-sm">
          No stations match &quot;{query}&quot;
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filtered.map((station) => {
            const selected = selectedId === station.id;
            return (
              <button
                key={station.id}
                type="button"
                onClick={() => onSelect(station)}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${
                  selected
                    ? "border-[#B42225] bg-white shadow-sm"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    selected
                      ? "bg-[#B42225] text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <MdStorefront size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold leading-snug ${selected ? "text-[#B42225]" : "text-gray-800"}`}
                  >
                    {station.name}
                  </p>
                  {station.landmark && (
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <FiMapPin size={10} className="shrink-0" />
                      {station.landmark}
                    </p>
                  )}
                  {station.address && !station.landmark && (
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <FiMapPin size={10} className="shrink-0" />
                      {station.address}
                    </p>
                  )}
                  {station.operating_hours && (
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <FiClock size={10} className="shrink-0" />
                      {station.operating_hours}
                    </p>
                  )}
                </div>
                {selected && (
                  <div className="w-5 h-5 rounded-full bg-[#B42225] flex items-center justify-center shrink-0 mt-0.5">
                    <FiCheck size={11} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
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
  pickupStations,
  pickupStationsLoading,
  pickupStationsError,
  selectedStation,
  onStationSelect,
  onNext,
}: {
  info: DeliveryInfo;
  setInfo: (v: DeliveryInfo) => void;
  selectedDeliveryId: string | null;
  setSelectedDeliveryId: (v: string) => void;
  deliveryOptions: DeliveryOption[];
  deliveryLoading: boolean;
  deliveryError: string | null;
  pickupStations: PickupStation[];
  pickupStationsLoading: boolean;
  pickupStationsError: string | null;
  selectedStation: PickupStation | null;
  onStationSelect: (station: PickupStation) => void;
  onNext: () => void;
}) {
  const { user } = useContext(AuthContext);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const hasPrefilledRef = useRef(false);
  const selectedDeliveryOption =
    deliveryOptions.find((o) => o.id === selectedDeliveryId) ?? null;
  const isPickup =
    !!selectedDeliveryOption && isPickupOption(selectedDeliveryOption);

  useEffect(() => {
    if (user && !hasPrefilledRef.current) {
      hasPrefilledRef.current = true;
      setInfo({
        fullName:
          user.full_name ||
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
    }
  }, [user, setInfo]);

  const set =
    (k: keyof DeliveryInfo) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInfo({ ...info, [k]: e.target.value });
      setErrors((prev) => ({ ...prev, [k]: "" }));
    };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!info.fullName?.trim()) e.fullName = "Full name is required";
    if (!info.phone?.trim()) e.phone = "Phone number is required";
    if (!info.email?.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email.trim()))
      e.email = "Please enter a valid email address";
    if (!selectedDeliveryId) e.delivery = "Please select a delivery method";

    if (isPickup) {
      if (!selectedStation) e.station = "Please select a pickup station";
    } else {
      if (!info.address?.trim()) e.address = "Address is required";
      if (!info.city?.trim()) e.city = "City is required";
      if (!info.state?.trim()) e.state = "State is required";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const Field = (
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
            <FiUser size={16} className="text-[#B42225]" />
          </div>
          Contact Details
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            {Field(
              "Full Name",
              "fullName",
              "Your full name",
              <FiUser size={15} />,
            )}
          </div>
          {Field(
            "Phone Number",
            "phone",
            "08012345678",
            <FiPhone size={15} />,
            "tel",
          )}
          {Field(
            "Email Address",
            "email",
            "your@email.com",
            <FiMail size={15} />,
            "email",
          )}
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
          <div className="flex items-center justify-center py-8 gap-2 text-sm text-gray-500">
            <FiLoader size={22} className="animate-spin text-[#B42225]" />{" "}
            Loading delivery options…
          </div>
        )}

        {deliveryError && !deliveryLoading && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-3 rounded-xl text-sm">
            <FiAlertCircle size={16} />
            <span>{deliveryError}</span>
          </div>
        )}

        {!deliveryLoading && deliveryOptions.length === 0 && !deliveryError && (
          <div className="text-center py-8 text-gray-400">
            <FiTruck size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No delivery options available.</p>
          </div>
        )}

        {!deliveryLoading &&
          deliveryOptions.map((opt) => {
            const selected = selectedDeliveryId === opt.id;
            const pickup = isPickupOption(opt);
            return (
              <div key={opt.id}>
                <div
                  onClick={() => {
                    setSelectedDeliveryId(opt.id);
                    setErrors((prev) => ({
                      ...prev,
                      delivery: "",
                      station: "",
                    }));
                  }}
                  className={`flex gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 mb-3 ${
                    selected
                      ? "border-[#B42225] bg-[#B42225]/3"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      selected
                        ? "bg-[#B42225] text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {pickup ? (
                      <MdStorefront size={20} />
                    ) : (
                      <FiTruck size={20} />
                    )}
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
                      {opt.delivery_description ||
                        (pickup
                          ? "Collect from a campus hub"
                          : "Delivery to your doorstep")}
                    </p>
                    {opt.carrier_name && (
                      <p className="text-xs text-gray-400 mt-1">
                        📦 {opt.carrier_name}
                      </p>
                    )}
                  </div>
                  {selected && (
                    <div className="shrink-0 w-5 h-5 rounded-full bg-[#B42225] flex items-center justify-center self-start mt-0.5">
                      <FiCheck size={11} className="text-white" />
                    </div>
                  )}
                </div>

                {selected && pickup && (
                  <PickupStationPicker
                    stations={pickupStations}
                    loading={pickupStationsLoading}
                    error={pickupStationsError}
                    selectedId={selectedStation?.id ?? null}
                    onSelect={(s) => {
                      onStationSelect(s);
                      setErrors((prev) => ({ ...prev, station: "" }));
                    }}
                  />
                )}
                {selected && pickup && errors.station && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1">
                    {errors.station}
                  </p>
                )}
              </div>
            );
          })}
        {errors.delivery && (
          <p className="text-xs text-red-500 mt-1 ml-1">{errors.delivery}</p>
        )}
      </div>

      {!isPickup && (
        <div
          className="bg-white rounded-3xl p-6 md:p-8 mb-6"
          style={{
            boxShadow: "0 4px 30px rgba(0,0,0,0.06)",
            animation: "fadeUp 0.3s ease both",
          }}
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
              {Field(
                "Street Address",
                "address",
                "House number, street name…",
                <FiMapPin size={15} />,
              )}
            </div>
            {Field("City", "city", "e.g. Owerri", <FiMapPin size={15} />)}
            {Field("State", "state", "e.g. Imo", <FiMapPin size={15} />)}
            {Field("Country", "country", "Nigeria", <FiMapPin size={15} />)}
          </div>
          <div className="mt-4">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">
              Delivery Notes (optional)
            </label>
            <textarea
              value={info.notes || ""}
              onChange={(e) => setInfo({ ...info, notes: e.target.value })}
              placeholder="Special delivery instructions…"
              rows={2}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:border-[#B42225] focus:ring-2 focus:ring-[#B42225]/15 transition resize-none placeholder-gray-400"
            />
          </div>
        </div>
      )}

      {isPickup && selectedStation && (
        <div
          className="flex items-center gap-3 p-4 mb-6 bg-green-50 border border-green-200 rounded-2xl"
          style={{ animation: "fadeUp 0.3s ease both" }}
        >
          <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
            <FiCheck size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-green-800">
              Pickup station selected
            </p>
            <p className="text-xs text-green-600 truncate">
              {selectedStation.name}
              {selectedStation.landmark ? ` — ${selectedStation.landmark}` : ""}
            </p>
          </div>
          <button
            onClick={() =>
              onStationSelect({ ...selectedStation, id: "" } as any)
            }
            className="shrink-0 text-green-400 hover:text-red-500 transition p-1"
            title="Change station"
          >
            <FiX size={15} />
          </button>
        </div>
      )}

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
        {deliveryLoading ? "Loading…" : "Review Order"}
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
  selectedStation,
  subtotal,
  total,
  onBack,
  onPay,
  paying,
}: {
  info: DeliveryInfo;
  selectedDelivery: DeliveryOption;
  selectedStation: PickupStation | null;
  subtotal: number;
  total: number;
  onBack: () => void;
  onPay: () => void;
  paying: boolean;
}) {
  const { items } = useCart();
  const pickup = isPickupOption(selectedDelivery);

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
            <div key={item.product_id} className="flex items-center gap-3 py-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                <Image
                  src={item.image_url}
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
                {fmt(item.subtotal)}
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

        <div className="bg-gray-50 rounded-2xl p-4 mb-4 text-sm">
          <p className="font-bold text-gray-700 mb-1 flex items-center gap-1.5">
            <FiUser size={13} className="text-[#B42225]" /> Contact
          </p>
          <p className="text-gray-600">
            {info.fullName} · {info.phone}
          </p>
          <p className="text-gray-500">{info.email}</p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 mb-4 text-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
            {pickup ? (
              <MdStorefront size={20} className="text-gray-500" />
            ) : (
              <FiTruck size={18} className="text-gray-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-700">
              {selectedDelivery.delivery_type}
            </p>
            {pickup && selectedStation ? (
              <>
                <p className="text-gray-600 mt-0.5">{selectedStation.name}</p>
                {selectedStation.landmark && (
                  <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                    <FiMapPin size={10} /> {selectedStation.landmark}
                  </p>
                )}
                {selectedStation.operating_hours && (
                  <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                    <FiClock size={10} /> {selectedStation.operating_hours}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-xs mt-0.5">
                {info.address}, {info.city}, {info.state}
              </p>
            )}
            <p className="text-xs text-[#B42225] font-semibold mt-1">
              ⏱ {formatEstimatedDays(selectedDelivery)} ·{" "}
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
          disabled={paying}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-gray-600 border-2 border-gray-200 hover:border-gray-300 transition-all disabled:opacity-50"
        >
          <FiArrowLeft size={15} /> Back
        </button>
        <button
          onClick={onPay}
          disabled={paying}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-white text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg,#B42225,#FF8C00)",
            boxShadow: "0 8px 30px rgba(180,34,37,0.35)",
          }}
        >
          {paying ? (
            <>
              <FiLoader size={16} className="animate-spin" /> Processing…
            </>
          ) : (
            <>
              <FiCreditCard size={16} /> Pay {fmt(total)} with Paystack
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN CHECKOUT PAGE
// ─────────────────────────────────────────────────────────────
export default function Checkout() {
  const {
    items,
    subtotal,
    refetchCart,
    itemCount,
    loading: cartLoading,
  } = useCart();
  const { user, loading: authLoading } = useContext(AuthContext) as any;
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [paying, setPaying] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState("");
  const [successTotal, setSuccessTotal] = useState(0);
  const [paymentDone, setPaymentDone] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [validatingCart, setValidatingCart] = useState(false);
  // True while we're waiting on the backend to confirm a payment that the
  // Paystack iframe already reported as "done" on its end. Distinct from
  // `paying`, which covers the whole pay flow including order creation —
  // this one specifically covers the verification window so the UI can
  // show "Confirming your payment…" instead of silently doing nothing
  // after the Paystack modal closes.
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  const paymentDoneRef = useRef(false);
  const prevDeliveryIdRef = useRef<string | null>(null);
  const authCheckDoneRef = useRef(false);
  const cartRedirectDoneRef = useRef(false);

  const goToStep = (n: number) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

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
  const [deliveryLoading, setDeliveryLoading] = useState(true);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  const [pickupStations, setPickupStations] = useState<PickupStation[]>([]);
  const [pickupStationsLoading, setPickupStationsLoading] = useState(false);
  const [pickupStationsError, setPickupStationsError] = useState<string | null>(
    null,
  );
  const [selectedStation, setSelectedStation] = useState<PickupStation | null>(
    null,
  );

  const selectedDelivery =
    deliveryOptions.find((d) => d.id === selectedDeliveryId) ?? null;
  const deliveryCost = selectedDelivery?.is_free_delivery
    ? 0
    : (selectedDelivery?.delivery_cost ?? 0);
  const total = subtotal + deliveryCost;
  const currentlyPickup =
    !!selectedDelivery && isPickupOption(selectedDelivery);

  // ── Load Paystack script ────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ((window as any).PaystackPop) {
      setTimeout(() => setPaystackLoaded(true), 0);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      setTimeout(() => setPaystackLoaded(true), 0);
    };
    script.onerror = () => {
      console.error("Failed to load Paystack script");
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (authCheckDoneRef.current) return;

    if (authLoading === undefined) {
      const t = setTimeout(() => {
        if (!authCheckDoneRef.current) {
          authCheckDoneRef.current = true;
          setCheckingAuth(false);
        }
      }, 2000);
      return () => clearTimeout(t);
    }
    if (!authLoading && !authCheckDoneRef.current) {
      authCheckDoneRef.current = true;
      setCheckingAuth(false);
    }
  }, [authLoading]);

  // ── Check cart and redirect if empty ───────────────────────────────────────
  useEffect(() => {
    if (checkingAuth || paymentDone || cartRedirectDoneRef.current) return;
    if (!user) return;
    if (cartLoading) return;

    if (items.length === 0) {
      cartRedirectDoneRef.current = true;
      setTimeout(() => {
        setCheckoutError("Your cart is empty. Redirecting you to shop...");
      }, 0);
      setTimeout(() => {
        router.push("/shop");
      }, 2000);
    }
  }, [items.length, cartLoading, checkingAuth, paymentDone, user, router]);

  // ── Redirect unauthenticated users ─────────────────────────────────────────
  useEffect(() => {
    if (checkingAuth || paymentDone) return;
    if (!user) {
      sessionStorage.setItem("redirectAfterLogin", "/cart/checkout");
      router.replace("/login");
      return;
    }
  }, [user, router, checkingAuth, paymentDone]);

  // ── Fetch delivery options ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user || items.length === 0) return;
    const fetch = async () => {
      setDeliveryLoading(true);
      setDeliveryError(null);
      try {
        const totalWeight = items.reduce(
          (acc, item) => acc + ((item as any).weight || 1) * item.quantity,
          0,
        );
        const res = await ApiService.getAvailableDeliveryOptions(
          subtotal,
          totalWeight,
        );
        const opts: DeliveryOption[] =
          res?.data?.delivery_options ??
          res?.delivery_options ??
          (Array.isArray(res?.data) ? res.data : null) ??
          (Array.isArray(res) ? res : []);
        const available = opts.filter((o) => o.is_available);
        if (!available.length) {
          setDeliveryError("No delivery options available for your location.");
        } else {
          setDeliveryOptions(available);
          if (!selectedDeliveryId) setSelectedDeliveryId(available[0].id);
        }
      } catch (err: any) {
        setDeliveryError(err?.message ?? "Failed to load delivery options");
      } finally {
        setDeliveryLoading(false);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, subtotal, user]);

  // ── Fetch pickup stations ───────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedDelivery || !isPickupOption(selectedDelivery)) {
      return;
    }

    const schoolId = user?.school_id || user?.schoolId;
    if (!schoolId) {
      setTimeout(() => {
        setPickupStationsError(
          "No school linked to your account. Please update your profile to select a pickup station.",
        );
      }, 0);
      return;
    }

    const fetch = async () => {
      setPickupStationsLoading(true);
      setPickupStationsError(null);
      try {
        const res = await ApiService.getSchoolPickupStations(schoolId, {
          per_page: 100,
        });
        const stations: PickupStation[] =
          res?.data?.items ??
          res?.data?.stations ??
          (Array.isArray(res?.data) ? res.data : null) ??
          res?.items ??
          (Array.isArray(res) ? res : []);
        setPickupStations(stations.filter((s) => s.is_active !== false));
      } catch (err: any) {
        setTimeout(() => {
          setPickupStationsError(
            err?.message ?? "Failed to load pickup stations",
          );
        }, 0);
      } finally {
        setPickupStationsLoading(false);
      }
    };

    fetch();
  }, [selectedDelivery, user]);

  useEffect(() => {
    if (prevDeliveryIdRef.current !== selectedDeliveryId) {
      setSelectedStation(null);
      setPickupStations([]);
      setPickupStationsError(null);
      prevDeliveryIdRef.current = selectedDeliveryId;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeliveryId]);

  const handleStationSelect = (station: PickupStation) => {
    setSelectedStation(station.id ? station : null);
  };

  // ── handlePay ───────────────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!items || items.length === 0) {
      setCheckoutError("Your cart is empty. Please add items before checkout.");
      setTimeout(() => router.push("/shop"), 2000);
      return;
    }

    if (!selectedDelivery) {
      setCheckoutError("Please select a delivery method");
      return;
    }

    // ── Resolve the Paystack public key early so we surface a clear error ──
    // NEXT_PUBLIC_ vars are inlined at build time. If the key is missing in
    // the deployment environment the build output will literally contain the
    // string "undefined", so we check for that explicitly.
    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey || paystackKey === "undefined" || paystackKey.trim() === "") {
      setCheckoutError(
        "Payment is not configured. Please contact support. (Missing NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY)",
      );
      console.error(
        "[Checkout] NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not set. " +
        "Add it to your deployment environment variables and redeploy.",
      );
      return;
    }

    if (!paystackLoaded) {
      setCheckoutError(
        "Payment system is still loading. Please wait a moment and try again.",
      );
      return;
    }

    // ── Validate email before doing anything else ───────────────────────────
    const resolvedEmail = info.email?.trim().toLowerCase();
    if (!resolvedEmail) {
      setCheckoutError(
        "An email address is required to process payment. Please go back and fill in your email.",
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resolvedEmail)) {
      setCheckoutError(
        "The email address you entered is invalid. Please go back and correct it.",
      );
      return;
    }

    setPaying(true);
    setCheckoutError(null);
    setValidatingCart(true);

    try {
      // ── Validate cart ─────────────────────────────────────────────────────
      let validationResult;
      try {
        validationResult = await ApiService.validateCart();
      } catch (validateErr: any) {
        console.error("Cart validation error:", validateErr);
        await refetchCart();
        throw new Error(
          "Unable to validate cart. Please refresh and try again.",
        );
      }

      const validationData = unwrapEnvelope(validationResult);
      const backendItems = validationData?.items ?? [];

      if (backendItems.length === 0) {
        await refetchCart();
        throw new Error(
          "Cart session expired. Please refresh the page and try again.",
        );
      }

      if (validationData?.valid === false) {
        const errors = validationData?.errors ?? [];
        const errorMsg =
          errors.length > 0
            ? errors.join(", ")
            : "Your cart has issues. Please review your items.";
        throw new Error(errorMsg);
      }

      setValidatingCart(false);

      // ── Resolve delivery destination fields ───────────────────────────────
      let deliveryStreetAddress: string;
      let deliveryCity: string;
      let deliveryState: string;
      let deliveryNotes: string | undefined;

      if (currentlyPickup && selectedStation) {
        deliveryStreetAddress =
          selectedStation.address ||
          selectedStation.landmark ||
          selectedStation.name;
        deliveryCity =
          selectedStation.city || user?.city || info.city || "Campus";
        deliveryState =
          selectedStation.state || user?.state || info.state || "";
        deliveryNotes = `Campus Pickup — ${selectedStation.name}${selectedStation.landmark ? ` (${selectedStation.landmark})` : ""}`;
      } else {
        if (!info.address?.trim()) throw new Error("Delivery address is required");
        if (!info.city?.trim()) throw new Error("City is required");
        if (!info.state?.trim()) throw new Error("State is required");
        deliveryStreetAddress = info.address;
        deliveryCity = info.city;
        deliveryState = info.state;
        deliveryNotes = info.notes || undefined;
      }

      // ── Create the order ──────────────────────────────────────────────────
      const checkoutRes = await ApiService.checkout({
        delivery_street_address: deliveryStreetAddress,
        delivery_city: deliveryCity,
        delivery_state: deliveryState,
        delivery_country: info.country || "Nigeria",
        delivery_option_id: selectedDelivery.id,
        delivery_notes: deliveryNotes,
        // Always send email — the backend passes it to Paystack when creating
        // the payment link; without it Paystack rejects the transaction.
        email: resolvedEmail,
        full_name: info.fullName,
        phone: info.phone,
      });

      const order = unwrapEnvelope(checkoutRes);
      const { order_id, total_amount, payment_url } = order;

      if (!order_id) throw new Error("Order was not created. Please try again.");
      if (!payment_url) throw new Error("No payment URL returned. Please try again.");

      const accessCode = extractPaystackAccessCode(payment_url);

      if (!accessCode) {
        // Could not parse access code from the URL — fall back to redirect.
        window.location.href = payment_url;
        return;
      }

      const PaystackPop = (window as any).PaystackPop;
      if (!PaystackPop || typeof PaystackPop.setup !== "function") {
        // SDK not ready — fall back to redirect.
        window.location.href = payment_url;
        return;
      }

      // ── Open Paystack inline modal ────────────────────────────────────────
      // Paystack's setup() is synchronous and validates its params eagerly.
      // We must pass `email` and `amount` alongside `access_code`; without
      // them the SDK throws "Please enter a valid email address" even though
      // the access_code already embeds these values server-side.
      // `amount` is in kobo (1 NGN = 100 kobo).
      const onPaymentSuccess = (response: { reference: string }) => {
        // Plain wrapper so typeof callback === "function" (not AsyncFunction),
        // satisfying Paystack's internal validator.
        (async () => {
          // IMPORTANT: Paystack's inline SDK firing this callback only means
          // the *iframe* considers the transaction complete on its end. It is
          // NOT proof that our backend has recorded the payment. We always
          // gate the success UI behind an explicit, checked response from
          // our own /payments/verify endpoint — never on the callback firing
          // alone. Previously this call's result was discarded, which let
          // the success modal show even when verification failed (e.g. a
          // 404 because the backend didn't recognise the reference).
          setVerifyingPayment(true);
          try {
            const verifyRes = await ApiService.verifyPayment(response.reference);

            if (!isPaymentVerifiedSuccessful(verifyRes)) {
              throw new Error(
                "We received your payment but could not confirm it yet. " +
                "Please check your orders page in a moment — if it still " +
                "shows as pending, contact support with your order ID.",
              );
            }

            await refetchCart();
            setVerifyingPayment(false);
            setPaying(false);
            setSuccessOrderId(order_id);
            setSuccessTotal(total_amount ?? total);
            setShowSuccess(true);
            setPaymentDone(true);
            paymentDoneRef.current = true;
          } catch (verifyErr: any) {
            console.error("Payment verification error:", verifyErr);
            setVerifyingPayment(false);
            setPaying(false);
            await refetchCart();
            // Verification failure client-side ≠ payment failure.
            // We don't know for certain whether the backend will eventually
            // reconcile this (e.g. via a delayed webhook), so we never claim
            // success here — we send the user to their orders page where the
            // real, authoritative status is shown instead of an artificial
            // confirmation message.
            setCheckoutError(
              verifyErr?.message ??
                "We couldn't confirm your payment yet. Redirecting you to your orders — please check the status there.",
            );
            setTimeout(() => {
              router.push(`/orders?ref=${order_id}`);
            }, 1500);
          }
        })();
      };

      const onPaymentClose = () => {
        setPaying(false);
        router.push(`/orders?ref=${order_id}`);
      };

      const handler = PaystackPop.setup({
        key: paystackKey,
        access_code: accessCode,
        // email and amount are required by the Paystack JS SDK even when
        // access_code is provided. Without email the modal shows the
        // "Please enter a valid email address" error before the iframe loads.
        email: resolvedEmail,
        amount: Math.round((total_amount ?? total) * 100), // convert NGN → kobo
        currency: "NGN",
        callback: onPaymentSuccess,
        onClose: onPaymentClose,
      });

      handler.openIframe();
    } catch (err: any) {
      setPaying(false);
      setValidatingCart(false);

      let errorMsg = err?.message ?? "Checkout failed. Please try again.";

      if (err?.response?.data?.detail?.message) {
        errorMsg = err.response.data.detail.message;
      } else if (err?.detail?.message) {
        errorMsg = err.detail.message;
      } else if (
        err?.message?.includes("401") ||
        err?.message?.includes("Authentication")
      ) {
        errorMsg = "Please log in again to complete your purchase.";
        setTimeout(() => router.push("/login?redirect=/cart/checkout"), 2000);
      } else if (errorMsg.toLowerCase().includes("empty")) {
        errorMsg = "Your cart is empty. Redirecting you to shop...";
        setTimeout(() => router.push("/shop"), 2000);
      }

      setCheckoutError(errorMsg);
      console.error("Checkout error details:", err);
    }
  };

  const handleContinueShopping = () => {
    setShowSuccess(false);
    setPaymentDone(false);
    paymentDoneRef.current = false;
    router.push(`/orders?ref=${successOrderId}`);
  };

  if (checkingAuth || authLoading || (cartLoading && !paymentDone)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#B42225] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!user || (itemCount === 0 && !paymentDone)) return null;

  return (
    <>
      <style>{`
        @keyframes slideIn        { from{opacity:0;transform:translateX(20px)}           to{opacity:1;transform:translateX(0)} }
        @keyframes fadeUp         { from{opacity:0;transform:translateY(12px)}           to{opacity:1;transform:translateY(0)} }
        @keyframes successSlideUp { from{opacity:0;transform:translateY(30px) scale(.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes successScaleIn { from{opacity:0;transform:scale(0)}                  to{opacity:1;transform:scale(1)} }
      `}</style>

      {showSuccess && (
        <PaymentSuccessModal
          orderId={successOrderId}
          total={successTotal}
          onContinue={handleContinueShopping}
        />
      )}

      {verifyingPayment && !showSuccess && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 999998,
          }}
        >
          <div className="bg-white rounded-3xl p-8 text-center max-w-xs w-full">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#B42225] rounded-full animate-spin mx-auto mb-4" />
            <p className="font-black text-gray-900 mb-1">Confirming your payment…</p>
            <p className="text-xs text-gray-400">
              Please don't close this window.
            </p>
          </div>
        </div>
      )}

      <div className="min-h-screen" style={{ background: "#F7F8FC" }}>
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

        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
          <StepBar current={step} />

          {validatingCart && (
            <div
              className="flex items-center gap-2 p-4 mb-6 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-600"
              style={{ animation: "fadeUp 0.3s ease both" }}
            >
              <FiLoader size={16} className="animate-spin shrink-0" />
              <span>Validating your cart...</span>
            </div>
          )}

          {checkoutError && (
            <div
              className="flex items-center gap-2 p-4 mb-6 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600"
              style={{ animation: "fadeUp 0.3s ease both" }}
            >
              <FiAlertCircle size={16} className="shrink-0" />
              <span>{checkoutError}</span>
            </div>
          )}

          {step === 1 && (
            <StepDelivery
              info={info}
              setInfo={setInfo}
              selectedDeliveryId={selectedDeliveryId}
              setSelectedDeliveryId={setSelectedDeliveryId}
              deliveryOptions={deliveryOptions}
              deliveryLoading={deliveryLoading}
              deliveryError={deliveryError}
              pickupStations={pickupStations}
              pickupStationsLoading={pickupStationsLoading}
              pickupStationsError={pickupStationsError}
              selectedStation={selectedStation}
              onStationSelect={handleStationSelect}
              onNext={() => goToStep(2)}
            />
          )}

          {step === 2 && selectedDelivery && (
            <StepReview
              info={info}
              selectedDelivery={selectedDelivery}
              selectedStation={selectedStation}
              subtotal={subtotal}
              total={total}
              onBack={() => goToStep(1)}
              onPay={handlePay}
              paying={paying}
            />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}