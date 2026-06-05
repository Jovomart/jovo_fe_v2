"use client";

import { useState, useContext, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";
import apiService from "@/services/apiService";
import {
  FiHome,
  FiShoppingBag,
  FiSettings,
  FiLogOut,
  FiChevronRight,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiMenu,
  FiX,
  FiBell,
  FiTrendingUp,
  FiPackage,
  FiClock,
  FiDollarSign,
  FiBarChart2,
  FiZap,
  FiHelpCircle,
  FiTag,
  FiTruck,
} from "react-icons/fi";
import {
  MdOutlineInventory2,
  MdOutlineDeliveryDining,
  MdOutlineSwapHoriz,
  MdAnalytics,
} from "react-icons/md";
import { FaStore, FaBullhorn, FaCrown, FaRocket } from "react-icons/fa";
import { HiTable, HiOutlineSupport } from "react-icons/hi";
import { GiConfirmed } from "react-icons/gi";
import { GrProductHunt } from "react-icons/gr";
import { VerifiedIcon, StoreIcon, PackageIcon, ClockIcon } from "lucide-react";
import { HiWallet } from "react-icons/hi2";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SellerStats {
  totalSales?: number;
  totalOrders?: number;
  pendingOrders?: number;
  totalProducts?: number;
  todayViews?: number;
  conversionRate?: number;
}

interface SellerLayoutProps {
  children: React.ReactNode;
  activeNav?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  pageTitle?: string;
  headerAction?: React.ReactNode;
  stats?: SellerStats;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const fmtCurrency = (n: number) =>
  n >= 1_000_000
    ? `₦${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `₦${(n / 1_000).toFixed(1)}K`
      : `₦${n.toLocaleString()}`;

// ─── Component ────────────────────────────────────────────────────────────────

const SellerLayout = ({
  children,
  activeNav = "dashboard",
  onRefresh,
  isLoading = false,
  pageTitle,
  headerAction,
  stats = {},
}: SellerLayoutProps) => {
  const { user, exitSellerMode } = useContext(AuthContext) as any;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("Welcome");
  const [displayName, setDisplayName] = useState("Seller");
  const [initials, setInitials] = useState("SE");
  const [notifications] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // FIX: Use refs to prevent multiple state updates
  const isMountedRef = useRef(false);
  const userDataAppliedRef = useRef(false);

  // FIX: Use setTimeout to avoid direct setState in effect
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      const timer1 = setTimeout(() => setMounted(true), 0);
      const timer2 = setTimeout(() => {
        const h = new Date().getHours();
        setGreeting(
          h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening",
        );
      }, 0);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, []);

  // FIX: Use setTimeout to avoid direct setState in effect
  useEffect(() => {
    if (user && !userDataAppliedRef.current) {
      userDataAppliedRef.current = true;
      const name =
        user?.full_name || user?.username || user?.first_name || "Seller";
      const timer1 = setTimeout(() => setDisplayName(name), 0);
      const timer2 = setTimeout(() => {
        setInitials(
          name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
        );
      }, 0);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [user]);

  const navigate = (p: string) => {
    window.location.href = p;
    setSidebarOpen(false);
  };

  const handleSwitchToBuyer = async () => {
    try {
      if (typeof exitSellerMode === "function") await exitSellerMode();
    } catch {}
    window.location.href = "/shop";
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
      badge: stats.totalProducts,
    },
    {
      id: "analytics",
      icon: <FiBarChart2 size={17} />,
      label: "Analytics",
      to: "/seller/analytics",
    },
    {
      id: "orders",
      icon: <FiShoppingBag size={17} />,
      label: "Orders",
      to: "/seller/orders",
      badge: stats.pendingOrders,
    },
    {
      id: "deliveries",
      icon: <MdOutlineDeliveryDining size={17} />,
      label: "Deliveries",
      to: "/seller/deliveries",
    },
    {
      id: "wallet",
      icon: <HiWallet size={17} />,
      label: "Wallet",
      to: "/seller/wallet",
    },
    {
      id: "promote",
      icon: <FaBullhorn size={15} />,
      label: "Promotions",
      to: "/seller/promote",
    },
    {
      id: "profile",
      icon: <StoreIcon size={17} />,
      label: "Profile",
      to: "/seller/profile",
    },
    {
      id: "settings",
      icon: <FiSettings size={17} />,
      label: "Settings",
      to: "/seller/settings",
    },
  ];

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: "#F8FAFC",
        fontFamily: "'DM Sans','Plus Jakarta Sans','Segoe UI',sans-serif",
      }}
    >
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══════ SIDEBAR ═══════ */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 w-64 flex flex-col transition-transform duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen`}
        style={{
          background: "#FFFFFF",
          borderRight: "1px solid #F1F5F9",
          boxShadow: "4px 0 30px rgba(0,0,0,0.04)",
        }}
      >
        {/* Logo */}
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

        {/* Profile Card */}
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
              <span suppressHydrationWarning>{mounted ? initials : "SE"}</span>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>
            <div className="overflow-hidden">
              <p
                className="text-slate-900 text-sm font-bold truncate"
                suppressHydrationWarning
              >
                {mounted ? displayName : "Seller"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <FaCrown size={8} className="text-amber-500" />
                <p className="text-amber-700 text-[10px] font-bold">Seller</p>
              </div>
            </div>
            <VerifiedIcon
              size={12}
              className="text-orange-500 shrink-0 ml-auto"
            />
          </div>
          {stats.totalSales !== undefined && (
            <div
              className="mt-3 pt-3"
              style={{ borderTop: "1px solid rgba(249,115,22,0.15)" }}
            >
              <div className="flex justify-between text-[10px]">
                <span className="text-amber-700 font-semibold">Revenue</span>
                <span className="font-black text-slate-900">
                  {fmtCurrency(stats.totalSales || 0)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 px-3.5 pt-2 pb-1.5">
            Main Menu
          </p>
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.id}
              href={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 text-left group ${
                activeNav === item.id
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                  : "text-slate-500 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              <span
                className={`shrink-0 transition-transform duration-150 ${
                  activeNav === item.id ? "" : "group-hover:scale-110"
                }`}
              >
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                    activeNav === item.id
                      ? "bg-white/20 text-white"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {item.badge}
                </span>
              )}
              {activeNav === item.id && <FiChevronRight size={13} />}
            </Link>
          ))}
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 px-3.5 pt-4 pb-1.5">
            Manage
          </p>
          {navItems.slice(5).map((item) => (
            <Link
              key={item.id}
              href={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 text-left group ${
                activeNav === item.id
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                  : "text-slate-500 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              <span
                className={`shrink-0 ${activeNav === item.id ? "" : "group-hover:scale-110"}`}
              >
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {activeNav === item.id && <FiChevronRight size={13} />}
            </Link>
          ))}
        </nav>

        {/* Footer */}
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
            onClick={() => {
              apiService.logout();
              window.location.href = "/";
            }}
            className="w-full flex items-center gap-2.5 py-2.5 px-4 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-50 transition"
          >
            <FiLogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* ═══════ MAIN AREA ═══════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ENHANCED RESPONSIVE TOPBAR */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
          {/* Mobile Search Overlay (when search is active on mobile) */}
          {showMobileSearch && (
            <div className="fixed inset-0 z-50 bg-white lg:hidden">
              <div className="flex items-center gap-3 p-4 border-b border-slate-100">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                  <FiSearch size={18} className="text-slate-400" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search orders, products, customers..."
                    className="flex-1 bg-transparent outline-none text-slate-700 text-sm"
                  />
                </div>
                <button
                  onClick={() => {
                    setShowMobileSearch(false);
                    setSearchQuery("");
                  }}
                  className="px-3 py-2 text-sm font-semibold text-slate-600"
                >
                  Cancel
                </button>
              </div>
              <div className="p-4">
                <p className="text-xs text-slate-400 mb-2">Recent searches</p>
                {/* Add recent searches here */}
              </div>
            </div>
          )}

          {/* Main Topbar Row */}
          <div className="px-3 sm:px-4 md:px-6 py-2.5 md:py-3">
            <div className="flex items-center justify-between gap-2 md:gap-4">
              {/* Left Section - Menu + Brand + Greeting */}
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-1.5 md:p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors text-slate-600"
                >
                  <FiMenu size={18} className="md:w-5 md:h-5" />
                </button>

                {/* Desktop Logo/Brand */}
                <div className="hidden lg:flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <FaStore size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="font-black text-sm text-slate-900">JOVO</p>
                    <p className="text-[9px] font-semibold text-orange-500">
                      Seller
                    </p>
                  </div>
                </div>

                {/* Mobile Greeting (visible only on mobile when search not active) */}
                {!showMobileSearch && (
                  <div className="lg:hidden">
                    <p
                      className="text-[10px] text-slate-400 font-medium"
                      suppressHydrationWarning
                    >
                      {greeting}
                    </p>
                    <p
                      className="text-sm font-bold text-slate-800 leading-tight"
                      suppressHydrationWarning
                    >
                      {displayName.split(" ")[0]}
                    </p>
                  </div>
                )}

                {/* Desktop Page Title */}
                {pageTitle && (
                  <div className="hidden md:block h-6 w-px bg-slate-200 mx-2" />
                )}
                {pageTitle && (
                  <h1 className="hidden md:block text-lg font-bold text-slate-800">
                    {pageTitle}
                  </h1>
                )}
              </div>

              {/* Center Section - Search (Desktop full, Mobile icon) */}
              <div className="hidden md:flex flex-1 max-w-md mx-4">
                <div className="w-full relative">
                  <FiSearch
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search orders, products, customers..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
              </div>

              {/* Right Section - Actions */}
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                {/* Mobile Search Button */}
                <button
                  onClick={() => setShowMobileSearch(true)}
                  className="md:hidden p-1.5 md:p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                >
                  <FiSearch size={18} />
                </button>

                {/* Quick Stats (Tablet+) */}
                <div className="hidden sm:flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <FiDollarSign size={12} className="text-emerald-500" />
                    <div>
                      <p className="text-[9px] text-slate-400">Revenue</p>
                      <p className="text-xs font-bold text-slate-700">
                        {fmtCurrency(stats.totalSales || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="w-px h-6 bg-slate-200" />
                  <div className="flex items-center gap-1.5">
                    <FiPackage size={12} className="text-orange-400" />
                    <div>
                      <p className="text-[9px] text-slate-400">Orders</p>
                      <p className="text-xs font-bold text-slate-700">
                        {stats.totalOrders || 0}
                      </p>
                    </div>
                  </div>
                  <div className="w-px h-6 bg-slate-200" />
                  <div className="flex items-center gap-1.5">
                    <FiClock size={12} className="text-amber-500" />
                    <div>
                      <p className="text-[9px] text-slate-400">Pending</p>
                      <p className="text-xs font-bold text-slate-700">
                        {stats.pendingOrders || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Refresh Button */}
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    className="p-1.5 md:p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
                    disabled={isLoading}
                  >
                    <FiRefreshCw
                      size={16}
                      className={isLoading ? "animate-spin" : ""}
                    />
                  </button>
                )}

                {/* Notification Bell */}
                <button className="relative p-1.5 md:p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600">
                  <FiBell size={16} className="md:w-[18px] md:h-[18px]" />
                  {notifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button>

                {/* Primary Action Button */}
                {headerAction ?? (
                  <Link
                    href="/seller/add-product"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                  >
                    <FiPlus size={14} className="md:w-4 md:h-4" />
                    <span className="hidden xs:inline">Add</span>
                    <span className="hidden sm:inline ml-0">Product</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Stats Row (Cards) - Only on Mobile */}
          <div className="sm:hidden px-3 pb-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-xl p-2.5 border border-emerald-100">
                <div className="flex items-center justify-between mb-1">
                  <FiDollarSign size={12} className="text-emerald-600" />
                  <span className="text-[9px] font-bold text-emerald-600">
                    Revenue
                  </span>
                </div>
                <p className="text-sm font-black text-emerald-700">
                  {fmtCurrency(stats.totalSales || 0)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100/30 rounded-xl p-2.5 border border-orange-100">
                <div className="flex items-center justify-between mb-1">
                  <FiPackage size={12} className="text-orange-600" />
                  <span className="text-[9px] font-bold text-orange-600">
                    Orders
                  </span>
                </div>
                <p className="text-sm font-black text-orange-700">
                  {stats.totalOrders || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 rounded-xl p-2.5 border border-amber-100">
                <div className="flex items-center justify-between mb-1">
                  <FiClock size={12} className="text-amber-600" />
                  <span className="text-[9px] font-bold text-amber-600">
                    Pending
                  </span>
                </div>
                <p className="text-sm font-black text-amber-700">
                  {stats.pendingOrders || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Chips (Mobile Only) - All emojis replaced with icons */}
          <div className="sm:hidden px-3 pb-3 overflow-x-auto flex gap-2 scrollbar-hide">
            <Link
              href="/seller/orders"
              className="whitespace-nowrap text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 active:bg-slate-200 transition flex items-center gap-1.5"
            >
              <FiTruck size={10} />
              Manage Orders
            </Link>
            <Link
              href="/seller/analytics"
              className="whitespace-nowrap text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 active:bg-slate-200 transition flex items-center gap-1.5"
            >
              <FiBarChart2 size={10} />
              Analytics
            </Link>
            <Link
              href="/seller/promote"
              className="whitespace-nowrap text-[10px] font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 active:bg-orange-200 transition flex items-center gap-1.5"
            >
              <FaRocket size={9} />
              Boost Sales
            </Link>
            <Link
              href="/seller/support"
              className="whitespace-nowrap text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 active:bg-slate-200 transition flex items-center gap-1.5"
            >
              <HiOutlineSupport size={10} />
              Support
            </Link>
            <Link
              href="/seller/promotions"
              className="whitespace-nowrap text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 active:bg-slate-200 transition flex items-center gap-1.5"
            >
              <FiTag size={10} />
              Promotions
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Add hide scrollbar styles */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default SellerLayout;
