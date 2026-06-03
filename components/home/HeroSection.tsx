"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback, useContext } from "react";
import Image from "next/image";
import { AuthContext } from "@/context/AuthContext";
import {
  FiArrowRight,
  FiVolume2,
  FiVolumeX,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiShoppingBag,
  FiGrid,
  FiBox,
} from "react-icons/fi";
import { MdOutlineLocalOffer, MdFlashOn } from "react-icons/md";
import { getCategoryTheme } from "@/categoryConfig";
import apiService from "@/services/apiService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  product_count?: number;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

interface Slide {
  id: number;
  video: string;
  label: string;
  headline: string;
  sub: string;
  cta: string;
  ctaPath: string;
  accent: string;
}

// ─── Static Slides ─────────────────────────────────────────────────────────

const slides: Slide[] = [
  {
    id: 1,
    video: "https://assets.mixkit.co/videos/242/242-720.mp4",
    label: "NEW ARRIVALS",
    headline: "Shop the Latest\nTech & Gadgets",
    sub: "Exclusive deals on phones, laptops and more",
    cta: "Shop Now",
    ctaPath: "/electronic-deals",
    accent: "#FF8C00",
  },
  {
    id: 2,
    video: "https://assets.mixkit.co/videos/23509/23509-720.mp4",
    label: "LATEST NEWS",
    headline: "Stay Updated with\nJOVO News",
    sub: "Campus events, product launches, and exclusive offers",
    cta: "Read News",
    ctaPath: "/news",
    accent: "#3B82F6",
  },
  {
    id: 3,
    video: "https://assets.mixkit.co/videos/44541/44541-720.mp4",
    label: "FLASH SALES",
    headline: "Up to 60% Off\nFashion & Beauty",
    sub: "Limited time deals ending soon",
    cta: "Grab Deals",
    ctaPath: "/flash-sales",
    accent: "#B42225",
  },
  {
    id: 4,
    video: "https://assets.mixkit.co/videos/4198/4198-720.mp4",
    label: "ACCOMMODATION",
    headline: "Find Your\nPerfect Stay",
    sub: "Hostels, apartments, and short-let accommodations near campus",
    cta: "Find Accommodation",
    ctaPath: "/accommodations",
    accent: "#D97706",
  },
  {
    id: 5,
    video: "https://assets.mixkit.co/videos/36425/36425-720.mp4",
    label: "CAMPUS DELIVERY",
    headline: "Fast Delivery\nRight to Your Door",
    sub: "Within FUTO campus in under 30 minutes",
    cta: "Learn More",
    ctaPath: "/logistics",
    accent: "#10B981",
  },
  {
    id: 6,
    video: "https://assets.mixkit.co/videos/49301/49301-720.mp4",
    label: "CAMPUS SERVICES",
    headline: "Book Services\nInstantly",
    sub: "Cleaning, repairs, tutoring & more - all on campus",
    cta: "Explore Services",
    ctaPath: "/services",
    accent: "#8B5CF6",
  },
  {
    id: 7,
    video: "https://assets.mixkit.co/videos/4519/4519-720.mp4",
    label: "CAMPUS GUIDE",
    headline: "Your Ultimate\nCampus Guide",
    sub: "Discover the best spots, events, and student resources",
    cta: "Explore Guide",
    ctaPath: "/campus-guide",
    accent: "#EC4899",
  },
];

const SidebarSkeleton = () => (
  <div className="space-y-1 px-4 py-6">
    <div className="h-2 w-16 bg-white/10 rounded mb-4" />
    {Array.from({ length: 7 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-3 py-2.5">
        <div className="w-7 h-7 rounded-lg bg-white/10 animate-pulse shrink-0" />
        <div className="h-2.5 rounded bg-white/10 animate-pulse" style={{ width: `${50 + i * 8}%` }} />
      </div>
    ))}
  </div>
);

const CategoryIcon = ({ name, slug, size = 15 }: { name: string; slug: string; size?: number }) => {
  try {
    const theme = getCategoryTheme(slug || name);
    const icon = theme.icon as React.ReactElement;
    return icon;
  } catch {
    return <FiBox size={size} />;
  }
};

