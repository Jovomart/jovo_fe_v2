"use client";
// NOTE: CartProvider must be rendered INSIDE AuthProvider in your layout.
// e.g. <AuthProvider><CartProvider>{children}</CartProvider></AuthProvider>

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import ApiService from "@/services/apiService";

// ─── Types — match the backend cart API response shape ────────────────────────

export interface CartItem {
  product_id: string;       // UUID string from backend
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  subtotal: number;         // price × quantity, computed by backend
  stock_available: number;
  is_in_stock: boolean;
}

export interface CartData {
  items: CartItem[];
  total_items: number;      // sum of all quantities
  total_price: number;      // sum of all subtotals
}

// ─── Delivery info type (used by checkout page) ───────────────────────────────
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
  operationLoading: boolean; // true while an add/remove/update call is in flight
  error: string | null;
  recentlyAdded: string | null; // product_id of the most recently added item
  addToCart: (product_id: string, qty?: number) => Promise<void>;
  removeFromCart: (product_id: string) => Promise<void>;
  updateQuantity: (product_id: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  validateCart: () => Promise<any>;
  isInCart: (product_id: string) => boolean;
  getItemQuantity: (product_id: string) => number;
  refetchCart: () => Promise<void>;
}

// ─── Defaults (used before context is available — should never happen in practice) ──
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
  isInCart: () => false,
  getItemQuantity: () => 0,
  refetchCart: async () => {},
};

export const CartContext = createContext<CartContextType>(defaultValues);

// ─── Guest session ID helpers ─────────────────────────────────────────────────
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

// ─── Provider ─────────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: ReactNode }) {
  // Wait for auth to resolve before fetching cart so we don't do a
  // spurious guest fetch for an already-logged-in user on page load.
  const { user, loading: authLoading } = useAuth();

  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);

  // ── Fetch cart from backend ──────────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Authenticated users: backend identifies cart by their JWT.
      // Guest users: we pass the session_id query param.
      const sessionId = user ? undefined : getOrCreateSessionId();
      const res = await ApiService.getCart(sessionId);
      const payload: CartData = res?.data ?? {
        items: [],
        total_items: 0,
        total_price: 0,
      };
      setCartData(payload);
    } catch (err: any) {
      // A failed cart fetch is non-fatal — show empty cart, log the error.
      console.error("CartContext: failed to fetch cart", err);
      setError(err?.message ?? "Failed to load cart");
      setCartData({ items: [], total_items: 0, total_price: 0 });
    } finally {
      setLoading(false);
    }
  }, [user]); // re-create when user changes so auth state is fresh

  // ── Fetch cart once auth has resolved (avoids double-fetch on page load) ─
  useEffect(() => {
    if (authLoading) return; // wait until we know who the user is
    fetchCart();
  }, [fetchCart, authLoading]);

  // ── Clear recentlyAdded badge after 3 s ──────────────────────────────────
  useEffect(() => {
    if (!recentlyAdded) return;
    const t = setTimeout(() => setRecentlyAdded(null), 3000);
    return () => clearTimeout(t);
  }, [recentlyAdded]);

  // ─── Cart mutations ────────────────────────────────────────────────────────

  const addToCart = useCallback(
    async (product_id: string, qty = 1) => {
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
        throw new Error(msg); // re-throw so the caller (product page) can react
      } finally {
        setOperationLoading(false);
      }
    },
    [user, fetchCart],
  );

  const removeFromCart = useCallback(
    async (product_id: string) => {
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
    },
    [user, fetchCart],
  );

  /**
   * Update an item's quantity.
   * Passing qty = 0 removes the item (the backend supports this).
   */
  const updateQuantity = useCallback(
    async (product_id: string, qty: number) => {
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
    },
    [user, fetchCart],
  );

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

  // ─── Derived values ────────────────────────────────────────────────────────
  const items = cartData?.items ?? [];
  const itemCount = cartData?.total_items ?? 0;
  const subtotal = cartData?.total_price ?? 0;

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
    <CartContext.Provider
      value={{
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
        isInCart,
        getItemQuantity,
        refetchCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}