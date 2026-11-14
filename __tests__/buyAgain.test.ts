import { buyAgainProducts, latestOrder, planReorder, reorderMessage } from "../utils/buyAgain";
import type { Order, Product } from "../types/product";

const p = (id: string, price: number, extra: Partial<Product> = {}): Product => ({ id, name: id.toUpperCase(), price, category: "c", ...extra });
const order = (id: string, createdAt: string, items: [string, number, number][]): Order => ({
  id, createdAt, items: items.map(([i, price, quantity]) => ({ ...p(i, price), quantity })),
  customer: { name: "", phone: "", addresses: [] }, address: { id: "1", label: "Home", name: "n", phone: "1", address: "a" },
  subtotal: 0, deliveryFee: 0, discount: 0, total: 0, paymentMethod: "cod", status: "placed",
});
const catalog = [p("a", 10), p("b", 20, { inStock: false }), p("c", 30), p("d", 40)];

describe("buyAgainProducts", () => {
  it("is empty without history", () => expect(buyAgainProducts([], catalog)).toEqual([]));
  it("ranks by frequency, then recency, skips unavailable/removed", () => {
    const orders = [
      order("1", "2026-11-01T10:00:00Z", [["a", 10, 1], ["b", 20, 1], ["gone", 5, 1]]),
      order("2", "2026-11-05T10:00:00Z", [["a", 10, 2], ["c", 30, 1]]),
      order("3", "2026-11-10T10:00:00Z", [["d", 40, 1]]),
    ];
    expect(buyAgainProducts(orders, catalog).map((x) => x.id)).toEqual(["a", "d", "c"]);
    expect(buyAgainProducts(orders, catalog, 1)).toHaveLength(1);
  });
});

describe("planReorder", () => {
  it("uses current prices, skips unavailable, reports changes", () => {
    const o = order("1", "2026-11-01T10:00:00Z", [["a", 8, 2], ["b", 20, 1], ["gone", 5, 1], ["c", 30, 1]]);
    const plan = planReorder(o, catalog);
    expect(plan.lines.map((l) => [l.product.id, l.quantity])).toEqual([["a", 2], ["c", 1]]);
    expect(plan.total).toBe(50);
    expect(plan.unavailable).toEqual(["B", "GONE"]);
    expect(plan.priceChanges).toEqual(["A: ₹8 → ₹10"]);
    expect(reorderMessage(plan)).toContain("Not available, skipped");
  });
  it("returns an empty message when all is fine", () => {
    expect(reorderMessage(planReorder(order("1", "2026-11-01T10:00:00Z", [["a", 10, 1]]), catalog))).toBe("");
  });
});

describe("latestOrder", () => {
  it("picks the newest", () => {
    const a = order("1", "2026-11-01T10:00:00Z", []); const b = order("2", "2026-11-09T10:00:00Z", []);
    expect(latestOrder([a, b])?.id).toBe("2");
    expect(latestOrder([])).toBeUndefined();
  });
});
