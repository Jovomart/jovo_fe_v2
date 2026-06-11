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
} from "react-icons/fi";
import { MdOutlineInventory2 } from "react-icons/md";
import { FaRocket } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Order {
  id: string;
  product: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
}

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  fulfillmentRate: number;
  recentOrders: Order[];
  dailySalesData: { date: string; amount: number }[];
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
  dailyData: { date: string; amount: number }[];
}) => {
  const chartData =
    dailyData.length > 0
      ? dailyData.slice(-30)
      : Array.from({ length: 30 }, (_, i) => ({
          date: `Day ${i + 1}`,
          amount: 0,
        }));

  const W = 700,
    H = 200,
    PAD = { t: 20, r: 20, b: 36, l: 56 };
  const innerW = W - PAD.l - PAD.r,
    innerH = H - PAD.t - PAD.b;
  const maxVal = Math.max(...chartData.map((d) => d.amount), 1);

  const pts = chartData.map((d, i) => ({
    x: PAD.l + (i / Math.max(chartData.length - 1, 1)) * innerW,
    y: PAD.t + (1 - d.amount / maxVal) * innerH,
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
}: {
  value: number;
  max: number;
  color: string;
  size?: number;
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
    processing: {
      label: "Processing",
      cls: "bg-blue-50 text-blue-600 border border-blue-100",
    },
    shipped: {
      label: "Shipped",
      cls: "bg-indigo-50 text-indigo-600 border border-indigo-100",
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

  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    fulfillmentRate: 0,
    recentOrders: [],
    dailySalesData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentDate(
        new Date().toLocaleDateString("en-NG", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      );
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Single endpoint powers the entire dashboard
      const res = await apiService.getSellerDashboard(); // GET /seller/dashboard

      // The response may be wrapped in a `data` key or returned directly
      const d = res?.data ?? res;

      // ── Financial snapshot ──────────────────────────────────────────────────
      const totalSales = Number(
        d?.total_earnings ??
          d?.financial_snapshot?.total_earnings ??
          d?.total_revenue ??
          d?.earnings ??
          0
      );

      // ── Orders ──────────────────────────────────────────────────────────────
      const totalOrders = Number(
        d?.total_orders ??
          d?.order_pipeline?.total_orders ??
          d?.order_count ??
          0
      );
      const pendingOrders = Number(
        d?.pending_orders ??
          d?.order_pipeline?.pending_orders ??
          d?.pending_count ??
          0
      );
      const completedOrders = Number(
        d?.completed_orders ??
          d?.order_pipeline?.completed_orders ??
          d?.fulfilled_orders ??
          d?.completed_count ??
          0
      );
      const cancelledOrders = Number(
        d?.cancelled_orders ??
          d?.order_pipeline?.cancelled_orders ??
          d?.cancelled_count ??
          0
      );

      // ── KPIs ────────────────────────────────────────────────────────────────
      const fulfillmentRate = Number(
        d?.fulfillment_rate ??
          d?.kpis?.fulfillment_rate ??
          d?.fulfillment_percentage ??
          0
      );

      // ── Catalog size ────────────────────────────────────────────────────────
      const totalProducts = Number(
        d?.catalog_size ??
          d?.total_products ??
          d?.store_identity?.total_listings ??
          d?.kpis?.catalog_size ??
          0
      );

      // ── Daily sales (30-day brand health) ───────────────────────────────────
      const rawDailySales: any[] =
        d?.daily_sales ??
        d?.brand_health?.daily_sales ??
        d?.sales_data ??
        d?.daily_revenue ??
        [];
      const dailySalesData = rawDailySales.map((item: any) => ({
        date: item.date ?? item.day ?? "",
        amount: Number(item.amount ?? item.revenue ?? item.total ?? 0),
      }));

      // ── Recent orders (last 5) ───────────────────────────────────────────────
      const ordersList: any[] =
        d?.recent_orders ??
        d?.last_orders ??
        d?.orders ??
        [];

      const recentOrders: Order[] = ordersList.slice(0, 5).map((o: any) => ({
        id: o.order_number ?? o.id ?? "—",
        product:
          o.items?.[0]?.product_name ??
          o.product_name ??
          o.first_product ??
          "—",
        customer:
          o.buyer?.full_name ??
          o.buyer?.username ??
          o.customer_name ??
          o.customer ??
          "—",
        amount: Number(o.total_amount ?? o.amount ?? 0),
        status: o.order_status ?? o.status ?? "pending",
        date: o.created_at
          ? new Date(o.created_at).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
            })
          : "—",
      }));

      setStats({
        totalSales,
        totalOrders,
        totalProducts,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        fulfillmentRate,
        recentOrders,
        dailySalesData,
      });
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

  const sparkData = stats.dailySalesData.map((d) => d.amount);

  return (
    <SellerLayout
      activeNav="dashboard"
      onRefresh={fetchDashboard}
      isLoading={loading}
      stats={{
        totalSales: stats.totalSales,
        totalOrders: stats.totalOrders,
        pendingOrders: stats.pendingOrders,
        totalProducts: stats.totalProducts,
      }}
    >
      <div className="p-5 md:p-7 space-y-6">
        {/* Error */}
        {error && !loading && (
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
            background:
              "linear-gradient(135deg,#0F172A 0%,#1E293B 40%,#0F172A 100%)",
            minHeight: 140,
          }}
        >
          <div
            className="absolute -left-16 -top-16 w-64 h-64 rounded-full opacity-30"
            style={{
              background: "radial-gradient(circle,#F97316 0%,transparent 70%)",
            }}
          />
          <div
            className="absolute right-0 bottom-0 w-72 h-72 rounded-full opacity-20"
            style={{
              background: "radial-gradient(circle,#F97316 0%,transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle,rgba(255,255,255,0.06) 1px,transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-7">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />{" "}
                  Store Active
                </span>
              </div>
              <h1
                className="text-white text-2xl font-black leading-tight"
                suppressHydrationWarning
              >
                {currentDate || "Your Dashboard"}
              </h1>
              <p className="text-slate-400 text-sm mt-1.5 font-medium">
                {loading
                  ? "Loading your store data…"
                  : `You have ${stats.pendingOrders} pending order${
                      stats.pendingOrders !== 1 ? "s" : ""
                    } waiting for action`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="flex flex-col items-center px-5 py-3 rounded-2xl"
                style={{
                  background: "rgba(249,115,22,0.12)",
                  border: "1px solid rgba(249,115,22,0.2)",
                }}
              >
                <span className="text-orange-400 text-[10px] font-bold uppercase tracking-widest">
                  Revenue
                </span>
                <span className="text-white font-black text-lg mt-0.5">
                  {loading ? "…" : fmtCurrency(stats.totalSales)}
                </span>
              </div>
              <div
                className="flex flex-col items-center px-5 py-3 rounded-2xl"
                style={{
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.2)",
                }}
              >
                <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
                  Orders
                </span>
                <span className="text-white font-black text-lg mt-0.5">
                  {loading ? "…" : stats.totalOrders}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => router.push("/seller/analytics")}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white border border-white/20 hover:bg-white/10 transition"
                >
                  <FiBarChart2 size={13} /> Analytics
                </button>
                <button
                  onClick={() => router.push("/seller/add-product")}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg,#F97316,#EA580C)",
                    boxShadow: "0 4px 20px rgba(249,115,22,0.4)",
                  }}
                >
                  <FaRocket size={13} /> New Listing
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        {loading ? (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-2xl animate-pulse bg-slate-100"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard
              icon={<FiDollarSign size={18} />}
              label="Total Revenue"
              prefix="₦"
              value={stats.totalSales}
              color="#F97316"
              bg="#FFF7ED"
              sparkData={sparkData}
            />
            <MetricCard
              icon={<FiShoppingBag size={18} />}
              label="Total Orders"
              value={stats.totalOrders}
              color="#6366F1"
              bg="#EEF2FF"
            />
            <MetricCard
              icon={<MdOutlineInventory2 size={18} />}
              label="Live Products"
              value={stats.totalProducts}
              color="#0EA5E9"
              bg="#F0F9FF"
            />
            <MetricCard
              icon={<FiCheckCircle size={18} />}
              label="Fulfillment Rate"
              value={stats.fulfillmentRate}
              suffix="%"
              color="#10B981"
              bg="#F0FDF4"
            />
          </div>
        )}

        {/* Order Status Pills */}
        {!loading && (
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Pending",
                val: stats.pendingOrders,
                color: "#F97316",
                bg: "#FFF7ED",
                border: "#FED7AA",
                icon: <FiClock size={16} />,
                desc: "Awaiting action",
              },
              {
                label: "Completed",
                val: stats.completedOrders,
                color: "#10B981",
                bg: "#F0FDF4",
                border: "#BBF7D0",
                icon: <FiCheckCircle size={16} />,
                desc: "Successfully done",
              },
              {
                label: "Cancelled",
                val: stats.cancelledOrders,
                color: "#EF4444",
                bg: "#FEF2F2",
                border: "#FECACA",
                icon: <FiAlertCircle size={16} />,
                desc: "Needs follow-up",
              },
            ].map(({ label, val, color, bg, border, icon, desc }) => (
              <div
                key={label}
                className="rounded-2xl p-4 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                style={{ background: bg, borderColor: border }}
                onClick={() => router.push("/seller/orders")}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: color + "20", color }}
                  >
                    {icon}
                  </div>
                  <FiArrowUpRight size={14} style={{ color }} />
                </div>
                <p className="text-3xl font-black" style={{ color }}>
                  {val}
                </p>
                <p className="text-xs font-bold mt-0.5" style={{ color }}>
                  {label}
                </p>
                <p
                  className="text-[10px] font-medium mt-0.5"
                  style={{ color: color + "80" }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Charts Row */}
        <div className="grid xl:grid-cols-3 gap-5">
          {/* Revenue Chart */}
          <div
            className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 overflow-hidden"
            style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
          >
            <div className="px-6 pt-6 pb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Performance
              </p>
              <p className="text-xl font-black text-slate-900 mt-1">
                30-Day Sales Revenue
              </p>
              <p className="text-slate-400 text-xs font-medium mt-0.5">
                Daily breakdown
              </p>
            </div>
            <div className="px-4 pb-2" style={{ height: 220 }}>
              <RevenueChart dailyData={stats.dailySalesData} />
            </div>
            <div
              className="grid grid-cols-3 gap-0"
              style={{ borderTop: "1px solid #F8FAFC" }}
            >
              {[
                { label: "Total Revenue", val: fmtCurrency(stats.totalSales) },
                { label: "Total Orders", val: String(stats.totalOrders) },
                {
                  label: "Avg Order Value",
                  val:
                    stats.totalOrders > 0
                      ? fmtCurrency(
                          Math.round(stats.totalSales / stats.totalOrders)
                        )
                      : "—",
                },
              ].map(({ label, val }, i) => (
                <div
                  key={label}
                  className={`px-6 py-4 ${i < 2 ? "border-r border-slate-50" : ""}`}
                >
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="text-base font-black text-slate-900 mt-1">
                    {loading ? "…" : val}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div
            className="bg-white rounded-3xl border border-slate-100 p-6"
            style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Breakdown
            </p>
            <p className="text-xl font-black text-slate-900 mt-1 mb-5">
              Order Status
            </p>
            {!loading ? (
              <>
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="text-center">
                    <RadialProgress
                      value={stats.completedOrders}
                      max={stats.totalOrders || 1}
                      color="#10B981"
                      size={88}
                    />
                    <p className="text-[10px] font-bold text-emerald-600 mt-1">
                      Done
                    </p>
                  </div>
                  <div className="text-center">
                    <RadialProgress
                      value={stats.pendingOrders}
                      max={stats.totalOrders || 1}
                      color="#F97316"
                      size={72}
                    />
                    <p className="text-[10px] font-bold text-orange-500 mt-1">
                      Pending
                    </p>
                  </div>
                  <div className="text-center">
                    <RadialProgress
                      value={stats.cancelledOrders}
                      max={stats.totalOrders || 1}
                      color="#EF4444"
                      size={60}
                    />
                    <p className="text-[10px] font-bold text-red-500 mt-1">
                      Cancelled
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      label: "Completed",
                      val: stats.completedOrders,
                      color: "#10B981",
                    },
                    {
                      label: "Pending",
                      val: stats.pendingOrders,
                      color: "#F97316",
                    },
                    {
                      label: "Cancelled",
                      val: stats.cancelledOrders,
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
                            {stats.totalOrders > 0
                              ? Math.round((val / stats.totalOrders) * 100)
                              : 0}
                            %)
                          </span>
                        </span>
                      </div>
                      <AnimBar
                        value={val}
                        max={stats.totalOrders || 1}
                        color={color}
                      />
                    </div>
                  ))}
                </div>
                <div
                  className="mt-5 pt-4"
                  style={{ borderTop: "1px solid #F8FAFC" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500">
                      Fulfillment Rate
                    </span>
                    <span className="text-sm font-black text-emerald-600">
                      {stats.fulfillmentRate}%
                    </span>
                  </div>
                  <AnimBar
                    value={stats.fulfillmentRate}
                    max={100}
                    color="#10B981"
                  />
                </div>
                <div
                  className="mt-4 pt-3 flex items-center justify-between"
                  style={{ borderTop: "1px solid #F8FAFC" }}
                >
                  <span className="text-xs font-semibold text-slate-400">
                    Total orders
                  </span>
                  <span className="text-lg font-black text-slate-900">
                    {stats.totalOrders}
                  </span>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-8 rounded-lg bg-slate-100 animate-pulse"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div
          className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
        >
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5"
            style={{ borderBottom: "1px solid #F8FAFC" }}
          >
            <div>
              <p className="font-black text-slate-900 text-sm sm:text-base">
                Recent Orders
              </p>
              <p className="text-slate-400 text-xs font-medium mt-0.5">
                Latest 5 incoming orders
              </p>
            </div>
            <button
              onClick={() => router.push("/seller/orders")}
              className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-orange-50 transition"
            >
              View all <FiChevronRight size={12} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
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
              {loading ? (
                <div className="divide-y divide-slate-50">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="grid grid-cols-6 gap-3 px-6 py-4">
                      {[...Array(6)].map((_, j) => (
                        <div
                          key={j}
                          className="h-3 rounded bg-slate-100 animate-pulse"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              ) : stats.recentOrders.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {stats.recentOrders.map((order, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-6 gap-3 px-6 py-4 items-center hover:bg-orange-50/30 transition-colors cursor-pointer"
                      onClick={() => router.push("/seller/orders")}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                          <FiPackage size={12} className="text-orange-400" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">
                          {String(order.id).slice(0, 8)}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {order.product}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {order.customer}
                      </p>
                      <p className="text-xs font-black text-slate-900">
                        ₦{order.amount.toLocaleString()}
                      </p>
                      <Badge status={order.status} />
                      <p className="text-[10px] text-slate-400 font-medium">
                        {order.date}
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

        {/* Tip Banner */}
        <div
          className="rounded-3xl overflow-hidden relative"
          style={{
            background:
              "linear-gradient(135deg,#0F172A 0%,#1C1917 60%,#1C0A00 100%)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div
            className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full"
            style={{
              background:
                "radial-gradient(circle,rgba(249,115,22,0.25) 0%,transparent 70%)",
            }}
          />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 px-8 py-7">
            <div className="flex items-start gap-5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl"
                style={{
                  background: "rgba(249,115,22,0.15)",
                  border: "1px solid rgba(249,115,22,0.2)",
                }}
              >
                💡
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <HiSparkles size={11} className="text-orange-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-400/70">
                    Pro Seller Tip
                  </p>
                </div>
                <p className="text-white font-black text-lg mb-1">
                  Better photos = 5× more views
                </p>
                <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                  Products with 3+ clear, well-lit images get dramatically more
                  clicks. Shoot in natural light with a neutral background.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/seller/add-product")}
              className="shrink-0 flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-black text-white transition hover:opacity-90"
              style={{
                background: "linear-gradient(135deg,#F97316,#EA580C)",
                boxShadow: "0 4px 20px rgba(249,115,22,0.4)",
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