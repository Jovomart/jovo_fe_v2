"use client";
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

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  is_on_sale?: boolean;
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
  syncCartPrices: () => Promise<boolean>;
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
  syncCartPrices: async () => false,
  isInCart: () => false,
  getItemQuantity: () => 0,
  refetchCart: async () => {},
};

export const CartContext = createContext<CartContextType>(defaultValues);

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem("guest_session_id");
  if (!sid) {
    sid = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("guest_session_id", sid);
  }
  return sid;
}

// Fetch current product prices from shop-homepage
async function fetchCurrentProductPrices(): Promise<Map<string, { price: number; original_price: number; discount_percentage: number; is_on_sale: boolean; name: string; image_url: string }>> {
  const priceMap = new Map();
  try {
    const homepageData = await ApiService.getShopHomepage(20, false);
    const categoriesData = homepageData?.data || homepageData;
    const categories = Array.isArray(categoriesData) 
      ? categoriesData 
      : (categoriesData?.categories || []);
    
    for (const category of categories) {
      const products = category?.products || [];
      for (const product of products) {
        priceMap.set(product.id, {
          price: product.current_price,
          original_price: product.product_original_price,
          discount_percentage: product.discount_percentage,
          is_on_sale: product.is_on_sale,
          name: product.product_name,
          image_url: product.product_images?.[0] || "",
        });
      }
    }
  } catch (err) {
    console.error("Failed to fetch current prices:", err);
  }
  return priceMap;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);

  const hasFetchedRef = useRef(false);

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

  // Sync cart prices and update frontend directly
  const syncCartPrices = useCallback(async (): Promise<boolean> => {
    if (!cartData?.items.length) return false;
    
    setOperationLoading(true);
    let hasUpdates = false;
    
    try {
      // Fetch all current product prices at once
      const currentPrices = await fetchCurrentProductPrices();
      const sessionId = user ? undefined : getOrCreateSessionId();
      
      // Create updated items array
      const updatedItems = [...cartData.items];
      
      for (let i = 0; i < updatedItems.length; i++) {
        const item = updatedItems[i];
        const currentPriceData = currentPrices.get(item.product_id);
        
        if (currentPriceData && currentPriceData.price !== item.price) {
          console.log(`Price changed for ${item.product_id}: ${item.price} -> ${currentPriceData.price}`);
          hasUpdates = true;
          
          // Update the item with new price data
          updatedItems[i] = {
            ...item,
            price: currentPriceData.price,
            original_price: currentPriceData.original_price,
            discount_percentage: currentPriceData.discount_percentage,
            is_on_sale: currentPriceData.is_on_sale,
            subtotal: currentPriceData.price * item.quantity,
            name: currentPriceData.name || item.name,
            image_url: currentPriceData.image_url || item.image_url,
          };
          
          // Also update on backend
          try {
            await ApiService.updateCartItem(item.product_id, item.quantity, sessionId);
          } catch (err) {
            console.error(`Failed to update backend for ${item.product_id}:`, err);
          }
        }
      }
      
      // Update local state with new prices
      if (hasUpdates) {
        const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
        const newTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        
        setCartData({
          items: updatedItems,
          total_items: newTotalItems,
          total_price: newTotalPrice,
        });
      }
    } catch (err) {
      console.error("Failed to sync cart prices:", err);
    } finally {
      setOperationLoading(false);
    }
    
    return hasUpdates;
  }, [cartData?.items, user]);

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