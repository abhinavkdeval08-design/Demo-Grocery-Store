import type { CartItem, Product } from "../types/product";

export function addItem(items: CartItem[], product: Product): CartItem[] {
  const found = items.find((item) => item.id === product.id);
  if (!found) return [...items, { ...product, quantity: 1 }];
  return items.map((item) =>
    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
  );
}

export function removeItem(items: CartItem[], id: string): CartItem[] {
  return items.flatMap((item) => {
    if (item.id !== id) return [item];
    return item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [];
  });
}

export function cartTotals(items: CartItem[]) {
  return {
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };
}
