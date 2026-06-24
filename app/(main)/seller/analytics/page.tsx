"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import apiService from "@/services/apiService";
import SellerLayout, { fmtCurrency } from "@/components/layout/SellerLayout";
import Image from "next/image";
import {
  FiAlertCircle,
  FiRefreshCw,
  FiTrendingUp,
  FiEye,
  FiShoppingCart,
  FiPackage,
  FiBarChart2,
  FiArrowUpRight,
  FiArrowDownRight,
  FiSearch,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiZap,
  FiUsers,
  FiStar,
} from "react-icons/fi";
import {
  MdOutlineInventory2,
  MdOutlineTrendingUp,
  MdAnalytics,
} from "react-icons/md";
import { FaChartLine } from "react-icons/fa";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductAnalytic {
  product_id: string;
  product_name: string;
  product_images: string[];
  current_price: number;
  in_stock: boolean;
  stock_quantity: number;
  views_count_30d: number;
  cart_adds_count_30d: number;
  sold_count_30d: number;
  revenue_30d: number;
  conversion_rate_30d: number;
}

interface DashboardData {
  store: {
    business_name: string;
    business_image: string;
    items_sold: number;
    average_rating: number;
    review_count: number;
    total_followers: number;
  };
  financial_snapshot: {
    available_balance: number;
    pending_balance: number;
    total_earned: number;
    total_withdrawn: number;
  };
  order_pipeline: {
    total: number;
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  kpis: {
    fulfillment_rate: number;
    cancellation_rate: number;
    average_order_value: number;
    active_catalog_size: number;
  };
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

interface ProductTotals {
  total_views_30d: number;
  total_cart_adds_30d: number;
  total_units_sold_30d: number;
  total_revenue_30d: number;
  avg_conversion_rate_30d: number;
  product_count: number;
}

// ─── Chart Components ─────────────────────────────────────────────────────────

const RevenueChart = ({
  data,
  height = 200,
}: {
  data: { date: string; revenue: number }[];
  height?: number;
}) => {
  const chartData = data.length > 0 ? data.slice(-30) : [];
  const hasData = chartData.some(d => d.revenue > 0);
  
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-slate-400">
        <FiBarChart2 size={32} className="mb-2 opacity-30" />
        <p className="text-sm font-medium">No revenue data yet</p>
        <p className="text-xs">Sales will appear here once orders are completed</p>
      </div>
    );
  }

  const W = 700,
    H = height,
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
  
