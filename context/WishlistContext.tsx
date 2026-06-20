"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";

export type WishlistItem = {
  id: string;
  name?: string;
  price?: number;
  oldPrice?: number;
  image?: string;
  [key: string]: any;
};

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (product: WishlistItem) => void;
  removeFromWishlist: (id: string | number) => void;
  isWishlisted: (id: string | number) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

const GUEST_WISHLIST_KEY = "jovo_wishlist_guest";

const getWishlistKey = (userId?: string | number | null) =>
  userId ? `jovo_wishlist_user_${userId}` : GUEST_WISHLIST_KEY;

const normalizeWishlistItem = (product: any): WishlistItem | null => {
  if (!product) return null;
  const id = product?.id ?? product?.product_id ?? product?._id ?? "";
  if (id === null || id === undefined || id === "") return null;
  return {
    ...product,
    id: String(id),
    name:
      product.name ||
      product.product_name ||
      product.title ||
      product.product_title ||
      "",
    price:
      Number(
        product.price ??
          product.current_price ??
          product.product_discount_price ??
          product.product_original_price ??
          0,
      ) || 0,
    oldPrice:
      Number(
        product.oldPrice ??
          product.product_original_price ??
          product.product_discount_price ??
          0,
      ) || undefined,
    image:
      product.image ||
      product.product_images?.[0] ||
      product.thumbnail ||
      product.image_url ||
      "",
  };
};

const uniqueWishlistItems = (items: WishlistItem[]) => {
  const seen = new Map<string, WishlistItem>();
  items.forEach((item) => {
    if (!item?.id) return;
    if (!seen.has(item.id)) seen.set(item.id, item);
  });
  return Array.from(seen.values());
};

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const currentKeyRef = useRef<string>(GUEST_WISHLIST_KEY);

  const loadWishlistFromStorage = (key: string) => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return [] as WishlistItem[];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [] as WishlistItem[];
      return uniqueWishlistItems(
        parsed
          .map((item) => normalizeWishlistItem(item))
          .filter((item): item is WishlistItem => item !== null),
      );
    } catch {
      return [] as WishlistItem[];
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const targetKey = getWishlistKey(user?.id || user?.user_id);
    const guestWishlist = loadWishlistFromStorage(GUEST_WISHLIST_KEY);
    const userWishlist = loadWishlistFromStorage(targetKey);

    if (user) {
      const merged = uniqueWishlistItems([...guestWishlist, ...userWishlist]);
      setWishlist(merged);
      currentKeyRef.current = targetKey;
      if (guestWishlist.length > 0) {
        localStorage.removeItem(GUEST_WISHLIST_KEY);
      }
    } else {
      setWishlist(userWishlist);
      currentKeyRef.current = GUEST_WISHLIST_KEY;
    }

    setHydrated(true);
  }, [user?.id, user?.user_id]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      localStorage.setItem(currentKeyRef.current, JSON.stringify(wishlist));
    } catch {
      // ignore storage failures
    }
  }, [wishlist, hydrated]);

  const addToWishlist = (product: WishlistItem) => {
    const item = normalizeWishlistItem(product);
    if (!item) return;
    setWishlist((prev) =>
      prev.some((p) => p.id === item.id) ? prev : [...prev, item],
    );
  };

  const removeFromWishlist = (id: string | number) => {
    const key = String(id);
    setWishlist((prev) => prev.filter((p) => p.id !== key));
  };

  const isWishlisted = (id: string | number) => {
    const key = String(id);
    return wishlist.some((p) => p.id === key);
  };

  const clearWishlist = () => setWishlist([]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isWishlisted,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
