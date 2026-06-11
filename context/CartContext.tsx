"use client";
// CartProvider must be rendered INSIDE AuthProvider in your layout.
// e.g. <AuthProvider><CartProvider>{children}</CartProvider></AuthProvider>

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
  useRef,
} from "react";
import { useAuth } from "@/context/AuthContext";
import ApiService from "@/services/apiService";

// ─── Types — exactly match the GET /cart response schema ─────────────────────
export interface CartItem {
  product_id: string;
  name: string;
  price: number;        // Will be overridden with live price
  image_url: string;
  quantity: number;
  subtotal: number;     // Will be recalculated with live price
  stock_available: number;
  is_in_stock: boolean;
}

export interface CartData {
  items: CartItem[];
  total_items: number;
  total_price: number;
}

export interface DeliveryInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  notes?: string;
}

// ─── Context shape ────────────────────────────────────────────────────────────
interface CartContextType {
  cartData: CartData | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  loading: boolean;
  operationLoading: boolean;
  error: string | null;
  recentlyAdded: string | null;
  addToCart: (product_id: string, qty?: number) => Promise<void>;
  removeFromCart: (product_id: string) => Promise<void>;
  updateQuantity: (product_id: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  validateCart: () => Promise<any>;
  syncCartPrices: () => Promise<Map<string, { oldPrice: number; newPrice: number }>>;
  isInCart: (product_id: string) => boolean;
  getItemQuantity: (product_id: string) => number;
  refetchCart: () => Promise<void>;
}

const defaultValues: CartContextType = {
  cartData: null,
  items: [],
  itemCount: 0,
  subtotal: 0,
  loading: false,
  operationLoading: false,
  error: null,
  recentlyAdded: null,
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  validateCart: async () => null,
  syncCartPrices: async () => new Map(),
  isInCart: () => false,
  getItemQuantity: () => 0,
  refetchCart: async () => {},
};

export const CartContext = createContext<CartContextType>(defaultValues);

// ─── Guest session ID ─────────────────────────────────────────────────────────
function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem("guest_session_id");
  if (!sid) {
    sid =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("guest_session_id", sid);
  }
  return sid;
}

// ─── Fetch live price for a single product ───────────────────────────────────
async function fetchLivePrice(product_id: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://dev-api-jovomart.onrender.com/api/v1/products/${product_id}`
    );
    const data = await res.json();
    // Extract current_price from the response structure
    const livePrice = data?.data?.current_price ?? 
                      data?.data?.product_discount_price ?? 
                      data?.data?.product_original_price;
    return livePrice ? Number(livePrice) : null;
  } catch (err) {
    console.error(`[CartContext] Failed to fetch live price for ${product_id}:`, err);
    return null;
  }
}