  const gridVals = [0, 0.25, 0.5, 0.75, 1].map((r) => ({
    y: PAD.t + r * innerH,
    val: Math.round((maxVal * (1 - r)) / 1000),
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="revGlow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#EA580C" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#B42225" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Grid lines */}
      {gridVals.map(({ y, val }) => (
        <g key={val}>
          <line
            x1={PAD.l}
            y1={y}
            x2={W - PAD.r}
            y2={y}
            stroke="#F1F5F9"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text
            x={PAD.l - 8}
            y={y + 4}
            textAnchor="end"
            fontSize="9"
            fill="#CBD5E1"
            fontFamily="inherit"
          >
            {val > 0 ? `${val}k` : '0'}
          </text>
        </g>
      ))}
      
      {/* Area fill */}
      <path d={areaPath} fill="url(#revGrad)" />
      
      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="#F97316"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Glow behind line */}
      <path
        d={linePath}
        fill="none"
        stroke="url(#revGlow)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
      />
      
      {/* Data points */}
      {pts.map((p, i) => {
        const showLabel = i % 5 === 0 || i === chartData.length - 1;
        const label = chartData[i].date
          ? new Date(chartData[i].date).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
            })
          : "";
        return (
          <g key={i}>
            {showLabel && (
              <text
                x={p.x}
                y={H - 8}
                textAnchor="middle"
                fontSize="9"
                fill="#94A3B8"
                fontFamily="inherit"
              >
                {label}
              </text>
            )}
            {i === chartData.length - 1 && (
              <>
                <circle cx={p.x} cy={p.y} r="5" fill="#F97316" stroke="white" strokeWidth="2.5" />
                <circle cx={p.x} cy={p.y} r="10" fill="#F97316" fillOpacity="0.12" />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
};

const MetricCard = ({
  icon,
  label,
  value,
  color,
  bg,
  prefix = "",
  suffix = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  bg: string;
  prefix?: string;
  suffix?: string;
}) => {
  return (
    <div
      className="relative bg-white rounded-2xl p-5 border border-slate-100/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
      style={{ boxShadow: "0 1px 20px rgba(0,0,0,0.04)" }}
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 opacity-[0.06]"
        style={{ background: color }}
      />
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: bg, color }}
        >
          {icon}
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
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SellerAnalyticsPage = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [products, setProducts] = useState<ProductAnalytic[]>([]);
  const [productTotals, setProductTotals] = useState<ProductTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"views" | "carts" | "sold" | "conversion" | "revenue">("views");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [itemsSoldTotal, setItemsSoldTotal] = useState(0);

  const hasFetchedRef = useRef(false);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch dashboard data
      const dashRes = await apiService.getSellerDashboard();
      const dash = dashRes?.data ?? dashRes;
      setDashboardData(dash);
      
      // Get items sold from store data
      if (dash?.store?.items_sold !== undefined) {
        setItemsSoldTotal(dash.store.items_sold);
      }

      // Fetch product analytics
      const productsRes = await apiService.getSellerProductAnalytics();
      const productsData = productsRes?.data ?? productsRes;
      
      const list: ProductAnalytic[] = productsData?.products ?? [];
      setProducts(list);
      
      if (productsData?.totals) {
        setProductTotals(productsData.totals);
      } else {
        // Calculate totals from products
        const totals = list.reduce(
          (acc, p) => ({
            total_views_30d: acc.total_views_30d + (p.views_count_30d || 0),
            total_cart_adds_30d: acc.total_cart_adds_30d + (p.cart_adds_count_30d || 0),
            total_units_sold_30d: acc.total_units_sold_30d + (p.sold_count_30d || 0),
            total_revenue_30d: acc.total_revenue_30d + (p.revenue_30d || 0),
            avg_conversion_rate_30d: 0,
            product_count: list.length,
          }),
          {
            total_views_30d: 0,
            total_cart_adds_30d: 0,
            total_units_sold_30d: 0,
            total_revenue_30d: 0,
            avg_conversion_rate_30d: 0,
            product_count: 0,
          }
        );
        totals.avg_conversion_rate_30d = list.length > 0 
          ? list.reduce((acc, p) => acc + (p.conversion_rate_30d || 0), 0) / list.length 
          : 0;
        setProductTotals(totals);
      }
    } catch (err: any) {
      setError(err.message ?? "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchAnalytics();
    }
  }, [fetchAnalytics]);

  // Sort and filter products
  const displayed = products
    .filter((p) =>
      p.product_name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const map = {
        views: "views_count_30d",
        carts: "cart_adds_count_30d",
        sold: "sold_count_30d",
        conversion: "conversion_rate_30d",
        revenue: "revenue_30d",
      };
      const key = map[sortBy] as keyof ProductAnalytic;
      const va = Number(a[key] ?? 0);
      const vb = Number(b[key] ?? 0);
      return sortDir === "desc" ? vb - va : va - vb;
    });

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) =>
    sortBy === col ? (
      sortDir === "desc" ? (
        <FiArrowDownRight size={11} />
      ) : (
        <FiArrowUpRight size={11} />
      )
    ) : null;

  const totalRevenue = dashboardData?.financial_snapshot?.total_earned || 0;
  const totalOrders = dashboardData?.order_pipeline?.total || 0;
  const pendingOrders = dashboardData?.order_pipeline?.pending || 0;
  const fulfillmentRate = dashboardData?.kpis?.fulfillment_rate || 0;
  const catalogSize = dashboardData?.kpis?.active_catalog_size || 0;
  const totalViews = dashboardData?.store_health?.total_views_30d || 0;
  const conversionRate = dashboardData?.store_health?.avg_conversion_30d || 0;

  return (
    <SellerLayout
      activeNav="analytics"
      onRefresh={fetchAnalytics}
      isLoading={loading}
      pageTitle="Analytics"
    >
      <div className="p-4 sm:p-5 md:p-7 space-y-5 sm:space-y-6">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl px-5 py-4 bg-red-50 border border-red-200">
            <FiAlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-red-700 text-sm font-semibold flex-1">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="text-xs font-bold text-red-600 flex items-center gap-1"
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
            minHeight: 140,
          }}
        >
          <div
            className="absolute -left-20 -top-20 w-80 h-80 rounded-full opacity-20"
            style={{
              background: "radial-gradient(circle, #F97316 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full opacity-15"
            style={{
              background: "radial-gradient(circle, #B42225 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 50%, rgba(249, 115, 22, 0.06) 0%, transparent 50%),
                radial-gradient(circle at 80% 50%, rgba(180, 34, 37, 0.04) 0%, transparent 50%)
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

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                  <MdAnalytics size={12} />
                  Analytics Overview
                </div>
              </div>
              <h1 className="text-white text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                Performance Insights
              </h1>
              <p className="text-slate-400 text-sm mt-1 font-medium">
                Track your store's growth and product performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  Revenue
                </p>
                <p className="text-white font-black text-xl mt-0.5">
                  {fmtCurrency(totalRevenue)}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  Orders
                </p>
                <p className="text-white font-black text-xl mt-0.5">
                  {totalOrders}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex items-center justify-end">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
          >
            <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh Data
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            icon={<FiEye size={18} />}
            label="Total Views (30d)"
            value={totalViews}
            color="#6366F1"
            bg="#EEF2FF"
          />
          <MetricCard
            icon={<FiShoppingCart size={18} />}
            label="Conversion Rate"
            value={conversionRate}
            suffix="%"
            color="#F97316"
            bg="#FFF7ED"
          />
          <MetricCard
            icon={<FiPackage size={18} />}
            label="Items Sold"
            value={itemsSoldTotal}
            color="#10B981"
            bg="#F0FDF4"
          />
          <MetricCard
            icon={<FiTrendingUp size={18} />}
            label="Fulfillment Rate"
            value={fulfillmentRate}
            suffix="%"
            color="#0EA5E9"
            bg="#F0F9FF"
          />
        </div>

        {/* Revenue Chart */}
        <div
          className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
        >
          <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FaChartLine size={14} className="text-orange-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Revenue Trend
                  </p>
                </div>
                <p className="text-lg sm:text-xl font-black text-slate-900">
                  {fmtCurrency(totalRevenue)}
                </p>
                <p className="text-slate-400 text-xs font-medium mt-0.5">
                  Last 30 days • {loading ? "Loading..." : `${productTotals?.product_count || 0} products`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span className="text-[10px] text-slate-400 font-medium">Revenue</span>
                </div>
              </div>
            </div>
          </div>
          <div className="px-3 sm:px-4 pb-4" style={{ height: 220 }}>
            <RevenueChart data={dashboardData?.sales_chart_data || []} />
          </div>
        </div>

        {/* Product Performance Table */}
        <div
          className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <MdOutlineInventory2 size={16} className="text-orange-500" />
                <p className="font-black text-slate-900 text-sm sm:text-base">
                  Product Performance
                </p>
              </div>
              <p className="text-slate-400 text-xs font-medium mt-0.5">
                {products.length} products tracked • Last 30 days
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all placeholder-slate-400"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Column Headers - Desktop */}
          <div className="hidden sm:grid grid-cols-7 gap-3 px-6 py-3 bg-slate-50/80 border-b border-slate-100">
            <div className="col-span-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Product
              </p>
            </div>
            {[
              { key: "views", label: "Views" },
              { key: "carts", label: "Cart Adds" },
              { key: "sold", label: "Sold" },
              { key: "conversion", label: "Conversion" },
              { key: "revenue", label: "Revenue" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleSort(key as typeof sortBy)}
                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition text-left"
              >
                {label} <SortIcon col={key as typeof sortBy} />
              </button>
            ))}
          </div>

          {/* Product Rows */}
          <div className="divide-y divide-slate-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="px-4 sm:px-6 py-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100" />
                    <div className="flex-1">
                      <div className="h-3 bg-slate-100 rounded w-2/3 mb-2" />
                      <div className="h-2 bg-slate-100 rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))
            ) : displayed.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                  <FiPackage size={24} className="text-slate-300" />
                </div>
                <p className="font-bold text-slate-600">No products found</p>
                <p className="text-slate-400 text-sm mt-1">
                  {search ? "Try a different search term" : "Products will appear here once you start selling"}
                </p>
              </div>
            ) : (
              displayed.map((p) => {
                const maxViews = Math.max(...displayed.map(x => x.views_count_30d || 0), 1);
                const viewsPercent = Math.min((p.views_count_30d / maxViews) * 100, 100);
                
                return (
                  <div
                    key={p.product_id}
                    className="flex flex-col sm:grid sm:grid-cols-7 gap-2 sm:gap-3 px-4 sm:px-6 py-4 hover:bg-orange-50/20 transition-colors"
                  >
                    {/* Product */}
                    <div className="col-span-2 flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center relative">
                        {p.product_images?.[0] ? (
                          <Image
                            src={p.product_images[0]}
                            alt={p.product_name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <FiPackage size={16} className="text-slate-300" />
                        )}
                        {!p.in_stock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">OOS</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {p.product_name}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{fmtCurrency(p.current_price)}</span>
                          {p.in_stock ? (
                            <span className="text-emerald-500">• In Stock</span>
                          ) : (
                            <span className="text-red-500">• Out of Stock</span>
                          )}
                        </div>
                        {/* Views bar - mobile */}
                        <div className="sm:hidden mt-1.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${viewsPercent}%`,
                                  background: "linear-gradient(90deg, #F97316, #EA580C)",
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">
                              {p.views_count_30d || 0} views
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Views - Desktop */}
                    <div className="hidden sm:flex sm:flex-col gap-1">
                      <p className="text-sm font-bold text-slate-900">{p.views_count_30d || 0}</p>
                      <div className="h-1 rounded-full bg-slate-100 overflow-hidden w-full max-w-[80px]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${viewsPercent}%`,
                            background: "linear-gradient(90deg, #6366F1, #818CF8)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Cart Adds */}
                    <div className="flex sm:block items-center justify-between">
                      <span className="sm:hidden text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Cart Adds
                      </span>
                      <p className="text-sm font-bold text-orange-500">
                        {p.cart_adds_count_30d || 0}
                      </p>
                    </div>

                    {/* Sold - Using sold_count_30d from API */}
                    <div className="flex sm:block items-center justify-between">
                      <span className="sm:hidden text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Sold
                      </span>
                      <p className="text-sm font-black text-emerald-600">
                        {p.sold_count_30d || 0}
                      </p>
                    </div>

                    {/* Conversion */}
                    <div className="flex sm:block items-center justify-between">
                      <span className="sm:hidden text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Conversion
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(p.conversion_rate_30d || 0, 100)}%`,
                              background: (p.conversion_rate_30d || 0) >= 10 ? "#10B981" : 
                                         (p.conversion_rate_30d || 0) >= 5 ? "#F97316" : "#EF4444",
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-600">
                          {(p.conversion_rate_30d || 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Revenue */}
                    <div className="flex sm:block items-center justify-between">
                      <span className="sm:hidden text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Revenue
                      </span>
                      <p className="text-sm font-black text-slate-900">
                        {fmtCurrency(p.revenue_30d || 0)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {!loading && displayed.length > 0 && (
            <div className="px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <p className="text-xs text-slate-400 font-medium">
                  Showing {displayed.length} of {products.length} products
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-slate-400 font-medium">Total Revenue:</span>
                  <span className="font-black text-slate-900">
                    {fmtCurrency(displayed.reduce((acc, p) => acc + (p.revenue_30d || 0), 0))}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-400 font-medium">Total Sold:</span>
                  <span className="font-black text-emerald-600">
                    {displayed.reduce((acc, p) => acc + (p.sold_count_30d || 0), 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats Footer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total Views (30d)",
              value: productTotals?.total_views_30d || 0,
              icon: <FiEye size={14} />,
              color: "#6366F1",
              bg: "#EEF2FF",
            },
            {
              label: "Total Cart Adds",
              value: productTotals?.total_cart_adds_30d || 0,
              icon: <FiShoppingCart size={14} />,
              color: "#F97316",
              bg: "#FFF7ED",
            },
            {
              label: "Units Sold",
              value: productTotals?.total_units_sold_30d || itemsSoldTotal || 0,
              icon: <FiPackage size={14} />,
              color: "#10B981",
              bg: "#F0FDF4",
            },
            {
              label: "Avg Conversion",
              value: (productTotals?.avg_conversion_rate_30d || 0).toFixed(1),
              suffix: "%",
              icon: <FiTrendingUp size={14} />,
              color: "#0EA5E9",
              bg: "#F0F9FF",
            },
          ].map(({ label, value, suffix, icon, color, bg }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-4 border border-slate-100/80 transition-all duration-300 hover:shadow-lg"
              style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: bg }}
                >
                  <span style={{ color }}>{icon}</span>
                </div>
              </div>
              <p className="text-lg font-black text-slate-900">
                {typeof value === "number" ? value.toLocaleString() : value}{suffix}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerAnalyticsPage;