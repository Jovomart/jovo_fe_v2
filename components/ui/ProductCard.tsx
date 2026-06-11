"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart as faHeartSolid,
  faBagShopping,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import type { Product } from "@/types";
import { useWishlist } from "@/context/WishlistContext";
import { showToast } from "@/components/ui/toast";
import { CART_EVENT } from "@/components/layout/Header";

let globalCartCount = 0;

interface Props {
  product: Product;
}

// Placeholder image for when product image fails to load
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%239ca3af' font-size='14' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ProductCard({ product: p }: Props) {
  const [added, setAdded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  // Ensure we pass a number id to wishlist functions
  const idNum = typeof p.id === "number" ? p.id : Number(p.id);
  const wishlisted = isWishlisted(idNum);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate discount percentage if oldPrice exists
  const discount = p.oldPrice
    ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
    : null;

  // Get the product image with fallback
  const productImage = imageError ? PLACEHOLDER_IMAGE : (p.image || PLACEHOLDER_IMAGE);
  
  // Get alt text for the image
  const altText = p.alt || p.name || "Product image";
  
  // Check if product is in stock (using any available property or default to true)
  const isInStock = (p as any).is_in_stock !== undefined ? (p as any).is_in_stock : true;

  const toggleWishlist = () => {
    if (wishlisted) {
      removeFromWishlist(idNum);
      showToast("Removed from wishlist", "info");
    } else {
      addToWishlist(p);
      showToast("Added to wishlist ❤️", "success");
    }
  };

  const addToCart = () => {
    setAdded(true);
    globalCartCount++;
    window.dispatchEvent(
      new CustomEvent(CART_EVENT, { detail: globalCartCount }),
    );
    showToast("Added to cart 🛍️", "success");
    setTimeout(() => setAdded(false), 1600);
  };

  // On server and before client hydration, always show empty heart
  const showFilledHeart = isClient && wishlisted;

  return (
    <article
      className="product-card w-[230px] flex-shrink-0 border border-gray-200 rounded-[20px] overflow-hidden bg-white hover:-translate-y-1 hover:shadow-brand-md transition-all duration-250 relative group"
      role="listitem"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={productImage}
          alt={altText}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          sizes="230px"
          onError={() => setImageError(true)}
          priority={false}
        />
        {discount && discount > 0 && (
          <span className="absolute top-2 left-2 bg-brand-red text-white text-[10px] font-extrabold px-2 py-[3px] rounded-full z-10">
            -{discount}%
          </span>
        )}
        {!isInStock && (
          <span className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-full">
              Out of Stock
            </span>
          </span>
        )}
        <button
          onClick={toggleWishlist}
          className={`product-wishlist absolute top-2 right-2 w-[30px] h-[30px] rounded-full bg-white/90 backdrop-blur-[8px] flex items-center justify-center text-[13px] transition-all hover:scale-110 opacity-0 group-hover:opacity-100 z-20 ${showFilledHeart ? "!opacity-100 text-brand-red" : "text-gray-400 hover:text-brand-red"}`}
          aria-label={showFilledHeart ? "Remove from wishlist" : "Add to wishlist"}
        >
          <FontAwesomeIcon icon={showFilledHeart ? faHeartSolid : faHeartRegular} />
        </button>
      </div>
      <div className="p-3">
        {p.brand && (
          <p className="text-[10px] font-bold text-brand-orange uppercase tracking-[.08em]">
            {p.brand}
          </p>
        )}
        <h3 className="text-[12.5px] font-bold text-gray-900 mt-[3px] mb-[6px] leading-[1.35] line-clamp-2 min-h-[32px]">
          <Link
            href={`/product/${p.id}`}
            className="hover:text-brand-red transition-colors"
          >
            {p.name}
          </Link>
        </h3>
        {(p.rating !== undefined || p.reviews !== undefined) && (
          <div
            className="flex items-center gap-1 mb-[7px]"
            aria-label={`${p.rating || 0} stars, ${p.reviews || 0} reviews`}
          >
            <span className="text-brand-orange text-[10.5px]" aria-hidden="true">
              {"★".repeat(Math.floor(p.rating || 0))}
              {(p.rating || 0) % 1 >= 0.5 ? "☆" : ""}
            </span>
            <span className="text-[10px] text-gray-400">
              ({((p.reviews || 0)).toLocaleString()})
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5 mb-[10px] flex-wrap">
          <span className="text-[15px] font-extrabold text-brand-red">
            ₦{(p.price || 0).toLocaleString()}
          </span>
          {p.oldPrice && p.oldPrice > (p.price || 0) && (
            <span className="text-[11px] text-gray-400">
              <del>₦{p.oldPrice.toLocaleString()}</del>
            </span>
          )}
        </div>
        <button
          onClick={addToCart}
          disabled={!isInStock}
          aria-label={`Add ${p.name} to cart`}
          className={`w-full flex items-center justify-center gap-[5px] py-[7.5px] rounded-[8px] text-[12px] font-bold transition-all font-body ${
            added 
              ? "!bg-[#22c55e] !text-white" 
              : !isInStock
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 text-gray-900 hover:bg-brand-gradient hover:text-white"
          }`}
          style={
            added
              ? {
                  background: "linear-gradient(135deg,#22c55e,#16a34a)",
                  color: "#fff",
                }
              : {}
          }
        >
          <FontAwesomeIcon icon={added ? faCheck : faBagShopping} />
          {added ? "Added!" : !isInStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}