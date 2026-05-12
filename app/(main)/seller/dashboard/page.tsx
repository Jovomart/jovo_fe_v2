"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useContext, useRef } from "react";
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
  FiActivity,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiBarChart2,
  FiMenu,
  FiX,
  FiHome,
  FiSettings,
  FiLogOut,
  FiEye,
  FiArrowUpRight,
  FiArrowDownRight,
  FiBell,
  FiSearch,
  FiMoreVertical,
  FiZap,
} from "react-icons/fi";
import {
  FaStore,
  FaFire,
  FaRocket,
  FaBullhorn,
  FaChartLine,
  FaCrown,
} from "react-icons/fa";
import {
  MdVerified,
  MdOutlineInventory2,
  MdOutlineDeliveryDining,
  MdOutlineSwapHoriz,
  MdOutlineTrendingUp,
} from "react-icons/md";
import { HiSparkles } from "react-icons/hi";

interface Order {
  id: string;
  product?: string;
  product_name?: string;
  customer?: string;
  buyer_name?: string;
  amount: number;
  status: string;
  date?: string;
}
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
  recent_orders: Order[];
  monthly_revenue?: number;
  conversion_rate?: number;
}

/* ── Sparkline SVG ── */
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
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id={`sg-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace("#", "")})`} />
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

/* ── Main Revenue Chart ── */
const revenueData = [
  { label: "Jan", value: 45000 },
  { label: "Feb", value: 72000 },
  { label: "Mar", value: 58000 },
  { label: "Apr", value: 95000 },
  { label: "May", value: 87000 },
  { label: "Jun", value: 120000 },
  { label: "Jul", value: 134000 },
  { label: "Aug", value: 119000 },
  { label: "Sep", value: 148000 },
  { label: "Oct", value: 162000 },
  { label: "Nov", value: 195000 },
  { label: "Dec", value: 245800 },
];
const compareData = [
  32000, 48000, 41000, 71000, 65000, 90000, 102000, 93000, 118000, 130000,
  158000, 210000,
];

const RevenueChart = () => {
  const W = 700,
    H = 200,
    PAD = { t: 20, r: 20, b: 36, l: 56 };
  const innerW = W - PAD.l - PAD.r,
    innerH = H - PAD.t - PAD.b;
  const maxVal = Math.max(...revenueData.map((d) => d.value));
  const pts = revenueData.map((d, i) => ({
    x: PAD.l + (i / (revenueData.length - 1)) * innerW,
    y: PAD.t + (1 - d.value / maxVal) * innerH,
  }));
  const cpts = compareData.map((v, i) => ({
    x: PAD.l + (i / (compareData.length - 1)) * innerW,
    y: PAD.t + (1 - v / maxVal) * innerH,
  }));
  const toPath = (arr: { x: number; y: number }[]) =>
    arr
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`,
      )
      .join(" ");
  const linePath = toPath(pts),
    cmpPath = toPath(cpts);
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${PAD.t + innerH} L${pts[0].x},${PAD.t + innerH} Z`;
  const gridVals = [0, 0.25, 0.5, 0.75, 1].map((r) => ({
    y: PAD.t + r * innerH,
    val: Math.round((maxVal * (1 - r)) / 1000),
  }));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridVals.map(({ y, val }) => (
        <g key={val}>
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
        d={cmpPath}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      <path
        d={linePath}
        fill="none"
        stroke="#F97316"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {revenueData.map((d, i) => (
        <text
          key={d.label}
          x={pts[i].x}
          y={H - 8}
          textAnchor="middle"
          fontSize="9.5"
          fill="#94A3B8"
          fontFamily="inherit"
        >
          {d.label}
        </text>
      ))}
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
    </svg>
  );
};

/* ── Radial Progress ── */
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
    pct = value / max;
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

/* ── Animated Bar ── */
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
    const t = setTimeout(() => setW((value / max) * 100), 300);
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

/* ── Stat Card ── */
const MetricCard = ({
  icon,
  label,
  value,
  prefix = "",
  suffix = "",
  color,
  bg,
  trend,
  trendUp = true,
  sparkData,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  color: string;
  bg: string;
  trend?: string;
  trendUp?: boolean;
  sparkData?: number[];
}) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      className={`relative bg-white rounded-2xl p-5 border border-slate-100/80 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 overflow-hidden ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
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
        {trend && (
          <div
            className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${trendUp ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50"}`}
          >
            {trendUp ? (
              <FiArrowUpRight size={11} />
            ) : (
              <FiArrowDownRight size={11} />
            )}{" "}
            {trend}
          </div>
        )}
      </div>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-2xl font-black text-slate-900 leading-none">
        {prefix}
        {typeof value === "number" ? value.toLocaleString() : value}
        {suffix}
      </p>
      {sparkData && (
        <div className="mt-3 h-10 -mx-1">
          <Sparkline data={sparkData} color={color} />
        </div>
      )}
    </div>
  );
};

