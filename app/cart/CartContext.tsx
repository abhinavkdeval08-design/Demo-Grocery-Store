// app/cart/CartContext.tsx
import React, {
    createContext,
    ReactNode,
    useContext,
    useMemo,
    useState,
} from "react";

export type Product = {
  id: string;
  name: string;
  price: number;
  unit?: string;
  image?: string;
};

export type CartItem = Product & {
  quantity: number;
};

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

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((it) => it.id === product.id);
      if (existing) {
        return prev.map((it) =>
          it.id === product.id
            ? { ...it, quantity: it.quantity + 1 }
            : it
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => {
      const existing = prev.find((it) => it.id === productId);
      if (!existing) return prev;
      if (existing.quantity === 1) {
        return prev.filter((it) => it.id !== productId);
      }
      return prev.map((it) =>
        it.id === productId
          ? { ...it, quantity: it.quantity - 1 }
          : it
      );
    });
  };

  const clearCart = () => setItems([]);

  const { totalItems, totalPrice } = useMemo(() => {
    const totalItems = items.reduce((sum, it) => sum + it.quantity, 0);
    const totalPrice = items.reduce(
      (sum, it) => sum + it.quantity * it.price,
      0
    );
    return { totalItems, totalPrice };
  }, [items]);

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
