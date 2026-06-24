"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import apiService from "@/services/apiService";
import SellerLayout, { fmtCurrency } from "@/components/layout/SellerLayout";
import {
  FiAlertCircle,
  FiRefreshCw,
  FiPackage,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiMapPin,
  FiUser,
  FiCalendar,
  FiSearch,
  FiFilter,
  FiTruck,
  FiClock,
  FiDollarSign,
} from "react-icons/fi";
import {
  MdOutlineDeliveryDining,
  MdLocalShipping,
} from "react-icons/md";
import { HiOutlineClock } from "react-icons/hi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  seller_unit_price: number;
  seller_total_price: number;
  platform_fee: number;
  item_status: string;
}

interface Delivery {
  id: string;
  order_id: string;
  order_number: string;
  order_status: string;
  payment_status: string;
  total_amount: number;
  subtotal: number;
  platform_fee: number;
  seller_credit: number;
  order_date: string;
  created_at?: string;
  buyer?: {
    full_name?: string;
    username?: string;
    email?: string;
  };
  order_items: OrderItem[];
  delivery_address: string;
  delivery_type: string;
  tracking_number?: string | null;
  order_notes?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PIPELINE: {
  status: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}[] = [
  {
    status: "pending",
    label: "Pending",
    icon: <HiOutlineClock size={15} />,
    color: "#D97706",
    bg: "#FEF3C7",
  },
  {
    status: "confirmed",
    label: "Confirmed",
    icon: <FiCheck size={15} />,
    color: "#2563EB",
    bg: "#DBEAFE",
  },
  {
    status: "shipped",
    label: "Shipped",
    icon: <MdLocalShipping size={15} />,
    color: "#7C3AED",
    bg: "#EDE9FE",
  },
  {
    status: "delivered",
    label: "Delivered",
    icon: <FiCheck size={15} />,
    color: "#059669",
    bg: "#D1FAE5",
  },
];

const statusIdx = (s: string) =>
  PIPELINE.findIndex((p) => p.status === s?.toLowerCase());

// ─── Status Pipeline Bar ─────────────────────────────────────────────────────

const PipelineBar = ({ current }: { current: string }) => {
  const idx = statusIdx(current);
  if (current?.toLowerCase() === "cancelled") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 w-fit">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        <span className="text-[11px] font-bold text-red-600">Cancelled</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {PIPELINE.map((step, i) => {
        const done = i <= idx;
        const active = i === idx;
        return (
          <div key={step.status} className="flex items-center shrink-0">
            <div
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all"
              style={{
                background: done ? step.bg : "#F8FAFC",
                color: done ? step.color : "#CBD5E1",
                border: `1px solid ${done ? step.color + "40" : "#E2E8F0"}`,
                boxShadow: active
                  ? `0 2px 8px ${step.color}30`
                  : "none",
              }}
            >
              <span style={{ color: done ? step.color : "#CBD5E1" }}>
                {step.icon}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < PIPELINE.length - 1 && (
              <div
                className="w-3 sm:w-4 h-0.5 shrink-0"
                style={{ background: i < idx ? step.color : "#E2E8F0" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Item Status Select ───────────────────────────────────────────────────────

const NEXT_STATUS: Record<string, string | null> = {
  pending: "confirmed",
  confirmed: "shipped",
  shipped: "delivered",
  delivered: null,
  cancelled: null,
};

const ItemFulfillRow = ({
  item,
  onUpdate,
}: {
  item: OrderItem;
  onUpdate: (id: string, status: string) => Promise<void>;
}) => {
  const [updating, setUpdating] = useState(false);
  const [current, setCurrent] = useState(item.item_status ?? "pending");
  const nextStatus = NEXT_STATUS[current?.toLowerCase()];
  const pipe = PIPELINE.find((p) => p.status === current?.toLowerCase());

  const advance = async () => {
    if (!nextStatus) return;
    setUpdating(true);
    try {
      await onUpdate(item.id, nextStatus);
      setCurrent(nextStatus);
    } catch {}
    finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-3.5 px-4 sm:px-5">
      {/* Thumbnail */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
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
          <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
            {item.product_name}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            Qty {item.quantity} · {fmtCurrency(Number(item.unit_price))} each
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3">
        {/* Current status badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0"
          style={{
            background: pipe?.bg ?? "#F8FAFC",
            color: pipe?.color ?? "#64748B",
            border: `1px solid ${(pipe?.color ?? "#CBD5E1") + "40"}`,
          }}
        >
          {pipe?.icon}
          <span>{pipe?.label ?? current}</span>
        </div>

        {/* Advance button */}
        {nextStatus && (
          <button
            onClick={advance}
            disabled={updating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold text-white transition disabled:opacity-60 shrink-0"
            style={{
              background: updating
                ? "#CBD5E1"
                : "linear-gradient(135deg,#F97316,#EA580C)",
              boxShadow: updating
                ? "none"
                : "0 2px 8px rgba(249,115,22,0.3)",
            }}
          >
            {updating ? (
              <FiRefreshCw size={11} className="animate-spin" />
            ) : (
              <>
                <FiTruck size={11} />
                <span className="hidden xs:inline">
                  Mark {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                </span>
              </>
            )}
          </button>
        )}
        {!nextStatus && (
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 shrink-0">
            <FiCheck size={11} /> Done
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Delivery Card ────────────────────────────────────────────────────────────

const DeliveryCard = ({
  delivery,
  onStatusUpdate,
  onToast,
}: {
  delivery: Delivery;
  onStatusUpdate: (itemId: string, status: string) => Promise<void>;
  onToast: (msg: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const buyerName =
    delivery.buyer?.full_name || delivery.buyer?.username || "Customer";
  const address = delivery.delivery_address || "";

  // Compute the "worst" item status to represent overall delivery stage
  const dominantStatus = (() => {
    const items = delivery.order_items ?? [];
    if (items.every((i) => i.item_status === "delivered")) return "delivered";
    if (items.some((i) => i.item_status === "shipped")) return "shipped";
    if (items.some((i) => i.item_status === "confirmed")) return "confirmed";
    return delivery.order_status ?? "pending";
  })();

  const handleItemUpdate = async (itemId: string, newStatus: string) => {
    try {
      await onStatusUpdate(itemId, newStatus);
      onToast(`Item marked as ${newStatus}.`);
    } catch (err: any) {
      onToast(err.message ?? "Failed to update.");
      throw err;
    }
  };

  return (
    <div
      className="bg-white rounded-3xl border border-slate-100 overflow-hidden transition-all duration-200 hover:border-orange-200 hover:shadow-lg"
      style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.05)" }}
    >
      {/* Header */}
      <button
        className="w-full text-left px-4 sm:px-6 py-4 sm:py-5 hover:bg-orange-50/20 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Icon + order info */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg,#FFF7ED,#FEF3C7)",
              }}
            >
              <MdOutlineDeliveryDining
                size={18}
                className="text-orange-500"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-black text-slate-900">
                  #{delivery.order_number || delivery.id.slice(0, 8)}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    delivery.payment_status?.toLowerCase() === "paid"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-amber-50 text-amber-700 border border-amber-100"
                  }`}
                >
                  {delivery.payment_status ?? "—"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                  <FiUser size={11} /> {buyerName}
                </span>
                {address && (
                  <span className="flex items-center gap-1 text-xs text-slate-400 font-medium truncate max-w-[180px] sm:max-w-[220px]">
                    <FiMapPin size={11} /> {address.split(',')[0]}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                  <FiCalendar size={11} />
                  {delivery.order_date
                    ? new Date(delivery.order_date).toLocaleDateString(
                        "en-NG",
                        { day: "numeric", month: "short", year: "numeric" }
                      )
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Amount + toggle */}
          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
            <span className="text-base sm:text-lg font-black text-slate-900">
              {fmtCurrency(Number(delivery.total_amount))}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-medium">
                {delivery.order_items?.length ?? 0} item
                {(delivery.order_items?.length ?? 0) !== 1 ? "s" : ""}
              </span>
              {expanded ? (
                <FiChevronUp size={15} className="text-slate-400" />
              ) : (
                <FiChevronDown size={15} className="text-slate-400" />
              )}
            </div>
          </div>
        </div>

        {/* Pipeline */}
        <div className="mt-3 sm:mt-4 overflow-x-auto pb-1 scrollbar-hide">
          <PipelineBar current={dominantStatus} />
        </div>

        {delivery.delivery_type && (
          <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <FiTruck size={10} /> {delivery.delivery_type}
          </p>
        )}
        {delivery.order_notes && (
          <p className="mt-1 text-xs text-slate-400 italic flex items-center gap-1.5">
            <FiMapPin size={10} /> Note: {delivery.order_notes}
          </p>
        )}
      </button>

      {/* Expanded Items */}
      {expanded && (
        <div
          className="border-t border-slate-50 divide-y divide-slate-50"
          style={{ background: "#FAFBFC" }}
        >
          <div className="px-4 sm:px-5 py-2 bg-gradient-to-r from-slate-50 to-orange-50/30">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Items · Update Fulfillment Status
            </p>
          </div>
          {(delivery.order_items ?? []).map((item) => (
            <ItemFulfillRow
              key={item.id}
              item={item}
              onUpdate={onStatusUpdate}
            />
          ))}
          
          {/* Order Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 sm:px-5 py-3 bg-white">
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-400 font-semibold">
                Subtotal: {fmtCurrency(Number(delivery.subtotal || 0))}
              </span>
              <span className="text-slate-400 font-semibold">
                Fee: {fmtCurrency(Number(delivery.platform_fee || 0))}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400 font-semibold">
                Seller Credit
              </span>
              <span className="text-base font-black text-emerald-600">
                {fmtCurrency(Number(delivery.seller_credit || 0))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SellerDeliveriesPage = () => {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("active");
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 1,
  });

  const hasFetchedRef = useRef(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: any = { page: 1, per_page: 50 };
      
      // Map stage filter to order status
      if (stageFilter !== "active" && stageFilter !== "all") {
        params.order_status = stageFilter;
      }

      const res = await apiService.getSellerOrders(params);
      const body = res?.data ?? res;
      let list: Delivery[] =
        body?.orders ??
        body?.items ??
        body?.data ??
        [];

      // Map the response to match our Delivery type
      const mappedList = list.map((order: any) => ({
        ...order,
        order_items: order.order_items || order.items || [],
        order_date: order.order_date || order.created_at,
        delivery_address: order.delivery_address || "",
      }));

      // Filter active orders (not delivered or cancelled)
      if (stageFilter === "active") {
        list = mappedList.filter((d) =>
          d.order_items?.some(
            (i: OrderItem) =>
              i.item_status !== "delivered" && i.item_status !== "cancelled"
          )
        );
      } else {
        list = mappedList;
      }

      setDeliveries(list);
      setPagination({
        page: body?.page ?? 1,
        per_page: body?.per_page ?? 20,
        total: body?.total ?? list.length,
        pages: body?.pages ?? body?.total_pages ?? 1,
      });
    } catch (err: any) {
      setError(err.message ?? "Failed to load deliveries.");
    } finally {
      setLoading(false);
    }
  }, [stageFilter]);

  useEffect(() => {
    hasFetchedRef.current = false;
  }, [stageFilter]);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchDeliveries();
    }
  }, [fetchDeliveries]);

  const handleStatusUpdate = async (itemId: string, newStatus: string) => {
    await apiService.updateOrderItemStatus(itemId, newStatus);
    await fetchDeliveries();
  };

  const displayed = search.trim()
    ? deliveries.filter(
        (d) =>
          (d.order_number ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (d.buyer?.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (d.delivery_address ?? "").toLowerCase().includes(search.toLowerCase()) ||
          d.order_items?.some((i) =>
            i.product_name.toLowerCase().includes(search.toLowerCase())
          )
      )
    : deliveries;

  // Summary counts
  const counts = {
    pending: deliveries.filter((d) =>
      d.order_items?.every((i) => i.item_status === "pending")
    ).length,
    confirmed: deliveries.filter((d) =>
      d.order_items?.some((i) => i.item_status === "confirmed")
    ).length,
    shipped: deliveries.filter((d) =>
      d.order_items?.some((i) => i.item_status === "shipped")
    ).length,
    delivered: deliveries.filter((d) =>
      d.order_items?.every((i) => i.item_status === "delivered")
    ).length,
  };

  const STAGE_TABS = [
    { key: "active", label: "Active" },
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
    { key: "all", label: "All" },
  ];

  return (
    <>
      <SellerLayout
        activeNav="deliveries"
        onRefresh={fetchDeliveries}
        isLoading={loading}
        pageTitle="Deliveries"
      >
        <div className="p-4 sm:p-5 md:p-7 space-y-5 sm:space-y-6">
          {/* Luxurious Hero Banner */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #0F0A1A 0%, #1A0F1F 40%, #2D1810 100%)",
              minHeight: 120,
            }}
          >
            <div
              className="absolute -left-16 -top-16 w-64 h-64 rounded-full opacity-20"
              style={{
                background: "radial-gradient(circle, #F97316 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full opacity-15"
              style={{
                background: "radial-gradient(circle, #B42225 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8">
              <div>
                <h1 className="text-white text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                  Delivery Management
                </h1>
                <p className="text-slate-400 text-sm mt-1 font-medium">
                  Track and fulfill customer orders
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    Total Orders
                  </p>
                  <p className="text-white font-black text-xl mt-0.5">
                    {pagination.total}
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
                  <p className="text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                    Pending
                  </p>
                  <p className="text-white font-black text-xl mt-0.5">
                    {counts.pending}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                label: "Awaiting Dispatch",
                value: counts.pending,
                ...PIPELINE[0],
              },
              {
                label: "Confirmed",
                value: counts.confirmed,
                ...PIPELINE[1],
              },
              {
                label: "In Transit",
                value: counts.shipped,
                ...PIPELINE[2],
              },
              {
                label: "Delivered",
                value: counts.delivered,
                ...PIPELINE[3],
              },
            ].map(({ label, value, color, bg, icon }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-4 border border-slate-100/80 hover:border-orange-300 transition-all duration-300 hover:shadow-lg cursor-pointer"
                style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}
                onClick={() => {
                  const filterMap: Record<string, string> = {
                    "Awaiting Dispatch": "pending",
                    "Confirmed": "confirmed",
                    "In Transit": "shipped",
                    "Delivered": "delivered",
                  };
                  setStageFilter(filterMap[label] || "active");
                }}
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
                onClick={fetchDeliveries}
                className="text-xs font-bold text-red-600 flex items-center gap-1"
              >
                <FiRefreshCw size={12} /> Retry
              </button>
            </div>
          )}

          {/* Filters */}
          <div
            className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-5"
            style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
          >
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div className="relative">
                <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all placeholder-slate-400"
                  placeholder="Search by order ID, customer, product, city…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Stage tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
                {STAGE_TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setStageFilter(key)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                      stageFilter === key
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery Cards */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-36 rounded-3xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div
              className="bg-white rounded-3xl border border-slate-100 py-20 text-center"
              style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                <MdOutlineDeliveryDining size={28} className="text-slate-300" />
              </div>
              <p className="font-bold text-slate-600">No deliveries found</p>
              <p className="text-slate-400 text-sm mt-1">
                {search
                  ? "Try a different search term"
                  : stageFilter === "active"
                  ? "All orders have been fulfilled — great work!"
                  : "No deliveries match this filter"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayed.map((delivery) => (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  onStatusUpdate={handleStatusUpdate}
                  onToast={showToast}
                />
              ))}
            </div>
          )}
        </div>
      </SellerLayout>

      {/* Toast */}
      {toastMsg && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white text-sm font-semibold shadow-2xl animate-fade-in"
          style={{ background: "linear-gradient(145deg, #0F0A1A, #1A0F1F)" }}
        >
          <FiCheck size={15} className="text-emerald-400" />
          {toastMsg}
        </div>
      )}
    </>
  );
};

export default SellerDeliveriesPage;