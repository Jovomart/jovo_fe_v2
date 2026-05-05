// CartContext.tsx
"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  quantity: number;
  category: string;
  brand?: string;
  stock: number;
}

// Type for product when adding to cart (without quantity)
export type CartProduct = Omit<CartItem, "quantity">;

// Delivery Info Type
export interface DeliveryInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  notes?: string;
  deliveryMethod?: string;
}

// Saved Order Type
export interface SavedOrder {
  id: string;
  reference: string;
  items: CartItem[];
  subtotal: number;
  deliveryCost: number;
  total: number;
  deliveryInfo: DeliveryInfo;
  status: "processing" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  createdAt: string;
  updatedAt?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: CartProduct, qty?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, qty: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isInCart: (id: number) => boolean;
  getItemQuantity: (id: number) => number;
  recentlyAdded: number | null;
  // NEW: Order management
  orders: SavedOrder[];
  saveOrder: (orderData: Omit<SavedOrder, "id" | "createdAt">) => SavedOrder;
  getOrderById: (id: string) => SavedOrder | undefined;
  updateOrderStatus: (id: string, status: SavedOrder["status"]) => void;
}

// Default values for context
const defaultValues: CartContextType = {
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  itemCount: 0,
  subtotal: 0,
  isInCart: () => false,
  getItemQuantity: () => 0,
  recentlyAdded: null,
  orders: [],
  saveOrder: () => ({
    id: "",
    reference: "",
    items: [],
    subtotal: 0,
    deliveryCost: 0,
    total: 0,
    deliveryInfo: {} as DeliveryInfo,
    status: "processing",
    paymentMethod: "",
    createdAt: "",
  }),
  getOrderById: () => undefined,
  updateOrderStatus: () => {},
};

export const CartContext = createContext<CartContextType>(defaultValues);

// Provider component
interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart AND orders from localStorage on mount
  useEffect(() => {
    // Load cart
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }

    // Load orders
    const savedOrders = localStorage.getItem("jovo_orders");
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);
        setOrders(parsedOrders);
      } catch (error) {
        console.error("Failed to parse orders from localStorage:", error);
      }
    }

    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isInitialized]);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("jovo_orders", JSON.stringify(orders));
    }
  }, [orders, isInitialized]);

  // Clear recentlyAdded after 3 seconds
  useEffect(() => {
    if (recentlyAdded !== null) {
      const timer = setTimeout(() => {
        setRecentlyAdded(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [recentlyAdded]);

  const addToCart = useCallback((product: CartProduct, qty: number = 1) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        // Update existing item quantity
        const newQuantity = Math.min(
          existingItem.quantity + qty,
          product.stock,
        );
        if (newQuantity <= 0) return currentItems;

        return currentItems.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item,
        );
      } else {
        // Add new item
        const newQuantity = Math.min(qty, product.stock);
        if (newQuantity <= 0) return currentItems;

        return [...currentItems, { ...product, quantity: newQuantity }];
      }
    });

    // Set recently added product ID
    setRecentlyAdded(product.id);
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback(
    (id: number, qty: number) => {
      if (qty <= 0) {
        removeFromCart(id);
        return;
      }

      setItems((currentItems) =>
        currentItems.map((item) => {
          if (item.id === id) {
            // Respect stock limit
            const validQty = Math.min(qty, item.stock);
            return { ...item, quantity: validQty };
          }
          return item;
        }),
      );
    },
    [removeFromCart],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // NEW: Save order
  const saveOrder = useCallback(
    (orderData: Omit<SavedOrder, "id" | "createdAt">): SavedOrder => {
      const newOrder: SavedOrder = {
        ...orderData,
        id: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setOrders((prevOrders) => [newOrder, ...prevOrders]);
      return newOrder;
    },
    [],
  );

  // NEW: Get order by ID
  const getOrderById = useCallback(
    (id: string): SavedOrder | undefined => {
      return orders.find((order) => order.id === id);
    },
    [orders],
  );

  // NEW: Update order status
  const updateOrderStatus = useCallback(
    (id: string, status: SavedOrder["status"]) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id
            ? { ...order, status, updatedAt: new Date().toISOString() }
            : order,
        ),
      );
    },
    [],
  );

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const isInCart = useCallback(
    (id: number) => {
      return items.some((item) => item.id === id);
    },
    [items],
  );

  const getItemQuantity = useCallback(
    (id: number) => {
      const item = items.find((item) => item.id === id);
      return item?.quantity || 0;
    },
    [items],
  );

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemCount,
    subtotal,
    isInCart,
    getItemQuantity,
    recentlyAdded,
    orders,
    saveOrder,
    getOrderById,
    updateOrderStatus,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Custom hook with error checking
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
