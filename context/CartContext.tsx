import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import type { Address, CartItem, Customer, Order, Product } from "../types/product";
import { addItem, cartTotals, removeItem } from "../utils/cart";
import { sanitizeCustomer, sanitizeItems, sanitizeOrders } from "../utils/persist";

const STORAGE_KEY = "@awad-trading/cart-state";
type CartContextType = {
  items: CartItem[]; addToCart: (product: Product) => void; removeFromCart: (id: string) => void;
  clearCart: () => void; replaceItems: (items: CartItem[]) => void; totalItems: number; totalPrice: number; customer: Customer;
  addresses: Address[]; saveAddress: (address: Address) => void; deleteAddress: (id: string) => void;
  orders: Order[]; saveOrder: (order: Order) => void; hydrated: boolean;
};
const emptyCustomer: Customer = { name: "", phone: "", addresses: [] };
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer>(emptyCustomer);
  const [orders, setOrders] = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (!value) return;
      try {
        const parsed: unknown = JSON.parse(value);
        const data = typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {};
        setItems(sanitizeItems(data.items));
        setCustomer(sanitizeCustomer(data.customer));
        setOrders(sanitizeOrders(data.orders));
      } catch { /* discard corrupt state */ }
    }).catch(() => undefined).finally(() => setHydrated(true));
  }, []);
  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ items, customer, orders })).catch(() => undefined);
  }, [items, customer, orders, hydrated]);
  const addToCart = (product: Product) => setItems((old) => addItem(old, product));
  const removeFromCart = (id: string) => setItems((old) => removeItem(old, id));
  const clearCart = () => setItems([]);
  const replaceItems = (next: CartItem[]) => setItems(next);
  const saveAddress = (address: Address) => setCustomer((old) => ({
    ...old, name: address.name, phone: address.phone,
    addresses: old.addresses.some((item) => item.id === address.id) ? old.addresses.map((item) => item.id === address.id ? address : item) : [...old.addresses, address],
  }));
  const deleteAddress = (id: string) => setCustomer((old) => ({ ...old, addresses: old.addresses.filter((item) => item.id !== id) }));
  const saveOrder = (order: Order) => setOrders((old) => [order, ...old]);
  const value = useMemo(() => ({ items, addToCart, removeFromCart, clearCart, replaceItems, customer, addresses: customer.addresses, saveAddress, deleteAddress, orders, saveOrder, hydrated, ...cartTotals(items) }), [items, customer, orders, hydrated]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart(): CartContextType {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}
