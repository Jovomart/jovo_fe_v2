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
  useMemo,
  useRef,
} from "react";
import { useAuth } from "@/context/AuthContext";
import ApiService from "@/services/apiService";

// ─── Types — match the backend cart API response shape ────────────────────────

export interface CartItem {
  product_id: string;       // UUID string from backend
  name: string;
  price: number;
  original_price?: number;  // Original price before discount
  discount_percentage?: number; // Discount percentage if on sale
  is_on_sale?: boolean;     // Whether the product is on sale
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
  syncCartPrices: () => Promise<Map<string, { oldPrice: number; newPrice: number }>>;
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
  syncCartPrices: async () => new Map(),
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

// ─── Helper to find product from shop-homepage ────────────────────────────────
async function findProductFromShopHomepage(productId: string): Promise<any> {
  try {
    const homepageData = await ApiService.getShopHomepage(20, false);
    const categoriesData = homepageData?.data || homepageData;
    const categories = Array.isArray(categoriesData) 
      ? categoriesData 
      : (categoriesData?.categories || []);
    
    for (const category of categories) {
      const products = category?.products || [];
      const found = products.find((p: any) => p.id === productId);
      if (found) {
        return found;
      }
    }
    return null;
  } catch (err) {
    console.error("Failed to fetch from shop-homepage:", err);
    return null;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);

  const hasFetchedRef = useRef(false);
  const productCacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const cartItemsRef = useRef(cartData?.items);

  // Keep ref in sync with cartData
  useEffect(() => {
    cartItemsRef.current = cartData?.items;
  }, [cartData?.items]);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sessionId = user ? undefined : getOrCreateSessionId();
      const res = await ApiService.getCart(sessionId);
      const payload: CartData = res?.data ?? {
        items: [],
        total_items: 0,
        total_price: 0,
      };
      setCartData(payload);
    } catch (err: any) {
      console.error("CartContext: failed to fetch cart", err);
      setError(err?.message ?? "Failed to load cart");
      setCartData({ items: [], total_items: 0, total_price: 0 });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      const timer = setTimeout(() => fetchCart(), 0);
      return () => clearTimeout(timer);
    }
  }, [fetchCart, authLoading]);

  useEffect(() => {
    if (!recentlyAdded) return;
    const t = setTimeout(() => setRecentlyAdded(null), 3000);
    return () => clearTimeout(t);
  }, [recentlyAdded]);

  // ─── Get fresh product data with cache ──────────────────────────────────────
  const getFreshProductData = useCallback(async (productId: string) => {
    // Check cache (30 seconds)
    const cached = productCacheRef.current.get(productId);
    if (cached && Date.now() - cached.timestamp < 30000) {
      return cached.data;
    }
    
    const productData = await findProductFromShopHomepage(productId);
    if (productData) {
      productCacheRef.current.set(productId, {
        data: productData,
        timestamp: Date.now(),
      });
    }
    return productData;
  }, []);

  // ─── Actually update cart item prices ───────────────────────────────────────
  const updateCartItemPrice = useCallback(async (product_id: string, newPrice: number) => {
    const sessionId = user ? undefined : getOrCreateSessionId();
    const currentItem = cartData?.items.find(i => i.product_id === product_id);
    if (!currentItem) return;
    
    // Update the cart item with new price
    await ApiService.updateCartItem(product_id, currentItem.quantity, sessionId);
    await fetchCart();
  }, [user, cartData?.items, fetchCart]);

  // ─── Refresh all cart prices and apply updates ──────────────────────────────
  // FIXED: Using ref to avoid dependency issues with React Compiler
  const syncCartPrices = useCallback(async () => {
    const priceChanges = new Map<string, { oldPrice: number; newPrice: number }>();
    const currentItems = cartItemsRef.current;
    
    if (!currentItems?.length) return priceChanges;
    
    setOperationLoading(true);
    
    for (const item of currentItems) {
      const freshProduct = await getFreshProductData(item.product_id);
      if (freshProduct && freshProduct.current_price !== item.price) {
        priceChanges.set(item.product_id, {
          oldPrice: item.price,
          newPrice: freshProduct.current_price,
        });
        // Actually update the cart with the new price
        await updateCartItemPrice(item.product_id, freshProduct.current_price);
      }
    }
    
    setOperationLoading(false);
    return priceChanges;
  }, [getFreshProductData, updateCartItemPrice]);

  // ─── Cart mutations ─────────────────────────────────────────────────────────
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
  const items = useMemo(() => cartData?.items ?? [], [cartData?.items]);
  const itemCount = useMemo(() => cartData?.total_items ?? 0, [cartData?.total_items]);
  const subtotal = useMemo(() => cartData?.total_price ?? 0, [cartData?.total_price]);

  const isInCart = useCallback((product_id: string) => 
    items.some((i) => i.product_id === product_id), [items]);

  const getItemQuantity = useCallback((product_id: string) =>
    items.find((i) => i.product_id === product_id)?.quantity ?? 0, [items]);

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