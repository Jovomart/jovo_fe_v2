'use client';
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faArrowRight,
  faBoltLightning,
  faMobileScreen,
  faLaptop,
  faShirt,
  faLayerGroup,
  faBox,
} from "@fortawesome/free-solid-svg-icons";
import ProductCard from "@/components/ui/ProductCard";
import type { Product } from "@/types";
import apiService from "@/services/apiService";

// Styles as a constant to be used in both loading and loaded states
const FPS_STYLES = `
  .fps-root {
    position: relative;
    padding: 88px 24px 104px;
    background: #07070e;
    overflow: hidden;
    isolation: isolate;
  }
  @media (max-width: 767px) { .fps-root { padding: 60px 16px 72px; } }
  .fps-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
  .fps-orb-r {
    position: absolute; bottom: -15%; right: -8%;
    width: 55%; height: 70%;
    background: radial-gradient(ellipse at 100% 100%, rgba(180,34,37,0.13) 0%, transparent 65%);
    filter: blur(80px);
  }
  .fps-orb-l {
    position: absolute; top: -10%; left: -5%;
    width: 40%; height: 55%;
    background: radial-gradient(ellipse at 0% 0%, rgba(255,140,0,0.07) 0%, transparent 65%);
    filter: blur(80px);
  }
  .fps-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.013) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.013) 1px, transparent 1px);
    background-size: 64px 64px;
  }
  .fps-top-line {
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent 5%, rgba(180,34,37,0.3) 35%, rgba(255,140,0,0.3) 65%, transparent 95%);
  }
  .fps-grain {
    position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 200px 200px;
    opacity: 0.018;
    mix-blend-mode: overlay;
  }
  .fps-inner {
    position: relative;
    z-index: 1;
    max-width: 1380px;
    margin: 0 auto;
  }
  .fps-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 52px;
    gap: 0;
  }
  @media (max-width: 767px) { .fps-header { margin-bottom: 36px; } }
  .fps-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    border-radius: 100px;
    background: rgba(255,140,0,0.07);
    border: 1px solid rgba(255,140,0,0.2);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(255,140,0,0.75);
    margin-bottom: 28px;
    animation: fps-fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s both;
  }
  .fps-eyebrow__dot {
    width: 5px; height: 5px;
    background: #FF8C00;
    border-radius: 50%;
    animation: fps-dot-blink 1.8s ease-in-out infinite;
  }
  @keyframes fps-dot-blink {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.3; transform:scale(0.55); }
  }
  .fps-h2 {
    font-family: var(--font-sora, 'Sora', sans-serif);
    font-size: clamp(30px, 4.5vw, 58px);
    font-weight: 900;
    letter-spacing: -0.028em;
    line-height: 1.04;
    color: #fff;
    margin-bottom: 18px;
    animation: fps-fade-up 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both;
  }
  .fps-h2__grad {
    background: linear-gradient(135deg, #B42225 0%, #FF8C00 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .fps-h2__outline {
    -webkit-text-stroke: 2px rgba(255,255,255,0.18);
    -webkit-text-fill-color: transparent;
    color: transparent;
  }
  .fps-sub {
    font-size: 14px;
    line-height: 1.75;
    color: rgba(255,255,255,0.68);
    max-width: 420px;
    animation: fps-fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.28s both;
  }
  .fps-rule {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0 0;
    animation: fps-fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.38s both;
  }
  .fps-rule__line {
    flex: 1;
    max-width: 80px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1));
  }
  .fps-rule__line--r {
    background: linear-gradient(90deg, rgba(255,255,255,0.1), transparent);
  }
  .fps-rule__gem {
    font-size: 9px;
    color: rgba(255,140,0,0.55);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 700;
  }
  @keyframes fps-fade-up {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .fps-tabs-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 44px;
    overflow-x: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
    animation: fps-fade-up 0.65s cubic-bezier(0.16,1,0.3,1) 0.44s both;
  }
  .fps-tabs-wrap::-webkit-scrollbar { display: none; }
  .fps-tabs {
    display: inline-flex;
    gap: 6px;
    padding: 5px;
    background: rgba(255,255,255,0.034);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 100px;
    backdrop-filter: blur(12px);
  }
  .fps-tab {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 20px;
    border-radius: 100px;
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: 0.01em;
    cursor: pointer;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.75);
    transition: color 0.22s ease;
    white-space: nowrap;
  }
  .fps-tab:hover { color: rgba(255,255,255,0.95); }
  .fps-tab--active { color: #fff; }
  .fps-tab__pill {
    position: absolute;
    inset: 0;
    border-radius: 100px;
    background: linear-gradient(135deg, #B42225, #FF8C00);
    box-shadow: 0 4px 20px rgba(180,34,37,0.38);
    z-index: 0;
  }
  .fps-tab__label { position: relative; z-index: 1; }
  .fps-tab__icon  { position: relative; z-index: 1; font-size: 10px; }
  @media (max-width: 479px) {
    .fps-tab { padding: 8px 14px; font-size: 11.5px; gap: 5px; }
  }
  .fps-slider-shell { position: relative; }
  .fps-slider-shell::before,
  .fps-slider-shell::after {
    content: '';
    position: absolute;
    top: 0; bottom: 0;
    width: 80px;
    pointer-events: none;
    z-index: 10;
  }
  .fps-slider-shell::before {
    left: 0;
    background: linear-gradient(90deg, #07070e 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .fps-slider-shell::after {
    right: 0;
    background: linear-gradient(90deg, transparent 0%, #07070e 100%);
    opacity: 1;
  }
  .fps-slider-shell.fps-fade-left::before { opacity: 1; }
  .fps-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 44px; height: 44px;
    border-radius: 50%;
    background: rgba(10,8,22,0.92);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.6);
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 20;
    transition: all 0.22s ease;
    box-shadow: 0 8px 28px rgba(0,0,0,0.5);
    backdrop-filter: blur(12px);
    opacity: 0;
    pointer-events: none;
  }
  .fps-arrow--visible {
    opacity: 1;
    pointer-events: auto;
  }
  .fps-arrow:hover {
    background: linear-gradient(135deg, #B42225, #FF8C00);
    border-color: transparent;
    color: #fff;
    box-shadow: 0 8px 28px rgba(180,34,37,0.45);
  }
  .fps-arrow--l { left: -18px; }
  .fps-arrow--r { right: -18px; }
  @media (max-width: 767px) {
    .fps-arrow--l { left: -10px; }
    .fps-arrow--r { right: -10px; }
    .fps-arrow { width: 38px; height: 38px; opacity: 1; pointer-events: auto; }
  }
  .fps-track {
    overflow-x: auto;
    overflow-y: visible;
    -ms-overflow-style: none;
    scrollbar-width: none;
    padding: 12px 4px 20px;
  }
  .fps-track::-webkit-scrollbar { display: none; }
  .fps-cards {
    display: flex;
    gap: 4px;
    transition: opacity 0.22s ease, transform 0.22s ease;
  }
  .fps-cards--fading {
    opacity: 0;
    transform: translateY(10px);
  }
  .fps-card-wrap {
    flex-shrink: 0;
    width: 268px;
  }
  @media (min-width: 640px)  { .fps-card-wrap { width: 290px; } }
  @media (min-width: 1024px) { .fps-card-wrap { width: 310px; } }
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
    min-height: 300px;
    width: 100%;
  }
  .empty-state__icon {
    font-size: 48px;
    color: rgba(255,255,255,0.1);
    margin-bottom: 16px;
  }
  .empty-state__title {
    font-size: 18px;
    font-weight: 700;
    color: rgba(255,255,255,0.5);
    margin-bottom: 8px;
  }
  .empty-state__sub {
    font-size: 13px;
    color: rgba(255,255,255,0.3);
  }
  .fps-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 52px;
    padding-top: 32px;
    border-top: 1px solid rgba(255,255,255,0.055);
  }
  @media (max-width: 767px) {
    .fps-footer { justify-content: center; margin-top: 36px; }
  }
  .fps-footer__count {
    font-size: 13px;
    color: rgba(255,255,255,0.55);
    font-weight: 600;
    letter-spacing: 0.04em;
  }
  .fps-footer__count strong {
    color: rgba(255,255,255,0.5);
  }
  @media (max-width: 767px) { .fps-footer__count { display: none; } }
  .fps-cta {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 13px 32px;
    border-radius: 100px;
    font-size: 13.5px;
    font-weight: 700;
    color: rgba(255,255,255,0.85);
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    letter-spacing: 0.02em;
    transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
    text-decoration: none;
  }
  .fps-cta:hover {
    background: linear-gradient(135deg, #B42225, #FF8C00);
    border-color: transparent;
    color: #fff;
    box-shadow: 0 10px 36px rgba(180,34,37,0.4);
    transform: translateY(-2px);
  }
  .fps-cta__icon { font-size: 11px; transition: transform 0.22s ease; }
  .fps-cta:hover .fps-cta__icon { transform: translateX(5px); }
  .fps-trust {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }
  @media (max-width: 767px) { .fps-trust { display: none; } }
  .fps-trust__item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,255,255,0.55);
  }
  .fps-trust__dot {
    width: 4px; height: 4px;
    border-radius: 50%;
    background: rgba(255,140,0,0.35);
  }
  @media (prefers-reduced-motion: reduce) {
    .fps-eyebrow, .fps-h2, .fps-sub, .fps-rule, .fps-tabs-wrap {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
    .fps-eyebrow__dot { animation: none !important; }
    .fps-arrow { opacity: 1; pointer-events: auto; }
  }
`;

