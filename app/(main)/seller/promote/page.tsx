"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
} from "react-icons/fi";
import {
  FaBullhorn,
  FaRocket,
  FaCrown,
  FaFire,
} from "react-icons/fa";
import { HiSparkles, HiLightBulb } from "react-icons/hi";
import { MdOutlineInventory2 } from "react-icons/md";

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
    pct >= 70 ? "Great" : pct >= 40 ? "Good" : "Needs Work";

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
            stroke="#F1F5F9"
            strokeWidth="8"
          />
          <circle
            cx="48"
            cy="48"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
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
            fill="#0F172A"
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
      <p className="text-[11px] font-bold text-slate-400 mt-1">
        Visibility Score
      </p>
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
    className="flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    style={{
      background: done ? "#F0FDF4" : "white",
      borderColor: done ? "#BBF7D0" : "#F1F5F9",
      boxShadow: "0 1px 12px rgba(0,0,0,0.04)",
    }}
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: bg, color }}
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
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white shrink-0 transition hover:opacity-90"
        style={{ background: color }}
      >
        {action} <FiArrowRight size={11} />
      </button>
    )}
    {done && (
      <span className="text-xs font-bold text-emerald-600 shrink-0">
        ✓ Done
      </span>
    )}
  </div>
);

const ComingSoonBadge = () => (
  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
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
    className="relative bg-white rounded-2xl p-5 border border-slate-100 overflow-hidden"
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
        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500">
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

  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [approvedProducts, setApprovedProducts] = useState(0);
  const [productsWithImages, setProductsWithImages] = useState(0);

  useEffect(() => {
    (async () => {
      try {
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
      } catch {}
      setLoading(false);
    })();
  }, []);

  // Compute a rough visibility score based on what they've done
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
      title: "Add relevant tags",
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
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{
            background: "linear-gradient(135deg,#F97316,#EA580C)",
            boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
          }}
        >
          <FaRocket size={13} />
          <span className="hidden sm:inline">List Product</span>
        </button>
      }
    >
      <div className="p-5 md:p-7 space-y-6">
        {/* Hero */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg,#0F172A 0%,#1E1B4B 50%,#0F172A 100%)",
            minHeight: 160,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div
            className="absolute -left-16 -top-16 w-64 h-64 rounded-full"
            style={{
              background:
                "radial-gradient(circle,rgba(249,115,22,0.25) 0%,transparent 70%)",
            }}
          />
          <div
            className="absolute right-0 bottom-0 w-56 h-56 rounded-full"
            style={{
              background:
                "radial-gradient(circle,rgba(124,58,237,0.2) 0%,transparent 70%)",
            }}
          />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-7">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaBullhorn size={14} className="text-orange-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                  Promotions & Visibility
                </span>
              </div>
              <h1 className="text-white text-2xl font-black leading-tight">
                Grow your store
              </h1>
              <p className="text-slate-400 text-sm mt-1.5 max-w-sm font-medium">
                Follow these steps to boost your products in search and reach
                more buyers across the platform.
              </p>
            </div>
            {!loading && (
              <div className="shrink-0">
                <ScoreMeter score={score} />
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div
          className="bg-white rounded-2xl border border-slate-100 p-5"
          style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-black text-slate-900">
                Visibility Checklist
              </p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {completedTips} of {tips.length} completed
              </p>
            </div>
            <span
              className="text-sm font-black px-3 py-1.5 rounded-xl"
              style={{
                background: completedTips === tips.length ? "#F0FDF4" : "#FFF7ED",
                color: completedTips === tips.length ? "#059669" : "#F97316",
              }}
            >
              {Math.round((completedTips / tips.length) * 100)}%
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden bg-slate-100">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${(completedTips / tips.length) * 100}%`,
                background: "linear-gradient(90deg,#F97316,#EA580C)",
              }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Listed",
              value: totalProducts,
              icon: <MdOutlineInventory2 size={17} />,
              color: "#6366F1",
              bg: "#EEF2FF",
            },
            {
              label: "Approved Live",
              value: approvedProducts,
              icon: <FiCheck size={17} />,
              color: "#059669",
              bg: "#F0FDF4",
            },
            {
              label: "With 3+ Images",
              value: productsWithImages,
              icon: <FiCamera size={17} />,
              color: "#F97316",
              bg: "#FFF7ED",
            },
          ].map(({ label, value, icon, color, bg }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-4 border border-slate-100"
              style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}
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

        {/* Tips */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HiLightBulb size={17} className="text-orange-500" />
            <p className="font-black text-slate-900">How to Get More Views</p>
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
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: "1px solid #F8FAFC" }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <FaFire size={14} className="text-orange-500" />
                  <p className="font-black text-slate-900">Top Products</p>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Your most viewed listings
                </p>
              </div>
              <button
                onClick={() => router.push("/seller/products")}
                className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-orange-50 transition"
              >
                Manage <FiChevronRight size={12} />
              </button>
            </div>

            <div className="divide-y divide-slate-50">
              {loading
                ? [...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-100 rounded animate-pulse w-2/3" />
                        <div className="h-2.5 bg-slate-100 rounded animate-pulse w-1/3" />
                      </div>
                    </div>
                  ))
                : topProducts.map((p, rank) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-orange-50/20 transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(`/seller/products/${p.id}/edit`)
                      }
                    >
                      {/* Rank */}
                      <div
                        className="w-6 text-center text-xs font-black shrink-0"
                        style={{
                          color:
                            rank === 0
                              ? "#F59E0B"
                              : rank === 1
                              ? "#94A3B8"
                              : rank === 2
                              ? "#D97706"
                              : "#CBD5E1",
                        }}
                      >
                        {rank === 0 ? (
                          <FaCrown size={14} />
                        ) : (
                          `#${rank + 1}`
                        )}
                      </div>

                      {/* Thumbnail */}
                      <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                        {p.product_images?.[0] ? (
                          <img
                            src={p.product_images[0]}
                            alt={p.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiPackage
                              size={16}
                              className="text-slate-300"
                            />
                          </div>
                        )}
                      </div>

                      {/* Name + price */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {p.product_name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {fmtCurrency(p.current_price)}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="hidden sm:flex items-center gap-4 shrink-0">
                        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                          <FiEye size={12} />
                          {p.view_count ?? 0}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                          <FiZap size={12} />
                          {p.sold_count ?? 0} sold
                        </div>
                        {p.average_rating > 0 && (
                          <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                            <FiStar size={12} />
                            {p.average_rating.toFixed(1)}
                          </div>
                        )}
                      </div>

                      <FiChevronRight
                        size={14}
                        className="text-slate-300 shrink-0"
                      />
                    </div>
                  ))}
            </div>
          </div>
        )}

        {/* Coming Soon Features */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HiSparkles size={16} className="text-violet-500" />
            <p className="font-black text-slate-900">Coming Soon</p>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
              icon={<FiTrendingUp size={18} />}
              title="Analytics Dashboard"
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
          className="relative rounded-3xl overflow-hidden px-8 py-8"
          style={{
            background:
              "linear-gradient(135deg,#0F172A 0%,#1C1917 60%,#1C0A00 100%)",
          }}
        >
          <div
            className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full"
            style={{
              background:
                "radial-gradient(circle,rgba(249,115,22,0.25) 0%,transparent 70%)",
            }}
          />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaFire size={13} className="text-orange-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
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
              className="shrink-0 flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-black text-white transition hover:opacity-90"
              style={{
                background: "linear-gradient(135deg,#F97316,#EA580C)",
                boxShadow: "0 4px 20px rgba(249,115,22,0.4)",
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