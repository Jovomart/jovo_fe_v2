"use client";
import Link from "next/link";
import {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
  cloneElement,
  isValidElement,
} from "react";
import Image from "next/image";
import {
  FiMenu,
  FiShoppingCart,
  FiUser,
  FiHeart,
  FiBox,
  FiLogIn,
  FiLogOut,
  FiX,
  FiChevronRight,
  FiArrowRight,
  FiChevronDown,
  FiBriefcase,
  FiGrid,
  FiBookOpen,
  FiMapPin,
  FiHome,
} from "react-icons/fi";
import { MdStorefront, MdOutlineDeliveryDining } from "react-icons/md";
import { FaConciergeBell, FaStore } from "react-icons/fa";
import { AuthContext } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getCategoryTheme } from "@/categoryConfig";
import apiService from "@/services/apiService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavCategory {
  id: string;
  name: string;
  slug: string;
}

interface NavSubcategory {
  id: string;
  name: string;
  slug: string;
}

// ─── Static non-category nav links (unchanged) ────────────────────────────────

const moreLinks = [
  {
    name: "Services",
    icon: <FaConciergeBell size={16} />,
    to: "/services",
    color: "bg-orange-100 text-orange-600",
  },
  {
    name: "Logistics",
    icon: <MdOutlineDeliveryDining size={17} />,
    to: "/logistics",
    color: "bg-green-100 text-green-600",
  },
  {
    name: "News",
    icon: <FiBookOpen size={16} />,
    to: "/news",
    color: "bg-sky-100 text-sky-700",
  },
  {
    name: "Campus Guide",
    icon: <FiMapPin size={16} />,
    to: "/campus-guide",
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    name: "Accommodation",
    icon: <FiHome size={16} />,
    to: "/accommodation",
    color: "bg-rose-100 text-rose-600",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Get a react-icons icon element for a category by using getCategoryTheme.
 * Falls back to <FiGrid /> if the theme lookup fails.
 */
function CategoryIconEl({
  name,
  slug,
  size = 22,
}: {
  name: string;
  slug: string;
  size?: number;
}) {
  try {
    const theme = getCategoryTheme(slug || name);
    const icon = theme.icon as React.ReactElement<any>;
    if (isValidElement(icon)) {
      return cloneElement(icon as React.ReactElement<any>, {
        size,
        strokeWidth: 2.4,
      });
    }
    return icon;
  } catch {
    return <FiGrid size={size} />;
  }
}

function getCategoryAccent(name: string, slug: string): string {
  try {
    return getCategoryTheme(slug || name).accentColor;
  } catch {
    return "#B42225";
  }
}

function getCategoryBg(name: string, slug: string): string {
  try {
    return getCategoryTheme(slug || name).accentColor + "22";
  } catch {
    return "#B4222522";
  }
}

function getProductId(product: any): string {
  return String(
    product?.id || product?.product_id || product?._id || product?.slug || "",
  );
}

function getProductName(product: any): string {
  return String(
    product?.name ||
      product?.product_name ||
      product?.title ||
      product?.product_name ||
      "",
  );
}

function getProductCategoryName(product: any): string {
  if (!product) return "";
  if (typeof product.category === "string") return product.category;
  return String(
    product?.category?.name ||
      product?.category?.title ||
      product?.category?.category_name ||
      "",
  );
}

function getProductBrand(product: any): string {
  return String(product?.brand || product?.vendor || product?.brand_name || "");
}

function getProductDescription(product: any): string {
  return String(
    product?.description || product?.desc || product?.product_description || "",
  );
}

function getProductImageUrl(product: any): string {
  return (
    product?.image ||
    product?.image_url ||
    product?.thumbnail ||
    (Array.isArray(product?.product_images) && product.product_images[0]) ||
    (Array.isArray(product?.images) && product.images[0]) ||
    "/images/Jovo_official_logo.png"
  );
}

function productMatchesQuery(product: any, query: string): boolean {
  const text =
    `${getProductName(product)} ${getProductCategoryName(product)} ${getProductBrand(product)} ${getProductDescription(product)}`.toLowerCase();
  return text.includes(query);
}

function extractProductsFromResponse(response: any): any[] {
  const collected: any[] = [];

  const addProduct = (product: any) => {
    if (!product || typeof product !== "object") return;
    const id = getProductId(product);
    if (!id) return;
    collected.push({ ...product, id });
  };

  const scanItem = (item: any) => {
    if (!item || typeof item !== "object") return;

    if (Array.isArray(item)) {
      item.forEach((inner) => scanItem(inner));
      return;
    }

    const listKeys = [
      "products",
      "items",
      "results",
      "data",
      "category_products",
      "product_list",
    ];

    for (const key of listKeys) {
      const value = item[key];
      if (Array.isArray(value)) {
        value.forEach((inner) => scanItem(inner));
        return;
      }
    }

    if (item.product_id || item.id || item.product_name || item.name) {
      addProduct(item);
      return;
    }
  };

  scanItem(response);
  return collected;
}

// ─── Search Dropdown ─────────────────────────────────────────────────────────

const SearchDropdown = ({
  query,
  categories,
  products,
  onSelect,
}: {
  query: string;
  categories: NavCategory[];
  products: any[];
  onSelect: (product: any, rawQuery?: string) => void;
}) => {
  const q = query.trim().toLowerCase();
  const results =
    q.length > 0
      ? products
          .filter((product: any) => productMatchesQuery(product, q))
          .slice(0, 7)
      : [];

  return (
    <div
      className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl border border-gray-100 overflow-hidden z-[100]"
      style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
    >
      {results.length > 0 && (
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
                      src={getProductImageUrl(product)}
                      alt={getProductName(product)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      width={44}
                      height={44}
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#B42225] transition-colors leading-tight">
                      {getProductName(product)}
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
                    {getProductCategoryName(product)}
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

      {results.length === 0 && q.length > 0 && (
        <div className="px-4 py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
            <FiSearch size={20} />
          </div>
          <p className="text-sm font-semibold text-gray-700">
            No results for &quot;{query.trim()}&quot;
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Try a different keyword or browse categories below
          </p>
        </div>
      )}

      {/* Browse categories from backend */}
      {q.length === 0 && (
        <div className="p-4">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-3">
            Browse Categories
          </p>
          {categories.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {categories.slice(0, 8).map((cat) => {
                const accent = getCategoryAccent(cat.name, cat.slug);
                const bg = getCategoryBg(cat.name, cat.slug);
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug || cat.id}`}
                    prefetch={true}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-gray-50 transition text-center"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: bg, color: accent }}
                    >
                      <CategoryIconEl
                        name={cat.name}
                        slug={cat.slug}
                        size={22}
                      />
                    </div>
                    <span className="text-[10px] text-gray-600 font-medium leading-tight line-clamp-2">
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1.5 p-2.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-gray-200" />
                  <div className="h-2 w-12 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-gray-100 mt-3 pt-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-3">
              More
            </p>
            <div className="grid grid-cols-4 gap-2">
              {moreLinks.map(({ name, icon, to, color }) => (
                <Link
                  key={name}
                  href={to}
                  prefetch={true}
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
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Cart Button ──────────────────────────────────────────────────────────────

function CartButton({ onClick }: { onClick: () => void }) {
  const { itemCount, recentlyAdded } = useCart();
  const [pulse, setPulse] = useState(false);
  const pulseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pulseSetRef = useRef(false);

  useEffect(() => {
    if (recentlyAdded !== null && !pulseSetRef.current) {
      pulseSetRef.current = true;
      const timer1 = setTimeout(() => setPulse(true), 0);
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = setTimeout(() => {
        setPulse(false);
        pulseSetRef.current = false;
      }, 650);
      return () => {
        clearTimeout(timer1);
        if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
      };
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
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[9px] font-black text-white px-1 shadow-md"
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

// ─── Main Navbar ──────────────────────────────────────────────────────────────

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

  // ── Real categories from backend ──────────────────────────────────────────
  const [navCategories, setNavCategories] = useState<NavCategory[]>([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState<
    Record<string, NavSubcategory[]>
  >({});
  const [loadingSubMap, setLoadingSubMap] = useState<Record<string, boolean>>(
    {},
  );
  const [catLoading, setCatLoading] = useState(true);
  const [searchProducts, setSearchProducts] = useState<any[]>([]);
  const [profileImageBroken, setProfileImageBroken] = useState(false);
  // Mobile: track which category is expanded
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(
    null,
  );

  const accountRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  const { user, logout, isSeller, isServiceProvider, enterSellerMode } =
    useContext(AuthContext) as any;

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

  const isLoggedIn = mounted && !!user;
  const isSellerVerified = mounted && !!isSeller;
  const isServiceProviderVerified = mounted && !!isServiceProvider;

  // ── Mount ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      const timer = setTimeout(() => setMounted(true), 0);
      return () => clearTimeout(timer);
    }
  }, []);

  // ── Fetch categories from backend (same as HeroSection) ───────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      setCatLoading(true);
      try {
        const response = await apiService.getPublicCategories("PRODUCT");

        let cats: any[] = [];
        if (response?.data && Array.isArray(response.data))
          cats = response.data;
        else if (response?.categories && Array.isArray(response.categories))
          cats = response.categories;
        else if (Array.isArray(response)) cats = response;
        else if (
          response?.data?.categories &&
          Array.isArray(response.data.categories)
        )
          cats = response.data.categories;

        const mapped: NavCategory[] = cats
          .map((cat: any) => ({
            id: String(cat.id || cat.category_id || ""),
            name: String(cat.name || cat.category_name || ""),
            slug: String(
              cat.slug || cat.category_slug || cat.id || cat.category_id || "",
            ),
          }))
          .filter((c) => c.name && c.id);

        setNavCategories(mapped);
      } catch (err) {
        console.error("[Navbar] Failed to fetch categories:", err);
      } finally {
        setCatLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSearchProducts = async () => {
      try {
        const response = await apiService.getShopHomepage(6, false);
        let rawList: any = response;

        if (response?.data && Array.isArray(response.data))
          rawList = response.data;
        else if (response?.categories && Array.isArray(response.categories))
          rawList = response.categories;
        else if (
          response?.data?.categories &&
          Array.isArray(response.data.categories)
        )
          rawList = response.data.categories;

        const flattened = extractProductsFromResponse(rawList);
        const uniqueProducts = Array.from(
          new Map(flattened.map((product) => [getProductId(product), product])),
        ).filter(Boolean);
        setSearchProducts(uniqueProducts as any[]);
      } catch (err) {
        console.warn("[Navbar] Could not load search suggestions:", err);
      }
    };

    fetchSearchProducts();
  }, []);

  // ── Fetch subcategories on demand (hover on desktop, expand on mobile) ────
  const fetchSubcategories = useCallback(
    async (categoryId: string) => {
      if (subcategoriesMap[categoryId] !== undefined) return; // already fetched
      if (loadingSubMap[categoryId]) return; // already loading
      setLoadingSubMap((prev) => ({ ...prev, [categoryId]: true }));
      try {
        const response = await apiService.getCategoryMarketspace(categoryId, {
          limit: 1,
        });
        const data = response?.data ?? response;
        const subs: NavSubcategory[] = Array.isArray(data?.subcategories)
          ? data.subcategories.map((s: any) => ({
              id: String(s.id || ""),
              name: String(s.name || ""),
              slug: String(s.slug || s.id || ""),
            }))
          : [];
        setSubcategoriesMap((prev) => ({ ...prev, [categoryId]: subs }));
      } catch {
        setSubcategoriesMap((prev) => ({ ...prev, [categoryId]: [] }));
      } finally {
        setLoadingSubMap((prev) => ({ ...prev, [categoryId]: false }));
      }
    },
    [subcategoriesMap, loadingSubMap],
  );

  // ── Scroll ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Click outside ─────────────────────────────────────────────────────────
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

  // ── Body scroll lock when mobile menu open ────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // ── Search handlers ───────────────────────────────────────────────────────
  const handleSelect = (product: any, rawQuery?: string) => {
    setDesktopOpen(false);
    setMobileDropOpen(false);
    setDesktopQuery("");
    setMobileQuery("");
    if (product) window.location.href = `/product/${getProductId(product)}`;
    else if (rawQuery)
      window.location.href = `/shop?search=${encodeURIComponent(rawQuery.trim())}`;
  };

  const commitSearch = (q: string) => {
    if (!q.trim()) return;
    setDesktopOpen(false);
    setMobileDropOpen(false);
    const searchValue = q.trim();
    const matches = searchProducts.filter((product: any) =>
      productMatchesQuery(product, searchValue.toLowerCase()),
    );
    if (matches.length === 1) {
      window.location.href = `/product/${getProductId(matches[0])}`;
    } else {
      window.location.href = `/shop?search=${encodeURIComponent(searchValue)}`;
    }
    setDesktopQuery("");
    setMobileQuery("");
  };

  const handleLogout = async () => {
    setAccountOpen(false);
    setMobileOpen(false);
    await logout();
    window.location.href = "/";
  };

  const handleEnterSellerMode = async () => {
    setAccountOpen(false);
    setMobileOpen(false);
    await enterSellerMode();
    window.location.href = "/seller/dashboard";
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setAccountOpen(false);
  };

  // ── Profile photo: use user.photoURL which is updated by updateProfileImage ─
  const profilePhoto = user?.photoURL || user?.profile_image || null;

  useEffect(() => {
    setProfileImageBroken(false);
  }, [profilePhoto]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <header
        className={`sticky top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.08)]"
            : "bg-white shadow-sm"
        }`}
      >
        <div
          className="h-0.5 w-full"
          style={{
            background: "linear-gradient(to right, #B42225, #FF8C00, #B42225)",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-0">
          {/* Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition text-gray-700"
            onClick={() => setMobileOpen(true)}
          >
            <FiMenu size={22} />
          </button>

          {/* Logo */}
          <Link href={isLoggedIn ? "/shop" : "/"} prefetch={true}>
            <Image
              src="/images/Jovo_official_logo.png"
              alt="Jovo"
              width={220}
              height={48}
              className="cursor-pointer shrink-0 md:w-55 md:h-12 w-28 h-10 object-cover"
              priority
            />
          </Link>

          {/* Desktop search */}
          <div
            className="hidden md:flex flex-1 max-w-3xl mx-4 relative"
            ref={desktopSearchRef}
          >
            <div
              className={`flex w-full rounded-xl overflow-hidden border transition-all duration-200 ${
                desktopOpen
                  ? "border-[#B42225] shadow-[0_0_0_3px_rgba(180,34,37,0.1)]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
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
              <SearchDropdown
                query={desktopQuery}
                categories={navCategories}
                products={searchProducts}
                onSelect={handleSelect}
              />
            )}
          </div>

          {/* Right actions */}
          <div className="ml-auto md:ml-0 flex items-center gap-1 md:gap-2">
            {/* Account dropdown */}
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setAccountOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition text-gray-700"
              >
                <div className="relative">
                  <div className="relative w-8 h-8 rounded-full bg-[#B42225]/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {!mounted ? (
                      <FiUser size={20} className="text-[#B42225]" />
                    ) : profilePhoto && !profileImageBroken ? (
                      <Image
                        src={profilePhoto}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                        width={32}
                        height={32}
                        unoptimized
                        onError={() => setProfileImageBroken(true)}
                      />
                    ) : initials ? (
                      <span className="text-xs font-bold text-[#B42225]">
                        {initials}
                      </span>
                    ) : (
                      <FiUser size={20} className="text-[#B42225]" />
                    )}
                  </div>
                  {isSellerVerified && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white shadow-md z-10" />
                  )}
                </div>
                <span className="hidden md:inline text-sm font-medium max-w-[90px] truncate">
                  {!mounted ? "Account" : displayName}
                </span>
              </button>

              {/* Account dropdown panel */}
              <div
                className={`absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 transition-all duration-200 origin-top-right z-[200] ${
                  accountOpen
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
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
                        <div className="w-10 h-10 rounded-full bg-[#B42225]/10 flex items-center justify-center shrink-0 overflow-hidden">
                          {profilePhoto ? (
                            <Image
                              src={profilePhoto}
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
                          onClick={() =>
                            (window.location.href =
                              "/seller/application-status")
                          }
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors group"
                        >
                          <FiBox
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
                          onClick={() =>
                            (window.location.href = "/become-service-provider")
                          }
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
                          onClick={() =>
                            (window.location.href = "/services/dashboard")
                          }
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors group"
                        >
                          <FiBriefcase
                            size={15}
                            className="text-gray-400 group-hover:text-purple-600"
                          />
                          <span className="flex-1 text-left">
                            Service Dashboard
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
                          to: "/orders",
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
                          onClick={() => (window.location.href = to)}
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
                    <Link
                      href="/login"
                      prefetch={true}
                      className="w-full flex items-center justify-center gap-2 bg-[#B42225] hover:bg-[#9e1e20] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <FiLogIn size={15} /> Sign In
                    </Link>
                    <Link
                      href="/register"
                      prefetch={true}
                      className="w-full flex border border-[#B42225] text-[#B42225] py-2.5 rounded-xl text-sm font-semibold hover:bg-[#B42225]/5 transition-colors text-center"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <CartButton onClick={() => (window.location.href = "/cart")} />
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative" ref={mobileSearchRef}>
            <div
              className={`flex rounded-xl overflow-hidden border transition-all duration-200 ${
                mobileDropOpen
                  ? "border-[#B42225] shadow-[0_0_0_3px_rgba(180,34,37,0.1)]"
                  : "border-gray-200"
              }`}
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
              <SearchDropdown
                query={mobileQuery}
                categories={navCategories}
                products={searchProducts}
                onSelect={handleSelect}
              />
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════
          MOBILE SIDEBAR
      ══════════════════════════════════════════════════ */}
      <div
        className={`fixed inset-0 z-[60] flex transition-all duration-300 ${
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={closeMobileMenu}
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Sidebar panel */}
        <div
          className={`relative flex flex-col bg-white w-[320px] h-full shadow-2xl transform transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-5 py-4 bg-[#B42225]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 border-2 border-white/30 overflow-hidden">
                {!mounted ? (
                  <FiUser size={20} className="text-white" />
                ) : isLoggedIn && profilePhoto ? (
                  <Image
                    src={profilePhoto}
                    alt=""
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : isLoggedIn && initials ? (
                  <span className="text-sm font-bold text-white">
                    {initials}
                  </span>
                ) : (
                  <FiUser size={20} className="text-white" />
                )}
              </div>
              <div>
                {!mounted || !isLoggedIn ? (
                  <>
                    <p className="text-white font-semibold text-sm">
                      Hello, Guest
                    </p>
                    <p className="text-white/60 text-xs">
                      Sign in for the best experience
                    </p>
                  </>
                ) : (
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
                      {isServiceProviderVerified && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black bg-white/20 text-white px-1.5 py-0.5 rounded-full">
                          <FiBriefcase size={7} /> Provider
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 text-xs truncate max-w-[160px]">
                      {user.email}
                    </p>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={closeMobileMenu}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition text-white"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Sign in / Register for guests */}
          {mounted && !isLoggedIn && (
            <div className="px-4 py-3 flex gap-2 border-b border-gray-100">
              <Link
                href="/login"
                prefetch={true}
                onClick={closeMobileMenu}
                className="flex-1 bg-[#B42225] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#9e1e20] transition text-center"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                prefetch={true}
                onClick={closeMobileMenu}
                className="flex-1 border border-[#B42225] text-[#B42225] py-2.5 rounded-xl text-sm font-semibold hover:bg-[#B42225]/5 transition text-center"
              >
                Register
              </Link>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {/* My Account shortcuts */}
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
                    <Link
                      key={label}
                      href={to}
                      prefetch={true}
                      onClick={closeMobileMenu}
                      className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-gray-50 hover:bg-[#B42225]/5 hover:text-[#B42225] transition text-gray-600 text-xs font-medium text-center"
                    >
                      {icon}
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Shop by Category — REAL from backend */}
            <div className="px-4 pt-3 pb-2">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2 px-1">
                Shop by Category
              </p>
              <div className="space-y-0.5">
                {catLoading ? (
                  // Skeleton
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-3 animate-pulse"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gray-200 shrink-0" />
                      <div className="h-3 bg-gray-200 rounded flex-1" />
                    </div>
                  ))
                ) : navCategories.length === 0 ? (
                  <p className="text-xs text-gray-400 px-3 py-2">
                    No categories available
                  </p>
                ) : (
                  navCategories.slice(0, 10).map((cat) => {
                    const accent = getCategoryAccent(cat.name, cat.slug);
                    const bg = getCategoryBg(cat.name, cat.slug);
                    const subs = subcategoriesMap[cat.id];
                    const isExpanded = expandedMobileCat === cat.id;
                    const isLoadingSubs = loadingSubMap[cat.id];

                    return (
                      <div key={cat.id}>
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/category/${cat.slug || cat.id}`}
                            prefetch={true}
                            onClick={closeMobileMenu}
                            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition group text-left flex-1"
                          >
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: bg, color: accent }}
                            >
                              <CategoryIconEl
                                name={cat.name}
                                slug={cat.slug}
                                size={22}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-[#B42225] transition-colors flex-1">
                              {cat.name}
                            </span>
                          </Link>
                          {/* Expand subcategories button */}
                          <button
                            onClick={() => {
                              const next = isExpanded ? null : cat.id;
                              setExpandedMobileCat(next);
                              if (next) fetchSubcategories(cat.id);
                            }}
                            className="p-2 rounded-xl hover:bg-gray-50 transition text-gray-400 hover:text-[#B42225]"
                          >
                            <FiChevronDown
                              size={14}
                              className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </button>
                        </div>

                        {/* Subcategory list */}
                        {isExpanded && (
                          <div className="ml-12 pl-3 border-l-2 border-gray-100 space-y-0.5 mb-1">
                            {isLoadingSubs ? (
                              <div className="py-2 flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-[#B42225] rounded-full animate-spin" />
                                <span className="text-xs text-gray-400">
                                  Loading...
                                </span>
                              </div>
                            ) : subs && subs.length > 0 ? (
                              subs.slice(0, 8).map((sub) => (
                                <Link
                                  key={sub.id}
                                  href={`/category/${cat.slug || cat.id}?subcategory=${sub.slug || sub.id}`}
                                  prefetch={true}
                                  onClick={closeMobileMenu}
                                  className="block text-xs text-gray-500 py-1.5 px-2 rounded-lg hover:text-[#B42225] hover:bg-gray-50 transition"
                                >
                                  {sub.name}
                                </Link>
                              ))
                            ) : (
                              <p className="text-xs text-gray-400 py-1.5 px-2">
                                No subcategories
                              </p>
                            )}
                            {subs && subs.length > 8 && (
                              <Link
                                href={`/category/${cat.slug || cat.id}`}
                                onClick={closeMobileMenu}
                                className="block text-xs font-semibold py-1.5 px-2"
                                style={{ color: accent }}
                              >
                                View all {subs.length} subcategories →
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {/* More categories toggle */}
                <button
                  onClick={() => setMoreOpen((o) => !o)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition group text-left"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gray-100 text-gray-500">
                    <MdStorefront size={18} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#B42225] transition-colors flex-1">
                    More
                  </span>
                  <FiChevronDown
                    size={14}
                    className={`text-gray-300 group-hover:text-[#B42225] transition-all duration-200 ${moreOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {moreOpen && (
                  <div className="ml-3 pl-3 border-l-2 border-gray-100 space-y-0.5">
                    {moreLinks.map(({ name, icon, to, color }) => (
                      <Link
                        key={name}
                        href={to}
                        prefetch={true}
                        onClick={closeMobileMenu}
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
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Extra links */}
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
                  ? [
                      {
                        label: "Service Dashboard",
                        to: "/services/dashboard",
                      },
                    ]
                  : [
                      {
                        label: "Become a Service Provider",
                        to: "/become-service-provider",
                      },
                    ]),
                { label: "Help Center", to: "/help" },
              ].map(({ label, to, action }: any) =>
                action ? (
                  <button
                    key={label}
                    onClick={() => {
                      action();
                      closeMobileMenu();
                    }}
                    className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition ${
                      label === "Switch to Seller"
                        ? "text-green-600 font-semibold"
                        : "text-gray-600 hover:text-[#B42225] hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </button>
                ) : (
                  <Link
                    key={label}
                    href={to}
                    prefetch={true}
                    onClick={closeMobileMenu}
                    className={`w-full block text-left px-3 py-2.5 text-sm rounded-xl transition ${
                      label === "Service Dashboard"
                        ? "text-purple-600 font-semibold"
                        : "text-gray-600 hover:text-[#B42225] hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </Link>
                ),
              )}
            </div>
          </div>

          {/* Logout */}
          {mounted && isLoggedIn && (
            <div className="px-4 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
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

// ─── Missing icon imports referenced in account dropdown ─────────────────────
// (FiSettings was used inside the account dropdown link list but not imported at top)
function FiSearch({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function FiSettings({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
