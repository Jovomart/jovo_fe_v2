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
} from "react-icons/fi";
import { MdOutlineInventory2 } from "react-icons/md";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductAnalytic {
  product_id: string;
  product_name: string;
  product_image?: string;
  views: number;
  add_to_carts: number;
  units_sold: number;
  conversion_rate: number;
  revenue?: number;
}

interface DashboardAnalytics {
  total_earnings: number;
  total_orders: number;
  catalog_size: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  fulfillment_rate: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => (n ?? 0).toLocaleString();

// Safely extract a number from multiple possible keys in an object
const pick = (obj: any, ...keys: string[]): number => {
  for (const key of keys) {
    const val = obj?.[key];
    if (val != null && !isNaN(Number(val))) return Number(val);
  }
  return 0;
};

// Safely extract an array from multiple possible keys in an object
const pickArr = (obj: any, ...keys: string[]): any[] => {
  for (const key of keys) {
    const val = obj?.[key];
    if (Array.isArray(val) && val.length > 0) return val;
  }
  return [];
};

// ─── Conversion bar ───────────────────────────────────────────────────────────

const ConversionBar = ({
  value,
  max,
}: {
  value: number;
  max: number;
}) => {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(
      () => setW(max > 0 ? Math.min((value / max) * 100, 100) : 0),
      200
    );
    return () => clearTimeout(t);
  }, [value, max]);

  const color =
    value >= 10 ? "#10B981" : value >= 5 ? "#F97316" : "#EF4444";

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: "#F1F5F9" }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${w}%`, background: color }}
        />
      </div>
      <span
        className="text-[11px] font-black w-10 text-right"
        style={{ color }}
      >
        {(value ?? 0).toFixed(1)}%
      </span>
    </div>
  );
};

// ─── Summary Card ─────────────────────────────────────────────────────────────

const SummaryCard = ({
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
}) => (
  <div
    className="bg-white rounded-2xl p-5 border border-slate-100 transition-all hover:-translate-y-0.5 hover:shadow-lg"
    style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
      style={{ background: bg, color }}
    >
      {icon}
    </div>
    <p className="text-2xl font-black text-slate-900 leading-none">
      {prefix}
      {typeof value === "number" ? value.toLocaleString() : value}
      {suffix}
    </p>
    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
      {label}
    </p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const SellerAnalyticsPage = () => {
  const [dashboardStats, setDashboardStats] =
    useState<DashboardAnalytics | null>(null);
  const [products, setProducts] = useState<ProductAnalytic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<
    | "views"
    | "add_to_carts"
    | "units_sold"
    | "conversion_rate"
    | "revenue"
  >("units_sold");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const hasFetchedRef = useRef(false);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch analytics dashboard, per-product analytics, and product count.
      // We run them in parallel and handle each independently so a partial
      // failure on one doesn't kill the whole page.
      const results = await Promise.allSettled([
        apiService.getSellerAnalyticsDashboard(), // GET /seller/analytics/dashboard
        apiService.getSellerProductAnalytics(),   // GET /seller/analytics/products
        apiService.getMyProducts({ page: 1, page_size: 1 }), // for catalog count
      ]);

      const dashRes =
        results[0].status === "fulfilled" ? results[0].value : null;
      const productsRes =
        results[1].status === "fulfilled" ? results[1].value : null;
      const myProductsRes =
        results[2].status === "fulfilled" ? results[2].value : null;

      // Surface the first actual error so users know something went wrong,
      // but still render whatever data we did receive.
      const firstError = results.find((r) => r.status === "rejected") as
        | PromiseRejectedResult
        | undefined;
      if (firstError && !dashRes && !productsRes) {
        throw new Error(
          firstError.reason?.message ?? "Failed to load analytics."
        );
      }

      // ── Dashboard summary ────────────────────────────────────────────────
      // Unwrap possible `data` wrapper
      const dash = dashRes?.data ?? dashRes ?? {};

      // Live product count — sourced from /seller/products/my-products pagination
      const myPB = myProductsRes?.data ?? myProductsRes ?? {};
      const catalogSize = pick(
        myPB,
        "total",
        "total_count",
        "count",
        "pagination.total"
      ) || pick(dash, "catalog_size", "total_products");

      setDashboardStats({
        total_earnings: pick(
          dash,
          "total_earnings",
          "total_revenue",
          "earnings"
        ),
        total_orders: pick(dash, "total_orders", "order_count"),
        catalog_size: catalogSize,
        pending_orders: pick(dash, "pending_orders", "pending_count"),
        completed_orders: pick(
          dash,
          "completed_orders",
          "fulfilled_orders",
          "completed_count"
        ),
        cancelled_orders: pick(
          dash,
          "cancelled_orders",
          "cancelled_count"
        ),
        fulfillment_rate: pick(
          dash,
          "fulfillment_rate",
          "fulfillment_percentage"
        ),
      });

      // ── Per-product analytics ────────────────────────────────────────────
      // Unwrap possible `data` wrapper
      const raw = productsRes?.data ?? productsRes ?? {};

      // The list might live under different keys depending on the API version
      const list: any[] = pickArr(
        raw,
        "products",
        "items",
        "analytics",
        "data"
      );

      // If `raw` itself is an array, use it directly
      const finalList = list.length > 0
        ? list
        : Array.isArray(raw)
        ? raw
        : [];

      const normalised: ProductAnalytic[] = finalList.map((p: any) => ({
        product_id: p.product_id ?? p.id ?? "",
        product_name: p.product_name ?? p.name ?? "—",
        product_image:
          p.product_image ?? p.image_url ?? p.thumbnail ?? undefined,
        views: pick(p, "views", "view_count"),
        add_to_carts: pick(p, "add_to_carts", "cart_adds", "cart_count"),
        units_sold: pick(p, "units_sold", "sold", "total_units_sold"),
        conversion_rate: pick(p, "conversion_rate", "conversion"),
        revenue:
          p.revenue != null
            ? Number(p.revenue)
            : p.total_revenue != null
            ? Number(p.total_revenue)
            : undefined,
      }));

      setProducts(normalised);
    } catch (err: any) {
      setError(err.message ?? "Failed to load analytics. Please try again.");
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

  // Totals derived from per-product data
  const totals = products.reduce(
    (acc, p) => ({
      views: acc.views + p.views,
      carts: acc.carts + p.add_to_carts,
      sold: acc.sold + p.units_sold,
    }),
    { views: 0, carts: 0, sold: 0 }
  );

  const avgConversion =
    products.length > 0
      ? products.reduce((a, p) => a + p.conversion_rate, 0) / products.length
      : 0;

  // Sort + filter
  const displayed = products
    .filter((p) =>
      p.product_name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const va = Number(a[sortBy] ?? 0);
      const vb = Number(b[sortBy] ?? 0);
      return sortDir === "desc" ? vb - va : va - vb;
    });

  const toggleSort = (
    col:
      | "views"
      | "add_to_carts"
      | "units_sold"
      | "conversion_rate"
      | "revenue"
  ) => {
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

  return (
    <SellerLayout
      activeNav="analytics"
      onRefresh={fetchAnalytics}
      isLoading={loading}
      pageTitle="Analytics"
    >
      <div className="p-5 md:p-7 space-y-6">

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl px-5 py-4 bg-red-50 border border-red-200">
            <FiAlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-red-700 text-sm font-semibold flex-1">
              {error}
            </p>
            <button
              onClick={fetchAnalytics}
              className="text-xs font-bold text-red-600 flex items-center gap-1 hover:text-red-800 transition-colors"
            >
              <FiRefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {/* Hero banner */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg,#0F172A 0%,#1E293B 50%,#0F172A 100%)",
            minHeight: 120,
          }}
        >
          {/* Glow blobs */}
          <div
            className="absolute -left-16 -top-16 w-64 h-64 rounded-full opacity-30 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle,#6366F1 0%,transparent 70%)",
            }}
          />
          <div
            className="absolute right-0 bottom-0 w-56 h-56 rounded-full opacity-20 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle,#F97316 0%,transparent 70%)",
            }}
          />
          {/* Dot grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative z-10 flex items-center justify-between gap-5 px-7 py-6">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(99,102,241,0.2)" }}
                >
                  <FiBarChart2 size={15} className="text-indigo-400" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  Store Analytics
                </p>
              </div>
              <p className="text-white text-2xl font-black">
                Product Performance
              </p>
              <p className="text-slate-400 text-sm font-medium mt-0.5">
                Views, cart adds, conversions &amp; sales per product
              </p>
            </div>
            {/* Refresh button */}
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white border border-white/20 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <FiRefreshCw
                size={13}
                className={loading ? "animate-spin" : ""}
              />{" "}
              Refresh
            </button>
          </div>
        </div>

        {/* Summary cards */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SummaryCard
              icon={<FiEye size={18} />}
              label="Total Views"
              value={totals.views}
              color="#6366F1"
              bg="#EEF2FF"
            />
            <SummaryCard
              icon={<FiShoppingCart size={18} />}
              label="Cart Adds"
              value={totals.carts}
              color="#F97316"
              bg="#FFF7ED"
            />
            <SummaryCard
              icon={<FiPackage size={18} />}
              label="Units Sold"
              value={totals.sold}
              color="#10B981"
              bg="#F0FDF4"
            />
            <SummaryCard
              icon={<FiTrendingUp size={18} />}
              label="Avg Conversion"
              value={avgConversion.toFixed(1)}
              suffix="%"
              color="#0EA5E9"
              bg="#F0F9FF"
            />
          </div>
        )}

        {/* Dashboard summary strip */}
        {!loading && dashboardStats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                label: "Revenue",
                value: fmtCurrency(dashboardStats.total_earnings),
                color: "#F97316",
                bg: "#FFF7ED",
                icon: <FiDollarSign size={14} />,
              },
              {
                label: "Orders",
                value: fmt(dashboardStats.total_orders),
                color: "#6366F1",
                bg: "#EEF2FF",
                icon: <FiShoppingCart size={14} />,
              },
              {
                label: "Products",
                value: fmt(dashboardStats.catalog_size),
                color: "#0EA5E9",
                bg: "#F0F9FF",
                icon: <MdOutlineInventory2 size={14} />,
              },
              {
                label: "Pending",
                value: fmt(dashboardStats.pending_orders),
                color: "#D97706",
                bg: "#FFFBEB",
                icon: <FiClock size={14} />,
              },
              {
                label: "Completed",
                value: fmt(dashboardStats.completed_orders),
                color: "#059669",
                bg: "#F0FDF4",
                icon: <FiCheckCircle size={14} />,
              },
              {
                label: "Fulfillment",
                value: `${dashboardStats.fulfillment_rate}%`,
                color: "#10B981",
                bg: "#F0FDF4",
                icon: <FiTrendingUp size={14} />,
              },
            ].map(({ label, value, color, bg, icon }) => (
              <div
                key={label}
                className="bg-white rounded-2xl px-4 py-3 border border-slate-100 text-center"
                style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-2"
                  style={{ background: bg, color }}
                >
                  {icon}
                </div>
                <p className="text-base font-black" style={{ color }}>
                  {value}
                </p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Per-product table */}
        <div
          className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
        >
          {/* Table header */}
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-5"
            style={{ borderBottom: "1px solid #F8FAFC" }}
          >
            <div>
              <p className="font-black text-slate-900">
                Per-Product Analytics
              </p>
              <p className="text-slate-400 text-xs font-medium mt-0.5">
                {products.length} product{products.length !== 1 ? "s" : ""}{" "}
                tracked
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-100 flex-1 sm:w-56">
                <FiSearch size={13} className="text-slate-400 shrink-0" />
                <input
                  className="bg-transparent text-sm text-slate-700 outline-none flex-1 placeholder-slate-400"
                  placeholder="Search products…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                onClick={fetchAnalytics}
                disabled={loading}
                className="p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition text-slate-500 disabled:opacity-50"
                title="Refresh"
              >
                <FiRefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          {/* Column headers */}
          <div
            className="hidden sm:grid grid-cols-7 gap-3 px-6 py-3"
            style={{ background: "#F8FAFC" }}
          >
            <div className="col-span-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Product
              </p>
            </div>
            {(
              [
                { key: "views", label: "Views" },
                { key: "add_to_carts", label: "Cart Adds" },
                { key: "units_sold", label: "Units Sold" },
                { key: "conversion_rate", label: "Conversion" },
                { key: "revenue", label: "Revenue" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition text-left"
              >
                {label} <SortIcon col={key} />
              </button>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-50">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="grid grid-cols-7 gap-3 px-6 py-4">
                  {[...Array(7)].map((_, j) => (
                    <div
                      key={j}
                      className={`h-3 rounded bg-slate-100 animate-pulse ${
                        j === 0 ? "col-span-2" : ""
                      }`}
                    />
                  ))}
                </div>
              ))
            ) : displayed.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
                  <MdOutlineInventory2 size={24} className="text-slate-300" />
                </div>
                <p className="font-bold text-slate-700">
                  {search
                    ? "No products match your search"
                    : "No analytics data yet"}
                </p>
                <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
                  {search
                    ? "Try a different search term"
                    : "Analytics accumulate as customers view and purchase your products"}
                </p>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="mt-3 text-sm text-orange-500 font-bold hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              displayed.map((p, idx) => (
                <div
                  key={p.product_id || idx}
                  className="flex flex-col sm:grid sm:grid-cols-7 gap-3 px-6 py-4 hover:bg-orange-50/20 transition-colors"
                >
                  {/* Product */}
                  <div className="col-span-2 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                      {p.product_image ? (
                        <Image
                          src={p.product_image}
                          alt={p.product_name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <FiPackage size={16} className="text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {p.product_name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium truncate">
                        ID: {p.product_id.slice(0, 8)}
                      </p>
                    </div>
                  </div>

                  {/* Views */}
                  <div className="flex sm:block items-center justify-between">
                    <span className="sm:hidden text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Views
                    </span>
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {fmt(p.views)}
                      </p>
                      <div className="hidden sm:block mt-1">
                        <div
                          className="h-1 rounded-full overflow-hidden"
                          style={{ background: "#F1F5F9" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(
                                (p.views /
                                  Math.max(
                                    ...displayed.map((x) => x.views),
                                    1
                                  )) *
                                  100,
                                100
                              )}%`,
                              background: "#6366F1",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cart Adds */}
                  <div className="flex sm:block items-center justify-between">
                    <span className="sm:hidden text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Cart Adds
                    </span>
                    <p className="text-sm font-bold text-orange-500">
                      {fmt(p.add_to_carts)}
                    </p>
                  </div>

                  {/* Units Sold */}
                  <div className="flex sm:block items-center justify-between">
                    <span className="sm:hidden text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Units Sold
                    </span>
                    <p className="text-sm font-black text-emerald-600">
                      {fmt(p.units_sold)}
                    </p>
                  </div>

                  {/* Conversion */}
                  <div className="flex sm:block items-center justify-between">
                    <span className="sm:hidden text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Conversion
                    </span>
                    <div className="w-full sm:max-w-[120px]">
                      <ConversionBar
                        value={p.conversion_rate}
                        max={Math.max(
                          ...displayed.map((x) => x.conversion_rate),
                          1
                        )}
                      />
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="flex sm:block items-center justify-between">
                    <span className="sm:hidden text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Revenue
                    </span>
                    <p className="text-sm font-black text-slate-900">
                      {p.revenue != null ? fmtCurrency(p.revenue) : "—"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer totals row */}
          {!loading && displayed.length > 0 && (
            <div
              className="hidden sm:grid grid-cols-7 gap-3 px-6 py-4"
              style={{
                borderTop: "1px solid #F1F5F9",
                background: "#F8FAFC",
              }}
            >
              <div className="col-span-2">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Totals ({displayed.length})
                </p>
              </div>
              <p className="text-sm font-black text-indigo-600">
                {fmt(displayed.reduce((a, p) => a + p.views, 0))}
              </p>
              <p className="text-sm font-black text-orange-500">
                {fmt(displayed.reduce((a, p) => a + p.add_to_carts, 0))}
              </p>
              <p className="text-sm font-black text-emerald-600">
                {fmt(displayed.reduce((a, p) => a + p.units_sold, 0))}
              </p>
              <p className="text-sm font-black text-sky-600">
                {(
                  displayed.reduce((a, p) => a + p.conversion_rate, 0) /
                  displayed.length
                ).toFixed(1)}
                % avg
              </p>
              <p className="text-sm font-black text-slate-800">
                {displayed.some((p) => p.revenue != null)
                  ? fmtCurrency(
                      displayed.reduce((a, p) => a + (p.revenue ?? 0), 0)
                    )
                  : "—"}
              </p>
            </div>
          )}
        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerAnalyticsPage;