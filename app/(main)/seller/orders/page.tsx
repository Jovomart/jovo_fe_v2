"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import apiService from "@/services/apiService";
import SellerLayout, { fmtCurrency } from "@/components/layout/SellerLayout";
import {
  FiShoppingBag,
  FiAlertCircle,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiFilter,
  FiCalendar,
  FiSearch,
  FiPackage,
  FiTruck,
  FiCheck,
  FiX,
  FiClock,
  FiLoader,
  FiMapPin,
  FiEdit2,
  FiSave,
} from "react-icons/fi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_status: string;
}

interface Order {
  id: string;
  order_number: string;
  order_status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  seller_notes?: string;
  buyer?: {
    full_name?: string;
    username?: string;
    email?: string;
  };
  items: OrderItem[];
  delivery_street_address?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_country?: string;
  delivery_notes?: string;
}

interface Pagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

type OrderStatusFilter =
  | "all"
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
type PaymentFilter = "all" | "paid" | "pending" | "failed";
type ItemStatusFilter =
  | "all"
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

const ITEM_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
  }
> = {
  pending: {
    label: "Pending",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    icon: <FiClock size={12} />,
  },
  processing: {
    label: "Processing",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    icon: <FiLoader size={12} />,
  },
  shipped: {
    label: "Shipped",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    icon: <FiTruck size={12} />,
  },
  delivered: {
    label: "Delivered",
    color: "#059669",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    icon: <FiCheck size={12} />,
  },
  completed: {
    label: "Completed",
    color: "#059669",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    icon: <FiCheck size={12} />,
  },
  cancelled: {
    label: "Cancelled",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    icon: <FiX size={12} />,
  },
  paid: {
    label: "Paid",
    color: "#059669",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    icon: <FiCheck size={12} />,
  },
  failed: {
    label: "Failed",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    icon: <FiX size={12} />,
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = statusConfig[status?.toLowerCase()] ?? {
    label: status,
    color: "#64748B",
    bg: "#F8FAFC",
    border: "#E2E8F0",
    icon: null,
  };
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

// ─── Item Status Dropdown ─────────────────────────────────────────────────────

const ItemStatusSelect = ({
  item,
  onUpdate,
}: {
  item: OrderItem;
  onUpdate: (itemId: string, newStatus: string) => Promise<void>;
}) => {
  const [updating, setUpdating] = useState(false);
  const [current, setCurrent] = useState(item.item_status ?? "pending");

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setUpdating(true);
    try {
      await onUpdate(item.id, newStatus);
      setCurrent(newStatus);
    } catch {
      // revert handled by parent toast
    } finally {
      setUpdating(false);
    }
  };

  const cfg = statusConfig[current?.toLowerCase()] ?? statusConfig.pending;

  return (
    <div className="relative">
      <select
        value={current}
        onChange={handleChange}
        disabled={
          updating ||
          current === "delivered" ||
          current === "cancelled"
        }
        className="appearance-none text-[11px] font-bold pl-2.5 pr-6 py-1.5 rounded-lg border cursor-pointer outline-none disabled:cursor-not-allowed transition"
        style={{
          color: cfg.color,
          background: cfg.bg,
          borderColor: cfg.border,
        }}
      >
        {ITEM_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>
      <FiChevronDown
        size={10}
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: cfg.color }}
      />
    </div>
  );
};

// ─── Seller Notes Editor ──────────────────────────────────────────────────────

