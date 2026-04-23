'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import {
  FiPackage,
  FiTrendingUp,
  FiShoppingBag,
  FiStar,
  FiPlus,
  FiArrowRight,
  FiRefreshCw,
  FiDollarSign,
  FiBox,
  FiChevronRight,
  FiEye,
  FiActivity,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiBarChart2,
} from "react-icons/fi";
import { FaStore, FaFire, FaRocket, FaBullhorn } from "react-icons/fa";
import {
  MdVerified,
  MdOutlineInventory2,
  MdOutlineDeliveryDining,
} from "react-icons/md";

// Types
interface DashboardData {
  total_sales: number;
  total_orders: number;
  total_products: number;
  avg_rating: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders?: number;
  profile_views?: number;
  product_clicks?: number;
  completion_rate?: number;
  recent_orders: Array<{
    id: string;
    product_name?: string;
    product?: string;
    customer?: string;
    buyer_name?: string;
    amount: number;
    status: string;
    date?: string;
  }>;
  monthly_revenue?: number;
  conversion_rate?: number;
}

/* ─── Animated counter ──────────────────────────────────────── */
const useCount = (target: number, duration: number = 1200) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

/* ─── Stat Card ─────────────────────────────────────────────── */
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value?: string | number;
  rawValue?: number;
  prefix?: string;
  suffix?: string;
  color: string;
  gradient: string;
  trend?: string;
  delay?: number;
}