const HeroSection = () => {
  const { isSeller } = useContext(AuthContext);

  const [current, setCurrent] = useState<number>(0);
  const [muted, setMuted] = useState<boolean>(true);
  const desktopVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const mobileVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, Subcategory[]>>({});
  const [productCountsMap, setProductCountsMap] = useState<Record<string, number>>({});
  const [loadingData, setLoadingData] = useState<Record<string, boolean>>({});
  const [catLoading, setCatLoading] = useState(true);
  const [showAllModal, setShowAllModal] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0, left: 0 });

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 50;

  const getCategoryImage = (categoryName: string): string => {
    const images: Record<string, string> = {
      "Electronics": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=150&h=150&fit=crop",
      "Fashion": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=150&h=150&fit=crop",
      "Phones": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&h=150&fit=crop",
      "Computers": "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=150&h=150&fit=crop",
      "Home": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=150&h=150&fit=crop",
      "Beauty": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=150&h=150&fit=crop",
      "Sports": "https://images.unsplash.com/photo-1461896836934-ffe807baa2e7?w=150&h=150&fit=crop",
      "Books": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=150&h=150&fit=crop",
      "Toys": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=150&h=150&fit=crop",
      "Gaming": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=150&h=150&fit=crop",
    };
    
    for (const [key, url] of Object.entries(images)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return url;
      }
    }
    return "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=150&h=150&fit=crop";
  };

  // ── Fetch categories and their product counts ─────────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      setCatLoading(true);
      try {
        // Fetch categories first
        const response = await apiService.getPublicCategories("PRODUCT");
        console.log("[HeroSection] Categories response:", response);
        
        let cats: Category[] = [];
        
        if (response?.data && Array.isArray(response.data)) {
          cats = response.data;
        } else if (response?.categories && Array.isArray(response.categories)) {
          cats = response.categories;
        } else if (Array.isArray(response)) {
          cats = response;
        } else if (response?.data?.categories && Array.isArray(response.data.categories)) {
          cats = response.data.categories;
        }
        
        const mappedCats: Category[] = cats.map((cat: any) => {
          const categoryId = String(cat.id || cat.category_id);
          const categorySlug = String(cat.slug || cat.category_slug || categoryId);
          
          return {
            id: categoryId,
            name: String(cat.name || cat.category_name || ""),
            slug: categorySlug,
            image: cat.image || cat.icon || getCategoryImage(String(cat.name || "")),
            product_count: 0, // Will update after fetching
          };
        }).filter(cat => cat.name && cat.id);
        
        console.log("[HeroSection] Mapped categories:", mappedCats);
        setCategories(mappedCats);
        
        // Fetch product counts for each category in parallel (limit to first 8)
        const categoriesToFetch = mappedCats.slice(0, 8);
        const countPromises = categoriesToFetch.map(async (cat) => {
          try {
            const marketData = await apiService.getCategoryMarketspace(cat.id, { limit: 1 });
            const data = marketData?.data ?? marketData;
            const total = data?.total || 0;
            return { id: cat.id, count: total };
          } catch (err) {
            console.error(`Failed to get product count for ${cat.name}:`, err);
            return { id: cat.id, count: 0 };
          }
        });
        
        const counts = await Promise.all(countPromises);
        const countsMap: Record<string, number> = {};
        counts.forEach(({ id, count }) => {
          countsMap[id] = count;
        });
        setProductCountsMap(countsMap);
        
        // Update categories with product counts
        setCategories(prev => prev.map(cat => ({
          ...cat,
          product_count: countsMap[cat.id] || 0
        })));
        
      } catch (err) {
        console.error("[HeroSection] Failed to fetch categories:", err);
        setCategories([]);
      } finally {
        setCatLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // ── Fetch subcategories for a specific category (same way as category page) ──
  const fetchCategoryDetails = async (categoryId: string) => {
    // Don't fetch if already have them or currently fetching
    if (subcategoriesMap[categoryId] || loadingData[categoryId]) {
      return;
    }
    
    setLoadingData(prev => ({ ...prev, [categoryId]: true }));
    
    try {
      console.log(`[HeroSection] Fetching details for category ${categoryId}`);
      // Use the same endpoint as category page - getCategoryMarketspace
      const response = await apiService.getCategoryMarketspace(categoryId, { limit: 1 });
      console.log(`[HeroSection] Category marketspace response for ${categoryId}:`, response);
      
      const data = response?.data ?? response;
      
      // Extract subcategories - same as category page: data.subcategories
      const subs: Subcategory[] = Array.isArray(data?.subcategories) 
        ? data.subcategories 
        : [];
      
      // Update product count if needed
      const total = data?.total || 0;
      
      console.log(`[HeroSection] Subcategories for ${categoryId}:`, subs);
      console.log(`[HeroSection] Product count for ${categoryId}:`, total);
      
      setSubcategoriesMap(prev => ({ ...prev, [categoryId]: subs }));
      
      // Update product count if it was 0 or different
      if (total > 0) {
        setProductCountsMap(prev => ({ ...prev, [categoryId]: total }));
        setCategories(prev => prev.map(cat => 
          cat.id === categoryId ? { ...cat, product_count: total } : cat
        ));
      }
    } catch (err) {
      console.error(`[HeroSection] Failed to fetch details for category ${categoryId}:`, err);
      setSubcategoriesMap(prev => ({ ...prev, [categoryId]: [] }));
    } finally {
      setLoadingData(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  const handleMouseEnter = async (e: React.MouseEvent<HTMLDivElement>, categoryId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPosition({
      top: rect.top - 10,
      left: rect.right + 8,
    });
    setHoveredCategory(categoryId);
    
    // Fetch category details (subcategories and product count) in the background
    fetchCategoryDetails(categoryId);
  };

  const handleMouseLeave = () => {
    setHoveredCategory(null);
  };

  const goTo = useCallback((idx: number) => setCurrent(idx), []);
  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);

  useEffect(() => {
    intervalRef.current = setInterval(next, 6000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [next]);

  useEffect(() => {
    desktopVideoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === current) { video.currentTime = 0; video.play().catch(() => {}); }
      else video.pause();
    });
  }, [current]);

  useEffect(() => {
    mobileVideoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === current) { video.currentTime = 0; video.play().catch(() => {}); }
      else video.pause();
    });
  }, [current]);

  useEffect(() => {
    const t = setTimeout(() => { 
      desktopVideoRefs.current[0]?.play().catch(() => {}); 
      mobileVideoRefs.current[0]?.play().catch(() => {}); 
    }, 100);
    return () => clearTimeout(t);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
        if (dx < 0) next();
        else prev();
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(next, 6000);
      }

      touchStartX.current = null;
      touchStartY.current = null;
    },
    [next, prev],
  );

  const slide = slides[current];

  const renderSidebarCategories = () => {
    if (catLoading) return <SidebarSkeleton />;

    const displayCats = categories.slice(0, 8);

    if (displayCats.length === 0) {
      return (
        <div className="px-4 py-6">
          <p className="text-[9px] font-black uppercase tracking-[3px] text-white/30 mb-4 px-1">
            Categories
          </p>
          <p className="text-white/40 text-xs text-center py-4">No categories available</p>
        </div>
      );
    }

    return (
      <div className="px-4 py-6">
        <p className="text-[9px] font-black uppercase tracking-[3px] text-white/30 mb-4 px-1">
          Categories
        </p>
        <div className="space-y-0.5">
          {displayCats.map((cat) => {
            const theme = getCategoryTheme(cat.slug || cat.name);
            const displayCount = productCountsMap[cat.id] || cat.product_count || 0;
            return (
              <div
                key={cat.id}
                onMouseEnter={(e) => handleMouseEnter(e, cat.id)}
                onMouseLeave={handleMouseLeave}
                className="relative"
              >
                <Link
                  href={`/category/${cat.slug || cat.id}`}
                  prefetch={true}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left group transition-all duration-150 hover:bg-white/10 cursor-pointer"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all group-hover:scale-110"
                    style={{ background: `${theme.accentColor}22`, color: theme.accentColor }}
                  >
                    <CategoryIcon name={cat.name} slug={cat.slug} size={15} />
                  </div>
                  <span className="text-xs font-semibold text-white/60 group-hover:text-white transition-colors leading-tight truncate">
                    {cat.name}
                  </span>
                  <span className="text-[9px] font-bold text-white/30 ml-auto">
                    {displayCount.toLocaleString() || 0}
                  </span>
                  <FiArrowRight
                    size={11}
                    className="text-white/0 group-hover:text-white/50 transition-all group-hover:translate-x-0.5 shrink-0"
                  />
                </Link>
              </div>
            );
          })}

          <button
            onClick={() => setShowAllModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left group transition-all duration-150 hover:bg-white/10 cursor-pointer"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all group-hover:scale-110"
              style={{ background: "#F59E0B22", color: "#F59E0B" }}
            >
              <FiGrid size={15} />
            </div>
            <span className="text-xs font-semibold text-white/60 group-hover:text-white transition-colors leading-tight">
              All Categories
            </span>
            <FiArrowRight
              size={11}
              className="ml-auto text-white/0 group-hover:text-white/50 transition-all group-hover:translate-x-0.5"
            />
          </button>
        </div>
      </div>
    );
  };

  const renderMobileCategories = () => {
    if (catLoading) {
      return (
        <div className="px-4 py-4 bg-white">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gray-200 animate-pulse" />
                <div className="h-2 w-10 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    const displayCats = [...categories.slice(0, 7)];
    
    if (displayCats.length === 0) {
      return null;
    }

    return (
      <div className="px-4 py-4 bg-white">
        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
          {displayCats.map((cat) => {
            const theme = getCategoryTheme(cat.slug || cat.name);
            const imageUrl = cat.image || getCategoryImage(cat.name);
            const displayCount = productCountsMap[cat.id] || cat.product_count || 0;
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug || cat.id}`}
                prefetch={true}
                className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
              >
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden transition-all group-hover:scale-105 group-active:scale-95 bg-gray-100">
                  <Image
                    src={imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = "none";
                    }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight w-14 line-clamp-2">
                  {cat.name}
                </span>
                <span className="text-[8px] font-bold text-gray-400">
                  {displayCount.toLocaleString() || 0} items
                </span>
              </Link>
            );
          })}
          
          <button
            onClick={() => setShowAllModal(true)}
            className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105 group-active:scale-95"
              style={{ background: "#F59E0B20", border: "1.5px solid #F59E0B30", color: "#F59E0B" }}
            >
              <FiGrid size={22} />
            </div>
            <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight w-14">
              All Categories
            </span>
          </button>
        </div>
      </div>
    );
  };

  // Get the hovered category data and its subcategories
  const hoveredCategoryData = hoveredCategory ? categories.find(c => c.id === hoveredCategory) : null;
  const hoveredCategorySubs = hoveredCategoryData ? (subcategoriesMap[hoveredCategoryData.id] || []) : [];
  const isLoadingData = hoveredCategoryData ? (loadingData[hoveredCategoryData.id] || false) : false;
  const hoverTheme = hoveredCategoryData ? getCategoryTheme(hoveredCategoryData.slug || hoveredCategoryData.name) : null;

  return (
    <>
      <style>{`
        @keyframes hero-fade-up { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes hero-fade-in { from { opacity:0; } to { opacity:1; } }
        @keyframes pill-in { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
        @keyframes modalSlideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
        .hero-label { animation: hero-fade-up 0.5s ease both; animation-delay:0.1s; }
        .hero-title { animation: hero-fade-up 0.55s ease both; animation-delay:0.22s; }
        .hero-sub { animation: hero-fade-up 0.55s ease both; animation-delay:0.34s; }
        .hero-cta { animation: hero-fade-up 0.55s ease both; animation-delay:0.46s; }
        .hero-dots { animation: hero-fade-in 0.4s ease both; animation-delay:0.5s; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <section className="w-full" style={{ fontFamily: "'DM Sans',sans-serif" }}>

        {/* ════════════════ DESKTOP LAYOUT ════════════════ */}
        <div
          className="hidden md:block relative w-full"
          style={{ height: "80vh", maxHeight: "720px", minHeight: "560px" }}
        >
          <div className="absolute inset-0 overflow-hidden">
            {slides.map((s, i) => (
              <video
                key={`desktop-${s.id}`}
                ref={(el) => { desktopVideoRefs.current[i] = el; }}
                src={s.video}
                loop
                muted={muted}
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                style={{ opacity: i === current ? 1 : 0 }}
              />
            ))}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(105deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0.05) 100%)" }}
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)" }}
            />
          </div>

          <div
            className="absolute left-0 top-0 bottom-0 w-64 z-30 flex flex-col justify-start overflow-y-auto"
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(16px)",
              borderRight: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {renderSidebarCategories()}
          </div>

          <div className="absolute inset-0 z-20 flex items-center" style={{ paddingLeft: "280px" }}>
            <div className="max-w-lg px-10" key={current}>
              <div
                className="hero-label inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[3px] px-3 py-1.5 rounded-full mb-5"
                style={{ background: `${slide.accent}25`, border: `1px solid ${slide.accent}50`, color: slide.accent }}
              >
                <MdFlashOn size={12} /> {slide.label}
              </div>
              <h1
                className="hero-title font-black text-white leading-[1.05] mb-4"
                style={{ fontSize: "clamp(2.2rem,3.5vw,3.4rem)", fontFamily: "'Georgia',serif", whiteSpace: "pre-line", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
              >
                {slide.headline}
              </h1>
              <p className="hero-sub text-white/55 text-base mb-8 leading-relaxed">{slide.sub}</p>
              <div className="hero-cta flex items-center gap-3">
                <Link
                  href={slide.ctaPath}
                  prefetch={true}
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.03] active:scale-95 cursor-pointer"
                  style={{ background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}cc)`, boxShadow: `0 8px 28px ${slide.accent}55` }}
                >
                  {slide.cta} <FiArrowRight size={15} />
                </Link>
                <Link
                  href="/flash-sales"
                  prefetch={true}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm text-white/70 hover:text-white border border-white/15 hover:border-white/30 hover:bg-white/8 transition-all cursor-pointer"
                >
                  Flash Sales
                </Link>
              </div>
            </div>
          </div>

          <div className="hero-dots absolute bottom-8 right-8 z-30 flex items-center gap-3">
            <button
              onClick={() => setMuted(!muted)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all backdrop-blur-sm cursor-pointer"
            >
              {muted ? <FiVolumeX size={14} /> : <FiVolume2 size={14} />}
            </button>
            <button
              onClick={prev}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all backdrop-blur-sm cursor-pointer"
            >
              <FiChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all backdrop-blur-sm cursor-pointer"
            >
              <FiChevronRight size={16} />
            </button>
            <div className="flex items-center gap-1.5 ml-1">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="rounded-full transition-all duration-400 cursor-pointer"
                  style={{ width: i === current ? "24px" : "7px", height: "7px", background: i === current ? slide.accent : "rgba(255,255,255,0.35)" }}
                />
              ))}
            </div>
          </div>

          <div className="absolute top-6 right-8 z-30 flex items-center gap-2">
            <span className="text-white font-black text-lg" style={{ fontFamily: "'Georgia',serif" }}>
              {String(current + 1).padStart(2, "0")}
            </span>
            <div className="w-12 h-px bg-white/20 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-white/70 transition-all duration-700"
                style={{ width: `${((current + 1) / slides.length) * 100}%` }}
              />
            </div>
            <span className="text-white/35 text-sm">{String(slides.length).padStart(2, "0")}</span>
          </div>

          <div className="absolute bottom-8 left-64 z-30 flex items-center gap-2">
            {[
              { icon: <MdFlashOn size={13} />, text: "Flash Sales Live" },
              { icon: <MdOutlineLocalOffer size={13} />, text: "50K+ Products" },
              { icon: <FiShoppingBag size={13} />, text: "Free Campus Pickup" },
            ].map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-[10px] font-bold text-white/60 bg-black/30 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full"
                style={{ animation: "pill-in 0.4s ease both", animationDelay: `${0.6 + i * 0.1}s` }}
              >
                <span style={{ color: slide.accent }}>{s.icon}</span>
                {s.text}
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════ MOBILE LAYOUT ════════════════ */}
        <div className="md:hidden">
          <div
            className="relative w-full overflow-hidden select-none"
            style={{ height: "75vw", maxHeight: "480px", minHeight: "280px" }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {slides.map((s, i) => (
              <video
                key={`mobile-${s.id}`}
                ref={(el) => { mobileVideoRefs.current[i] = el; }}
                src={s.video}
                loop
                muted
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                style={{ opacity: i === current ? 1 : 0 }}
              />
            ))}
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.85) 100%)" }}
            />

            <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
              <span className="text-white font-black text-xs">{current + 1}</span>
              <span className="text-white/40 text-xs">/</span>
              <span className="text-white/40 text-xs">{slides.length}</span>
            </div>

            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/70 transition-all active:scale-90"
            >
              <FiChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/70 transition-all active:scale-90"
            >
              <FiChevronRight size={16} />
            </button>

            <div className="absolute bottom-0 left-0 right-0 p-5 z-10" key={`mob-${current}`}>
              <div
                className="hero-label inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[2px] px-2.5 py-1 rounded-full mb-2"
                style={{ background: `${slide.accent}30`, border: `1px solid ${slide.accent}50`, color: slide.accent }}
              >
                <MdFlashOn size={10} /> {slide.label}
              </div>
              <h2
                className="hero-title text-white font-black text-xl leading-tight mb-1"
                style={{ fontFamily: "'Georgia',serif", whiteSpace: "pre-line" }}
              >
                {slide.headline}
              </h2>
              <p className="hero-sub text-white/50 text-xs mb-3">{slide.sub}</p>
              <Link
                href={slide.ctaPath}
                prefetch={true}
                className="hero-cta inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs text-white"
                style={{ background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}bb)`, boxShadow: `0 4px 16px ${slide.accent}44` }}
              >
                {slide.cta} <FiArrowRight size={13} />
              </Link>
            </div>

            <div className="hero-dots absolute bottom-4 right-4 z-10 flex gap-1">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="rounded-full transition-all duration-300"
                  style={{ width: i === current ? "18px" : "5px", height: "5px", background: i === current ? slide.accent : "rgba(255,255,255,0.4)" }}
                />
              ))}
            </div>
          </div>

          {renderMobileCategories()}

          <div
            className="overflow-hidden relative"
            style={{ background: "linear-gradient(135deg,#0a0a0a 0%,#150500 40%,#2a0e00 100%)", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}
          >
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)", backgroundSize: "18px 18px" }}
            />
            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none opacity-25" style={{ background: "radial-gradient(circle,#FF8C00,transparent 65%)" }} />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full pointer-events-none opacity-15" style={{ background: "radial-gradient(circle,#B42225,transparent 65%)" }} />
            <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg,transparent,#B42225,#FF8C00,transparent)" }} />
            <div className="relative z-10 px-5 py-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#B42225,#FF8C00)", boxShadow: "0 4px 14px rgba(180,34,37,0.5)" }}>
                    <FiShoppingBag size={15} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-white font-black text-sm leading-tight">Sell on JOVO</p>
                      <span className="text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,140,0,0.15)", border: "1px solid rgba(255,140,0,0.3)", color: "#FF8C00" }}>
                        FREE
                      </span>
                    </div>
                    <p className="text-white/35 text-[10px] mt-0.5">Join 5,000+ campus sellers</p>
                  </div>
                </div>
                <Link
                  href={isSeller ? "/seller/dashboard" : "/become-seller"}
                  prefetch={true}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-[11px] text-white shrink-0 transition-all active:scale-95 cursor-pointer"
                  style={{ background: "linear-gradient(135deg,#B42225,#FF8C00)", boxShadow: "0 4px 14px rgba(180,34,37,0.4)" }}
                >
                  {isSeller ? "Go to Dashboard" : "Start Now"} <FiArrowRight size={11} />
                </Link>
              </div>
              <div className="flex items-center gap-2">
                {[" Easy Listing", "Weekly Payouts", "Instant Reach"].map((t) => (
                  <span key={t} className="text-[9px] font-semibold text-white/30 bg-white/5 border border-white/8 px-2 py-1 rounded-full whitespace-nowrap">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ HOVER CARD ════════════════ */}
      {hoveredCategoryData && hoverTheme && (
        <div
          className="fixed bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{
            top: hoverPosition.top,
            left: hoverPosition.left,
            width: "280px",
            zIndex: 9999,
            animation: "fadeIn 0.2s ease-out",
          }}
          onMouseEnter={() => setHoveredCategory(hoveredCategoryData.id)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="p-4 border-b" style={{ background: hoverTheme.gradient }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <CategoryIcon name={hoveredCategoryData.name} slug={hoveredCategoryData.slug} size={16} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{hoveredCategoryData.name}</p>
                <p className="text-white/70 text-[10px]">
                  {isLoadingData ? "Loading..." : `${(productCountsMap[hoveredCategoryData.id] || hoveredCategoryData.product_count || 0).toLocaleString()} products`}
                </p>
              </div>
            </div>
          </div>
          <div className="p-3 max-h-80 overflow-y-auto bg-white">
            {isLoadingData ? (
              <div className="text-center py-6">
                <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mb-2"></div>
                <p className="text-gray-400 text-xs">Loading subcategories...</p>
              </div>
            ) : hoveredCategorySubs.length > 0 ? (
              <>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2 px-2">
                  Subcategories
                </p>
                <div className="space-y-1">
                  {hoveredCategorySubs.slice(0, 8).map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/category/${hoveredCategoryData.slug || hoveredCategoryData.id}?subcategory=${sub.slug || sub.id}`}
                      className="block px-3 py-2 rounded-xl text-xs text-gray-700 transition-all hover:translate-x-1"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = hoverTheme.accentColor;
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "";
                        e.currentTarget.style.color = "";
                      }}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
                {hoveredCategorySubs.length > 8 && (
                  <Link
                    href={`/category/${hoveredCategoryData.slug || hoveredCategoryData.id}`}
                    className="block text-center text-[10px] font-semibold mt-3 pt-2 border-t border-gray-100"
                    style={{ color: hoverTheme.accentColor }}
                  >
                    View all {hoveredCategorySubs.length} subcategories →
                  </Link>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <FiBox size={24} className="text-gray-300" />
                  </div>
                </div>
                <p className="text-gray-400 text-xs">No subcategories available</p>
                <Link
                  href={`/category/${hoveredCategoryData.slug || hoveredCategoryData.id}`}
                  className="inline-block mt-2 text-xs font-semibold"
                  style={{ color: hoverTheme.accentColor }}
                >
                  Browse {hoveredCategoryData.name} →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ ALL CATEGORIES MODAL ════════════════ */}
      {showAllModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowAllModal(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl"
            style={{ animation: "modalSlideUp 0.3s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative px-6 py-5 border-b" style={{ background: "linear-gradient(135deg,#1e1b4b,#4338CA)", borderColor: "rgba(255,255,255,0.1)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">All Categories</h2>
                  <p className="text-white/50 text-xs mt-1">Explore everything JOVO has to offer</p>
                </div>
                <button
                  onClick={() => setShowAllModal(false)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {catLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <p className="text-center text-gray-400 py-10 text-sm">No categories available right now.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categories.map((cat) => {
                    const theme = getCategoryTheme(cat.slug || cat.name);
                    const categorySubs = subcategoriesMap[cat.id] || [];
                    const displayCount = productCountsMap[cat.id] || cat.product_count || 0;
                    return (
                      <div
                        key={cat.id}
                        className="rounded-2xl overflow-hidden border hover:shadow-lg transition-shadow"
                        style={{ borderColor: `${theme.accentColor}20` }}
                      >
                        <Link
                          href={`/category/${cat.slug || cat.id}`}
                          onClick={() => setShowAllModal(false)}
                          className="block p-4 transition-all hover:scale-[1.01]"
                          style={{ background: `linear-gradient(135deg, ${theme.accentColor}08, ${theme.accentColor}02)` }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center"
                              style={{ background: `${theme.accentColor}25`, color: theme.accentColor }}
                            >
                              <CategoryIcon name={cat.name} slug={cat.slug} size={24} />
                            </div>
                            <div className="flex-1">
                              <p className="font-black text-gray-800 text-base">{cat.name}</p>
                              <p className="text-gray-500 text-xs font-semibold">
                                {displayCount.toLocaleString() || 0} products
                              </p>
                            </div>
                            <FiArrowRight className="text-gray-300" size={18} />
                          </div>
                        </Link>
                        
                        {/* Show subcategories in modal */}
                        {categorySubs.length > 0 && (
                          <div className="p-4 bg-gray-50 border-t" style={{ borderColor: `${theme.accentColor}15` }}>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
                              Subcategories
                            </p>
                            <div className="grid grid-cols-2 gap-1">
                              {categorySubs.slice(0, 6).map((sub) => (
                                <Link
                                  key={sub.id}
                                  href={`/category/${cat.slug || cat.id}?subcategory=${sub.slug || sub.id}`}
                                  onClick={() => setShowAllModal(false)}
                                  className="text-xs text-gray-600 px-3 py-2 rounded-lg transition-all hover:text-white"
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = theme.accentColor;
                                    e.currentTarget.style.color = "white";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "";
                                    e.currentTarget.style.color = "";
                                  }}
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                            {categorySubs.length > 6 && (
                              <Link
                                href={`/category/${cat.slug || cat.id}`}
                                onClick={() => setShowAllModal(false)}
                                className="block text-center text-xs font-semibold mt-3 pt-2 border-t border-gray-200"
                                style={{ color: theme.accentColor }}
                              >
                                + {categorySubs.length - 6} more subcategories
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t" style={{ background: "#F9FAFB", borderColor: "#E5E7EB" }}>
              <p className="text-center text-xs text-gray-400">
                {categories.length} categories available • Shop with confidence on JOVO
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeroSection;