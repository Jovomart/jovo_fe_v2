"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import apiService from "@/services/apiService";
import SellerLayout, { fmtCurrency } from "@/components/layout/SellerLayout";
import {
  FiPackage,
  FiShoppingBag,
  FiDollarSign,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiArrowUpRight,
  FiChevronRight,
  FiBarChart2,
  FiUser,
  FiTrendingUp,
  FiTruck,
  FiEye,
  FiShoppingCart,
  FiHome,
  FiSearch,
} from "react-icons/fi";
import { MdOutlineInventory2 } from "react-icons/md";
import { FaRocket } from "react-icons/fa";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardData {
  store: {
    id: string;
    business_name: string;
    short_business_description: string;
    business_image: string;
    cover_image: string;
    seller_status: string;
    store_is_active: boolean;
    member_since: string;
    average_rating: number;
    review_count: number;
    total_followers: number;
    items_sold: number;
    badges: string[];
  };
  financial_snapshot: {
    available_balance: number;
    pending_balance: number;
    total_earned: number;
    total_withdrawn: number;
    pending_withdrawals_count: number;
  };
  order_pipeline: {
    total: number;
    pending: number;
    confirmed: number;
    shipped: number;
    at_station: number;
    delivered: number;
    cancelled: number;
    refunded: number;
  };
  order_status_percentages: {
    completed_pct: number;
    pending_pct: number;
    cancelled_pct: number;
  };
  kpis: {
    fulfillment_rate: number;
    cancellation_rate: number;
    average_order_value: number;
    active_catalog_size: number;
  };
  alerts: {
    needs_attention: boolean;
    items: Array<{
      type: string;
      label: string;
      count: number;
      severity: string;
    }>;
  };
  recent_orders: Array<{
    id: string;
    order_number: string;
    order_status: string;
    seller_credit: number;
    item_count: number;
    first_item_name: string;
    first_item_image: string;
    customer_name: string;
    customer_id: string;
    order_date: string;
  }>;
  store_health: {
    profile_views_30d: number;
    new_followers_30d: number;
    total_views_30d: number;
    avg_conversion_30d: number;
  };
  sales_chart_data: Array<{
    date: string;
    revenue: number;
  }>;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Sparkline = ({
  data,
  color,
  height = 40,
}: {
  data: number[];
  color: string;
  height?: number;
}) => {
  const W = 100,
    H = height;
  if (!data || data.length < 2) return null;
  const max = Math.max(...data),
    min = Math.min(...data);
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / (max - min || 1)) * H * 0.8 - H * 0.1,
  }));
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");
  const area = `${line} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;
  const gradId = `sg-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const RevenueChart = ({
  dailyData,
}: {
  dailyData: { date: string; revenue: number }[];
}) => {
  const chartData =
    dailyData.length > 0
      ? dailyData.slice(-30)
      : Array.from({ length: 30 }, (_, i) => ({
          date: `Day ${i + 1}`,
          revenue: 0,
        }));

  const W = 700,
    H = 200,
    PAD = { t: 20, r: 20, b: 36, l: 56 };
  const innerW = W - PAD.l - PAD.r,
    innerH = H - PAD.t - PAD.b;
  const maxVal = Math.max(...chartData.map((d) => d.revenue), 1);

  const pts = chartData.map((d, i) => ({
    x: PAD.l + (i / Math.max(chartData.length - 1, 1)) * innerW,
    y: PAD.t + (1 - d.revenue / maxVal) * innerH,
  }));

  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${PAD.t + innerH} L${pts[0].x},${PAD.t + innerH} Z`;
  const gridVals = [0, 0.25, 0.5, 0.75, 1].map((r, idx) => ({
    y: PAD.t + r * innerH,
    val: Math.round((maxVal * (1 - r)) / 1000),
    idx,
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridVals.map(({ y, val, idx }) => (
        <g key={idx}>
          <line
            x1={PAD.l}
            y1={y}
            x2={W - PAD.r}
            y2={y}
            stroke="#F1F5F9"
            strokeWidth="1"
          />
          <text
            x={PAD.l - 8}
            y={y + 4}
            textAnchor="end"
            fontSize="10"
            fill="#CBD5E1"
            fontFamily="inherit"
          >
            {val}k
          </text>
        </g>
      ))}
      <path d={areaPath} fill="url(#revGrad)" />
      <path
        d={linePath}
        fill="none"
        stroke="#F97316"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {chartData.map((d, i) => {
        const showLabel = i % 5 === 0 || i === chartData.length - 1;
        if (!showLabel) return null;
        const label = d.date
          ? new Date(d.date).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
            })
          : d.date;
        return (
          <text
            key={i}
            x={pts[i].x}
            y={H - 8}
            textAnchor="middle"
            fontSize="9.5"
            fill="#94A3B8"
            fontFamily="inherit"
          >
            {label}
          </text>
        );
      })}
      {pts.length > 0 && (
        <>
          <circle
            cx={pts[pts.length - 1].x}
            cy={pts[pts.length - 1].y}
            r="5"
            fill="#F97316"
            stroke="white"
            strokeWidth="2.5"
          />
          <circle
            cx={pts[pts.length - 1].x}
            cy={pts[pts.length - 1].y}
            r="9"
            fill="#F97316"
            fillOpacity="0.15"
          />
        </>
      )}
    </svg>
  );
};

const RadialProgress = ({
  value,
  max,
  color,
  size = 80,
  label,
}: {
  value: number;
  max: number;
  color: string;
  size?: number;
  label?: string;
}) => {
  const r = size * 0.38,
    circ = 2 * Math.PI * r,
    pct = max > 0 ? value / max : 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#F1F5F9"
        strokeWidth="7"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeDasharray={`${pct * circ} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text
        x={size / 2}
        y={size / 2 + 4}
        textAnchor="middle"
        fontSize="13"
        fontWeight="800"
        fill="#0F172A"
        fontFamily="inherit"
      >
        {Math.round(pct * 100)}%
      </text>
      {label && (
        <text
          x={size / 2}
          y={size / 2 + 22}
          textAnchor="middle"
          fontSize="8"
          fontWeight="600"
          fill="#94A3B8"
          fontFamily="inherit"
        >
          {label}
        </text>
      )}
    </svg>
  );
};

const AnimBar = ({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) => {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(max > 0 ? (value / max) * 100 : 0), 300);
    return () => clearTimeout(t);
  }, [value, max]);
  return (
    <div
      className="h-1.5 rounded-full overflow-hidden"
      style={{ background: "#F1F5F9" }}
    >
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${w}%`, background: color }}
      />
    </div>
  );
};

const MetricCard = ({
  icon,
  label,
  value,
  prefix = "",
  suffix = "",
  color,
  bg,
  sparkData,
}: any) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      className={`relative bg-white rounded-2xl p-5 border border-slate-100/80 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 overflow-hidden ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ boxShadow: "0 1px 20px rgba(0,0,0,0.05)" }}
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 opacity-[0.07]"
        style={{ background: color }}
      />
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: bg }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-2xl font-black text-slate-900 leading-none">
        {prefix}
        {typeof value === "number" ? value.toLocaleString() : value}
        {suffix}
      </p>
      {sparkData && sparkData.length > 1 && (
        <div className="mt-3 h-10 -mx-1">
          <Sparkline data={sparkData} color={color} />
        </div>
      )}
    </div>
  );
};

const Badge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    pending: {
      label: "Pending",
      cls: "bg-amber-50 text-amber-700 border border-amber-100",
    },
    confirmed: {
      label: "Confirmed",
      cls: "bg-blue-50 text-blue-700 border border-blue-100",
    },
    shipped: {
      label: "Shipped",
      cls: "bg-indigo-50 text-indigo-700 border border-indigo-100",
    },
    at_station: {
      label: "At Station",
      cls: "bg-purple-50 text-purple-700 border border-purple-100",
    },
    delivered: {
      label: "Delivered",
      cls: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    },
    completed: {
      label: "Completed",
      cls: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    },
    cancelled: {
      label: "Cancelled",
      cls: "bg-red-50 text-red-600 border border-red-100",
    },
    refunded: {
      label: "Refunded",
      cls: "bg-rose-50 text-rose-600 border border-rose-100",
    },
    processing: {
      label: "Processing",
      cls: "bg-blue-50 text-blue-600 border border-blue-100",
    },
  };
  const b = map[String(status).toLowerCase()] ?? {
    label: status,
    cls: "bg-slate-50 text-slate-600 border border-slate-100",
  };
  return (
    <span
      className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${b.cls}`}
    >
      {b.label}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SellerDashboard = () => {
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentDate(
        new Date().toLocaleDateString("en-NG", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }),
      );
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Only ONE API call - getSellerDashboard
      const res = await apiService.getSellerDashboard();
      const data = res?.data ?? res;
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message ?? "Failed to load dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchDashboard();
    }
  }, [fetchDashboard]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      router.push(`/seller/orders?search=${encodeURIComponent(searchQuery.trim())}`);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <SellerLayout activeNav="dashboard" isLoading={true}>
        <div className="p-5 md:p-7 space-y-6">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-2xl animate-pulse bg-slate-100"
              />
            ))}
          </div>
          <div className="h-64 rounded-2xl animate-pulse bg-slate-100" />
          <div className="h-96 rounded-2xl animate-pulse bg-slate-100" />
        </div>
      </SellerLayout>
    );
  }

  // Show error state
  if (error && !dashboardData) {
    return (
      <SellerLayout activeNav="dashboard" isLoading={false}>
        <div className="p-5 md:p-7">
          <div className="flex items-center gap-3 rounded-2xl px-5 py-4 bg-red-50 border border-red-200">
            <FiAlertCircle size={17} className="text-red-500 shrink-0" />
            <div className="flex-1">
              <p className="text-red-700 text-sm font-black">{error}</p>
            </div>
            <button
              onClick={fetchDashboard}
              className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <FiRefreshCw size={12} /> Retry
            </button>
          </div>
        </div>
      </SellerLayout>
    );
  }

  const data = dashboardData!;
  const sparkData = data.sales_chart_data.map((d) => d.revenue);

  // Fix alert display - show count only once
  const alertItems = data.alerts.items.map(alert => ({
    ...alert,
    displayLabel: alert.label.replace(/^\d+\s+/, '')
  }));

  return (
    <SellerLayout
      activeNav="dashboard"
      onRefresh={fetchDashboard}
      isLoading={loading}
      stats={{
        totalSales: data.financial_snapshot.total_earned,
        totalOrders: data.order_pipeline.total,
        pendingOrders: data.order_pipeline.pending,
        totalProducts: data.kpis.active_catalog_size,
      }}
    >
      <div className="p-4 sm:p-5 md:p-7 space-y-5 sm:space-y-6">
        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl px-5 py-4 bg-red-50 border border-red-200">
            <FiAlertCircle size={17} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 text-sm font-black">{error}</p>
            </div>
            <button
              onClick={fetchDashboard}
              className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <FiRefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {/* Hero Banner */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #0F0A1A 0%, #1A0F1F 40%, #2D1810 100%)",
            minHeight: 160,
          }}
        >
          <div
            className="absolute -left-20 -top-20 w-80 h-80 rounded-full opacity-20"
            style={{
              background: "radial-gradient(circle, #F97316 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full opacity-15"
            style={{
              background: "radial-gradient(circle, #B42225 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04]"
            style={{
              background: "radial-gradient(circle, #F97316 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 50%, rgba(249, 115, 22, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 80% 50%, rgba(180, 34, 37, 0.06) 0%, transparent 50%)
              `,
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
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-6 sm:p-8">
            <div className="flex items-start gap-5">
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20 blur-lg" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-orange-500/30 shadow-xl shadow-orange-500/10">
                  {data.store.business_image ? (
                    <img
                      src={data.store.business_image}
                      alt={data.store.business_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                      <FiHome size={28} className="text-slate-400" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    {data.store.store_is_active ? "Active" : "Inactive"}
                  </span>
                  {data.store.badges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="text-[8px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border border-orange-500/20"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
                <h1 className="text-white text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                  {data.store.business_name}
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-1 font-medium">
                  {data.store.short_business_description ||
                    `Member since ${data.store.member_since}`}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex-1 sm:flex-none bg-white/5 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
                  <p className="text-orange-400 text-[10px] font-bold uppercase tracking-widest">
                    Revenue
                  </p>
                  <p className="text-white font-black text-lg mt-0.5">
                    {fmtCurrency(data.financial_snapshot.total_earned)}
                  </p>
                </div>
                <div className="flex-1 sm:flex-none bg-white/5 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
                  <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
                    Orders
                  </p>
                  <p className="text-white font-black text-lg mt-0.5">
                    {data.order_pipeline.total}
                  </p>
                </div>
                <div className="flex-1 sm:flex-none bg-white/5 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
                  <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                    Sold
                  </p>
                  <p className="text-white font-black text-lg mt-0.5">
                    {data.store.items_sold}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => router.push("/seller/analytics")}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <FiBarChart2 size={14} /> Analytics
                </button>
                <button
                  onClick={() => router.push("/seller/add-product")}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
                  style={{
                    background: "linear-gradient(135deg, #F97316, #EA580C, #B42225)",
                    boxShadow: "0 4px 25px rgba(249, 115, 22, 0.4)",
                  }}
                >
                  <FaRocket size={14} /> New Listing
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {data.alerts.needs_attention && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {alertItems.map((alert, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-4 border ${
                  alert.severity === "critical"
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      alert.severity === "critical"
                        ? "bg-red-100 text-red-600"
                        : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {alert.type === "pending_orders" ? (
                      <FiClock size={16} />
                    ) : (
                      <FiAlertCircle size={16} />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        alert.severity === "critical"
                          ? "text-red-700"
                          : "text-amber-700"
                      }`}
                    >
                      <span className="font-black">{alert.count}</span> {alert.displayLabel}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            icon={<FiDollarSign size={18} />}
            label="Total Revenue"
            prefix="₦"
            value={data.financial_snapshot.total_earned}
            color="#F97316"
            bg="#FFF7ED"
            sparkData={sparkData}
          />
          <MetricCard
            icon={<FiShoppingBag size={18} />}
            label="Total Orders"
            value={data.order_pipeline.total}
            color="#6366F1"
            bg="#EEF2FF"
          />
          <MetricCard
            icon={<MdOutlineInventory2 size={18} />}
            label="Live Products"
            value={data.kpis.active_catalog_size}
            color="#0EA5E9"
            bg="#F0F9FF"
          />
          <MetricCard
            icon={<FiCheckCircle size={18} />}
            label="Fulfillment Rate"
            value={data.kpis.fulfillment_rate}
            suffix="%"
            color="#10B981"
            bg="#F0FDF4"
          />
        </div>

        {/* Order Status Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: "Pending",
              val: data.order_pipeline.pending,
              color: "#F97316",
              bg: "#FFF7ED",
              border: "#FED7AA",
              icon: <FiClock size={16} />,
              desc: "Awaiting action",
            },
            {
              label: "Confirmed",
              val: data.order_pipeline.confirmed,
              color: "#3B82F6",
              bg: "#EFF6FF",
              border: "#BFDBFE",
              icon: <FiCheckCircle size={16} />,
              desc: "Ready to ship",
            },
            {
              label: "Shipped",
              val: data.order_pipeline.shipped,
              color: "#8B5CF6",
              bg: "#F5F3FF",
              border: "#DDD6FE",
              icon: <FiTruck size={16} />,
              desc: "In transit",
            },
            {
              label: "Delivered",
              val: data.order_pipeline.delivered,
              color: "#10B981",
              bg: "#F0FDF4",
              border: "#BBF7D0",
              icon: <FiCheckCircle size={16} />,
              desc: "Completed",
            },
          ].map(({ label, val, color, bg, border, icon, desc }) => (
            <div
              key={label}
              className="rounded-2xl p-3 sm:p-4 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
              style={{ background: bg, borderColor: border }}
              onClick={() => router.push("/seller/orders")}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center"
                  style={{ background: color + "20", color }}
                >
                  {icon}
                </div>
                <FiArrowUpRight size={14} style={{ color }} />
              </div>
              <p className="text-xl sm:text-3xl font-black" style={{ color }}>
                {val}
              </p>
              <p className="text-xs font-bold mt-0.5" style={{ color }}>
                {label}
              </p>
              <p
                className="text-[9px] sm:text-[10px] font-medium mt-0.5"
                style={{ color: color + "80" }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid xl:grid-cols-3 gap-4 sm:gap-5">
          {/* Revenue Chart */}
          <div
            className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 overflow-hidden"
            style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
          >
            <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3 sm:pb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Performance
              </p>
              <p className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                30-Day Sales Revenue
              </p>
              <p className="text-slate-400 text-xs font-medium mt-0.5">
                Daily breakdown
              </p>
            </div>
            <div className="px-3 sm:px-4 pb-2" style={{ height: 200 }}>
              <RevenueChart dailyData={data.sales_chart_data} />
            </div>
            <div
              className="grid grid-cols-3 gap-0"
              style={{ borderTop: "1px solid #F8FAFC" }}
            >
              {[
                {
                  label: "Total Revenue",
                  val: fmtCurrency(data.financial_snapshot.total_earned),
                },
                {
                  label: "Total Orders",
                  val: String(data.order_pipeline.total),
                },
                {
                  label: "Avg Order Value",
                  val:
                    data.order_pipeline.total > 0
                      ? fmtCurrency(
                          Math.round(
                            data.financial_snapshot.total_earned /
                              data.order_pipeline.total,
                          ),
                        )
                      : "—",
                },
              ].map(({ label, val }, i) => (
                <div
                  key={label}
                  className={`px-4 sm:px-6 py-3 sm:py-4 ${i < 2 ? "border-r border-slate-50" : ""}`}
                >
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="text-sm sm:text-base font-black text-slate-900 mt-1">
                    {val}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div
            className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6"
            style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Breakdown
            </p>
            <p className="text-lg sm:text-xl font-black text-slate-900 mt-1 mb-4 sm:mb-5">
              Order Status
            </p>
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-5 sm:mb-6">
              <div className="text-center">
                <RadialProgress
                  value={data.order_pipeline.delivered}
                  max={data.order_pipeline.total || 1}
                  color="#10B981"
                  size={80}
                  label="Delivered"
                />
              </div>
              <div className="text-center">
                <RadialProgress
                  value={
                    data.order_pipeline.pending + data.order_pipeline.confirmed
                  }
                  max={data.order_pipeline.total || 1}
                  color="#F97316"
                  size={72}
                  label="Active"
                />
              </div>
              <div className="text-center">
                <RadialProgress
                  value={data.order_pipeline.cancelled}
                  max={data.order_pipeline.total || 1}
                  color="#EF4444"
                  size={64}
                  label="Cancelled"
                />
              </div>
            </div>
            <div className="space-y-4">
              {[
                {
                  label: "Delivered",
                  val: data.order_pipeline.delivered,
                  color: "#10B981",
                },
                {
                  label: "Pending",
                  val: data.order_pipeline.pending,
                  color: "#F97316",
                },
                {
                  label: "Confirmed",
                  val: data.order_pipeline.confirmed,
                  color: "#3B82F6",
                },
                {
                  label: "Cancelled",
                  val: data.order_pipeline.cancelled,
                  color: "#EF4444",
                },
              ].map(({ label, val, color }) => (
                <div key={label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ background: color }}
                      />
                      {label}
                    </span>
                    <span className="text-xs font-black text-slate-800">
                      {val}{" "}
                      <span className="text-slate-400 font-normal">
                        (
                        {data.order_pipeline.total > 0
                          ? Math.round((val / data.order_pipeline.total) * 100)
                          : 0}
                        %)
                      </span>
                    </span>
                  </div>
                  <AnimBar
                    value={val}
                    max={data.order_pipeline.total || 1}
                    color={color}
                  />
                </div>
              ))}
            </div>
            <div
              className="mt-5 pt-4 flex items-center justify-between"
              style={{ borderTop: "1px solid #F8FAFC" }}
            >
              <span className="text-xs font-semibold text-slate-400">
                Total orders
              </span>
              <span className="text-lg font-black text-slate-900">
                {data.order_pipeline.total}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div
          className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
        >
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5"
            style={{ borderBottom: "1px solid #F8FAFC" }}
          >
            <div>
              <p className="font-black text-slate-900 text-sm sm:text-base">
                Recent Orders
              </p>
              <p className="text-slate-400 text-xs font-medium mt-0.5">
                Latest {data.recent_orders.length} incoming orders
              </p>
            </div>
            
            <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-48 pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all bg-slate-50 hover:bg-white"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg transition-all disabled:opacity-50"
              >
                {searching ? "..." : "Search"}
              </button>
              <button
                onClick={() => router.push("/seller/orders")}
                className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-orange-50 transition whitespace-nowrap"
              >
                View all <FiChevronRight size={12} />
              </button>
            </form>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden divide-y divide-slate-50">
            {data.recent_orders.length > 0 ? (
              data.recent_orders.map((order, idx) => (
                <div
                  key={idx}
                  className="px-4 py-4 hover:bg-orange-50/30 transition-colors cursor-pointer"
                  onClick={() => router.push("/seller/orders")}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                        <FiPackage size={14} className="text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">
                          #{String(order.order_number).slice(0, 10)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {order.first_item_name}
                        </p>
                      </div>
                    </div>
                    <Badge status={order.order_status} />
                  </div>
                  <div className="flex items-center justify-between mt-2 pl-10">
                    <div>
                      <p className="text-xs text-slate-500">
                        {order.customer_name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(order.order_date).toLocaleDateString(
                          "en-NG",
                          {
                            day: "numeric",
                            month: "short",
                          },
                        )}
                      </p>
                    </div>
                    <p className="text-sm font-black text-slate-900">
                      ₦{order.seller_credit.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                  <FiShoppingBag size={22} className="text-slate-300" />
                </div>
                <p className="font-bold text-slate-600">No orders yet</p>
                <p className="text-slate-400 text-sm mt-1">
                  List a product to start selling
                </p>
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto scrollbar-hide">
            <div className="min-w-[768px]">
              <div
                className="grid grid-cols-6 gap-3 px-6 py-3"
                style={{ background: "#F8FAFC" }}
              >
                {[
                  "Order ID",
                  "Product",
                  "Customer",
                  "Amount",
                  "Status",
                  "Date",
                ].map((h) => (
                  <p
                    key={h}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                  >
                    {h}
                  </p>
                ))}
              </div>
              {data.recent_orders.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {data.recent_orders.map((order, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-6 gap-3 px-6 py-4 items-center hover:bg-orange-50/30 transition-colors cursor-pointer"
                      onClick={() => router.push("/seller/orders")}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                          <FiPackage size={12} className="text-orange-400" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">
                          #{String(order.order_number).slice(0, 8)}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {order.first_item_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {order.customer_name}
                      </p>
                      <p className="text-xs font-black text-slate-900">
                        ₦{order.seller_credit.toLocaleString()}
                      </p>
                      <Badge status={order.order_status} />
                      <p className="text-[10px] text-slate-400 font-medium">
                        {new Date(order.order_date).toLocaleDateString(
                          "en-NG",
                          {
                            day: "numeric",
                            month: "short",
                          },
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                    <FiShoppingBag size={22} className="text-slate-300" />
                  </div>
                  <p className="font-bold text-slate-600">No orders yet</p>
                  <p className="text-slate-400 text-sm mt-1">
                    List a product to start selling
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Store Health Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              icon: <FiEye size={16} />,
              label: "Profile Views",
              value: data.store_health.profile_views_30d,
              color: "#6366F1",
              bg: "#EEF2FF",
            },
            {
              icon: <FiUser size={16} />,
              label: "New Followers",
              value: data.store_health.new_followers_30d,
              color: "#8B5CF6",
              bg: "#F5F3FF",
            },
            {
              icon: <FiShoppingCart size={16} />,
              label: "Total Views",
              value: data.store_health.total_views_30d,
              color: "#F97316",
              bg: "#FFF7ED",
            },
            {
              icon: <FiTrendingUp size={16} />,
              label: "Conversion",
              value: data.store_health.avg_conversion_30d,
              suffix: "%",
              color: "#10B981",
              bg: "#F0FDF4",
            },
          ].map(({ icon, label, value, suffix, color, bg }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-4 border border-slate-100/80 transition-all duration-300 hover:shadow-lg"
              style={{ boxShadow: "0 1px 20px rgba(0,0,0,0.05)" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center"
                  style={{ background: bg }}
                >
                  <span style={{ color }}>{icon}</span>
                </div>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                {label}
              </p>
              <p className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                {typeof value === "number" ? value.toLocaleString() : value}
                {suffix}
              </p>
            </div>
          ))}
        </div>

        {/* Tip Banner */}
        <div
          className="rounded-3xl overflow-hidden relative"
          style={{
            background: "linear-gradient(145deg, #0F0A1A 0%, #1A0F1F 40%, #2D1810 100%)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div
            className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(249,115,22,0.25) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -left-10 -top-10 w-40 h-40 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(180,34,37,0.15) 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 px-6 sm:px-8 py-6 sm:py-7">
            <div className="flex items-start gap-4 sm:gap-5">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl sm:text-2xl"
                style={{
                  background: "rgba(249,115,22,0.15)",
                  border: "1px solid rgba(249,115,22,0.2)",
                }}
              >
                <span className="text-orange-400">💡</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-4 bg-gradient-to-b from-orange-400 to-red-500 rounded-full" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-400/80">
                    Pro Seller Tip
                  </p>
                </div>
                <p className="text-white font-black text-base sm:text-lg mb-1">
                  Better photos = 5× more views
                </p>
                <p className="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed">
                  Products with 3+ clear, well-lit images get dramatically more
                  clicks. Shoot in natural light with a neutral background.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/seller/add-product")}
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2.5 px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-black text-white transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #F97316, #EA580C, #B42225)",
                boxShadow: "0 4px 25px rgba(249, 115, 22, 0.4)",
              }}
            >
              <FaRocket size={13} /> List a Product
            </button>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerDashboard;