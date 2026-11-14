import type { Order, Product } from "../types/product";

export type ReorderPlan = {
  lines: { product: Product; quantity: number }[];
  /** Names of items that are no longer in the catalog or are out of stock. */
  unavailable: string[];
  /** Items whose price differs from what was paid last time. */
  priceChanges: string[];
  total: number;
};

/** Plans a reorder using CURRENT catalog products and prices; skips unavailable items. */
export function planReorder(order: Order, products: Product[]): ReorderPlan {
  const byId = new Map(products.map((p) => [p.id, p]));
  const plan: ReorderPlan = { lines: [], unavailable: [], priceChanges: [], total: 0 };
  for (const item of order.items) {
    const product = byId.get(item.id);
    if (!product || product.inStock === false) { plan.unavailable.push(item.name); continue; }
    plan.lines.push({ product, quantity: item.quantity });
    plan.total += product.price * item.quantity;
    if (product.price !== item.price) plan.priceChanges.push(`${product.name}: ₹${item.price} → ₹${product.price}`);
  }
  return plan;
}

/**
 * Products the customer buys most often (number of orders containing it),
 * ties broken by most recent order. Only products currently available are returned.
 */
export function buyAgainProducts(orders: Order[], products: Product[], limit = 6): Product[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  const stats = new Map<string, { count: number; last: number }>();
  for (const order of orders) {
    const time = Date.parse(order.createdAt) || 0;
    for (const id of new Set(order.items.map((i) => i.id))) {
      const s = stats.get(id) ?? { count: 0, last: 0 };
      stats.set(id, { count: s.count + 1, last: Math.max(s.last, time) });
    }
  }
  return [...stats.entries()]
    .filter(([id]) => byId.get(id) && byId.get(id)?.inStock !== false)
    .sort((a, b) => b[1].count - a[1].count || b[1].last - a[1].last)
    .slice(0, limit)
    .map(([id]) => byId.get(id) as Product);
}

export function latestOrder(orders: Order[]): Order | undefined {
  return [...orders].sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0))[0];
}

export function reorderMessage(plan: ReorderPlan): string {
  const parts: string[] = [];
  if (plan.unavailable.length) parts.push(`Not available, skipped: ${plan.unavailable.join(", ")}`);
  if (plan.priceChanges.length) parts.push(`Price changed since last time:\n${plan.priceChanges.join("\n")}`);
  return parts.join("\n\n");
}
