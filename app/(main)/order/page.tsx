"use client";
import { useState, useEffect, useContext, useCallback, useRef } from "react";
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
} from "react-icons/fi";
import { AuthContext } from "@/context/AuthContext";
import ApiService from "@/services/apiService";
import Footer from "@/components/layout/Footer";

const fmt = (n: number) => `₦${n.toLocaleString()}`;

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed";

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image_url?: string;
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

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode; step: number }
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

function OrderCard({
  order,
  defaultOpen,
  onCancel,
}: {
  order: Order;
  defaultOpen?: boolean;
  onCancel: (id: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const [copied, setCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const cfg = STATUS_CONFIG[order.order_status] ?? STATUS_CONFIG.pending;

  const copyRef = () => {
    const ref = order.payment_reference || order.order_number;
    if (!ref) return;
    navigator.clipboard.writeText(ref).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await onCancel(order.id);
      setConfirmCancel(false);
    } finally {
      setCancelling(false);
    }
  };

  const dateStr = new Date(order.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const canCancel = order.order_status === "pending" && order.payment_status === "pending";

  return (
    <div
      className="bg-white rounded-3xl overflow-hidden transition-all duration-300"
      style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.06)", animation: "fadeUp 0.5s ease both" }}
    >
      <button
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
            <p className="text-sm font-black text-gray-900">{order.order_number}</p>
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
              {cfg.icon} {cfg.label}
            </span>
            {order.payment_status === "paid" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700">
                <FiCheck size={11} /> Paid
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <FiCalendar size={11} /> {dateStr}
            </span>
            <span className="text-xs text-gray-400">
              {order.item_count} item{order.item_count !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-base font-black text-[#B42225]">{fmt(order.total_amount)}</p>
          <FiChevronDown
            size={16}
            className={`text-gray-400 mt-1 transition-transform duration-300 ${open ? "rotate-180" : ""} ml-auto`}
          />
        </div>
      </button>

      {open && (
        <div style={{ animation: "slideDown 0.3s ease both" }}>
          <div className="border-t border-gray-100" />

          {order.order_status !== "cancelled" && (
            <div className="px-5 md:px-6 py-5">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Order Progress</p>
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
                                ? { background: "linear-gradient(90deg,#B42225,#FF8C00)" }
                                : { background: "#E5E7EB" }
                            }
                          />
                        )}
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 shrink-0 transition-all duration-500"
                          style={
                            done
                              ? { background: "linear-gradient(135deg,#B42225,#FF8C00)", borderColor: "#B42225", color: "#fff" }
                              : { background: "#F9FAFB", borderColor: "#E5E7EB", color: "#9CA3AF" }
                          }
                        >
                          {done ? <FiCheck size={13} /> : step}
                        </div>
                        {i < TIMELINE.length - 1 && (
                          <div
                            className="flex-1 h-0.5"
                            style={cfg.step > step ? { background: "linear-gradient(90deg,#B42225,#FF8C00)" } : { background: "#E5E7EB" }}
                          />
                        )}
                      </div>
                      <p className={`text-[10px] font-bold mt-2 text-center leading-tight ${done ? "text-[#B42225]" : "text-gray-400"}`}>
                        {label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {order.items && order.items.length > 0 && (
            <div className="px-5 md:px-6 pb-3">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Items Ordered</p>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50">
                    {item.image_url ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-100 shrink-0">
                        <Image src={item.image_url} alt={item.name} width={48} height={48} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0 flex items-center justify-center">
                        <FiPackage size={18} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-400">
                        Qty: {item.quantity} × {fmt(item.price)}
                      </p>
                    </div>
                    <span className="text-sm font-black text-gray-900 shrink-0">{fmt(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4 px-5 md:px-6 py-4">
            {order.delivery_info && (
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Delivery Address</p>
                {order.delivery_info.recipient_name && (
                  <p className="text-sm font-bold text-gray-800">{order.delivery_info.recipient_name}</p>
                )}
                {order.delivery_info.recipient_phone && (
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <FiPhone size={11} /> {order.delivery_info.recipient_phone}
                  </p>
                )}
                {order.delivery_info.recipient_email && (
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <FiMail size={11} /> {order.delivery_info.recipient_email}
                  </p>
                )}
                {(order.delivery_info.street_address || order.delivery_info.city) && (
                  <p className="text-xs text-gray-500 mt-0.5 flex items-start gap-1">
                    <FiMapPin size={11} className="mt-0.5 shrink-0" />
                    {[
                      order.delivery_info.street_address,
                      order.delivery_info.city,
                      order.delivery_info.state,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
            )}

            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Payment Summary</p>
              <div className="space-y-1.5">
                {order.subtotal != null && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-700">{fmt(order.subtotal)}</span>
                  </div>
                )}
                {order.delivery_cost != null && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Delivery</span>
                    <span className="font-bold text-gray-700">
                      {order.delivery_cost === 0 ? "Free" : fmt(order.delivery_cost)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t border-gray-200 pt-1.5 mt-1.5">
                  <span className="font-black text-gray-900">Total</span>
                  <span className="font-black text-[#B42225]">{fmt(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {(order.payment_reference || order.order_number) && (
            <div className="px-5 md:px-6 pb-3">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-2xl">
                <p className="text-xs text-gray-500 flex-1 min-w-0">
                  Ref:{" "}
                  <span className="font-mono text-gray-700 font-bold truncate">
                    {order.payment_reference || order.order_number}
                  </span>
                </p>
                <button
                  onClick={copyRef}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-[#B42225] hover:bg-[#B42225]/10 px-2.5 py-1.5 rounded-xl transition"
                >
                  {copied ? <><FiCheck size={12} /> Copied!</> : <><FiCopy size={12} /> Copy</>}
                </button>
              </div>
            </div>
          )}

          {canCancel && (
            <div className="px-5 md:px-6 pb-5">
              {!confirmCancel ? (
                <button
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
                      onClick={() => setConfirmCancel(false)}
                      disabled={cancelling}
                      className="text-xs font-bold text-gray-500 hover:text-gray-700 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 transition flex items-center gap-1"
                    >
                      <FiX size={11} /> No
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="text-xs font-bold text-white px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 transition flex items-center gap-1 disabled:opacity-60"
                    >
                      {cancelling ? <FiLoader size={11} className="animate-spin" /> : <FiCheck size={11} />}
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

function EmptyOrders() {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 text-center"
      style={{ animation: "fadeUp 0.6s ease both" }}
    >
      <div
        className="w-32 h-32 rounded-full flex items-center justify-center mb-6"
        style={{ background: "linear-gradient(135deg,#FEF2F2,#FFF7ED)", animation: "floatBounce 3s ease-in-out infinite" }}
      >
        <FiShoppingBag size={52} className="text-[#B42225] opacity-60" />
      </div>
      <h2 className="text-2xl font-black text-gray-800 mb-2" style={{ fontFamily: "'Georgia',serif" }}>
        No orders yet
      </h2>
      <p className="text-gray-400 text-sm max-w-xs mb-8 leading-relaxed">
        When you place an order, it will appear here.
      </p>
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-white text-sm transition-all hover:scale-105 active:scale-95 shadow-xl"
        style={{ background: "linear-gradient(135deg,#B42225,#FF8C00)", boxShadow: "0 8px 30px rgba(180,34,37,0.35)" }}
      >
        <FiShoppingBag size={16} /> Start Shopping
      </Link>
    </div>
  );
}

export default function Orders() {
  const { user } = useContext(AuthContext);
  const params = useSearchParams();
  const newOrderRef = params.get("ref");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const PER_PAGE = 20;

  const ordersFetchedRef = useRef(false);

  const fetchOrders = useCallback(async (p = 1, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getUserOrders({ page: p, per_page: PER_PAGE });
      const raw = res?.data ?? res;
      const list: Order[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.orders)
          ? raw.orders
          : Array.isArray(raw?.results)
            ? raw.results
            : [];

      setOrders((prev) => (append ? [...prev, ...list] : list));
      setHasMore(list.length === PER_PAGE);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  // FIXED: Use ref to ensure fetchOrders is only called once when user is available
  useEffect(() => {
    if (!user) return;
    if (!ordersFetchedRef.current) {
      ordersFetchedRef.current = true;
      fetchOrders(1, false);
    }
  }, [user, fetchOrders]);

  const handleCancel = async (order_id: string) => {
    try {
      await ApiService.cancelOrder(order_id);
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

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.order_status === filter);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 p-4 text-center">
        <FiPackage size={48} className="text-gray-300" />
        <h2 className="text-xl font-black text-gray-700">Sign in to view your orders</h2>
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
        <div
          className="relative overflow-hidden py-8 md:py-11"
          style={{ background: "linear-gradient(135deg,#0d0d0d 0%,#1c0202 45%,#B42225 100%)" }}
        >
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
          <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10">
            <Link href="/profile" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-4 transition-colors">
              <FiArrowLeft size={14} /> Back to Profile
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: "'Georgia',serif" }}>My Orders</h1>
            <p className="text-white/50 text-sm mt-1">
              {loading ? "Loading…" : `${orders.length} order${orders.length !== 1 ? "s" : ""} total`}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8">
          {newOrderRef && (
            <div
              className="flex items-center gap-3 p-4 mb-6 rounded-2xl border border-green-200"
              style={{ background: "linear-gradient(135deg,#F0FDF4,#DCFCE7)", animation: "fadeUp 0.5s ease both" }}
            >
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
                <FiCheckCircle size={20} className="text-white" />
              </div>
              <div>
                <p className="font-black text-green-800">Order placed successfully! 🎉</p>
                <p className="text-xs text-green-600 mt-0.5">
                  Your order has been confirmed and is being processed.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">
              <FiAlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
              <button onClick={() => fetchOrders(1, false)} className="ml-auto text-xs font-bold underline">Retry</button>
            </div>
          )}

          {loading && orders.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-6 animate-pulse" style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.06)" }}>
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
              <div className="flex gap-2 flex-wrap mb-5 overflow-x-auto pb-1">
                {(["all", "pending", "confirmed", "shipped", "delivered", "cancelled"] as const).map(
                  (f) => (
                    <button
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
                      {f === "all" ? `All (${orders.length})` : STATUS_CONFIG[f].label}
                    </button>
                  ),
                )}
              </div>

              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 py-16 font-medium">
                  No orders with this status.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {filtered.map((order, i) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      defaultOpen={order.order_number === newOrderRef || order.id === newOrderRef && i === 0}
                      onCancel={handleCancel}
                    />
                  ))}
                </div>
              )}

              {hasMore && filter === "all" && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-gray-600 border-2 border-gray-200 hover:border-gray-300 transition-all disabled:opacity-50"
                  >
                    {loading ? <FiLoader size={15} className="animate-spin" /> : null}
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