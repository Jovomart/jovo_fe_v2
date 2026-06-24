"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import apiService from "@/services/apiService";
import SellerLayout, { fmtCurrency } from "@/components/layout/SellerLayout";
import {
  FiArrowRight,
  FiZap,
  FiEye,
  FiStar,
  FiTrendingUp,
  FiCamera,
  FiTag,
  FiMessageSquare,
  FiShare2,
  FiPackage,
  FiChevronRight,
  FiCheck,
  FiDollarSign,
  FiClock,
  FiAward,
  FiBarChart2,
} from "react-icons/fi";
import {
  FaBullhorn,
  FaRocket,
  FaCrown,
  FaFire,
  FaStore,
  FaChartLine,
} from "react-icons/fa";
import { HiSparkles, HiLightBulb } from "react-icons/hi";
import { MdOutlineInventory2, MdOutlineVerified } from "react-icons/md";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TopProduct {
  id: string;
  product_name: string;
  product_images: string[];
  current_price: number;
  view_count: number;
  sold_count: number;
  average_rating: number;
  is_active: boolean;
  is_approved: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const ScoreMeter = ({ score, max = 100 }: { score: number; max?: number }) => {
  const [animated, setAnimated] = useState(0);
  const pct = Math.min((score / max) * 100, 100);
  const color =
    pct >= 70 ? "#10B981" : pct >= 40 ? "#F97316" : "#EF4444";
  const label =
    pct >= 70 ? "Excellent" : pct >= 40 ? "Good" : "Needs Work";

  useEffect(() => {
    const t = setTimeout(() => setAnimated(pct), 300);
    return () => clearTimeout(t);
  }, [pct]);

  const r = 38;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r={r}
            fill="none"
            stroke="#1E293B"
            strokeWidth="6"
          />
          <circle
            cx="48"
            cy="48"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${(animated / 100) * circ} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 48 48)"
            style={{ transition: "stroke-dasharray 1.2s ease" }}
          />
          <text
            x="48"
            y="44"
            textAnchor="middle"
            fontSize="18"
            fontWeight="900"
            fill="#FFFFFF"
            fontFamily="inherit"
          >
            {score}
          </text>
          <text
            x="48"
            y="58"
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill={color}
            fontFamily="inherit"
          >
            {label}
          </text>
        </svg>
      </div>
    </div>
  );
};

const TipCard = ({
  icon,
  title,
  desc,
  action,
  onAction,
  done,
  color,
  bg,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action?: string;
  onAction?: () => void;
  done?: boolean;
  color: string;
  bg: string;
}) => (
  <div
    className="flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
    style={{
      background: done ? "#F0FDF4" : "white",
      borderColor: done ? "#BBF7D0" : "#F1F5F9",
      boxShadow: done ? "0 1px 12px rgba(5,150,105,0.1)" : "0 1px 12px rgba(0,0,0,0.04)",
    }}
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
      style={{ 
        background: done ? "#D1FAE5" : bg,
        color: done ? "#059669" : color,
      }}
    >
      {done ? <FiCheck size={16} /> : icon}
    </div>
    <div className="flex-1 min-w-0">
      <p
        className="text-sm font-black text-slate-900"
        style={{ color: done ? "#059669" : undefined }}
      >
        {title}
      </p>
      <p className="text-xs text-slate-400 font-medium mt-0.5 leading-relaxed">
        {desc}
      </p>
    </div>
    {action && !done && (
      <button
        onClick={onAction}
        className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white shrink-0 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
        style={{ 
          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
          boxShadow: `0 2px 12px ${color}40`,
        }}
      >
        {action} <FiArrowRight size={11} />
      </button>
    )}
    {done && (
      <span className="text-xs font-bold text-emerald-600 shrink-0 flex items-center gap-1">
        <FiCheck size={13} /> Done
      </span>
    )}
  </div>
);

const ComingSoonBadge = () => (
  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-50 to-purple-50 text-violet-600 border border-violet-200">
    <HiSparkles size={10} /> Coming Soon
  </span>
);