const StatCard = ({
  icon,
  label,
  value,
  rawValue,
  prefix = "",
  suffix = "",
  color,
  gradient,
  trend,
  delay = 0,
}: StatCardProps) => {
  const animated = useCount(rawValue || 0);
  return (
    <div
      className="bg-white rounded-3xl p-5 flex flex-col gap-4 border border-gray-100 hover:border-gray-200 hover:-translate-y-1 transition-all duration-300 cursor-default"
      style={{
        boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white"
          style={{
            background: gradient || color,
            boxShadow: `0 6px 16px ${color}35`,
          }}
        >
          {icon}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${
              trend.startsWith("+")
                ? "text-emerald-600 bg-emerald-50"
                : "text-red-500 bg-red-50"
            }`}
          >
            <FiTrendingUp size={9} /> {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-black text-gray-900 leading-none">
          {prefix}
          {rawValue !== undefined ? animated.toLocaleString() : value}
          {suffix}
        </p>
        <p className="text-xs text-gray-400 font-semibold mt-1.5">{label}</p>
      </div>
    </div>
  );
};

/* ─── Quick Action ───────────────────────────────────────────── */
interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  sub: string;
  to: string;
  gradient: string;
  navigate: (path: string) => void;
}

const QuickAction = ({ icon, label, sub, to, gradient, navigate }: QuickActionProps) => {
  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center gap-4 p-4 md:p-5 rounded-2xl border border-gray-100 hover:border-transparent hover:-translate-y-0.5 group transition-all duration-200 text-left w-full bg-white hover:shadow-lg"
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white transition-transform group-hover:scale-110"
        style={{ background: gradient }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-gray-900 group-hover:text-[#B42225] transition-colors">
          {label}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
      </div>
      <FiArrowRight
        size={14}
        className="text-gray-300 group-hover:text-[#B42225] group-hover:translate-x-1 transition-all shrink-0"
      />
    </button>
  );
};

/* ─── Performance Bar ────────────────────────────────────────── */
interface PerfBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

const PerfBar = ({ label, value, max, color }: PerfBarProps) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth((value / max) * 100), 300);
    return () => clearTimeout(t);
  }, [value, max]);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-600">{label}</span>
        <span className="text-xs font-black text-gray-800">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, background: color }}
        />
      </div>
    </div>
  );
};

/* ─── Main ──────────────────────────────────────────────────── */
const SellerDashboard = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const navigate = (p: string) => router.push(p);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const displayName =
    user?.full_name || user?.username || user?.first_name || "Seller";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const day = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      // Mock data for seller dashboard (backend endpoint coming soon)
      const mockData: DashboardData = {
        total_sales: 25800,
        total_orders: 127,
        total_products: 34,
        avg_rating: 4.7,
        pending_orders: 5,
        completed_orders: 122,
        cancelled_orders: 3,
        profile_views: 248,
        product_clicks: 156,
        completion_rate: 89,
        recent_orders: [
          {
            id: "ORD-001",
            product: "iPhone 14 Pro",
            customer: "Chioma A.",
            amount: 850000,
            status: "pending",
            date: "Today",
          },
          {
            id: "ORD-002",
            product: "Samsung Galaxy S23",
            customer: "Tunde B.",
            amount: 750000,
            status: "completed",
            date: "Yesterday",
          },
          {
            id: "ORD-003",
            product: "MacBook Air M2",
            customer: "Ada C.",
            amount: 1200000,
            status: "completed",
            date: "2 days ago",
          },
        ],
        monthly_revenue: 245800,
        conversion_rate: 3.8,
      };
      setData(mockData);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      setData({
        total_sales: 0,
        total_orders: 0,
        total_products: 0,
        avg_rating: 0,
        pending_orders: 0,
        completed_orders: 0,
        recent_orders: [],
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMounted(true), 100);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const tips = [
    {
      icon: "📸",
      title: "Better photos = more sales",
      desc: "Products with 3+ clear photos get 5× more views than single-image listings.",
    },
    {
      icon: "💰",
      title: "Price competitively",
      desc: "Check similar products and price within 10% to stay competitive on JOVO.",
    },
    {
      icon: "💬",
      title: "Respond fast",
      desc: "Sellers who respond to enquiries within 1 hour get 40% more conversions.",
    },
    {
      icon: "🚚",
      title: "Ship on time",
      desc: "Timely delivery leads to better reviews and higher search ranking.",
    },
  ];
  const [tipIdx] = useState(() => Math.floor(Math.random() * tips.length));
  const tip = tips[tipIdx];

  const activityMock = [
    {
      type: "order",
      text: "New order received",
      time: "2 min ago",
      color: "#10B981",
    },
    {
      type: "view",
      text: "Product viewed 12 times",
      time: "15 min ago",
      color: "#3B82F6",
    },
    {
      type: "review",
      text: "New 5★ review on your store",
      time: "1 hr ago",
      color: "#F59E0B",
    },
    {
      type: "payout",
      text: "Weekly payout processed",
      time: "Yesterday",
      color: "#8B5CF6",
    },
  ];

  return (
    <>
      <style>{`
        @keyframes slide-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fade-in  { from{opacity:0} to{opacity:1} }
        @keyframes shimmer  { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .slide-up { animation: slide-up 0.5s ease forwards; }
        .fade-in  { animation: fade-in 0.4s ease forwards; }
        .s1{animation-delay:0.05s} .s2{animation-delay:0.1s} .s3{animation-delay:0.15s}
        .s4{animation-delay:0.2s}  .s5{animation-delay:0.25s} .s6{animation-delay:0.3s}
        .skeleton {
          background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>

      <div style={{ background: "#F4F5F9" }}>
        {/* ── Hero ── */}
        <div
          className="relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg,#0a0a0a 0%,#150505 35%,#8B0000 70%,#B42225 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle,rgba(255,255,255,0.8) 1px,transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle,rgba(255,140,0,0.2),transparent 65%)",
            }}
          />
          <div
            className="absolute bottom-0 left-1/3 w-64 h-32 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse,rgba(255,255,255,0.04),transparent 70%)",
            }}
          />

          <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400/80 text-[10px] font-bold uppercase tracking-[3px]">
                    Store Online
                  </span>
                </div>
                <p className="text-white/40 text-sm font-semibold mb-1">
                  {greeting} — {day}
                </p>
                <h1
                  className="text-2xl md:text-4xl font-black text-white leading-tight mb-2"
                  style={{ fontFamily: "'Georgia',serif" }}
                >
                  {displayName}'s Dashboard
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1">
                    <MdVerified size={12} className="text-[#FF8C00]" />
                    <span className="text-white/70 text-[10px] font-bold">
                      Verified Seller
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1">
                    <FaStore size={10} className="text-white/60" />
                    <span className="text-white/70 text-[10px] font-bold">
                      JOVO Marketplace
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 slide-up">
                <button
                  onClick={fetchDashboard}
                  className="flex items-center gap-1.5 text-xs font-bold text-white/50 hover:text-white px-3 py-2.5 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 transition-all"
                >
                  <FiRefreshCw
                    size={13}
                    className={loading ? "animate-spin" : ""}
                  />
                </button>
                <button
                  onClick={() => navigate("/seller/add-product")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 hover:scale-[1.02]"
                  style={{
                    background: "linear-gradient(135deg,#FF8C00,#FF6B00)",
                    boxShadow: "0 6px 20px rgba(255,140,0,0.4)",
                  }}
                >
                  <FiPlus size={15} /> List Product
                </button>
              </div>
            </div>

            {/* Mini stats strip */}
            {!loading && data && (
              <div className="flex flex-wrap gap-3 mt-8 slide-up s3">
                {[
                  {
                    emoji: "💰",
                    val: `₦${(data.total_sales || 0).toLocaleString()}`,
                    label: "Revenue",
                  },
                  { emoji: "📦", val: data.total_orders || 0, label: "Orders" },
                  {
                    emoji: "🏷️",
                    val: data.total_products || 0,
                    label: "Products",
                  },
                  {
                    emoji: "⭐",
                    val: data.avg_rating ? `${data.avg_rating}★` : "—",
                    label: "Rating",
                  },
                ].map(({ emoji, val, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <span className="text-base">{emoji}</span>
                    <div>
                      <p className="text-white font-black text-sm leading-none">
                        {val}
                      </p>
                      <p className="text-white/35 text-[9px] font-semibold mt-0.5">
                        {label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-3xl skeleton h-36" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* ── Stat Cards ── */}
              <div
                className={`grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 ${mounted ? "slide-up" : "opacity-0"}`}
              >
                <StatCard
                  icon={<FiDollarSign size={20} />}
                  label="Total Revenue"
                  rawValue={data?.total_sales || 0}
                  prefix="₦"
                  color="#10B981"
                  gradient="linear-gradient(135deg,#059669,#10B981)"
                  trend="+12%"
                  value=""
                />
                <StatCard
                  icon={<FiShoppingBag size={20} />}
                  label="Total Orders"
                  rawValue={data?.total_orders || 0}
                  color="#3B82F6"
                  gradient="linear-gradient(135deg,#1D4ED8,#3B82F6)"
                  trend="+5%"
                  delay={50}
                  value=""
                />
                <StatCard
                  icon={<MdOutlineInventory2 size={20} />}
                  label="Products Live"
                  rawValue={data?.total_products || 0}
                  color="#FF8C00"
                  gradient="linear-gradient(135deg,#D97706,#FF8C00)"
                  delay={100}
                  value=""
                />
                <StatCard
                  icon={<FiStar size={20} />}
                  label="Avg Rating"
                  value={data?.avg_rating ? `${data.avg_rating}★` : "N/A"}
                  color="#F59E0B"
                  gradient="linear-gradient(135deg,#B45309,#F59E0B)"
                  delay={150}
                  rawValue={undefined}
                />
              </div>

              {/* ── Order status row ── */}
              <div
                className={`grid grid-cols-3 gap-3 ${mounted ? "slide-up s2" : "opacity-0"}`}
              >
                {[
                  {
                    label: "Pending",
                    value: data?.pending_orders || 0,
                    color: "#F59E0B",
                    bg: "#FFFBEB",
                    border: "#FDE68A",
                    icon: <FiClock size={14} />,
                  },
                  {
                    label: "Completed",
                    value: data?.completed_orders || 0,
                    color: "#10B981",
                    bg: "#ECFDF5",
                    border: "#A7F3D0",
                    icon: <FiCheckCircle size={14} />,
                  },
                  {
                    label: "Cancelled",
                    value: data?.cancelled_orders || 0,
                    color: "#EF4444",
                    bg: "#FEF2F2",
                    border: "#FECACA",
                    icon: <FiAlertCircle size={14} />,
                  },
                ].map(({ label, value, color, bg, border, icon }) => (
                  <div
                    key={label}
                    className="rounded-2xl p-4 text-center border"
                    style={{ background: bg, borderColor: border }}
                  >
                    <div
                      className="flex items-center justify-center gap-1.5 mb-1"
                      style={{ color }}
                    >
                      {icon}
                      <span className="text-[10px] font-black uppercase tracking-wide">
                        {label}
                      </span>
                    </div>
                    <p className="text-2xl font-black" style={{ color }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* ── Two column layout ── */}
              <div className="grid md:grid-cols-3 gap-5">
                {/* Quick Actions (left 2/3) */}
                <div
                  className={`md:col-span-2 space-y-4 ${mounted ? "slide-up s3" : "opacity-0"}`}
                >
                  <p className="text-[10px] font-black uppercase tracking-[3px] text-gray-400">
                    Quick Actions
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <QuickAction
                      icon={<FiPlus size={18} />}
                      label="Add New Product"
                      sub="List a product for sale on JOVO"
                      to="/seller/add-product"
                      gradient="linear-gradient(135deg,#B42225,#FF8C00)"
                      navigate={navigate}
                    />
                    <QuickAction
                      icon={<MdOutlineInventory2 size={18} />}
                      label="Manage Products"
                      sub="View, edit or remove your listings"
                      to="/seller/products"
                      gradient="linear-gradient(135deg,#2563EB,#7C3AED)"
                      navigate={navigate}
                    />
                    <QuickAction
                      icon={<FiShoppingBag size={18} />}
                      label="View Orders"
                      sub="Track and manage customer orders"
                      to="/seller/orders"
                      gradient="linear-gradient(135deg,#059669,#10B981)"
                      navigate={navigate}
                    />
                    <QuickAction
                      icon={<FiBarChart2 size={18} />}
                      label="Analytics"
                      sub="See your store performance data"
                      to="/seller/analytics"
                      gradient="linear-gradient(135deg,#D97706,#F59E0B)"
                      navigate={navigate}
                    />
                    <QuickAction
                      icon={<MdOutlineDeliveryDining size={18} />}
                      label="Deliveries"
                      sub="Track ongoing shipments"
                      to="/seller/deliveries"
                      gradient="linear-gradient(135deg,#0891B2,#06B6D4)"
                      navigate={navigate}
                    />
                    <QuickAction
                      icon={<FaBullhorn size={16} />}
                      label="Promote Products"
                      sub="Boost visibility with ads"
                      to="/seller/promote"
                      gradient="linear-gradient(135deg,#7C3AED,#9333EA)"
                      navigate={navigate}
                    />
                  </div>
                </div>

                {/* Activity feed (right 1/3) */}
                <div
                  className={`space-y-4 ${mounted ? "slide-up s4" : "opacity-0"}`}
                >
                  <p className="text-[10px] font-black uppercase tracking-[3px] text-gray-400">
                    Recent Activity
                  </p>
                  <div
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                    style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
                  >
                    {activityMock.map((a, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                          style={{ background: a.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-700 leading-tight">
                            {a.text}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {a.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Performance + Recent orders ── */}
              <div
                className={`grid md:grid-cols-2 gap-5 ${mounted ? "slide-up s5" : "opacity-0"}`}
              >
                {/* Store performance */}
                <div
                  className="bg-white rounded-3xl p-6 border border-gray-100"
                  style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[3px] text-gray-400">
                        Performance
                      </p>
                      <p className="text-base font-black text-gray-900 mt-0.5">
                        This Month
                      </p>
                    </div>
                    <FiActivity size={18} className="text-gray-300" />
                  </div>
                  <div className="space-y-4">
                    <PerfBar
                      label="Profile Views"
                      value={data?.profile_views || 248}
                      max={500}
                      color="linear-gradient(90deg,#3B82F6,#60A5FA)"
                    />
                    <PerfBar
                      label="Product Clicks"
                      value={data?.product_clicks || 156}
                      max={500}
                      color="linear-gradient(90deg,#10B981,#34D399)"
                    />
                    <PerfBar
                      label="Orders Received"
                      value={data?.total_orders || 23}
                      max={100}
                      color="linear-gradient(90deg,#B42225,#FF8C00)"
                    />
                    <PerfBar
                      label="Completion Rate"
                      value={data?.completion_rate || 89}
                      max={100}
                      color="linear-gradient(90deg,#7C3AED,#A78BFA)"
                    />
                  </div>
                </div>

                {/* Recent orders */}
                <div
                  className="bg-white rounded-3xl border border-gray-100 overflow-hidden"
                  style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                    <p className="text-sm font-black text-gray-900">
                      Recent Orders
                    </p>
                    <button
                      onClick={() => navigate("/seller/orders")}
                      className="text-xs font-bold text-[#B42225] hover:underline flex items-center gap-1"
                    >
                      View all <FiChevronRight size={12} />
                    </button>
                  </div>
                  {data?.recent_orders?.length > 0 ? (
                    data.recent_orders.map((order, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                          <FiPackage size={14} className="text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">
                            {order.product || order.product_name || "Product"}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {order.customer || order.buyer_name || "Customer"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-gray-900">
                            ₦{(order.amount || 0).toLocaleString()}
                          </p>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              order.status === "completed" || order.status === "delivered"
                                ? "bg-green-100 text-green-700"
                                : order.status === "pending"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {order.status === "completed" ? "Delivered" : order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                        <FiShoppingBag size={24} className="text-gray-300" />
                      </div>
                      <p className="font-black text-gray-500 text-sm">
                        No orders yet
                      </p>
                      <p className="text-gray-400 text-xs mt-1 mb-4">
                        List a product to start selling
                      </p>
                      <button
                        onClick={() => navigate("/seller/add-product")}
                        className="flex items-center gap-1.5 text-xs font-black text-white px-4 py-2 rounded-xl mx-auto"
                        style={{
                          background: "linear-gradient(135deg,#B42225,#FF8C00)",
                        }}
                      >
                        <FiPlus size={12} /> Add Product
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Tip banner ── */}
              <div
                className={`rounded-3xl p-6 md:p-8 relative overflow-hidden ${mounted ? "slide-up s6" : "opacity-0"}`}
                style={{
                  background:
                    "linear-gradient(135deg,#0a0a0a 0%,#150500 40%,#2a0e00 100%)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle,rgba(255,255,255,0.8) 1px,transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
                <div
                  className="absolute -right-10 -top-10 w-48 h-48 rounded-full pointer-events-none opacity-15"
                  style={{
                    background:
                      "radial-gradient(circle,#FF8C00,transparent 65%)",
                  }}
                />
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl shrink-0 mt-0.5">{tip.icon}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FaFire size={12} className="text-[#FF8C00]" />
                        <p className="text-[10px] font-black uppercase tracking-[3px] text-[#FF8C00]/70">
                          Seller Tip
                        </p>
                      </div>
                      <p
                        className="text-white font-black text-base md:text-lg mb-1"
                        style={{ fontFamily: "'Georgia',serif" }}
                      >
                        {tip.title}
                      </p>
                      <p className="text-white/40 text-xs md:text-sm max-w-md leading-relaxed">
                        {tip.desc}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/seller/add-product")}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black text-white shrink-0 transition-all hover:opacity-90 hover:scale-[1.02]"
                    style={{
                      background: "linear-gradient(135deg,#B42225,#FF8C00)",
                      boxShadow: "0 6px 20px rgba(180,34,37,0.35)",
                    }}
                  >
                    <FaRocket size={13} /> List a Product
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SellerDashboard;