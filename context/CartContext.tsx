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
  price: number;
  image_url: string;
  quantity: number;
  subtotal: number;
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

export interface PriceChange {
  oldPrice: number;
  newPrice: number;
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
  syncCartPrices: () => Promise<Map<string, PriceChange>>;
  isInCart: (product_id: string) => boolean;
  getItemQuantity: (product_id: string) => number;
  refetchCart: () => Promise<CartData>;
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
  refetchCart: async () => ({ items: [], total_items: 0, total_price: 0 }),
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

// ─── Parse the GET /cart response ──────────────────────────────────────────────
// The backend is the single source of truth for price/subtotal/stock. Do not
// re-derive or override these client-side — GET /cart already returns live,
// authoritative numbers, and POST /cart/checkout re-validates and atomically
// deducts stock server-side regardless of what the client displayed. Refetching
// prices per-product here was a workaround for a backend issue that has since
// been fixed; reintroducing it would just create a second, possibly
// inconsistent, source of truth (e.g. it can disagree with flash-sale pricing
// locked in at add-to-cart time, which /products/{id} doesn't account for).
function parseCartResponse(res: any): CartData {
  const payload = res?.data ?? res;

  if (!payload || typeof payload !== "object") {
    return { items: [], total_items: 0, total_price: 0 };
  }

  const rawItems: any[] = Array.isArray(payload.items) ? payload.items : [];

  const items: CartItem[] = rawItems.map((raw) => {
    const price = Number(raw.price ?? 0);
    const quantity = Number(raw.quantity ?? 1);
    return {
      product_id: String(raw.product_id ?? ""),
      name: String(raw.name ?? ""),
      price,
      image_url: String(raw.image_url ?? ""),
      quantity,
      subtotal: Number(raw.subtotal ?? price * quantity),
      stock_available: Number(raw.stock_available ?? 0),
      is_in_stock: Boolean(raw.is_in_stock ?? false),
    };
  });

  return {
    items,
    total_items: Number(payload.total_items ?? items.reduce((s, i) => s + i.quantity, 0)),
    total_price: Number(payload.total_price ?? items.reduce((s, i) => s + i.subtotal, 0)),
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
  // Mirrors cartData but is updated synchronously, so syncCartPrices can diff
  // against the *previous* snapshot without racing React's async state update.
  const cartDataRef    = useRef<CartData | null>(null);

  // ── fetchCart ───────────────────────────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sessionId = user ? undefined : getOrCreateSessionId();
      const res = await ApiService.getCart(sessionId);
      const parsed = parseCartResponse(res);
      cartDataRef.current = parsed;
      setCartData(parsed);
      return parsed;
    } catch (err: any) {
      console.error("[CartContext] fetchCart failed:", err);
      setError(err?.message ?? "Failed to load cart");
      const empty = { items: [], total_items: 0, total_price: 0 };
      cartDataRef.current = empty;
      setCartData(empty);
      return empty;
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

  // ── syncCartPrices — diffs the last known cart against a fresh fetch ─────────
  // Useful right before checkout to warn the user "this item changed price
  // since you last looked", without ever inventing prices client-side.
  const syncCartPrices = useCallback(async () => {
    const oldItems = cartDataRef.current?.items ?? [];
    const oldPriceMap = new Map(oldItems.map((i) => [i.product_id, i.price]));

    const fresh = await fetchCart();

    const changes = new Map<string, PriceChange>();
    for (const newItem of fresh.items) {
      const oldPrice = oldPriceMap.get(newItem.product_id);
      if (oldPrice !== undefined && oldPrice !== newItem.price) {
        changes.set(newItem.product_id, { oldPrice, newPrice: newItem.price });
      }
    }
    return changes;
  }, [fetchCart]);

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
      // Per spec: PATCH /cart/update with quantity 0 removes the item.
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
      const empty = { items: [], total_items: 0, total_price: 0 };
      cartDataRef.current = empty;
      setCartData(empty);
    } catch (err: any) {
      const msg = err?.message ?? "Failed to clear cart";
      setError(msg);
      throw new Error(msg);
    } finally {
      setOperationLoading(false);
    }
  }, [user]);

  // session_id is intentionally omitted here for authenticated users (the
  // backend resolves the cart from the Bearer token); guests still need it.
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