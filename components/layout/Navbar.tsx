"use client";
import { useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FiMenu,
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiHeart,
  FiBox,
  FiLogIn,
  FiLogOut,
  FiX,
  FiChevronRight,
  FiCpu,
  FiSmartphone,
  FiMonitor,
  FiHome,
  FiSettings,
  FiTag,
  FiArrowRight,
  FiClock,
  FiTruck,
  FiChevronDown,
  FiBriefcase,
} from "react-icons/fi";
import {
  MdStorefront,
  MdCleaningServices,
  MdOutlineDeliveryDining,
} from "react-icons/md";
import { FaLeaf, FaSpa, FaConciergeBell, FaStore } from "react-icons/fa";
import { AuthContext } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";

const categories = [
  {
    name: "Appliances",
    icon: <FiCpu size={18} />,
    to: "/appliances-deals",
    color: "bg-orange-100 text-orange-600",
  },
  {
    name: "Phones & Tablets",
    icon: <FiSmartphone size={18} />,
    to: "/phone-deals",
    color: "bg-blue-100 text-blue-600",
  },
  {
    name: "Health & Beauty",
    icon: <FiHeart size={18} />,
    to: "/beauty-deals",
    color: "bg-pink-100 text-pink-600",
  },
  {
    name: "Electronics",
    icon: <FiMonitor size={18} />,
    to: "/electronic-deals",
    color: "bg-purple-100 text-purple-600",
  },
  {
    name: "Fashion",
    icon: <FiTag size={18} />,
    to: "/fashion-deals",
    color: "bg-red-100 text-red-600",
  },
  {
    name: "Computing",
    icon: <FiCpu size={18} />,
    to: "/computing-deals",
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    name: "Gaming",
    icon: <FiMonitor size={18} />,
    to: "/gaming-deals",
    color: "bg-green-100 text-green-600",
  },
  {
    name: "Home & Living",
    icon: <FiHome size={18} />,
    to: "/home-deals",
    color: "bg-yellow-100 text-yellow-600",
  },
];

const moreCategories = [
  {
    name: "Groceries & Snacks",
    icon: <FaLeaf size={16} />,
    to: "/groceries",
    color: "bg-green-100 text-green-700",
  },
  {
    name: "Perishable Items",
    icon: <FiClock size={16} />,
    to: "/perishable",
    color: "bg-amber-100 text-amber-700",
  },
  {
    name: "Personal Care",
    icon: <FaSpa size={16} />,
    to: "/personal-care",
    color: "bg-violet-100 text-violet-700",
  },
  {
    name: "Cleaning & Hygiene",
    icon: <MdCleaningServices size={16} />,
    to: "/cleaning-hygiene",
    color: "bg-sky-100 text-sky-700",
  },
  {
    name: "Accommodations",
    icon: <FiHome size={16} />,
    to: "/accommodations",
    color: "bg-rose-100 text-rose-700",
  },
  {
    name: "Drinks",
    icon: <MdStorefront size={16} />,
    to: "/drink-deals",
    color: "bg-teal-100 text-teal-700",
  },
];