const SellerNotesEditor = ({
  orderId,
  initialNotes,
  onToast,
}: {
  orderId: string;
  initialNotes?: string;
  onToast: (msg: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [draft, setDraft] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiService.updateSellerOrderNotes(orderId, draft.trim());
      setNotes(draft.trim());
      setEditing(false);
      onToast("Order notes updated.");
    } catch (err: any) {
      onToast(err.message ?? "Failed to save notes.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(notes);
    setEditing(false);
  };

  return (
    <div className="px-5 py-3 border-t border-slate-100 bg-amber-50/40">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[11px] font-black text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
          <FiEdit2 size={11} /> Internal Notes
        </p>
        {!editing && (
          <button
            onClick={() => {
              setDraft(notes);
              setEditing(true);
            }}
            className="text-[11px] font-bold text-amber-600 hover:text-amber-800 transition"
          >
            {notes ? "Edit" : "+ Add Note"}
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Add an internal note for this order…"
            className="w-full px-3 py-2 rounded-xl border border-amber-200 text-sm text-slate-700 outline-none focus:border-amber-400 resize-none bg-white transition"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black text-white transition disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#F97316,#EA580C)" }}
            >
              <FiSave size={11} /> {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : notes ? (
        <p className="text-xs text-amber-800 font-medium leading-relaxed">
          {notes}
        </p>
      ) : (
        <p className="text-xs text-amber-600/60 italic">No notes yet.</p>
      )}
    </div>
  );
};

// ─── Order Row ────────────────────────────────────────────────────────────────

const OrderRow = ({
  order,
  onStatusUpdate,
  onToast,
}: {
  order: Order;
  onStatusUpdate: (itemId: string, status: string) => Promise<void>;
  onToast: (msg: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const buyerName =
    order.buyer?.full_name || order.buyer?.username || "Customer";

  const handleItemUpdate = async (itemId: string, newStatus: string) => {
    try {
      await onStatusUpdate(itemId, newStatus);
      onToast(`Item status updated to ${newStatus}.`);
    } catch (err: any) {
      onToast(err.message ?? "Failed to update status.");
      throw err;
    }
  };

  const deliveryAddress = [
    order.delivery_street_address,
    order.delivery_city,
    order.delivery_state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className="border border-slate-100 rounded-2xl overflow-hidden transition-all duration-200 hover:border-orange-200"
      style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Order Header */}
      <button
        className="w-full flex items-center gap-4 px-5 py-4 bg-white hover:bg-orange-50/20 transition-colors text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
          <FiShoppingBag size={16} className="text-orange-500" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-black text-slate-900">
              #{order.order_number || order.id.slice(0, 8)}
            </span>
            <StatusBadge status={order.order_status} />
            <StatusBadge status={order.payment_status} />
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {buyerName}
            {deliveryAddress && ` · ${deliveryAddress}`}
          </p>
        </div>

        <div className="hidden sm:flex flex-col items-end shrink-0">
          <p className="text-sm font-black text-slate-900">
            {fmtCurrency(Number(order.total_amount))}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">
            {order.created_at
              ? new Date(order.created_at).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-semibold text-slate-400">
            {order.items?.length ?? 0} item
            {(order.items?.length ?? 0) !== 1 ? "s" : ""}
          </span>
          {expanded ? (
            <FiChevronUp size={15} className="text-slate-400" />
          ) : (
            <FiChevronDown size={15} className="text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-50" style={{ background: "#FAFBFC" }}>
          {/* Delivery info */}
          {deliveryAddress && (
            <div className="px-5 py-3 flex items-start gap-2.5 border-b border-slate-100">
              <FiMapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Delivery Address
                </p>
                <p className="text-xs text-slate-700 font-medium">
                  {deliveryAddress}
                </p>
                {order.delivery_notes && (
                  <p className="text-[11px] text-slate-400 mt-0.5 italic">
                    Note: {order.delivery_notes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="divide-y divide-slate-100">
            {(order.items ?? []).map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center relative">
                  {item.product_image ? (
                    <Image
                      src={item.product_image}
                      alt={item.product_name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiPackage size={16} className="text-slate-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {item.product_name}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Qty: {item.quantity} ·{" "}
                    {fmtCurrency(Number(item.unit_price))} each
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-black text-slate-900 hidden sm:block">
                    {fmtCurrency(Number(item.total_price))}
                  </span>
                  <ItemStatusSelect item={item} onUpdate={handleItemUpdate} />
                </div>
              </div>
            ))}
          </div>

          {/* Order Total Footer */}
          <div className="flex items-center justify-between px-5 py-3 bg-white border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-semibold">
              Order Total
            </span>
            <span className="text-base font-black text-slate-900">
              {fmtCurrency(Number(order.total_amount))}
            </span>
          </div>

          {/* Seller Notes */}
          <SellerNotesEditor
            orderId={order.id}
            initialNotes={order.seller_notes}
            onToast={onToast}
          />
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SellerOrdersPage = () => {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [search, setSearch] = useState("");

  // Filters
  const [orderStatus, setOrderStatus] = useState<OrderStatusFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [itemStatusFilter, setItemStatusFilter] =
    useState<ItemStatusFilter>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const hasFetchedRef = useRef(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const fetchOrders = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError("");
      try {
        const params: any = { page, per_page: 20 };
        if (orderStatus !== "all") params.order_status = orderStatus;
        if (paymentFilter !== "all") params.payment_status = paymentFilter;
        if (itemStatusFilter !== "all") params.item_status = itemStatusFilter;
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;

        const res = await apiService.getSellerOrders(params);
        const body = res?.data ?? res;
        const list: Order[] =
          body?.orders ??
          body?.items ??
          body?.data ??
          (Array.isArray(body) ? body : []);

        setOrders(list);
        setPagination({
          page: body?.page ?? page,
          per_page: body?.per_page ?? 20,
          total: body?.total ?? list.length,
          total_pages: body?.total_pages ?? 1,
        });
      } catch (err: any) {
        setError(err.message ?? "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    },
    [orderStatus, paymentFilter, itemStatusFilter, startDate, endDate]
  );

  // Reset fetch guard when any filter changes
  useEffect(() => {
    hasFetchedRef.current = false;
  }, [orderStatus, paymentFilter, itemStatusFilter, startDate, endDate]);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchOrders(1);
    }
  }, [fetchOrders]);

  const handleStatusUpdate = async (itemId: string, newStatus: string) => {
    await apiService.updateOrderItemStatus(itemId, newStatus);
    await fetchOrders(pagination.page);
  };

  // Client-side search
  const displayed = search.trim()
    ? orders.filter(
        (o) =>
          (o.order_number ?? "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (o.buyer?.full_name ?? "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (o.buyer?.username ?? "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          o.items?.some((i) =>
            i.product_name.toLowerCase().includes(search.toLowerCase())
          )
      )
    : orders;

  // Summary counts
  const counts = {
    pending: orders.filter((o) => o.order_status?.toLowerCase() === "pending")
      .length,
    processing: orders.filter(
      (o) => o.order_status?.toLowerCase() === "processing"
    ).length,
    shipped: orders.filter((o) => o.order_status?.toLowerCase() === "shipped")
      .length,
    delivered: orders.filter(
      (o) =>
        o.order_status?.toLowerCase() === "delivered" ||
        o.order_status?.toLowerCase() === "completed"
    ).length,
  };

  const orderStatusTabs: { key: OrderStatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <>
      <SellerLayout
        activeNav="orders"
        onRefresh={() => fetchOrders(pagination.page)}
        isLoading={loading}
        pageTitle="Orders"
        stats={{ pendingOrders: counts.pending }}
      >
        <div className="p-5 md:p-7 space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Pending",
                value: counts.pending,
                color: "#D97706",
                bg: "#FFFBEB",
                icon: <FiClock size={16} />,
              },
              {
                label: "Processing",
                value: counts.processing,
                color: "#2563EB",
                bg: "#EFF6FF",
                icon: <FiLoader size={16} />,
              },
              {
                label: "Shipped",
                value: counts.shipped,
                color: "#7C3AED",
                bg: "#F5F3FF",
                icon: <FiTruck size={16} />,
              },
              {
                label: "Delivered",
                value: counts.delivered,
                color: "#059669",
                bg: "#F0FDF4",
                icon: <FiCheck size={16} />,
              },
            ].map(({ label, value, color, bg, icon }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-4 border border-slate-100 cursor-pointer hover:border-orange-200 transition"
                style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}
                onClick={() =>
                  setOrderStatus(label.toLowerCase() as OrderStatusFilter)
                }
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                  style={{ background: bg, color }}
                >
                  {icon}
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {loading ? "—" : value}
                </p>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 rounded-2xl px-5 py-4 bg-red-50 border border-red-200">
              <FiAlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-red-700 text-sm font-semibold flex-1">
                {error}
              </p>
              <button
                onClick={() => fetchOrders(1)}
                className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <FiRefreshCw size={12} /> Retry
              </button>
            </div>
          )}

          {/* Filters */}
          <div
            className="bg-white rounded-2xl border border-slate-100 p-4"
            style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 flex-1">
                <FiSearch size={14} className="text-slate-400 shrink-0" />
                <input
                  className="bg-transparent text-sm text-slate-700 outline-none flex-1 placeholder-slate-400"
                  placeholder="Search by order ID, customer, product…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition ${
                  showFilters
                    ? "bg-orange-500 text-white border-orange-500"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FiFilter size={14} /> Filters
              </button>
            </div>

            {/* Order status tabs */}
            <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1">
              {orderStatusTabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setOrderStatus(key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    orderStatus === key
                      ? "bg-orange-500 text-white"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Advanced filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Item fulfillment status */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                    Item Status
                  </label>
                  <select
                    value={itemStatusFilter}
                    onChange={(e) =>
                      setItemStatusFilter(e.target.value as ItemStatusFilter)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none bg-white"
                  >
                    <option value="all">All Items</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Payment status */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                    Payment
                  </label>
                  <select
                    value={paymentFilter}
                    onChange={(e) =>
                      setPaymentFilter(e.target.value as PaymentFilter)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none bg-white"
                  >
                    <option value="all">All Payments</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Unpaid</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                {/* Date range */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                    From Date
                  </label>
                  <div className="relative">
                    <FiCalendar
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                    To Date
                  </label>
                  <div className="relative">
                    <FiCalendar
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Orders List */}
          <div className="space-y-3">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl bg-slate-100 animate-pulse"
                />
              ))
            ) : displayed.length === 0 ? (
              <div
                className="bg-white rounded-3xl border border-slate-100 py-20 text-center"
                style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                  <FiShoppingBag size={24} className="text-slate-300" />
                </div>
                <p className="font-bold text-slate-600">No orders found</p>
                <p className="text-slate-400 text-sm mt-1">
                  {search
                    ? "Try a different search term"
                    : "Orders will appear here once customers purchase your products"}
                </p>
              </div>
            ) : (
              displayed.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                  onToast={showToast}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {!loading && pagination.total_pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 font-medium">
                Showing{" "}
                {(pagination.page - 1) * pagination.per_page + 1}–
                {Math.min(
                  pagination.page * pagination.per_page,
                  pagination.total
                )}{" "}
                of {pagination.total} orders
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => fetchOrders(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition disabled:opacity-40"
                >
                  <FiChevronLeft size={14} />
                </button>
                {[...Array(pagination.total_pages)].map((_, i) => {
                  const p = i + 1;
                  if (
                    p === 1 ||
                    p === pagination.total_pages ||
                    Math.abs(p - pagination.page) <= 1
                  ) {
                    return (
                      <button
                        key={p}
                        onClick={() => fetchOrders(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                          p === pagination.page
                            ? "bg-orange-500 text-white"
                            : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }
                  if (Math.abs(p - pagination.page) === 2)
                    return (
                      <span key={p} className="text-slate-400 text-xs">
                        …
                      </span>
                    );
                  return null;
                })}
                <button
                  onClick={() => fetchOrders(pagination.page + 1)}
                  disabled={pagination.page >= pagination.total_pages}
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition disabled:opacity-40"
                >
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </SellerLayout>

      {/* Toast */}
      {toastMsg && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white text-sm font-semibold shadow-2xl animate-fade-in"
          style={{ background: "linear-gradient(135deg,#0F172A,#1E293B)" }}
        >
          <FiCheck size={15} className="text-emerald-400" />
          {toastMsg}
        </div>
      )}
    </>
  );
};

export default SellerOrdersPage;