const FutureFeatureCard = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <div
    className="relative bg-white rounded-2xl p-5 border border-slate-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}
  >
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage:
          "radial-gradient(circle,#7C3AED 1px,transparent 1px)",
        backgroundSize: "18px 18px",
      }}
    />
    <div className="relative">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center text-violet-500">
          {icon}
        </div>
        <ComingSoonBadge />
      </div>
      <p className="text-sm font-black text-slate-800">{title}</p>
      <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
        {desc}
      </p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const SellerPromotePage = () => {
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [approvedProducts, setApprovedProducts] = useState(0);
  const [productsWithImages, setProductsWithImages] = useState(0);
  const [storeViews, setStoreViews] = useState(0);
  const [itemsSold, setItemsSold] = useState(0);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      (async () => {
        try {
          // Fetch dashboard data first
          const dashboardRes = await apiService.getSellerDashboard();
          const dashboard = dashboardRes?.data ?? dashboardRes;
          setDashboardData(dashboard);
          
          if (dashboard) {
            setStoreViews(dashboard.store_health?.total_views_30d || 0);
            setItemsSold(dashboard.store?.items_sold || 0);
          }

          // Fetch products
          const res = await apiService.getMyProducts({ page: 1, page_size: 100 });
          const body = res?.data ?? res;
          const list: TopProduct[] = body?.products ?? [];
          setTotalProducts(body?.total ?? list.length);
          setApprovedProducts(
            list.filter((p) => p.is_approved && p.is_active).length
          );
          setProductsWithImages(
            list.filter((p) => (p.product_images?.length ?? 0) >= 3).length
          );

          // Sort by view_count descending, show top 5
          const sorted = [...list]
            .sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0))
            .slice(0, 5);
          setTopProducts(sorted);
        } catch (err) {
          console.error("Failed to fetch data:", err);
        }
        setLoading(false);
      })();
    }
  }, []);

  // Compute visibility score
  const score = Math.min(
    Math.round(
      (approvedProducts > 0 ? 30 : 0) +
        (productsWithImages > 0 ? 25 : 0) +
        (totalProducts >= 5 ? 25 : (totalProducts / 5) * 25) +
        (topProducts.some((p) => p.average_rating > 0) ? 20 : 0)
    ),
    100
  );

  const tips = [
    {
      icon: <FiCamera size={16} />,
      title: "Add 3+ high-quality photos",
      desc: "Products with 3 or more clear photos get 5× more views. Use natural lighting and a clean background.",
      action: "Fix Products",
      onAction: () => router.push("/seller/products"),
      done: productsWithImages === totalProducts && totalProducts > 0,
      color: "#F97316",
      bg: "#FFF7ED",
    },
    {
      icon: <FiTag size={16} />,
      title: "Add relevant tags & attributes",
      desc: "Tags help buyers find your products in search. Aim for 5–10 specific, descriptive tags per listing.",
      action: "Edit Tags",
      onAction: () => router.push("/seller/products"),
      done: false,
      color: "#6366F1",
      bg: "#EEF2FF",
    },
    {
      icon: <MdOutlineInventory2 size={16} />,
      title: "List at least 10 products",
      desc: "Stores with 10+ listings appear more in browse sections and related product suggestions.",
      action: "Add Product",
      onAction: () => router.push("/seller/add-product"),
      done: totalProducts >= 10,
      color: "#0EA5E9",
      bg: "#F0F9FF",
    },
    {
      icon: <FiStar size={16} />,
      title: "Earn your first review",
      desc: "Fulfill orders quickly and provide accurate descriptions — happy buyers leave reviews that boost trust.",
      action: "View Orders",
      onAction: () => router.push("/seller/orders"),
      done: topProducts.some((p) => p.average_rating > 0),
      color: "#F59E0B",
      bg: "#FFFBEB",
    },
    {
      icon: <FiTrendingUp size={16} />,
      title: "Write an SEO title & description",
      desc: "Custom SEO fields help your products rank in Google and internal search. Make them keyword-rich.",
      action: "Edit Products",
      onAction: () => router.push("/seller/products"),
      done: false,
      color: "#10B981",
      bg: "#F0FDF4",
    },
    {
      icon: <FiMessageSquare size={16} />,
      title: "Enable WhatsApp contact",
      desc: "Buyers who can reach you directly convert up to 3× better. Add your WhatsApp number in Settings.",
      action: "Settings",
      onAction: () => router.push("/seller/settings"),
      done: false,
      color: "#059669",
      bg: "#ECFDF5",
    },
  ];

  const completedTips = tips.filter((t) => t.done).length;

  return (
    <SellerLayout
      activeNav="promote"
      isLoading={loading}
      pageTitle="Promotions"
      headerAction={
        <button
          onClick={() => router.push("/seller/add-product")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
          style={{
            background: "linear-gradient(135deg, #F97316, #EA580C, #B42225)",
            boxShadow: "0 4px 15px rgba(249,115,22,0.3)",
          }}
        >
          <FaRocket size={13} />
          <span className="hidden sm:inline">List Product</span>
        </button>
      }
    >
      <div className="p-4 sm:p-5 md:p-7 space-y-5 sm:space-y-6">
        {/* Luxurious Hero Banner */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #0F0A1A 0%, #1A0F1F 40%, #2D1810 100%)",
            minHeight: 180,
          }}
        >
          {/* Decorative elements */}
          <div
            className="absolute -left-20 -top-20 w-80 h-80 rounded-full opacity-25"
            style={{
              background: "radial-gradient(circle, #F97316 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full opacity-20"
            style={{
              background: "radial-gradient(circle, #B42225 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.04]"
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
            <div>
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                  <FaBullhorn size={11} />
                  Promotions & Visibility
                </div>
              </div>
              <h1 className="text-white text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                Grow Your Store
              </h1>
              <p className="text-slate-400 text-sm mt-1.5 max-w-md font-medium leading-relaxed">
                Follow these steps to boost your products in search and reach
                more buyers across the platform.
              </p>
            </div>
            {!loading && (
              <div className="shrink-0 bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                <ScoreMeter score={score} />
              </div>
            )}
          </div>
        </div>

        {/* Store Performance Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: "Store Views",
              value: storeViews,
              icon: <FiEye size={16} />,
              color: "#6366F1",
              bg: "#EEF2FF",
              suffix: "",
            },
            {
              label: "Items Sold",
              value: itemsSold,
              icon: <FiZap size={16} />,
              color: "#F97316",
              bg: "#FFF7ED",
              suffix: "",
            },
            {
              label: "Live Products",
              value: approvedProducts,
              icon: <MdOutlineInventory2 size={16} />,
              color: "#059669",
              bg: "#F0FDF4",
              suffix: "",
            },
            {
              label: "Completion Rate",
              value: Math.round((completedTips / tips.length) * 100),
              icon: <FiCheck size={16} />,
              color: "#8B5CF6",
              bg: "#F5F3FF",
              suffix: "%",
            },
          ].map(({ label, value, icon, color, bg, suffix }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-4 border border-slate-100/80 transition-all duration-300 hover:shadow-lg"
              style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                style={{ background: bg, color }}
              >
                {icon}
              </div>
              <p className="text-2xl font-black text-slate-900">
                {loading ? "—" : value}{suffix}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div
          className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6"
          style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <HiLightBulb size={17} className="text-orange-500" />
                <p className="font-black text-slate-900 text-sm sm:text-base">
                  Visibility Checklist
                </p>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {completedTips} of {tips.length} completed
              </p>
            </div>
            <span
              className="text-sm font-black px-4 py-2 rounded-xl transition-all duration-300"
              style={{
                background: completedTips === tips.length ? "#F0FDF4" : "#FFF7ED",
                color: completedTips === tips.length ? "#059669" : "#F97316",
                boxShadow: completedTips === tips.length ? "0 2px 12px rgba(5,150,105,0.15)" : "0 2px 12px rgba(249,115,22,0.1)",
              }}
            >
              {Math.round((completedTips / tips.length) * 100)}% Complete
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden bg-slate-100">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${(completedTips / tips.length) * 100}%`,
                background: "linear-gradient(90deg, #F97316, #EA580C, #B42225)",
                boxShadow: "0 2px 12px rgba(249,115,22,0.3)",
              }}
            />
          </div>
        </div>

        {/* Tips */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HiSparkles size={17} className="text-orange-500" />
            <p className="font-black text-slate-900 text-sm sm:text-base">
              How to Get More Views
            </p>
            <span className="text-[10px] font-bold text-slate-400 ml-auto">
              {completedTips === tips.length ? "🎉 All done!" : "Complete these steps"}
            </span>
          </div>
          <div className="space-y-3">
            {tips.map((tip, i) => (
              <TipCard key={i} {...tip} />
            ))}
          </div>
        </div>

        {/* Top Products */}
        {topProducts.length > 0 && (
          <div
            className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
            style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
          >
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5"
              style={{ borderBottom: "1px solid #F8FAFC" }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <FaFire size={14} className="text-orange-500" />
                  <p className="font-black text-slate-900 text-sm sm:text-base">
                    Top Performing Products
                  </p>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Your most viewed listings
                </p>
              </div>
              <button
                onClick={() => router.push("/seller/products")}
                className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-orange-50 transition"
              >
                Manage All <FiChevronRight size={12} />
              </button>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-slate-50">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="px-4 py-4 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100" />
                      <div className="flex-1">
                        <div className="h-3 bg-slate-100 rounded w-3/4 mb-2" />
                        <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                topProducts.map((p, rank) => (
                  <div
                    key={p.id}
                    className="px-4 py-4 hover:bg-orange-50/20 transition-colors cursor-pointer"
                    onClick={() => router.push(`/seller/products/${p.id}/edit`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 text-center text-xs font-black shrink-0">
                        {rank === 0 ? (
                          <FaCrown size={14} className="text-amber-500" />
                        ) : (
                          <span className="text-slate-400">#{rank + 1}</span>
                        )}
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative">
                        {p.product_images?.[0] ? (
                          <Image
                            src={p.product_images[0]}
                            alt={p.product_name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiPackage size={18} className="text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {p.product_name}
                        </p>
                        <p className="text-[11px] font-bold text-slate-600">
                          {fmtCurrency(p.current_price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <FiEye size={10} />
                          {p.view_count ?? 0}
                        </div>
                        {p.average_rating > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                            <FiStar size={10} />
                            {p.average_rating.toFixed(1)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto scrollbar-hide">
              <div className="min-w-[640px]">
                <div
                  className="grid grid-cols-6 gap-3 px-6 py-3"
                  style={{ background: "#F8FAFC" }}
                >
                  {["#", "Product", "Price", "Views", "Sold", "Rating"].map((h) => (
                    <p
                      key={h}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                    >
                      {h}
                    </p>
                  ))}
                </div>

                <div className="divide-y divide-slate-50">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <div key={i} className="grid grid-cols-6 gap-3 px-6 py-4">
                        {[...Array(6)].map((_, j) => (
                          <div key={j} className="h-3 rounded bg-slate-100 animate-pulse" />
                        ))}
                      </div>
                    ))
                  ) : (
                    topProducts.map((p, rank) => (
                      <div
                        key={p.id}
                        className="grid grid-cols-6 gap-3 px-6 py-4 items-center hover:bg-orange-50/20 transition-colors cursor-pointer"
                        onClick={() => router.push(`/seller/products/${p.id}/edit`)}
                      >
                        <div className="flex items-center gap-2">
                          {rank === 0 ? (
                            <FaCrown size={16} className="text-amber-500" />
                          ) : rank === 1 ? (
                            <span className="text-sm font-black text-slate-300">#2</span>
                          ) : rank === 2 ? (
                            <span className="text-sm font-black text-amber-600">#3</span>
                          ) : (
                            <span className="text-sm font-black text-slate-400">#{rank + 1}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative">
                            {p.product_images?.[0] ? (
                              <Image
                                src={p.product_images[0]}
                                alt={p.product_name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiPackage size={16} className="text-slate-300" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                            {p.product_name}
                          </p>
                        </div>
                        <p className="text-xs font-black text-slate-900">
                          {fmtCurrency(p.current_price)}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {p.view_count ?? 0}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {p.sold_count ?? 0}
                        </p>
                        <div>
                          {p.average_rating > 0 ? (
                            <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                              <FiStar size={12} />
                              {p.average_rating.toFixed(1)}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Coming Soon Features */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HiSparkles size={16} className="text-violet-500" />
            <p className="font-black text-slate-900 text-sm sm:text-base">
              Coming Soon
            </p>
            <span className="text-[10px] text-slate-400 font-medium ml-auto">
              Exciting new features
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <FutureFeatureCard
              icon={<FaRocket size={18} />}
              title="Sponsored Listings"
              desc="Boost your products to the top of search results and category pages for maximum visibility."
            />
            <FutureFeatureCard
              icon={<FiShare2 size={18} />}
              title="Social Sharing Tools"
              desc="Auto-generate shareable cards for WhatsApp, Instagram, and Twitter from your product pages."
            />
            <FutureFeatureCard
              icon={<FiTag size={18} />}
              title="Flash Sale Creator"
              desc="Run timed discount campaigns with countdown timers that create urgency and drive conversions."
            />
            <FutureFeatureCard
              icon={<FiBarChart2 size={18} />}
              title="Advanced Analytics"
              desc="See detailed traffic sources, conversion rates, and buyer demographics for every listing."
            />
            <FutureFeatureCard
              icon={<FaBullhorn size={16} />}
              title="Push Notifications"
              desc="Re-engage buyers who viewed your products with targeted notifications about price drops."
            />
            <FutureFeatureCard
              icon={<FaCrown size={16} />}
              title="Featured Seller Badge"
              desc="Earn a verified featured seller status that builds trust and appears on all your listings."
            />
          </div>
        </div>

        {/* CTA Banner */}
        <div
          className="relative rounded-3xl overflow-hidden px-6 sm:px-8 py-7 sm:py-8"
          style={{
            background: "linear-gradient(145deg, #0F0A1A 0%, #1A0F1F 40%, #2D1810 100%)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
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
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaFire size={13} className="text-orange-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400/80">
                  Best Action
                </span>
              </div>
              <p className="text-white font-black text-xl mb-1">
                More listings = more sales
              </p>
              <p className="text-slate-400 text-sm max-w-sm leading-relaxed font-medium">
                Sellers with 15+ active products earn 4× more revenue on
                average. Every listing is a new door for buyers to find you.
              </p>
            </div>
            <button
              onClick={() => router.push("/seller/add-product")}
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl text-sm font-black text-white transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #F97316, #EA580C, #B42225)",
                boxShadow: "0 4px 25px rgba(249,115,22,0.4)",
              }}
            >
              <FaRocket size={14} /> Add a Product
            </button>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerPromotePage;