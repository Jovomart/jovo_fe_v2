"use client";
import { useState, useEffect, useContext, useCallback, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FiPackage,
  FiChevronDown,
  FiCheckCircle,
  FiTruck,
  FiClock,
  FiXCircle,
  FiShoppingBag,
  FiArrowLeft,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCalendar,
  FiCopy,
  FiCheck,
  FiAlertCircle,
  FiLoader,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";
import { AuthContext } from "@/context/AuthContext";
import ApiService from "@/services/apiService";
import Footer from "@/components/layout/Footer";

const fmt = (n: number) => `₦${n.toLocaleString()}`;

// ── Safe date formatting — never throws, never renders "Invalid Date" raw.
// Backend timestamps are not guaranteed to always be present/well-formed,
// and this keeps a bad value from blowing up the whole order card.
function safeFormatDate(
  value: string | undefined | null,
  options: Intl.DateTimeFormatOptions,
): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", options);
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed";

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image_url?: string;
}

export interface TrackingEvent {
  status: string;
  timestamp: string;
  note?: string;
  location?: string;
}

export interface Order {
  id: string;
  order_number: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  subtotal?: number;
  delivery_cost?: number;
  item_count: number;
  items?: OrderItem[];
  delivery_info?: {
    recipient_name?: string;
    recipient_phone?: string;
    recipient_email?: string;
    street_address?: string;
    city?: string;
    state?: string;
    country?: string;
    notes?: string;
  };
  payment_reference?: string;
  created_at: string;
  updated_at?: string;
}

// ─── Parse the list response — backend schema is opaque ("string") so we
//     handle every shape we've seen in the wild. ────────────────────────────
function parseOrdersResponse(res: any): Order[] {
  // unwrap common envelope shapes
  const payload = res?.data ?? res;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.orders)) return payload.orders;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;

  // some backends return { data: { orders: [...], total: N } }
  const inner = payload?.data ?? payload;
  if (Array.isArray(inner)) return inner;
  if (Array.isArray(inner?.orders)) return inner.orders;
  if (Array.isArray(inner?.results)) return inner.results;

  return [];
}

// ─── Parse a single order — same defensive unwrapping. ───────────────────
function parseOrder(res: any): Order | null {
  const payload = res?.data ?? res;
  if (!payload || typeof payload !== "object") return null;
  // sometimes the order is nested one more level
  if (payload.id) return payload as Order;
  const inner = payload?.order ?? payload?.data;
  if (inner?.id) return inner as Order;
  return null;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    bg: string;
    icon: React.ReactNode;
    step: number;
  }
> = {
  pending: {
    label: "Pending Payment",
    color: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-200",
    icon: <FiClock size={14} />,
    step: 1,
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    icon: <FiCheckCircle size={14} />,
    step: 2,
  },
  shipped: {
    label: "Shipped",
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-200",
    icon: <FiTruck size={14} />,
    step: 3,
  },
  delivered: {
    label: "Delivered",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    icon: <FiCheckCircle size={14} />,
    step: 4,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: <FiXCircle size={14} />,
    step: 0,
  },
};

const TIMELINE = ["Order Placed", "Confirmed", "Shipped", "Delivered"];

// ─────────────────────────────────────────────────────────────
// TRACKING PANEL
// ─────────────────────────────────────────────────────────────
function TrackingPanel({ orderId }: { orderId: string }) {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await ApiService.makeRequest(
          `/user/orders/${orderId}/tracking`,
          { method: "GET" },
        );
        const payload = res?.data ?? res;
        // handle various shapes: array at root, or nested under events/timeline
        const list: TrackingEvent[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.events)
            ? payload.events
            : Array.isArray(payload?.timeline)
              ? payload.timeline
              : Array.isArray(payload?.tracking)
                ? payload.tracking
                : [];
        if (!cancelled) setEvents(list);
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "Failed to load tracking");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
        <FiLoader size={15} className="animate-spin text-[#B42225]" />
        Loading tracking info…
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-xs text-amber-600 py-2 flex items-center gap-1.5">
        <FiAlertCircle size={13} /> {error}
      </p>
    );
  }

  if (events.length === 0) {
    return (
      <p className="text-xs text-gray-400 py-2">
        No tracking events yet. Check back soon.
      </p>
    );
  }

  return (
    <div className="relative pl-5 border-l-2 border-dashed border-gray-200 space-y-4">
      {events.map((ev, i) => (
        <div key={`${ev.status}-${ev.timestamp}-${i}`} className="relative">
          {/* dot on the timeline */}
          <div
            className="absolute -left-[1.35rem] top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center"
            style={{
              background:
                i === 0
                  ? "linear-gradient(135deg,#B42225,#FF8C00)"
                  : "#D1D5DB",
            }}
          />
          <p
            className={`text-xs font-black ${i === 0 ? "text-[#B42225]" : "text-gray-500"}`}
          >
            {ev.status}
          </p>
          {ev.note && (
            <p className="text-xs text-gray-400 mt-0.5">{ev.note}</p>
          )}
          {ev.location && (
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <FiMapPin size={10} /> {ev.location}
            </p>
          )}
          <p className="text-[10px] text-gray-300 mt-0.5">
            {safeFormatDate(ev.timestamp, {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ORDER CARD
// ─────────────────────────────────────────────────────────────
function OrderCard({
  order: initialOrder,
  defaultOpen,
  onCancel,
  isHighlighted,
}: {
  order: Order;
  defaultOpen?: boolean;
  onCancel: (id: string) => Promise<void>;
  isHighlighted?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const [order, setOrder] = useState<Order>(initialOrder);
  const [copied, setCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const detailFetchedRef = useRef(false);

  // Use useMemo to update order state when initialOrder changes
  // This is more performant than useEffect with setState
  const updatedOrder = useMemo(() => {
    // Only update if there's actually a difference
    if (initialOrder.id !== order.id || initialOrder.order_status !== order.order_status) {
      return initialOrder;
    }
    return order;
  }, [initialOrder, order]);

  // Use the updated order if it changed, otherwise keep current
  const currentOrder = updatedOrder.id !== order.id ? updatedOrder : order;

  const cfg = STATUS_CONFIG[currentOrder.order_status] ?? STATUS_CONFIG.pending;

  // Fetch full order detail (includes items + delivery_info) on first open
  useEffect(() => {
    if (!open || detailFetchedRef.current) return;
    detailFetchedRef.current = true;
    const load = async () => {
      setLoadingDetail(true);
      try {
        const res = await ApiService.getOrderById(currentOrder.id);
        const parsed = parseOrder(res);
        if (parsed) setOrder(parsed);
      } catch {
        // silently fail — we still show whatever was in the list response
      } finally {
        setLoadingDetail(false);
      }
    };
    load();
  }, [open, currentOrder.id]);

  const copyRef = () => {
    const ref = currentOrder.payment_reference || currentOrder.order_number;
    if (!ref) return;
    navigator.clipboard.writeText(ref).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await onCancel(currentOrder.id);
      setConfirmCancel(false);
    } finally {
      setCancelling(false);
    }
  };

  const dateStr = safeFormatDate(currentOrder.created_at, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const canCancel =
    currentOrder.order_status === "pending" && currentOrder.payment_status === "pending";

  const canTrack =
    currentOrder.order_status === "confirmed" ||
    currentOrder.order_status === "shipped" ||
    currentOrder.order_status === "delivered";

  return (
    <div
      className={`bg-white rounded-3xl overflow-hidden transition-all duration-300 ${
        isHighlighted ? "ring-2 ring-[#B42225] ring-offset-2" : ""
      }`}
      style={{
        boxShadow: isHighlighted
          ? "0 8px 40px rgba(180,34,37,0.18)"
          : "0 4px 30px rgba(0,0,0,0.06)",
        animation: "fadeUp 0.5s ease both",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 p-5 md:p-6 text-left hover:bg-gray-50/60 transition-colors"
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg,#FEF2F2,#FFF7ED)" }}
        >
          <FiPackage size={22} className="text-[#B42225]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-black text-gray-900">
              {currentOrder.order_number}
            </p>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}
            >
              {cfg.icon} {cfg.label}
            </span>
            {currentOrder.payment_status === "paid" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700">
                <FiCheck size={11} /> Paid
              </span>
            )}
            {currentOrder.payment_status === "failed" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700">
                <FiXCircle size={11} /> Payment Failed
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <FiCalendar size={11} /> {dateStr}
            </span>
            <span className="text-xs text-gray-400">
              {currentOrder.item_count} item{currentOrder.item_count !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-base font-black text-[#B42225]">
            {fmt(currentOrder.total_amount)}
          </p>
          <FiChevronDown
            size={16}
            className={`text-gray-400 mt-1 transition-transform duration-300 ${open ? "rotate-180" : ""} ml-auto`}
          />
        </div>
      </button>

      {open && (
        <div style={{ animation: "slideDown 0.3s ease both" }}>
          <div className="border-t border-gray-100" />

          {loadingDetail && (
            <div className="flex items-center justify-center py-6 gap-2 text-sm text-gray-400">
              <FiLoader size={16} className="animate-spin text-[#B42225]" />
              Loading order details…
            </div>
          )}

          {/* Progress timeline */}
          {currentOrder.order_status !== "cancelled" && (
            <div className="px-5 md:px-6 py-5">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                Order Progress
              </p>
              <div className="flex items-start gap-0">
                {TIMELINE.map((label, i) => {
                  const step = i + 1;
                  const done = cfg.step >= step;
                  return (
                    <div key={label} className="flex-1 flex flex-col items-center">
                      <div className="flex items-center w-full">
                        {i > 0 && (
                          <div
                            className="flex-1 h-0.5 transition-all duration-700"
                            style={
                              done || cfg.step > step
                                ? {
                                    background:
                                      "linear-gradient(90deg,#B42225,#FF8C00)",
                                  }
                                : { background: "#E5E7EB" }
                            }
                          />
                        )}
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 shrink-0 transition-all duration-500"
                          style={
                            done
                              ? {
                                  background:
                                    "linear-gradient(135deg,#B42225,#FF8C00)",
                                  borderColor: "#B42225",
                                  color: "#fff",
                                }
                              : {
                                  background: "#F9FAFB",
                                  borderColor: "#E5E7EB",
                                  color: "#9CA3AF",
                                }
                          }
                        >
                          {done ? <FiCheck size={13} /> : step}
                        </div>
                        {i < TIMELINE.length - 1 && (
                          <div
                            className="flex-1 h-0.5"
                            style={
                              cfg.step > step
                                ? {
                                    background:
                                      "linear-gradient(90deg,#B42225,#FF8C00)",
                                  }
                                : { background: "#E5E7EB" }
                            }
                          />
                        )}
                      </div>
                      <p
                        className={`text-[10px] font-bold mt-2 text-center leading-tight ${done ? "text-[#B42225]" : "text-gray-400"}`}
                      >
                        {label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items */}
          {currentOrder.items && currentOrder.items.length > 0 && (
            <div className="px-5 md:px-6 pb-3">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
                Items Ordered
              </p>
              <div className="space-y-3">
                {currentOrder.items.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50"
                  >
                    {item.image_url ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-100 shrink-0">
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0 flex items-center justify-center">
                        <FiPackage size={18} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Qty: {item.quantity} × {fmt(item.price)}
                      </p>
                    </div>
                    <span className="text-sm font-black text-gray-900 shrink-0">
                      {fmt(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery + payment summary */}
          <div className="grid sm:grid-cols-2 gap-4 px-5 md:px-6 py-4">
            {currentOrder.delivery_info && (
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  Delivery Info
                </p>
                {currentOrder.delivery_info.recipient_name && (
                  <p className="text-sm font-bold text-gray-800">
                    {currentOrder.delivery_info.recipient_name}
                  </p>
                )}
                {currentOrder.delivery_info.recipient_phone && (
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <FiPhone size={11} />{" "}
                    {currentOrder.delivery_info.recipient_phone}
                  </p>
                )}
                {currentOrder.delivery_info.recipient_email && (
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <FiMail size={11} />{" "}
                    {currentOrder.delivery_info.recipient_email}
                  </p>
                )}
                {(currentOrder.delivery_info.street_address ||
                  currentOrder.delivery_info.city) && (
                  <p className="text-xs text-gray-500 mt-0.5 flex items-start gap-1">
                    <FiMapPin size={11} className="mt-0.5 shrink-0" />
                    {[
                      currentOrder.delivery_info.street_address,
                      currentOrder.delivery_info.city,
                      currentOrder.delivery_info.state,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                {currentOrder.delivery_info.notes && (
                  <p className="text-xs text-gray-400 mt-1 italic">
                    &quot;{currentOrder.delivery_info.notes}&quot;
                  </p>
                )}
              </div>
            )}

            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                Payment Summary
              </p>
              <div className="space-y-1.5">
                {currentOrder.subtotal != null && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-700">
                      {fmt(currentOrder.subtotal)}
                    </span>
                  </div>
                )}
                {currentOrder.delivery_cost != null && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Delivery</span>
                    <span className="font-bold text-gray-700">
                      {currentOrder.delivery_cost === 0
                        ? "Free"
                        : fmt(currentOrder.delivery_cost)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t border-gray-200 pt-1.5 mt-1.5">
                  <span className="font-black text-gray-900">Total</span>
                  <span className="font-black text-[#B42225]">
                    {fmt(currentOrder.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking */}
          {canTrack && (
            <div className="px-5 md:px-6 pb-4">
              <button
                type="button"
                onClick={() => setShowTracking((t) => !t)}
                className="flex items-center gap-2 text-xs font-black text-[#B42225] hover:opacity-70 transition mb-3"
              >
                <FiTruck size={13} />
                {showTracking ? "Hide" : "Show"} delivery tracking
                <FiChevronDown
                  size={12}
                  className={`transition-transform ${showTracking ? "rotate-180" : ""}`}
                />
              </button>
              {showTracking && <TrackingPanel orderId={currentOrder.id} />}
            </div>
          )}

          {/* Reference */}
          {(currentOrder.payment_reference || currentOrder.order_number) && (
            <div className="px-5 md:px-6 pb-3">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-2xl">
                <p className="text-xs text-gray-500 flex-1 min-w-0">
                  Ref:{" "}
                  <span className="font-mono text-gray-700 font-bold truncate">
                    {currentOrder.payment_reference || currentOrder.order_number}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={copyRef}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-[#B42225] hover:bg-[#B42225]/10 px-2.5 py-1.5 rounded-xl transition"
                >
                  {copied ? (
                    <>
                      <FiCheck size={12} /> Copied!
                    </>
                  ) : (
                    <>
                      <FiCopy size={12} /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Cancel */}
          {canCancel && (
            <div className="px-5 md:px-6 pb-5">
              {!confirmCancel ? (
                <button
                  type="button"
                  onClick={() => setConfirmCancel(true)}
                  className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1.5 transition"
                >
                  <FiXCircle size={13} /> Cancel this order
                </button>
              ) : (
                <div
                  className="flex items-center gap-3 p-3 bg-red-50 rounded-2xl border border-red-100"
                  style={{ animation: "fadeUp 0.25s ease both" }}
                >
                  <FiAlertCircle size={16} className="text-red-500 shrink-0" />
                  <p className="text-xs text-red-700 flex-1 font-medium">
                    Cancel this order and restore stock?
                  </p>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setConfirmCancel(false)}
                      disabled={cancelling}
                      className="text-xs font-bold text-gray-500 hover:text-gray-700 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 transition flex items-center gap-1"
                    >
                      <FiX size={11} /> No
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="text-xs font-bold text-white px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 transition flex items-center gap-1 disabled:opacity-60"
                    >
                      {cancelling ? (
                        <FiLoader size={11} className="animate-spin" />
                      ) : (
                        <FiCheck size={11} />
                      )}
                      Yes, Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────
function EmptyOrders() {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 text-center"
      style={{ animation: "fadeUp 0.6s ease both" }}
    >
      <div
        className="w-32 h-32 rounded-full flex items-center justify-center mb-6"
        style={{
          background: "linear-gradient(135deg,#FEF2F2,#FFF7ED)",
          animation: "floatBounce 3s ease-in-out infinite",
        }}
      >
        <FiShoppingBag size={52} className="text-[#B42225] opacity-60" />
      </div>
      <h2
        className="text-2xl font-black text-gray-800 mb-2"
        style={{ fontFamily: "'Georgia',serif" }}
      >
        No orders yet
      </h2>
      <p className="text-gray-400 text-sm max-w-xs mb-8 leading-relaxed">
        When you place an order, it will appear here.
      </p>
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-white text-sm transition-all hover:scale-105 active:scale-95 shadow-xl"
        style={{
          background: "linear-gradient(135deg,#B42225,#FF8C00)",
          boxShadow: "0 8px 30px rgba(180,34,37,0.35)",
        }}
      >
        <FiShoppingBag size={16} /> Start Shopping
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// POST-CHECKOUT BANNER
// ─────────────────────────────────────────────────────────────
// Renders a different message depending on the *actual* status of the
// order the user just came from, instead of always celebrating just
// because a `?ref=` param is present in the URL. `?ref=` only tells us
// the user was redirected from checkout — it says nothing about whether
// the payment was ever confirmed by the backend.
//
//   matchedOrder === undefined  → still loading orders, show a neutral
//                                  "checking your order" state
//   matchedOrder === null       → orders loaded but no match found
//                                  (don't show anything; avoids a false
//                                  claim about an order we can't verify)
//   matchedOrder is an Order    → branch on its real payment/order status
function PostCheckoutBanner({
  matchedOrder,
}: {
  matchedOrder: Order | null | undefined;
}) {
  if (matchedOrder === null) return null;

  if (matchedOrder === undefined) {
    return (
      <div
        className="flex items-center gap-3 p-4 mb-6 rounded-2xl border border-gray-200 bg-white"
        style={{ animation: "fadeUp 0.5s ease both" }}
      >
        <FiLoader size={20} className="animate-spin text-[#B42225] shrink-0" />
        <div className="flex-1">
          <p className="font-black text-gray-800">Checking your order…</p>
          <p className="text-xs text-gray-400 mt-0.5">One moment please.</p>
        </div>
      </div>
    );
  }

  const { payment_status, order_status } = matchedOrder;

  if (payment_status === "paid" || order_status === "confirmed") {
    return (
      <div
        className="flex items-center gap-3 p-4 mb-6 rounded-2xl border border-green-200"
        style={{
          background: "linear-gradient(135deg,#F0FDF4,#DCFCE7)",
          animation: "fadeUp 0.5s ease both",
        }}
      >
        <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
          <FiCheckCircle size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="font-black text-green-800">
            Order placed successfully! 🎉
          </p>
          <p className="text-xs text-green-600 mt-0.5">
            Your order is being processed. It&apos;s highlighted below.
          </p>
        </div>
      </div>
    );
  }

  if (payment_status === "failed") {
    return (
      <div
        className="flex items-center gap-3 p-4 mb-6 rounded-2xl border border-red-200 bg-red-50"
        style={{ animation: "fadeUp 0.5s ease both" }}
      >
        <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shrink-0">
          <FiXCircle size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="font-black text-red-800">Payment was not confirmed</p>
          <p className="text-xs text-red-600 mt-0.5">
            We couldn&apos;t verify this payment. If you were charged, please
            contact support with your order number — otherwise, feel free to
            try again.
          </p>
        </div>
      </div>
    );
  }

  // payment_status === "pending" (or anything else we don't explicitly
  // recognise) — don't claim success, just acknowledge we're still
  // waiting on confirmation.
  return (
    <div
      className="flex items-center gap-3 p-4 mb-6 rounded-2xl border border-amber-200 bg-amber-50"
      style={{ animation: "fadeUp 0.5s ease both" }}
    >
      <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
        <FiClock size={20} className="text-white" />
      </div>
      <div className="flex-1">
        <p className="font-black text-amber-800">
          Order placed — confirming payment
        </p>
        <p className="text-xs text-amber-700 mt-0.5">
          We&apos;re still confirming your payment. This page will reflect
          the latest status — feel free to refresh in a moment.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function OrdersClient() {
  const { user } = useContext(AuthContext);
  const params = useSearchParams();
  // ?ref= is the order_id UUID passed from checkout redirect
  const newOrderRef = params.get("ref");

  // `user` comes from AuthContext, which typically resolves from a token
  // in localStorage — unavailable during SSR, so the server always renders
  // with `user` unset. On the client, AuthContext can resolve `user`
  // synchronously (or on the very first effect tick) before React finishes
  // reconciling against the server-rendered HTML, causing the server's
  // "signed out" branch to mismatch the client's "signed in" branch.
  //
  // `mounted` only flips to true inside a useEffect, which never runs
  // during SSR. So the first client render (the one React hydrates against)
  // is forced to match the server's output exactly — we don't branch on
  // `user` at all until after hydration is complete.
  const [mounted, setMounted] = useState(false);
  
  // Use useMemo to track if we should render mounted state
  // This avoids setState in useEffect
  const isMounted = useMemo(() => {
    // This will be false on initial render, true after useEffect runs
    return mounted;
  }, [mounted]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const PER_PAGE = 20;

  const fetchOrders = useCallback(async (p = 1, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getUserOrders({
        page: p,
        per_page: PER_PAGE,
      });
      const list = parseOrdersResponse(res);
      setOrders((prev) => (append ? [...prev, ...list] : list));
      setHasMore(list.length === PER_PAGE);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  // Use useEffect only for side effects that need to happen
  useEffect(() => {
    // Set mounted state - this is a necessary side effect for hydration
    setMounted(true);
  }, []);

  // Separate effect for data fetching that depends on mounted state
  useEffect(() => {
    if (!isMounted || !user) return;
    fetchOrders(1, false);
  }, [isMounted, user, fetchOrders]);

  const handleCancel = async (order_id: string) => {
    try {
      await ApiService.cancelOrder(order_id);
      // re-fetch from page 1 so statuses are fresh
      await fetchOrders(1, false);
    } catch (err: any) {
      alert(err?.message ?? "Failed to cancel order");
    }
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchOrders(next, true);
  };

  const filtered = useMemo(
    () =>
      filter === "all"
        ? orders
        : orders.filter((o) => o.order_status === filter),
    [filter, orders],
  );

  // The order the post-checkout banner should describe, if any.
  //   undefined → orders haven't loaded yet (still checking)
  //   null      → orders loaded, no `ref` present, or no match found
  //   Order     → the matched order to report on
  const matchedOrder: Order | null | undefined = useMemo(() => {
    if (!newOrderRef) return null;
    if (loading && orders.length === 0) return undefined;
    return (
      orders.find(
        (o) => o.id === newOrderRef || o.order_number === newOrderRef,
      ) ?? null
    );
  }, [newOrderRef, orders, loading]);

  // Before hydration completes, render the same neutral loading state
  // regardless of what `user` actually is — this is what keeps the server
  // HTML and the first client render identical, which is what stops the
  // hydration mismatch. Once `mounted` flips true (client-only), we branch
  // on the real auth state as normal.
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#B42225] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading your orders…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 p-4 text-center">
        <FiPackage size={48} className="text-gray-300" />
        <h2 className="text-xl font-black text-gray-700">
          Sign in to view your orders
        </h2>
        <Link
          href="/login?redirect=/orders"
          className="px-6 py-3 rounded-2xl font-black text-white text-sm"
          style={{ background: "linear-gradient(135deg,#B42225,#FF8C00)" }}
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp      { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes slideDown   { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

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
          <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-4 transition-colors"
            >
              <FiArrowLeft size={14} /> Back to Profile
            </Link>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1
                  className="text-3xl md:text-4xl font-black text-white"
                  style={{ fontFamily: "'Georgia',serif" }}
                >
                  My Orders
                </h1>
                <p className="text-white/50 text-sm mt-1">
                  {loading
                    ? "Loading…"
                    : `${orders.length} order${orders.length !== 1 ? "s" : ""} total`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => fetchOrders(1, false)}
                disabled={loading}
                className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-bold transition disabled:opacity-40"
                title="Refresh"
              >
                <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8">
          {/* Success / pending / failed banner when coming from checkout —
              status-aware, never assumes success just because `?ref=` is present. */}
          {newOrderRef && <PostCheckoutBanner matchedOrder={matchedOrder} />}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">
              <FiAlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
              <button
                type="button"
                onClick={() => fetchOrders(1, false)}
                className="ml-auto text-xs font-bold underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Skeleton */}
          {loading && orders.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-6 animate-pulse"
                  style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.06)" }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <EmptyOrders />
          ) : (
            <>
              {/* Filter tabs */}
              <div className="flex gap-2 flex-wrap mb-5 overflow-x-auto pb-1">
                {(
                  [
                    "all",
                    "pending",
                    "confirmed",
                    "shipped",
                    "delivered",
                    "cancelled",
                  ] as const
                ).map((f) => (
                  <button
                    type="button"
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize shrink-0 ${
                      filter === f
                        ? "text-white shadow-md"
                        : "text-gray-500 bg-white hover:bg-gray-100 border border-gray-200"
                    }`}
                    style={
                      filter === f
                        ? { background: "linear-gradient(135deg,#B42225,#FF8C00)" }
                        : {}
                    }
                  >
                    {f === "all"
                      ? `All (${orders.length})`
                      : STATUS_CONFIG[f].label}
                  </button>
                ))}
              </div>

              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 py-16 font-medium">
                  No orders with this status.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {filtered.map((order, i) => {
                    // Match by order_id (UUID from ?ref=) OR order_number
                    const isHighlighted =
                      !!newOrderRef &&
                      (order.id === newOrderRef ||
                        order.order_number === newOrderRef);
                    const noMatchInList =
                      !!newOrderRef &&
                      !filtered.some(
                        (o) =>
                          o.id === newOrderRef ||
                          o.order_number === newOrderRef,
                      );
                    return (
                      <OrderCard
                        key={order.id}
                        order={order}
                        // Auto-open the order that came from checkout, or the first one
                        defaultOpen={isHighlighted || (i === 0 && noMatchInList)}
                        isHighlighted={isHighlighted}
                        onCancel={handleCancel}
                      />
                    );
                  })}
                </div>
              )}

              {hasMore && filter === "all" && (
                <div className="flex justify-center mt-6">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-gray-600 border-2 border-gray-200 hover:border-gray-300 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <FiLoader size={15} className="animate-spin" />
                    ) : null}
                    Load more orders
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}