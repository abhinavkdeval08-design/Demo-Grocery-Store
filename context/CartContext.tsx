import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, Product } from "../types/product";

const CART_STORAGE_KEY = "@awad-trading/cart";

type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CART_STORAGE_KEY).then((stored) => {
      if (!stored) return;
      try {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed.filter((item): item is CartItem =>
            item && typeof item.id === "string" && typeof item.name === "string" &&
            typeof item.price === "number" && typeof item.quantity === "number" && item.quantity > 0,
          ));
        }
      } catch {
        setItems([]);
      }
    }).catch(() => setItems([])).finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)).catch(() => {});
  }, [items, hydrated]);

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => item.id === product.id
          ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (!existing) return prev;
      if (existing.quantity === 1) return prev.filter((item) => item.id !== productId);
      return prev.map((item) => item.id === productId
        ? { ...item, quantity: item.quantity - 1 } : item);
    });
  };

  const value = useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    clearCart: () => setItems([]),
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.quantity * item.price, 0),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