/* ── Status Badge ── */
const Badge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    completed: {
      label: "Delivered",
      cls: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    },
    delivered: {
      label: "Delivered",
      cls: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    },
    pending: {
      label: "Pending",
      cls: "bg-amber-50 text-amber-700 border border-amber-100",
    },
    cancelled: {
      label: "Cancelled",
      cls: "bg-red-50 text-red-600 border border-red-100",
    },
    processing: {
      label: "Processing",
      cls: "bg-blue-50 text-blue-600 border border-blue-100",
    },
  };
  const b = map[status] ?? {
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

/* ── Nav Item ── */
const NavItem = ({
  icon,
  label,
  to,
  active,
  badge,
  navigate,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  to?: string;
  active?: boolean;
  badge?: number;
  navigate?: (p: string) => void;
  onClick?: () => void;
}) => (
  <button
    onClick={() => {
      onClick?.();
      to && navigate?.(to);
    }}
    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 text-left group ${active ? "bg-orange-500 text-white shadow-lg shadow-orange-200" : "text-slate-500 hover:bg-orange-50 hover:text-orange-600"}`}
  >
    <span
      className={`shrink-0 transition-transform duration-150 ${active ? "" : "group-hover:scale-110"}`}
    >
      {icon}
    </span>
    <span className="flex-1">{label}</span>
    {badge && badge > 0 ? (
      <span
        className={`text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${active ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"}`}
      >
        {badge}
      </span>
    ) : active ? (
      <FiChevronRight size={13} />
    ) : null}
  </button>
);

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
const SellerDashboard = () => {
  const { user, exitSellerMode } = useContext(AuthContext) as any;
  const router = useRouter();
  const navigate = (p: string) => router.push(p);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [notifOpen, setNotifOpen] = useState(false);

  const displayName =
    user?.full_name || user?.username || user?.first_name || "Seller";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const greetEmoji = hour < 12 ? "☀️" : hour < 17 ? "⚡" : "🌙";

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setData({
        total_sales: 245800,
        total_orders: 127,
        total_products: 34,
        avg_rating: 4.7,
        pending_orders: 5,
        completed_orders: 119,
        cancelled_orders: 3,
        profile_views: 2480,
        product_clicks: 1560,
        completion_rate: 89,
        monthly_revenue: 245800,
        conversion_rate: 3.8,
        recent_orders: [
          {
            id: "ORD-9821",
            product: "iPhone 14 Pro",
            customer: "Chioma Adeyemi",
            amount: 850000,
            status: "pending",
            date: "Today, 9:14am",
          },
          {
            id: "ORD-9820",
            product: "Samsung Galaxy S23",
            customer: "Tunde Bakare",
            amount: 750000,
            status: "completed",
            date: "Yesterday",
          },
          {
            id: "ORD-9819",
            product: "MacBook Air M2",
            customer: "Ada Chukwu",
            amount: 1200000,
            status: "completed",
            date: "2 days ago",
          },
          {
            id: "ORD-9818",
            product: "AirPods Pro 2",
            customer: "Emeka Dibie",
            amount: 280000,
            status: "processing",
            date: "3 days ago",
          },
          {
            id: "ORD-9817",
            product: "iPad Air 5th Gen",
            customer: "Ngozi Eze",
            amount: 620000,
            status: "cancelled",
            date: "4 days ago",
          },
        ],
      });
    } catch {
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
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboard();
  }, []);

  const handleSwitchToBuyer = async () => {
    try {
      if (typeof exitSellerMode === "function") await exitSellerMode();
    } catch {}
    router.push("/");
  };

  const navItems = [
    {
      id: "dashboard",
      icon: <FiHome size={17} />,
      label: "Dashboard",
      to: "/seller/dashboard",
    },
    {
      id: "products",
      icon: <MdOutlineInventory2 size={17} />,
      label: "Products",
      to: "/seller/products",
      badge: 34,
    },
    {
      id: "orders",
      icon: <FiShoppingBag size={17} />,
      label: "Orders",
      to: "/seller/orders",
      badge: 5,
    },
    {
      id: "analytics",
      icon: <FiBarChart2 size={17} />,
      label: "Analytics",
      to: "/seller/analytics",
    },
    {
      id: "deliveries",
      icon: <MdOutlineDeliveryDining size={17} />,
      label: "Deliveries",
      to: "/seller/deliveries",
    },
    {
      id: "promote",
      icon: <FaBullhorn size={15} />,
      label: "Promotions",
      to: "/seller/promote",
    },
    {
      id: "settings",
      icon: <FiSettings size={17} />,
      label: "Settings",
      to: "/seller/settings",
    },
  ];

  const sparkRevenue = [45, 72, 58, 95, 87, 120, 134, 119, 148, 162, 195, 245];
  const sparkOrders = [12, 18, 15, 22, 19, 28, 31, 27, 34, 38, 42, 51];
  const sparkViews = [
    180, 240, 210, 310, 280, 360, 410, 390, 450, 490, 560, 620,
  ];

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: "#F8FAFC",
        fontFamily: "'DM Sans','Plus Jakarta Sans','Segoe UI',sans-serif",
      }}
    >
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══════ SIDEBAR ═══════ */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 w-64 flex flex-col transition-transform duration-300 ease-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen`}
        style={{
          background: "#FFFFFF",
          borderRight: "1px solid #F1F5F9",
          boxShadow: "4px 0 30px rgba(0,0,0,0.04)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-5"
          style={{ borderBottom: "1px solid #F8FAFC" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg,#F97316,#EA580C)",
                boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
              }}
            >
              <FaStore size={15} className="text-white" />
            </div>
            <div>
              <p className="font-black text-sm text-slate-900 leading-none tracking-tight">
                JOVO
              </p>
              <p className="text-[10px] font-semibold text-orange-400 mt-0.5 uppercase tracking-wider">
                Seller Portal
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
          >
            <FiX size={17} />
          </button>
        </div>

        <div
          className="mx-4 my-4 rounded-2xl p-4 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#FFF7ED,#FEF3C7)",
            border: "1px solid #FED7AA",
          }}
        >
          <div
            className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-20"
            style={{
              background: "radial-gradient(circle,#F97316,transparent 70%)",
            }}
          />
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0 relative"
              style={{
                background: "linear-gradient(135deg,#F97316,#DC2626)",
                boxShadow: "0 4px 12px rgba(249,115,22,0.35)",
              }}
            >
              {initials}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1">
                <p className="text-slate-900 text-sm font-bold truncate">
                  {displayName}
                </p>
                <MdVerified size={12} className="text-orange-500 shrink-0" />
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <FaCrown size={8} className="text-amber-500" />
                <p className="text-amber-700 text-[10px] font-bold">
                  Top Seller
                </p>
              </div>
            </div>
          </div>
          <div
            className="mt-3 pt-3"
            style={{ borderTop: "1px solid rgba(249,115,22,0.15)" }}
          >
            <div className="flex justify-between text-[10px]">
              <span className="text-amber-700 font-semibold">This Month</span>
              <span className="font-black text-slate-900">₦245,800</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 px-3.5 pt-2 pb-1.5">
            Main Menu
          </p>
          {navItems.slice(0, 4).map((item) => (
            <NavItem
              key={item.id}
              {...item}
              active={activeNav === item.id}
              navigate={(p) => {
                navigate(p);
                setActiveNav(item.id);
                setSidebarOpen(false);
              }}
            />
          ))}
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 px-3.5 pt-4 pb-1.5">
            Manage
          </p>
          {navItems.slice(4).map((item) => (
            <NavItem
              key={item.id}
              {...item}
              active={activeNav === item.id}
              navigate={(p) => {
                navigate(p);
                setActiveNav(item.id);
                setSidebarOpen(false);
              }}
            />
          ))}
        </nav>

        <div
          className="p-4 space-y-2"
          style={{ borderTop: "1px solid #F8FAFC" }}
        >
          <button
            onClick={handleSwitchToBuyer}
            className="w-full flex items-center gap-2.5 py-2.5 px-4 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90"
            style={{
              background: "linear-gradient(135deg,#F97316,#EA580C)",
              boxShadow: "0 4px 14px rgba(249,115,22,0.3)",
            }}
          >
            <MdOutlineSwapHoriz size={17} /> Switch to Buyer
          </button>
          <button
            onClick={() => {}}
            className="w-full flex items-center gap-2.5 py-2.5 px-4 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-50 transition"
          >
            <FiLogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ═══════ TOP NAVBAR — REDESIGNED ═══════ */}
        <header
          className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl"
          style={{
            borderBottom: "1px solid #F1F5F9",
            boxShadow: "0 1px 20px rgba(0,0,0,0.04)",
          }}
        >
          {/* ── Primary Row ── */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3">
            {/* Left: hamburger + identity */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition text-slate-500 shrink-0"
              >
                <FiMenu size={19} />
              </button>
              {/* Mobile identity — visible only on mobile */}
              <div className="flex items-center gap-2.5 lg:hidden">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#F97316,#DC2626)",
                  }}
                >
                  {initials}
                </div>
                <div>
                  <p className="text-slate-900 text-sm font-black leading-tight capitalize">
                    {displayName}
                  </p>
                </div>
              </div>
              {/* Desktop identity — hidden on mobile */}
              <div className="hidden lg:flex items-center gap-3">
                <div>
                  <p className="text-slate-400 text-xs font-medium">
                    {greeting}
                  </p>
                  <p className="text-slate-900 text-[9px] font-black uppercase">
                    {displayName}'s Store
                  </p>
                </div>
              </div>
            </div>

            {/* Center: Search (desktop only) */}
            <div className="hidden md:flex items-center gap-2.5 flex-1 max-w-xs mx-8">
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 w-full">
                <FiSearch size={14} className="text-slate-400" />
                <input
                  className="bg-transparent text-sm text-slate-600 outline-none flex-1 placeholder-slate-400"
                  placeholder="Search orders, products..."
                />
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Rating — desktop only */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
                <FiStar size={13} className="text-amber-500 fill-amber-500" />
                <span className="text-amber-700 font-black text-sm">
                  {data?.avg_rating ?? 4.7}
                </span>
              </div>
              {/* Notification */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen((o) => !o)}
                  className="relative p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition text-slate-500"
                >
                  <FiBell size={17} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 border border-white" />
                </button>
              </div>
              {/* Refresh */}
              <button
                onClick={fetchDashboard}
                className="p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition text-slate-500"
              >
                <FiRefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
              {/* CTA */}
              <button
                onClick={() => navigate("/seller/add-product")}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{
                  background: "linear-gradient(135deg,#F97316,#EA580C)",
                  boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
                }}
              >
                <FiPlus size={15} />
                <span className="hidden sm:inline">List Product</span>
              </button>
              {/* Switch buyer — mobile */}
              <button
                onClick={handleSwitchToBuyer}
                className="lg:hidden flex items-center gap-1 px-2.5 py-2.5 rounded-xl text-xs font-bold border border-orange-200 text-orange-600 bg-orange-50"
              >
                <MdOutlineSwapHoriz size={16} />
              </button>
            </div>
          </div>

          {/* ── Mobile Stats Bar — only on small screens ── */}
          <div
            className="lg:hidden overflow-x-auto no-scrollbar"
            style={{ borderTop: "1px solid #F8FAFC" }}
          >
            <div className="flex items-stretch gap-0 px-0 min-w-max">
              {[
                {
                  icon: "💰",
                  label: "Revenue",
                  value: loading ? "…" : "₦245.8K",
                  color: "#F97316",
                  bg: "#FFF7ED",
                },
                {
                  icon: "🛍",
                  label: "Orders",
                  value: loading ? "…" : "127",
                  color: "#6366F1",
                  bg: "#EEF2FF",
                },
                {
                  icon: "⚡",
                  label: "Pending",
                  value: loading ? "…" : `${data?.pending_orders ?? 5}`,
                  color: "#EF4444",
                  bg: "#FEF2F2",
                },
                {
                  icon: "📦",
                  label: "Products",
                  value: loading ? "…" : "34",
                  color: "#10B981",
                  bg: "#F0FDF4",
                },
                {
                  icon: "⭐",
                  label: "Rating",
                  value: loading ? "…" : "4.7",
                  color: "#F59E0B",
                  bg: "#FFFBEB",
                },
              ].map(({ icon, label, value, color, bg }, i, arr) => (
                <div
                  key={label}
                  className="flex flex-col items-center justify-center px-4 py-2.5 shrink-0"
                  style={{
                    borderRight:
                      i < arr.length - 1 ? "1px solid #F1F5F9" : "none",
                    minWidth: 72,
                  }}
                >
                  <span className="text-base leading-none mb-1">{icon}</span>
                  <p className="font-black text-slate-900 text-sm leading-none">
                    {value}
                  </p>
                  <p className="text-slate-400 text-[10px] font-medium mt-0.5">
                    {label}
                  </p>
                </div>
              ))}
              {/* Pending action chip */}
              {!loading && (data?.pending_orders ?? 0) > 0 && (
                <button
                  onClick={() => navigate("/seller/orders")}
                  className="flex items-center gap-1.5 px-4 py-2.5 shrink-0 text-left"
                  style={{
                    borderLeft: "1px solid #F1F5F9",
                    background:
                      "linear-gradient(135deg,rgba(249,115,22,0.06),rgba(249,115,22,0.02))",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shrink-0" />
                  <div>
                    <p className="text-orange-600 font-black text-[11px] leading-none">
                      {data?.pending_orders} pending
                    </p>
                    <p className="text-orange-400 text-[10px] mt-0.5">
                      Tap to review
                    </p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 p-5 md:p-7 space-y-6 overflow-y-auto">
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
                background:
                  "radial-gradient(circle,#F97316 0%,transparent 70%)",
              }}
            />
            <div
              className="absolute right-40 top-0 w-48 h-48 rounded-full opacity-15"
              style={{
                background:
                  "radial-gradient(circle,#6366F1 0%,transparent 70%)",
              }}
            />
            <div
              className="absolute right-0 bottom-0 w-72 h-72 rounded-full opacity-20"
              style={{
                background:
                  "radial-gradient(circle,#F97316 0%,transparent 70%)",
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
                <h1 className="text-white text-2xl font-black leading-tight">
                  {new Date().toLocaleDateString("en-NG", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h1>
                <p className="text-slate-400 text-sm mt-1.5 font-medium">
                  You have{" "}
                  <span className="text-orange-400 font-bold">
                    {data?.pending_orders ?? 5} pending orders
                  </span>{" "}
                  waiting for action
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
                    ₦245.8K
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
                    127
                  </span>
                </div>
                <button
                  onClick={() => navigate("/seller/add-product")}
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

          {/* Stat Cards */}
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
                value={(data?.total_sales || 0).toLocaleString()}
                color="#F97316"
                bg="#FFF7ED"
                trend="+24%"
                trendUp
                sparkData={sparkRevenue}
              />
              <MetricCard
                icon={<FiShoppingBag size={18} />}
                label="Total Orders"
                value={data?.total_orders || 0}
                color="#6366F1"
                bg="#EEF2FF"
                trend="+8%"
                trendUp
                sparkData={sparkOrders}
              />
              <MetricCard
                icon={<MdOutlineInventory2 size={18} />}
                label="Live Products"
                value={data?.total_products || 0}
                color="#0EA5E9"
                bg="#F0F9FF"
                trend="+2"
                trendUp
              />
              <MetricCard
                icon={<FiEye size={18} />}
                label="Profile Views"
                value={(data?.profile_views || 2480).toLocaleString()}
                color="#10B981"
                bg="#F0FDF4"
                trend="+18%"
                trendUp
                sparkData={sparkViews}
              />
            </div>
          )}

          {/* Order Status Pills */}
          {!loading && data && (
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Pending",
                  val: data.pending_orders,
                  color: "#F97316",
                  bg: "#FFF7ED",
                  border: "#FED7AA",
                  icon: <FiClock size={16} />,
                  desc: "Awaiting action",
                },
                {
                  label: "Completed",
                  val: data.completed_orders,
                  color: "#10B981",
                  bg: "#F0FDF4",
                  border: "#BBF7D0",
                  icon: <FiCheckCircle size={16} />,
                  desc: "Successfully done",
                },
                {
                  label: "Cancelled",
                  val: data.cancelled_orders || 0,
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
            <div
              className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 overflow-hidden"
              style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
            >
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Performance
                    </p>
                    <p className="text-xl font-black text-slate-900 mt-1">
                      Sales Revenue
                    </p>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">
                      2024 vs 2023 comparison
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 rounded-full bg-orange-500 inline-block" />
                      <span className="text-slate-500">This Year</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 rounded-full bg-slate-200 inline-block" />
                      <span className="text-slate-400">Last Year</span>
                    </div>
                    <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full font-bold">
                      <FiTrendingUp size={11} /> +24%
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-2" style={{ height: 220 }}>
                <RevenueChart />
              </div>
              <div
                className="grid grid-cols-3 gap-0"
                style={{ borderTop: "1px solid #F8FAFC" }}
              >
                {[
                  {
                    label: "Monthly Revenue",
                    val: "₦245,800",
                    change: "+12%",
                    up: true,
                  },
                  {
                    label: "Conversion Rate",
                    val: "3.8%",
                    change: "+0.4%",
                    up: true,
                  },
                  {
                    label: "Avg Order Value",
                    val: "₦19,354",
                    change: "-2%",
                    up: false,
                  },
                ].map(({ label, val, change, up }, i) => (
                  <div
                    key={label}
                    className={`px-6 py-4 ${i < 2 ? "border-r border-slate-50" : ""}`}
                  >
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      {label}
                    </p>
                    <p className="text-base font-black text-slate-900 mt-1">
                      {val}
                    </p>
                    <p
                      className={`text-[11px] font-bold mt-0.5 ${up ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {change} vs last month
                    </p>
                  </div>
                ))}
              </div>
            </div>

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
              {!loading && data ? (
                <>
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="text-center">
                      <RadialProgress
                        value={data.completed_orders}
                        max={data.total_orders || 1}
                        color="#10B981"
                        size={88}
                      />
                      <p className="text-[10px] font-bold text-emerald-600 mt-1">
                        Done
                      </p>
                    </div>
                    <div className="text-center">
                      <RadialProgress
                        value={data.pending_orders}
                        max={data.total_orders || 1}
                        color="#F97316"
                        size={72}
                      />
                      <p className="text-[10px] font-bold text-orange-500 mt-1">
                        Pending
                      </p>
                    </div>
                    <div className="text-center">
                      <RadialProgress
                        value={data.cancelled_orders || 0}
                        max={data.total_orders || 1}
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
                        val: data.completed_orders,
                        total: data.total_orders || 1,
                        color: "#10B981",
                      },
                      {
                        label: "Pending",
                        val: data.pending_orders,
                        total: data.total_orders || 1,
                        color: "#F97316",
                      },
                      {
                        label: "Processing",
                        val: 3,
                        total: data.total_orders || 1,
                        color: "#6366F1",
                      },
                      {
                        label: "Cancelled",
                        val: data.cancelled_orders || 0,
                        total: data.total_orders || 1,
                        color: "#EF4444",
                      },
                    ].map(({ label, val, total, color }) => (
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
                              ({Math.round((val / total) * 100)}%)
                            </span>
                          </span>
                        </div>
                        <AnimBar value={val} max={total} color={color} />
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
                      {data.total_orders}
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

          {/* Orders Table + Performance */}
          <div className="grid xl:grid-cols-3 gap-5">
            <div
              className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 overflow-hidden"
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
                    Last 5 transactions
                  </p>
                </div>
                <button
                  onClick={() => navigate("/seller/orders")}
                  className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl hover:bg-orange-50 transition"
                >
                  View all <FiChevronRight size={12} />
                </button>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <div className="min-w-[640px]">
                  <div
                    className="grid grid-cols-6 gap-3 px-4 sm:px-6 py-3"
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
                        <div
                          key={i}
                          className="grid grid-cols-6 gap-3 px-4 sm:px-6 py-4"
                        >
                          {[...Array(6)].map((_, j) => (
                            <div
                              key={j}
                              className="h-3 rounded bg-slate-100 animate-pulse"
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : data?.recent_orders?.length ? (
                    <div className="divide-y divide-slate-50">
                      {data.recent_orders.map((order, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-6 gap-3 px-4 sm:px-6 py-4 items-center hover:bg-orange-50/30 transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                              <FiPackage
                                size={12}
                                className="text-orange-400"
                              />
                            </div>
                            <span className="text-[11px] font-bold text-slate-500">
                              {order.id}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {order.product || order.product_name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {order.customer || order.buyer_name}
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
                    <div className="py-12 sm:py-16 text-center">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <FiShoppingBag
                          size={20}
                          className="text-slate-300 sm:w-6 sm:h-6"
                        />
                      </div>
                      <p className="font-bold text-slate-600 text-sm sm:text-base">
                        No orders yet
                      </p>
                      <p className="text-slate-400 text-xs sm:text-sm mt-1">
                        List a product to start selling
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div
                className="bg-white rounded-3xl border border-slate-100 p-6"
                style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Overview
                    </p>
                    <p className="text-base font-black text-slate-900 mt-0.5">
                      Performance
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                    <FiActivity size={14} className="text-slate-400" />
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      label: "Profile Views",
                      val: data?.profile_views || 2480,
                      max: 5000,
                      color: "#6366F1",
                    },
                    {
                      label: "Product Clicks",
                      val: data?.product_clicks || 1560,
                      max: 5000,
                      color: "#F97316",
                    },
                    {
                      label: "Orders This Month",
                      val: data?.total_orders || 127,
                      max: 200,
                      color: "#10B981",
                    },
                    {
                      label: "Completion Rate",
                      val: data?.completion_rate || 89,
                      max: 100,
                      color: "#0EA5E9",
                      suffix: "%",
                    },
                  ].map(({ label, val, max, color, suffix }) => (
                    <div key={label}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-600">
                          {label}
                        </span>
                        <span className="text-xs font-black text-slate-900">
                          {val.toLocaleString()}
                          {suffix}
                        </span>
                      </div>
                      <AnimBar value={val} max={max} color={color} />
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="bg-white rounded-3xl border border-slate-100 p-6"
                style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                  Quick Actions
                </p>
                <div className="space-y-2">
                  {[
                    {
                      icon: <FiPlus size={15} />,
                      label: "Add New Product",
                      sub: "List something to sell",
                      to: "/seller/add-product",
                      color: "#F97316",
                    },
                    {
                      icon: <FiShoppingBag size={15} />,
                      label: "Manage Orders",
                      sub: `${data?.pending_orders ?? 5} pending`,
                      to: "/seller/orders",
                      color: "#6366F1",
                    },
                    {
                      icon: <FiBarChart2 size={15} />,
                      label: "View Analytics",
                      sub: "Full report available",
                      to: "/seller/analytics",
                      color: "#10B981",
                    },
                    {
                      icon: <FaBullhorn size={14} />,
                      label: "Boost Products",
                      sub: "Increase visibility",
                      to: "/seller/promote",
                      color: "#0EA5E9",
                    },
                  ].map(({ icon, label, sub, to, color }) => (
                    <button
                      key={label}
                      onClick={() => navigate(to)}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-slate-50 transition group text-left"
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: color + "15", color }}
                      >
                        {icon}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-slate-900 leading-tight">
                          {label}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {sub}
                        </p>
                      </div>
                      <FiArrowRight
                        size={13}
                        className="text-slate-200 group-hover:text-orange-400 transition-colors shrink-0"
                      />
                    </button>
                  ))}
                </div>
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
                    Products with 3+ clear, well-lit images get dramatically
                    more clicks. Shoot in natural light with a neutral
                    background.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/seller/add-product")}
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
        </main>
      </div>
    </div>
  );
};

export default SellerDashboard;
