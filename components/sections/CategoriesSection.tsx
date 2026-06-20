"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMobileScreen,
  faTv,
  faSpa,
  faShirt,
  faLaptop,
  faGamepad,
  faArrowUpRightFromSquare,
  faBox,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";
import { getCategoryTheme } from "@/categoryConfig";
import apiService from "@/services/apiService";

const iconMap: Record<string, any> = {
  "mobile-screen": faMobileScreen,
  tv: faTv,
  spa: faSpa,
  shirt: faShirt,
  laptop: faLaptop,
  gamepad: faGamepad,
};
const DEFAULT_ICON = faBox;

const getCategoryIcon = (slug: string, iconName?: string) => {
  if (iconName && iconMap[iconName]) return iconMap[iconName];
  const slugLower = slug?.toLowerCase() || "";
  if (slugLower.includes("phone") || slugLower.includes("mobile"))
    return faMobileScreen;
  if (slugLower.includes("tv") || slugLower.includes("television")) return faTv;
  if (slugLower.includes("beauty") || slugLower.includes("spa")) return faSpa;
  if (
    slugLower.includes("fashion") ||
    slugLower.includes("cloth") ||
    slugLower.includes("shoe")
  )
    return faShirt;
  if (
    slugLower.includes("computer") ||
    slugLower.includes("laptop") ||
    slugLower.includes("tech")
  )
    return faLaptop;
  if (slugLower.includes("game") || slugLower.includes("gaming"))
    return faGamepad;
  return DEFAULT_ICON;
};

// Default placeholder image (data URL - no 404)
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%231a1a2e'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23666' font-size='16' dy='.3em'%3ECategory%3C/text%3E%3C/svg%3E";

// Add this to your getCategoryImage function in CategoriesSection.tsx
const getCategoryImage = (categoryName: string): string => {
  const images: Record<string, string> = {
    Electronics:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
    Fashion:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop",
    Phones:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
    Computers:
      "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&h=300&fit=crop",
    Laptops:
      "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&h=300&fit=crop",
    Home: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=300&fit=crop",
    Beauty:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop",
    Sports:
      "https://images.unsplash.com/photo-1461896836934-ffe807baa2e7?w=400&h=300&fit=crop",
    Books:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=300&fit=crop",
    Toys: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop",
    Gaming:
      "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop",
    Groceries:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
    Appliances:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=300&fit=crop",
    // Added more categories with images
    Shoes:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
    Footwear:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
    Sneakers:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&h=300&fit=crop",
    Clothing:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=300&fit=crop",
    Watches:
      "https://images.unsplash.com/photo-1523170335358-fd0b1aef1ba3?w=400&h=300&fit=crop",
    Jewelry:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=300&fit=crop",
    Bags: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=300&fit=crop",
    Furniture:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop",
    Kitchen:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=300&fit=crop",
    Tools:
      "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=300&fit=crop",
    Automotive:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop",
    Pets: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=300&fit=crop",
    Baby: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=300&fit=crop",
    Office:
      "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=400&h=300&fit=crop",
    Music:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop",
    Cameras:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop",
    Printers:
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&h=300&fit=crop",
    Networking:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop",
  };

  // Case-insensitive matching
  const searchName = categoryName?.toLowerCase() || "";
  for (const [key, url] of Object.entries(images)) {
    if (searchName.includes(key.toLowerCase())) {
      return url;
    }
  }
  return PLACEHOLDER_IMAGE;
};

export default function CategoriesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("[CategoriesSection] Fetching categories...");
      // Fetch categories exactly like HeroSection does
      const response = await apiService.getPublicCategories("PRODUCT");
      console.log("[CategoriesSection] Categories response:", response);

      let cats: any[] = [];

      // Parse response exactly like HeroSection
      if (response?.data && Array.isArray(response.data)) {
        cats = response.data;
      } else if (response?.categories && Array.isArray(response.categories)) {
        cats = response.categories;
      } else if (Array.isArray(response)) {
        cats = response;
      } else if (
        response?.data?.categories &&
        Array.isArray(response.data.categories)
      ) {
        cats = response.data.categories;
      }

      console.log(
        "[CategoriesSection] Extracted categories count:",
        cats.length,
      );

      if (cats.length > 0) {
        // Map categories exactly like HeroSection
        const mappedCats = cats
          .map((cat: any) => {
            const categoryId = String(cat.id || cat.category_id);
            const categorySlug = String(
              cat.slug || cat.category_slug || categoryId,
            );

            return {
              id: categoryId,
              name: String(cat.name || cat.category_name || ""),
              slug: categorySlug,
              image:
                cat.image ||
                cat.icon ||
                getCategoryImage(String(cat.name || "")),
              product_count: 0, // Will be updated after fetching counts
              icon: cat.icon,
              color: cat.color,
            };
          })
          .filter((cat: any) => cat.name && cat.id);

        console.log(
          "[CategoriesSection] Mapped categories count:",
          mappedCats.length,
        );
        setCategories(mappedCats);

        // Fetch product counts for each category like HeroSection does
        const categoriesToFetch = mappedCats.slice(0, 8);
        const countPromises = categoriesToFetch.map(async (cat) => {
          try {
            const marketData = await apiService.getCategoryMarketspace(cat.id, {
              limit: 1,
            });
            const data = marketData?.data ?? marketData;
            const total = data?.total || 0;
            return { id: cat.id, count: total };
          } catch (err) {
            console.error(
              `[CategoriesSection] Failed to get product count for ${cat.name}:`,
              err,
            );
            return { id: cat.id, count: 0 };
          }
        });

        const counts = await Promise.all(countPromises);
        const countsMap: Record<string, number> = {};
        counts.forEach(({ id, count }) => {
          countsMap[id] = count;
        });

        // Update categories with product counts
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            product_count: countsMap[cat.id] || 0,
          })),
        );
      } else {
        console.warn("[CategoriesSection] No categories found");
        setCategories([]);
      }
    } catch (err: any) {
      console.error("[CategoriesSection] Failed to fetch categories:", err);
      setError(err?.message || "Failed to load categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Defer so the initial setLoading(true)/setError(null) inside
    // fetchCategories doesn't run synchronously within the effect body
    // (set-state-in-effect rule).
    queueMicrotask(() => {
      fetchCategories();
    });
  }, [fetchCategories]);

  // Loading state
  if (loading) {
    return (
      <section
        ref={sectionRef}
        className="cat2-section"
        aria-label="Shop by category"
      >
        <span className="cat2-watermark" aria-hidden="true">
          EXPLORE
        </span>
        <div className="cat2-top-line" aria-hidden="true" />
        <div className="cat2-wrap">
          <div className="cat2-header cat2--in">
            <div className="cat2-header__row">
              <div className="cat2-header__copy">
                <span className="cat2-eyebrow">
                  <span className="cat2-eyebrow__dot" />
                  Explore
                </span>
                <h2 className="cat2-h2">
                  Shop by <em className="cat2-h2__accent">Category</em>
                </h2>
                <p className="cat2-sub">
                  From gadgets to groceries — everything you need, right on
                  campus.
                </p>
              </div>
              <div className="cat2-header__num" aria-hidden="true">
                02
              </div>
            </div>
          </div>
          <div className="cat2-grid cat2--in">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="cat2-card animate-pulse">
                <div
                  className="cat2-card__photo bg-gray-800"
                  style={{ aspectRatio: "4/3" }}
                />
                <div className="cat2-card__body">
                  <div className="w-8 h-8 rounded-lg bg-gray-700" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded w-24 mb-1" />
                    <div className="h-3 bg-gray-800 rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Empty state - no categories found
  if (!loading && categories.length === 0) {
    return (
      <section
        ref={sectionRef}
        className="cat2-section"
        aria-label="Shop by category"
      >
        <span className="cat2-watermark" aria-hidden="true">
          EXPLORE
        </span>
        <div className="cat2-top-line" aria-hidden="true" />
        <div className="cat2-wrap">
          <div className={`cat2-header${visible ? " cat2--in" : ""}`}>
            <div className="cat2-header__row">
              <div className="cat2-header__copy">
                <span className="cat2-eyebrow" aria-label="Section label">
                  <span className="cat2-eyebrow__dot" aria-hidden="true" />
                  Explore
                </span>
                <h2 className="cat2-h2">
                  Shop by <em className="cat2-h2__accent">Category</em>
                </h2>
                <p className="cat2-sub">
                  From gadgets to groceries — everything you need, right on
                  campus.
                </p>
              </div>
              <div className="cat2-header__num" aria-hidden="true">
                02
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faFolderOpen}
                className="text-3xl text-gray-500"
              />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Categories Found
            </h3>
            <p className="text-gray-400 max-w-md">
              {error ||
                "We couldn't find any categories at the moment. Please check back later."}
            </p>
            <button
              onClick={() => fetchCategories()}
              className="mt-6 px-6 py-2 bg-gradient-to-r from-[#B42225] to-[#FF8C00] rounded-full text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Render categories
  const displayCategories = categories.slice(0, 8);

  return (
    <section
      ref={sectionRef}
      className="cat2-section"
      aria-label="Shop by category"
    >
      <span className="cat2-watermark" aria-hidden="true">
        EXPLORE
      </span>
      <div className="cat2-top-line" aria-hidden="true" />

      <div className={`cat2-header${visible ? " cat2--in" : ""}`}>
        <div className="cat2-wrap">
          <div className="cat2-header__row">
            <div className="cat2-header__copy">
              <span className="cat2-eyebrow" aria-label="Section label">
                <span className="cat2-eyebrow__dot" aria-hidden="true" />
                Explore
              </span>
              <h2 className="cat2-h2">
                Shop by <em className="cat2-h2__accent">Category</em>
              </h2>
              <p className="cat2-sub">
                From gadgets to groceries — everything you need, right on
                campus.
              </p>
            </div>
            <div className="cat2-header__num" aria-hidden="true">
              02
            </div>
          </div>
        </div>
      </div>

      <div className="cat2-wrap">
        <div
          className={`cat2-grid${visible ? " cat2--in" : ""}`}
          role="list"
          aria-label="Product categories"
        >
          {displayCategories.map((cat, idx) => {
            const theme = getCategoryTheme(cat.slug || cat.name);
            const icon = getCategoryIcon(cat.slug, cat.icon);
            const imageUrl = cat.image || getCategoryImage(cat.name);

            return (
              <article
                key={cat.id}
                className="cat2-card"
                role="listitem"
                style={
                  {
                    "--ci": idx,
                    "--cc": theme.accentColor || cat.color || "#B42225",
                  } as React.CSSProperties
                }
              >
                <Link
                  href={`/category/${cat.slug || cat.id}`}
                  className="cat2-card__link"
                  aria-label={`Shop ${cat.name}`}
                >
                  <div className="cat2-card__photo">
                    <Image
                      src={imageUrl}
                      alt={cat.name}
                      fill
                      className="cat2-card__img"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      unoptimized={true}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                    <div className="cat2-card__veil" aria-hidden="true" />
                    <span className="cat2-card__ghost" aria-hidden="true">
                      {cat.name}
                    </span>
                    <div className="cat2-card__scan" aria-hidden="true" />
                  </div>

                  <div className="cat2-card__body">
                    <div
                      className="cat2-card__icon"
                      aria-hidden="true"
                      style={{
                        background: `${theme.accentColor}20`,
                        color: theme.accentColor,
                      }}
                    >
                      <FontAwesomeIcon icon={icon} className="text-3xl" />
                    </div>
                    <div className="cat2-card__text">
                      <h3 className="cat2-card__name">{cat.name}</h3>
                      <span className="cat2-card__count">
                        {cat.product_count || 0} items
                      </span>
                    </div>
                    <span className="cat2-card__cta" aria-hidden="true">
                      <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                    </span>
                  </div>
                  <div
                    className="cat2-card__glow"
                    aria-hidden="true"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${theme.accentColor}, ${theme.accentColor}, transparent)`,
                    }}
                  />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