const SearchDropdown = ({ query, onSelect }: any) => {
  const q = query.trim().toLowerCase();
  const results =
    q.length > 0
      ? (products as any[])
          .filter(
            (p: any) =>
              p.name?.toLowerCase().includes(q) ||
              p.category?.toLowerCase().includes(q) ||
              p.brand?.toLowerCase().includes(q) ||
              p.description?.toLowerCase().includes(q),
          )
          .slice(0, 7)
      : [];
  const hasResults = results.length > 0;

  return (
    <div
      className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl border border-gray-100 overflow-hidden z-[100]"
      style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
    >
      {hasResults && (
        <>
          <div className="px-4 pt-3 pb-1">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
              Products ({results.length})
            </p>
          </div>
          <div>
            {results.map((product: any) => {
              const discount = product.oldPrice
                ? Math.round(
                    ((product.oldPrice - product.price) / product.oldPrice) *
                      100,
                  )
                : null;
              return (
                <button
                  key={product.id}
                  onMouseDown={() => onSelect(product)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group text-left"
                >
                  <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      width={44}
                      height={44}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#B42225] transition-colors leading-tight">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-[#B42225]">
                        ₦{product.price?.toLocaleString()}
                      </span>
                      {product.oldPrice && (
                        <span className="text-[11px] text-gray-400 line-through">
                          ₦{product.oldPrice?.toLocaleString()}
                        </span>
                      )}
                      {discount && (
                        <span className="text-[10px] font-bold bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full">
                          -{discount}%
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="hidden sm:inline text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full capitalize shrink-0">
                    {product.category}
                  </span>
                  <FiArrowRight
                    size={14}
                    className="text-gray-300 group-hover:text-[#B42225] shrink-0 transition-colors"
                  />
                </button>
              );
            })}
          </div>
          <div className="border-t border-gray-100 px-4 py-2.5">
            <button
              onMouseDown={() => onSelect(null, query)}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-[#B42225] hover:bg-[#B42225]/5 py-2 rounded-xl transition-colors"
            >
              <FiSearch size={13} /> See all results for &quot;{query.trim()}
              &quot; <FiChevronRight size={13} />
            </button>
          </div>
        </>
      )}
      {!hasResults && q.length > 0 && (
        <div className="px-4 py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <FiSearch size={20} className="text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700">
            No results for &quot;{query.trim()}&quot;
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Try a different keyword or browse categories below
          </p>
        </div>
      )}
      {q.length === 0 && (
        <div className="p-4">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-3">
            Browse Categories
          </p>
          <div className="grid grid-cols-4 gap-2">
            {categories.map(({ name, icon, to, color }) => (
              <button
                key={name}
                onMouseDown={() => onSelect(null, null, to)}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-gray-50 transition text-center"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}
                >
                  {icon}
                </div>
                <span className="text-[10px] text-gray-600 font-medium leading-tight">
                  {name}
                </span>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-3 pt-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-3">
              More
            </p>
            <div className="grid grid-cols-4 gap-2">
              {moreCategories.map(({ name, icon, to, color }) => (
                <button
                  key={name}
                  onMouseDown={() => onSelect(null, null, to)}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-gray-50 transition text-center"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}
                  >
                    {icon}
                  </div>
                  <span className="text-[10px] text-gray-600 font-medium leading-tight">
                    {name}
                  </span>
                </button>
              ))}
              <button
                onMouseDown={() => onSelect(null, null, "/services")}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-gray-50 transition text-center"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-orange-100 text-orange-600">
                  <FaConciergeBell size={15} />
                </div>
                <span className="text-[10px] text-gray-600 font-medium leading-tight">
                  Services
                </span>
              </button>
              <button
                onMouseDown={() => onSelect(null, null, "/logistics")}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-gray-50 transition text-center"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-100 text-green-600">
                  <MdOutlineDeliveryDining size={17} />
                </div>
                <span className="text-[10px] text-gray-600 font-medium leading-tight">
                  Logistics
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// CART BUTTON WITH BADGE
// ─────────────────────────────────────────────────────────────
function CartButton({ onClick }: { onClick: () => void }) {
  const { itemCount, recentlyAdded } = useCart();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (recentlyAdded !== null) {
      setPulse(true); // eslint-disable-line react-hooks/set-state-in-effect
      const t = setTimeout(() => setPulse(false), 650);
      return () => clearTimeout(t);
    }
  }, [recentlyAdded]);

  return (
    <>
      <style>{`
        @keyframes badgePop {
          0%  { transform: scale(0) rotate(-20deg); opacity: 0; }
          65% { transform: scale(1.3) rotate(6deg);  opacity: 1; }
          100%{ transform: scale(1)   rotate(0);    opacity: 1; }
        }
        @keyframes cartPulse {
          0%,100%{ transform: scale(1);    }
          40%    { transform: scale(1.18); }
          70%    { transform: scale(0.94); }
        }
      `}</style>
      <button
        onClick={onClick}
        className="relative flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition text-gray-700 group"
      >
        <FiShoppingCart
          size={22}
          className="group-hover:text-[#B42225] transition-colors"
          style={{
            animation: pulse
              ? "cartPulse 0.65s cubic-bezier(.34,1.56,.64,1)"
              : undefined,
          }}
        />
        <span className="hidden md:inline text-sm font-medium group-hover:text-[#B42225] transition-colors">
          Cart
        </span>
        {itemCount > 0 && (
          <span
            key={itemCount}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center
                       rounded-full text-[9px] font-black text-white px-1 shadow-md"
            style={{
              background: "linear-gradient(135deg,#B42225,#FF6B00)",
              animation: "badgePop 0.45s cubic-bezier(.34,1.56,.64,1) both",
            }}
          >
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </button>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN NAVBAR
// ─────────────────────────────────────────────────────────────
export default function Navbar() {
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [desktopQuery, setDesktopQuery] = useState("");
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileQuery, setMobileQuery] = useState("");
  const [mobileDropOpen, setMobileDropOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const {
    user,
    logout,
    isSeller,
    isServiceProvider,
    sellerMode,
    enterSellerMode,
  } = useContext(AuthContext) as any;
  const router = useRouter();

  const displayName =
    user?.full_name || user?.username || user?.name || "Account";
  const initials =
    displayName !== "Account"
      ? displayName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : null;

  // ── Derive stable booleans only after mount so SSR output is neutral ──
  const isLoggedIn = mounted && !!user;
  const isSellerVerified = mounted && !!isSeller;
  const isServiceProviderVerified = mounted && !!isServiceProvider;

  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node))
        setAccountOpen(false);
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(e.target as Node)
      )
        setDesktopOpen(false);
      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target as Node)
      )
        setMobileDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleSelect = (
    product: any,
    rawQuery?: any,
    categoryPath?: string,
  ) => {
    setDesktopOpen(false);
    setMobileDropOpen(false);
    setDesktopQuery("");
    setMobileQuery("");
    if (product) router.push(`/product/${product.id}`);
    else if (categoryPath) router.push(categoryPath);
    else if (rawQuery)
      router.push(`/shop?search=${encodeURIComponent(rawQuery.trim())}`);
  };

  const commitSearch = (q: string) => {
    if (!q.trim()) return;
    setDesktopOpen(false);
    setMobileDropOpen(false);
    const matches = (products as any[]).filter(
      (p: any) =>
        p.name?.toLowerCase().includes(q.trim().toLowerCase()) ||
        p.category?.toLowerCase().includes(q.trim().toLowerCase()),
    );
    if (matches.length === 1) router.push(`/product/${matches[0].id}`);
    else router.push(`/shop?search=${encodeURIComponent(q.trim())}`);
    setDesktopQuery("");
    setMobileQuery("");
  };

  const handleLogout = async () => {
    setAccountOpen(false);
    setMobileOpen(false);
    await logout();
    router.push("/");
  };

  const handleEnterSellerMode = async () => {
    setAccountOpen(false);
    setMobileOpen(false);
    await enterSellerMode();
    router.push("/seller/dashboard");
  };

  const goTo = (path: string) => {
    router.push(path);
    setMobileOpen(false);
    setAccountOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.08)]" : "bg-white shadow-sm"}`}
      >
        <div
          className="h-0.5 w-full"
          style={{
            background: "linear-gradient(to right, #B42225, #FF8C00, #B42225)",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-0">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition text-gray-700"
            onClick={() => setMobileOpen(true)}
          >
            <FiMenu size={22} />
          </button>
          <Image
            src="/images/Jovo_official_logo.png"
            alt="Jovo"
            onClick={() => router.push(isLoggedIn ? "/shop" : "/")}
            width={220}
            height={48}
            className="cursor-pointer shrink-0 md:w-55 md:h-12 w-28 h-10 object-cover"
            priority
          />

          {/* Desktop search */}
          <div
            className="hidden md:flex flex-1 max-w-3xl mx-4 relative"
            ref={desktopSearchRef}
          >
            <div
              className={`flex w-full rounded-xl overflow-hidden border transition-all duration-200 ${desktopOpen ? "border-[#B42225] shadow-[0_0_0_3px_rgba(180,34,37,0.1)]" : "border-gray-200 hover:border-gray-300"}`}
            >
              <input
                type="text"
                placeholder="Search products, brands and categories..."
                className="flex-1 px-4 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder-gray-400"
                value={desktopQuery}
                onChange={(e) => {
                  setDesktopQuery(e.target.value);
                  setDesktopOpen(true);
                }}
                onFocus={() => setDesktopOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitSearch(desktopQuery);
                  if (e.key === "Escape") setDesktopOpen(false);
                }}
                autoComplete="off"
              />
              {desktopQuery && (
                <button
                  onClick={() => {
                    setDesktopQuery("");
                    setDesktopOpen(false);
                  }}
                  className="px-2 text-gray-400 hover:text-gray-600 transition bg-white"
                >
                  <FiX size={15} />
                </button>
              )}
              <button
                onClick={() => commitSearch(desktopQuery)}
                className="bg-[#B42225] hover:bg-[#9e1e20] px-5 text-white font-medium text-sm flex items-center gap-2 transition-colors"
              >
                <FiSearch size={16} />
                <span>Search</span>
              </button>
            </div>
            {desktopOpen && (
              <SearchDropdown query={desktopQuery} onSelect={handleSelect} />
            )}
          </div>

          {/* Right actions */}
          <div className="ml-auto md:ml-0 flex items-center gap-1 md:gap-2">
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setAccountOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition text-gray-700"
              >
                {/* ── Avatar: always render the neutral shell; fill after mount ── */}
                <div className="relative w-8 h-8 rounded-full bg-[#B42225]/10 flex items-center justify-center shrink-0">
                  {!mounted ? (
                    <FiUser size={20} className="text-[#B42225]" />
                  ) : user?.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                      width={32}
                      height={32}
                    />
                  ) : initials ? (
                    <span className="text-xs font-bold text-[#B42225]">
                      {initials}
                    </span>
                  ) : (
                    <FiUser size={20} className="text-[#B42225]" />
                  )}
                  {isSellerVerified && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                  )}
                </div>
                <span className="hidden md:inline text-sm font-medium max-w-[90px] truncate">
                  {!mounted ? "Account" : displayName}
                </span>
              </button>

              {/* Account dropdown */}
              <div
                className={`absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 transition-all duration-200 origin-top-right z-[200] ${accountOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}`}
              >
                {!mounted ? (
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-gray-400 text-center mb-3 font-medium uppercase tracking-wide">
                      Your Account
                    </p>
                    <div className="h-10 rounded-xl bg-gray-100 animate-pulse" />
                    <div className="h-10 rounded-xl bg-gray-100 animate-pulse" />
                  </div>
                ) : user ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#B42225]/10 flex items-center justify-center shrink-0">
                          {user.photoURL ? (
                            <Image
                              src={user.photoURL}
                              alt=""
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-bold text-[#B42225]">
                              {initials}
                            </span>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {displayName}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {user.email}
                          </p>
                          {isSellerVerified && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
                              <FaStore size={8} /> Verified Seller
                            </span>
                          )}
                          {isServiceProviderVerified && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-0.5">
                              <FiBriefcase size={8} /> Service Provider
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="py-1.5">
                      {!isSellerVerified && (
                        <button
                          onClick={() => goTo("/seller/application-status")}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors group"
                        >
                          <FiClock
                            size={15}
                            className="text-gray-400 group-hover:text-blue-600"
                          />
                          <span className="flex-1 text-left">
                            Seller Status
                          </span>
                          <FiChevronRight
                            size={13}
                            className="ml-auto text-gray-300 group-hover:text-blue-600"
                          />
                        </button>
                      )}
                      {isSellerVerified && (
                        <button
                          onClick={handleEnterSellerMode}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors group"
                        >
                          <FaStore
                            size={15}
                            className="text-gray-400 group-hover:text-green-600"
                          />
                          <span className="flex-1 text-left">
                            Switch to Seller
                          </span>
                          <FiChevronRight
                            size={13}
                            className="ml-auto text-gray-300 group-hover:text-green-600"
                          />
                        </button>
                      )}
                      {!isServiceProviderVerified && (
                        <button
                          onClick={() => goTo("/become-service-provider")}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors group"
                        >
                          <FiBriefcase
                            size={15}
                            className="text-gray-400 group-hover:text-purple-600"
                          />
                          <span className="flex-1 text-left">
                            Become Service Provider
                          </span>
                          <FiChevronRight
                            size={13}
                            className="ml-auto text-gray-300 group-hover:text-purple-600"
                          />
                        </button>
                      )}
                      {isServiceProviderVerified && (
                        <button
                          onClick={() => goTo("/service-dashboard")}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors group"
                        >
                          <FiBriefcase
                            size={15}
                            className="text-gray-400 group-hover:text-purple-600"
                          />
                          <span className="flex-1 text-left">
                            Visit Service Dashboard
                          </span>
                          <FiChevronRight
                            size={13}
                            className="ml-auto text-gray-300 group-hover:text-purple-600"
                          />
                        </button>
                      )}
                      {[
                        {
                          icon: <FiUser size={15} />,
                          label: "My Profile",
                          to: "/profile",
                        },
                        {
                          icon: <FiBox size={15} />,
                          label: "My Orders",
                          to: "/order",
                        },
                        {
                          icon: <FiHeart size={15} />,
                          label: "Wishlist",
                          to: "/wishlist",
                        },
                        {
                          icon: <FiSettings size={15} />,
                          label: "Settings",
                          to: "/settings",
                        },
                      ].map(({ icon, label, to }) => (
                        <button
                          key={label}
                          onClick={() => goTo(to)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#B42225] transition-colors group"
                        >
                          <span className="text-gray-400 group-hover:text-[#B42225] transition-colors">
                            {icon}
                          </span>
                          {label}
                          <FiChevronRight
                            size={13}
                            className="ml-auto text-gray-300 group-hover:text-[#B42225] transition-colors"
                          />
                        </button>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                      >
                        <FiLogOut size={15} /> Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-gray-400 text-center mb-3 font-medium uppercase tracking-wide">
                      Your Account
                    </p>
                    <button
                      onClick={() => goTo("/login")}
                      className="w-full flex items-center justify-center gap-2 bg-[#B42225] hover:bg-[#9e1e20] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <FiLogIn size={15} /> Sign In
                    </button>
                    <button
                      onClick={() => goTo("/register")}
                      className="w-full border border-[#B42225] text-[#B42225] py-2.5 rounded-xl text-sm font-semibold hover:bg-[#B42225]/5 transition-colors"
                    >
                      Create Account
                    </button>
                  </div>
                )}
              </div>
            </div>

            <CartButton onClick={() => router.push("/cart")} />
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative" ref={mobileSearchRef}>
            <div
              className={`flex rounded-xl overflow-hidden border transition-all duration-200 ${mobileDropOpen ? "border-[#B42225] shadow-[0_0_0_3px_rgba(180,34,37,0.1)]" : "border-gray-200"}`}
            >
              <input
                type="text"
                placeholder="Search products, categories..."
                className="flex-1 px-3 py-2.5 text-sm outline-none bg-white placeholder-gray-400"
                value={mobileQuery}
                onChange={(e) => {
                  setMobileQuery(e.target.value);
                  setMobileDropOpen(true);
                }}
                onFocus={() => setMobileDropOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitSearch(mobileQuery);
                  if (e.key === "Escape") setMobileDropOpen(false);
                }}
                autoComplete="off"
              />
              {mobileQuery && (
                <button
                  onClick={() => {
                    setMobileQuery("");
                    setMobileDropOpen(false);
                  }}
                  className="px-2 bg-white text-gray-400"
                >
                  <FiX size={15} />
                </button>
              )}
              <button
                onClick={() => commitSearch(mobileQuery)}
                className="bg-[#FF8C00] px-4 text-white flex items-center"
              >
                <FiSearch size={17} />
              </button>
            </div>
            {mobileDropOpen && (
              <SearchDropdown query={mobileQuery} onSelect={handleSelect} />
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile sidebar ── */}
      <div
        className={`fixed inset-0 z-[60] flex transition-all duration-300 ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`relative flex flex-col bg-white w-[320px] h-full shadow-2xl transform transition-transform duration-300 ease-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* ── Sidebar header ──────────────────────────────────────
              FIX: gate on `mounted` so SSR always renders the guest
              shell; the client hydrates to the same neutral output
              and then swaps to user content after mount.
          ─────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-5 py-4 bg-[#B42225]">
            <div className="flex items-center gap-3">
              {/* Neutral avatar shell – identical on server & first client paint */}
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                {!mounted ? (
                  // SSR / pre-hydration: always show the icon (no border-2)
                  <FiUser size={20} className="text-white" />
                ) : isLoggedIn ? (
                  // Post-mount, logged-in: show photo or initials
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 border-2 border-white/30 overflow-hidden">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt=""
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-white">
                        {initials}
                      </span>
                    )}
                  </div>
                ) : (
                  // Post-mount, guest
                  <FiUser size={20} className="text-white" />
                )}
              </div>

              <div>
                {!mounted ? (
                  // Neutral text during SSR
                  <>
                    <p className="text-white font-semibold text-sm">
                      Hello, Guest
                    </p>
                    <p className="text-white/60 text-xs">
                      Sign in for the best experience
                    </p>
                  </>
                ) : isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold text-sm leading-tight">
                        {displayName}
                      </p>
                      {isSellerVerified && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black bg-white/20 text-white px-1.5 py-0.5 rounded-full">
                          <FaStore size={7} /> Seller
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 text-xs truncate max-w-[160px]">
                      {user.email}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-white font-semibold text-sm">
                      Hello, Guest
                    </p>
                    <p className="text-white/60 text-xs">
                      Sign in for the best experience
                    </p>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => setMobileOpen(false)}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition text-white"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* ── Sign-in strip ────────────────────────────────────────
              FIX: render nothing (not the guest buttons) until mounted
              so the SSR output matches the initial client render.
          ─────────────────────────────────────────────────────── */}
          {mounted && !isLoggedIn && (
            <div className="px-4 py-3 flex gap-2 border-b border-gray-100">
              <button
                onClick={() => goTo("/login")}
                className="flex-1 bg-[#B42225] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#9e1e20] transition"
              >
                Sign In
              </button>
              <button
                onClick={() => goTo("/register")}
                className="flex-1 border border-[#B42225] text-[#B42225] py-2.5 rounded-xl text-sm font-semibold hover:bg-[#B42225]/5 transition"
              >
                Register
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {/* ── My Account quick links ───────────────────────────
                FIX: gate on mounted so SSR produces nothing here.
            ─────────────────────────────────────────────────── */}
            {mounted && isLoggedIn && (
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2 px-1">
                  My Account
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      icon: <FiBox size={18} />,
                      label: "Orders",
                      to: "/orders",
                    },
                    {
                      icon: <FiHeart size={18} />,
                      label: "Wishlist",
                      to: "/wishlist",
                    },
                    {
                      icon: <FiUser size={18} />,
                      label: "Profile",
                      to: "/profile",
                    },
                  ].map(({ icon, label, to }) => (
                    <button
                      key={label}
                      onClick={() => goTo(to)}
                      className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-gray-50 hover:bg-[#B42225]/5 hover:text-[#B42225] transition text-gray-600 text-xs font-medium"
                    >
                      {icon}
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="px-4 pt-3 pb-2">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2 px-1">
                Shop by Category
              </p>
              <div className="space-y-0.5">
                {categories.map(({ name, icon, to, color }) => (
                  <button
                    key={name}
                    onClick={() => goTo(to)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition group text-left"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}
                    >
                      {icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#B42225] transition-colors flex-1">
                      {name}
                    </span>
                    <FiChevronRight
                      size={14}
                      className="text-gray-300 group-hover:text-[#B42225] transition-colors"
                    />
                  </button>
                ))}
                <button
                  onClick={() => setMoreOpen((o) => !o)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition group text-left"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gray-100 text-gray-500">
                    <MdStorefront size={18} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#B42225] transition-colors flex-1">
                    More Categories
                  </span>
                  <FiChevronDown
                    size={14}
                    className={`text-gray-300 group-hover:text-[#B42225] transition-all duration-200 ${moreOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {moreOpen && (
                  <div className="ml-3 pl-3 border-l-2 border-gray-100 space-y-0.5">
                    {moreCategories.map(({ name, icon, to, color }) => (
                      <button
                        key={name}
                        onClick={() => goTo(to)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition group text-left"
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}
                        >
                          {icon}
                        </div>
                        <span className="text-sm font-medium text-gray-600 group-hover:text-[#B42225] transition-colors flex-1">
                          {name}
                        </span>
                        <FiChevronRight
                          size={13}
                          className="text-gray-300 group-hover:text-[#B42225] transition-colors"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 py-3 border-t border-gray-100">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2 px-1">
                Services & Logistics
              </p>
              <div className="space-y-0.5">
                <button
                  onClick={() => goTo("/services")}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition group text-left"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-orange-100 text-orange-600">
                    <FaConciergeBell size={16} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#B42225] transition-colors flex-1">
                    Campus Services
                  </span>
                  <FiChevronRight
                    size={14}
                    className="text-gray-300 group-hover:text-[#B42225] transition-colors"
                  />
                </button>
                <button
                  onClick={() => goTo("/logistics")}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition group text-left"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-green-100 text-green-600">
                    <MdOutlineDeliveryDining size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#B42225] transition-colors flex-1">
                    Logistics & Delivery
                  </span>
                  <FiChevronRight
                    size={14}
                    className="text-gray-300 group-hover:text-[#B42225] transition-colors"
                  />
                </button>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-gray-100 mt-1">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2 px-1">
                More
              </p>
              {[
                { label: "Flash Sales", to: "/flash-sales" },
                ...(isSellerVerified
                  ? [
                      {
                        label: "Switch to Seller",
                        action: handleEnterSellerMode,
                      },
                    ]
                  : [{ label: "Become a Seller", to: "/become-seller" }]),
                ...(isServiceProviderVerified
                  ? []
                  : [
                      {
                        label: "Become a Service Provider",
                        to: "/become-service-provider",
                      },
                    ]),
                { label: "Help Center", to: "/help" },
              ].map(({ label, to, action }: any) => (
                <button
                  key={label}
                  onClick={() => (action ? action() : goTo(to))}
                  className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 rounded-xl transition ${label === "Switch to Seller" ? "text-green-600 font-semibold" : "text-gray-600 hover:text-[#B42225]"}`}
                >
                  {label === "Switch to Seller" && (
                    <FaStore size={13} className="inline mr-1.5 -mt-0.5" />
                  )}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Bottom logout button ─────────────────────────────────
              FIX: gate on mounted so SSR renders nothing here, keeping
              the server HTML identical to the first client paint.
          ─────────────────────────────────────────────────────── */}
          {mounted && isLoggedIn && (
            <div className="px-4 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white py-3 rounded-xl text-sm font-semibold transition-all duration-200"
              >
                <FiLogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