// Icon mapping for categories
const getCategoryIcon = (categoryName: string, categorySlug: string) => {
  const name = (categoryName || categorySlug || '').toLowerCase();
  if (name.includes('smartphone') || name.includes('mobile') || name.includes('phone')) return faMobileScreen;
  if (name.includes('fashion') || name.includes('cloth') || name.includes('shoe')) return faShirt;
  if (name.includes('electronic')) return faBoltLightning;
  if (name.includes('computer') || name.includes('laptop') || name.includes('tech')) return faLaptop;
  if (name.includes('gaming')) return faBoltLightning;
  return faLayerGroup;
};

interface Tab {
  label: string;
  value: string;
  icon: any;
}

export default function FeaturedProductsSection() {
  const [activeTab, setActiveTab] = useState("all");
  const [fading, setFading] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [productCountsMap, setProductCountsMap] = useState<Record<string, number>>({});
  const [categoryProductsMap, setCategoryProductsMap] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  const fetchCategoriesAndProducts = useCallback(async () => {
    try {
      console.log('[FeaturedProducts] Fetching categories like HeroSection...');
      
      const response = await apiService.getPublicCategories("PRODUCT");
      console.log('[FeaturedProducts] Categories response:', response);
      
      let cats: any[] = [];
      
      if (response?.data && Array.isArray(response.data)) {
        cats = response.data;
      } else if (response?.categories && Array.isArray(response.categories)) {
        cats = response.categories;
      } else if (Array.isArray(response)) {
        cats = response;
      } else if (response?.data?.categories && Array.isArray(response.data.categories)) {
        cats = response.data.categories;
      }
      
      const mappedCats = cats.map((cat: any) => ({
        id: String(cat.id || cat.category_id),
        name: String(cat.name || cat.category_name || ""),
        slug: String(cat.slug || cat.category_slug || cat.id),
        image: cat.image || cat.icon,
        product_count: 0,
      })).filter(cat => cat.name && cat.id);
      
      console.log('[FeaturedProducts] Mapped categories:', mappedCats);
      setCategories(mappedCats);
      
      console.log('[FeaturedProducts] Fetching products for each category...');
      
      const productsByCategory: Record<string, Product[]> = {};
      const countsMap: Record<string, number> = {};
      
      for (const cat of mappedCats) {
        try {
          console.log(`[FeaturedProducts] Fetching products for category: ${cat.name} (${cat.id})`);
          const marketData = await apiService.getCategoryMarketspace(cat.id, { limit: 10 });
          const data = marketData?.data ?? marketData;
          const productsList = data?.products || data?.items || [];
          const total = data?.total || productsList.length || 0;
          
          countsMap[cat.id] = total;
          
          if (Array.isArray(productsList) && productsList.length > 0) {
            const mappedProducts = productsList.map((p: any, idx: number) => {
              const originalPrice = p.product_original_price || p.original_price || 0;
              const currentPrice = p.current_price || p.price || p.product_discount_price || originalPrice;
              const firstImage = p.product_images?.[0] || p.images?.[0] || '';
              
              return {
                id: p.id || p.product_id || `${cat.slug}_${idx}`,
                name: p.product_name || p.name || 'Product',
                price: currentPrice,
                oldPrice: originalPrice > currentPrice ? originalPrice : undefined,
                category: cat.slug,
                categoryName: cat.name,
                image: firstImage,
                images: p.product_images || p.images || [],
                brand: p.brand || null,
                rating: p.average_rating || p.rating || 0,
                reviews: p.reviews_count || p.reviews || 0,
                alt: p.product_name || p.name || 'Product image',
              } as Product;
            });
            productsByCategory[cat.slug] = mappedProducts;
          } else {
            productsByCategory[cat.slug] = [];
          }
        } catch (err) {
          console.error(`Failed to get products for ${cat.name}:`, err);
          productsByCategory[cat.slug] = [];
          countsMap[cat.id] = 0;
        }
      }
      
      setProductCountsMap(countsMap);
      setCategoryProductsMap(productsByCategory);
      
      const allProducts = Object.values(productsByCategory).flat();
      console.log('[FeaturedProducts] Total products:', allProducts.length);
      
      setProducts(allProducts);
      
    } catch (error) {
      console.error('[FeaturedProducts] Error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchCategoriesAndProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayTabs: Tab[] = useMemo(() => [
    { label: "All", value: "all", icon: faLayerGroup },
    ...categories.map(cat => ({
      label: cat.name,
      value: cat.slug,
      icon: getCategoryIcon(cat.name, cat.slug),
    }))
  ], [categories]);

  const getProductCountForCategory = useCallback((categorySlug: string) => {
    if (categorySlug === "all") return products.length;
    return categoryProductsMap[categorySlug]?.length || 0;
  }, [products.length, categoryProductsMap]);

  const filtered = useMemo(() => 
    activeTab === "all"
      ? products
      : categoryProductsMap[activeTab] || []
  , [activeTab, products, categoryProductsMap]);

  const checkScroll = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 20);
    setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 20);
  }, []);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    checkScroll();
    return () => el.removeEventListener("scroll", checkScroll);
  }, [filtered, checkScroll]);

  const switchTab = useCallback((val: string) => {
    if (val === activeTab) return;
    setFading(true);
    setTimeout(() => {
      setActiveTab(val);
      setFading(false);
      if (sliderRef.current) {
        sliderRef.current.scrollLeft = 0;
        checkScroll();
      }
    }, 220);
  }, [activeTab, checkScroll]);

  const scroll = useCallback((dir: "left" | "right") => {
    const el = sliderRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>(".product-card");
    const cardWidth = firstCard ? firstCard.offsetWidth + 16 : 300;
    el.scrollBy({ left: dir === "left" ? -cardWidth : cardWidth, behavior: "smooth" });
  }, []);

  const showEmptyState = activeTab !== "all" && filtered.length === 0;

  // Always render styles first
  return (
    <>
      <style>{FPS_STYLES}</style>
      
      {loading ? (
        <section className="fps-root" aria-label="Featured products">
          <div className="fps-bg" aria-hidden="true">
            <div className="fps-orb-r" />
            <div className="fps-orb-l" />
            <div className="fps-grid" />
            <div className="fps-grain" />
            <div className="fps-top-line" />
          </div>
          <div className="fps-inner">
            <header className="fps-header">
              <div className="fps-eyebrow">
                <span className="fps-eyebrow__dot" />
                Premium Selection
              </div>
              <h2 className="fps-h2">
                Curated{" "}
                <em className="fps-h2__grad" style={{ fontStyle: "normal" }}>
                  For&nbsp;You
                </em>
                <br />
                <span className="fps-h2__outline">Campus Picks</span>
              </h2>
              <div className="fps-rule">
                <span className="fps-rule__line" />
                <span className="fps-rule__gem">✦ Featured ✦</span>
                <span className="fps-rule__line fps-rule__line--r" />
              </div>
            </header>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse px-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-xl h-64" />
              ))}
            </div>
          </div>
        </section>
      ) : products.length === 0 && categories.length === 0 ? null : (
        <section className="fps-root" aria-label="Featured products">
          <div className="fps-bg" aria-hidden="true">
            <div className="fps-orb-r" />
            <div className="fps-orb-l" />
            <div className="fps-grid" />
            <div className="fps-grain" />
            <div className="fps-top-line" />
          </div>

          <div className="fps-inner">
            <header className="fps-header">
              <div className="fps-eyebrow">
                <span className="fps-eyebrow__dot" />
                Premium Selection
              </div>

              <h2 className="fps-h2">
                Curated{" "}
                <em className="fps-h2__grad" style={{ fontStyle: "normal" }}>
                  For&nbsp;You
                </em>
                <br />
                <span className="fps-h2__outline">Campus Picks</span>
              </h2>

              <div className="fps-rule">
                <span className="fps-rule__line" />
                <span className="fps-rule__gem">✦ Featured ✦</span>
                <span className="fps-rule__line fps-rule__line--r" />
              </div>
            </header>

            {displayTabs.length > 1 && (
              <div className="fps-tabs-wrap" role="tablist" aria-label="Filter products by category">
                <div className="fps-tabs">
                  {displayTabs.map(({ label, value, icon }) => {
                    const active = activeTab === value;
                    const productCount = getProductCountForCategory(value);
                    return (
                      <button
                        key={value}
                        role="tab"
                        aria-selected={active}
                        onClick={() => switchTab(value)}
                        className={`fps-tab${active ? " fps-tab--active" : ""}`}
                      >
                        {active && (
                          <span className="fps-tab__pill" aria-hidden="true" />
                        )}
                        <FontAwesomeIcon icon={icon} className="fps-tab__icon" />
                        <span className="fps-tab__label">
                          {label}
                          {value !== "all" && (
                            <span className="ml-1 text-[9px] opacity-50">({productCount})</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={`fps-slider-shell${showLeftArrow ? " fps-fade-left" : ""}`}>
              <button
                onClick={() => scroll("left")}
                aria-label="Scroll left"
                className={`fps-arrow fps-arrow--l${showLeftArrow ? " fps-arrow--visible" : ""}`}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>

              <div ref={sliderRef} className="fps-track">
                {showEmptyState ? (
                  <div className="empty-state">
                    <div className="empty-state__icon">
                      <FontAwesomeIcon icon={faBox} />
                    </div>
                    <h3 className="empty-state__title">No products in this category</h3>
                    <p className="empty-state__sub">Check back later for new arrivals</p>
                  </div>
                ) : (
                  <div
                    role="list"
                    aria-label="Featured products"
                    className={`fps-cards${fading ? " fps-cards--fading" : ""}`}
                  >
                    {filtered.map((product, index) => (
                      <div
                        key={`${product.id}-${index}`}
                        role="listitem"
                        className="fps-card-wrap"
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => scroll("right")}
                aria-label="Scroll right"
                className={`fps-arrow fps-arrow--r${showRightArrow ? " fps-arrow--visible" : ""}`}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>

            <div className="fps-footer">
              <p className="fps-footer__count">
                Showing <strong>{filtered.length}</strong> product
                {filtered.length !== 1 ? "s" : ""}
                {activeTab !== "all" && (
                  <>
                    {" "}
                    in{" "}
                    <strong>
                      {displayTabs.find((t) => t.value === activeTab)?.label}
                    </strong>
                  </>
                )}
              </p>

              <Link href="/shop" className="fps-cta">
                <span>Explore Full Collection</span>
                <FontAwesomeIcon icon={faArrowRight} className="fps-cta__icon" />
              </Link>

              <div className="fps-trust">
                {["Verified Sellers", "Secure Checkout", "Campus Delivery"].map(
                  (t, i, arr) => (
                    <span key={t} className="fps-trust__item">
                      {t}
                      {i < arr.length - 1 && <span className="fps-trust__dot" />}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}