// ─── Parse the GET /cart response and override with live prices ──────────────
async function parseCartResponseWithLivePrices(res: any): Promise<CartData> {
  // Unwrap the standard envelope if present
  const payload = res?.data ?? res;

  if (!payload || typeof payload !== "object") {
    return { items: [], total_items: 0, total_price: 0 };
  }

  const rawItems: any[] = Array.isArray(payload.items) ? payload.items : [];

  if (rawItems.length === 0) {
    return { items: [], total_items: 0, total_price: 0 };
  }

  // Get unique product IDs and fetch their live prices in parallel
  const uniqueProductIds = [...new Set(rawItems.map((raw) => raw.product_id))];
  const priceMap = new Map<string, number>();
  
  await Promise.all(
    uniqueProductIds.map(async (product_id) => {
      const livePrice = await fetchLivePrice(product_id);
      if (livePrice !== null) {
        priceMap.set(product_id, livePrice);
      }
    })
  );

  // Build items with overridden prices
  const items: CartItem[] = rawItems.map((raw) => {
    const product_id = String(raw.product_id ?? "");
    const cartPrice = Number(raw.price ?? 0);
    const livePrice = priceMap.get(product_id);
    const finalPrice = livePrice !== undefined ? livePrice : cartPrice;
    const quantity = Number(raw.quantity ?? 1);
    
    return {
      product_id,
      name: String(raw.name ?? ""),
      price: finalPrice,                    // Overridden with live price
      image_url: String(raw.image_url ?? ""),
      quantity: quantity,
      subtotal: finalPrice * quantity,      // Recalculated with live price
      stock_available: Number(raw.stock_available ?? 0),
      is_in_stock: Boolean(raw.is_in_stock ?? false),
    };
  });

  // Recalculate total_price from corrected subtotals
  const total_price = items.reduce((sum, item) => sum + item.subtotal, 0);
  const total_items = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    total_items,
    total_price,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);

  const hasFetchedRef  = useRef(false);
  const prevUserRef    = useRef<typeof user>(undefined);

  // ── fetchCart — NOW WITH LIVE PRICE OVERRIDE ────────────────────────────────
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sessionId = user ? undefined : getOrCreateSessionId();
      const res = await ApiService.getCart(sessionId);
      // Use the enhanced parser that fetches live prices
      const correctedCartData = await parseCartResponseWithLivePrices(res);
      setCartData(correctedCartData);
    } catch (err: any) {
      console.error("[CartContext] fetchCart failed:", err);
      setError(err?.message ?? "Failed to load cart");
      setCartData({ items: [], total_items: 0, total_price: 0 });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch once auth resolves
  useEffect(() => {
    if (authLoading) return;
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchCart();
    }
  }, [fetchCart, authLoading]);

  // Re-fetch when user logs in or out
  useEffect(() => {
    if (authLoading) return;
    if (prevUserRef.current !== undefined && prevUserRef.current !== user) {
      hasFetchedRef.current = false;
      fetchCart();
    }
    prevUserRef.current = user;
  }, [user, authLoading, fetchCart]);

  // Clear recentlyAdded badge after 3 s
  useEffect(() => {
    if (!recentlyAdded) return;
    const t = setTimeout(() => setRecentlyAdded(null), 3000);
    return () => clearTimeout(t);
  }, [recentlyAdded]);

  // ── syncCartPrices — now actually useful ────────────────────────────────────
  const syncCartPrices = useCallback(async () => {
    const oldItems = cartData?.items ?? [];
    const oldPriceMap = new Map(oldItems.map(i => [i.product_id, i.price]));
    
    await fetchCart();
    
    const newItems = cartData?.items ?? [];
    const changes = new Map<string, { oldPrice: number; newPrice: number }>();
    
    for (const newItem of newItems) {
      const oldPrice = oldPriceMap.get(newItem.product_id);
      if (oldPrice !== undefined && oldPrice !== newItem.price) {
        changes.set(newItem.product_id, { oldPrice, newPrice: newItem.price });
      }
    }
    
    return changes;
  }, [fetchCart, cartData]);

  // ── Mutations ───────────────────────────────────────────────────────────────
  const addToCart = useCallback(async (product_id: string, qty = 1) => {
    setOperationLoading(true);
    setError(null);
    try {
      const sessionId = user ? undefined : getOrCreateSessionId();
      await ApiService.addToCart(product_id, qty, sessionId);
      setRecentlyAdded(product_id);
      await fetchCart();
    } catch (err: any) {
      const msg = err?.message ?? "Failed to add item to cart";
      setError(msg);
      throw new Error(msg);
    } finally {
      setOperationLoading(false);
    }
  }, [user, fetchCart]);

  const removeFromCart = useCallback(async (product_id: string) => {
    setOperationLoading(true);
    setError(null);
    try {
      const sessionId = user ? undefined : getOrCreateSessionId();
      await ApiService.removeCartItem(product_id, sessionId);
      await fetchCart();
    } catch (err: any) {
      const msg = err?.message ?? "Failed to remove item";
      setError(msg);
      throw new Error(msg);
    } finally {
      setOperationLoading(false);
    }
  }, [user, fetchCart]);

  const updateQuantity = useCallback(async (product_id: string, qty: number) => {
    setOperationLoading(true);
    setError(null);
    try {
      const sessionId = user ? undefined : getOrCreateSessionId();
      await ApiService.updateCartItem(product_id, qty, sessionId);
      await fetchCart();
    } catch (err: any) {
      const msg = err?.message ?? "Failed to update quantity";
      setError(msg);
      throw new Error(msg);
    } finally {
      setOperationLoading(false);
    }
  }, [user, fetchCart]);

  const clearCart = useCallback(async () => {
    setOperationLoading(true);
    setError(null);
    try {
      const sessionId = user ? undefined : getOrCreateSessionId();
      await ApiService.clearCart(sessionId);
      setCartData({ items: [], total_items: 0, total_price: 0 });
    } catch (err: any) {
      const msg = err?.message ?? "Failed to clear cart";
      setError(msg);
      throw new Error(msg);
    } finally {
      setOperationLoading(false);
    }
  }, [user]);

  const validateCart = useCallback(async () => {
    const sessionId = user ? undefined : getOrCreateSessionId();
    return ApiService.validateCart(sessionId);
  }, [user]);

  // ── Derived values ──────────────────────────────────────────────────────────
  const items     = useMemo(() => cartData?.items      ?? [], [cartData]);
  const itemCount = useMemo(() => cartData?.total_items ?? 0, [cartData]);
  const subtotal  = useMemo(() => cartData?.total_price ?? 0, [cartData]);

  const isInCart = useCallback(
    (product_id: string) => items.some((i) => i.product_id === product_id),
    [items],
  );

  const getItemQuantity = useCallback(
    (product_id: string) =>
      items.find((i) => i.product_id === product_id)?.quantity ?? 0,
    [items],
  );

  return (
    <CartContext.Provider value={{
      cartData,
      items,
      itemCount,
      subtotal,
      loading,
      operationLoading,
      error,
      recentlyAdded,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      validateCart,
      syncCartPrices,
      isInCart,
      getItemQuantity,
      refetchCart: fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}