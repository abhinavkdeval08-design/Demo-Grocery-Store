jest.mock("@react-native-async-storage/async-storage", () => {
  let store: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (k: string) => store[k] ?? null),
      setItem: jest.fn(async (k: string, v: string) => { store[k] = v; }),
      __reset: () => { store = {}; },
    },
  };
});

import AsyncStorage from "@react-native-async-storage/async-storage";
import { calculateDiscount, checkCoupon } from "../data/coupons";
import { buildOrderMessage } from "../utils/buildOrderMessage";
import { addItem, cartTotals, removeItem } from "../utils/cart";
import { dayKey, formatOrderId, getNextOrderId, nextSequence } from "../utils/orderId";
import { sanitizeItems, sanitizeOrders } from "../utils/persist";
import type { Coupon, Order, Product } from "../types/product";

const now = new Date("2026-11-14T10:00:00");
const pct: Coupon = { code: "P", label: "", type: "percentage", value: 10, minOrder: 500, maxDiscount: 100, expiresAt: "2099-01-01" };
const flat: Coupon = { code: "F", label: "", type: "flat", value: 50, minOrder: 700, expiresAt: "2099-01-01" };
const product = { id: "a", name: "Rice", price: 100 } as Product;

describe("coupons", () => {
  it("percentage with cap", () => {
    expect(calculateDiscount(pct, 600, now)).toBe(60);
    expect(calculateDiscount(pct, 5000, now)).toBe(100);
  });
  it("flat", () => expect(calculateDiscount(flat, 800, now)).toBe(50));
  it("below min order gives 0", () => expect(calculateDiscount(pct, 499, now)).toBe(0));
  it("expired gives 0", () => expect(calculateDiscount({ ...pct, expiresAt: "2020-01-01" }, 600, now)).toBe(0));
  it("never exceeds subtotal", () => expect(calculateDiscount({ ...flat, minOrder: 0, value: 500 }, 100, now)).toBe(100));
  it("checkCoupon reasons", () => {
    expect(checkCoupon("nope", 900, now)).toMatchObject({ ok: false, reason: "invalid" });
    expect(checkCoupon("FESTIVE20", 900, now)).toMatchObject({ ok: false, reason: "expired" });
    expect(checkCoupon("save50", 600, now)).toMatchObject({ ok: false, reason: "min_order" });
    expect(checkCoupon("save50", 900, now)).toMatchObject({ ok: true, discount: 50 });
  });
  it("discount follows the subtotal when items are removed", () => {
    expect(calculateDiscount(flat, 800, now)).toBe(50);
    expect(calculateDiscount(flat, 600, now)).toBe(0);
  });
});

describe("cart", () => {
  it("add, increment, remove", () => {
    let items = addItem([], product);
    items = addItem(items, product);
    expect(items).toEqual([{ ...product, quantity: 2 }]);
    expect(cartTotals(items)).toEqual({ totalItems: 2, totalPrice: 200 });
    items = removeItem(items, "a");
    expect(items[0].quantity).toBe(1);
    expect(removeItem(items, "a")).toEqual([]);
  });
  it("removing unknown id changes nothing", () => expect(removeItem([{ ...product, quantity: 1 }], "zzz")).toHaveLength(1));
});

describe("order id", () => {
  it("formats and sequences per day", () => {
    expect(formatOrderId("20261114", 7)).toBe("AT-20261114-0007");
    expect(nextSequence(null, "20261114")).toBe(1);
    expect(nextSequence({ day: "20261114", seq: 4 }, "20261114")).toBe(5);
    expect(nextSequence({ day: "20261113", seq: 9 }, "20261114")).toBe(1);
    expect(dayKey(now)).toBe("20261114");
  });
  it("persists the counter", async () => {
    (AsyncStorage as unknown as { __reset: () => void }).__reset();
    expect(await getNextOrderId(now)).toBe("AT-20261114-0001");
    expect(await getNextOrderId(now)).toBe("AT-20261114-0002");
    expect(await getNextOrderId(new Date("2026-11-15T09:00:00"))).toBe("AT-20261115-0001");
  });
});

describe("persisted data validation", () => {
  it("drops invalid cart items", () => {
    const good = { id: "a", name: "Rice", price: 10, quantity: 2 };
    const result = sanitizeItems([good, { id: "b" }, null, "x", { ...good, quantity: 0 }, { ...good, price: "10" }, { ...good, quantity: 1.5 }]);
    expect(result).toEqual([good]);
    expect(sanitizeItems("garbage")).toEqual([]);
  });
  it("drops invalid orders", () => {
    expect(sanitizeOrders([{ id: "x" }, 5, null])).toEqual([]);
    expect(sanitizeOrders(undefined)).toEqual([]);
  });
});

describe("buildOrderMessage", () => {
  const base: Order = {
    id: "AT-20261114-0001",
    items: [{ ...product, name: "Basmati चावल 🍚 & Dal", quantity: 2 }],
    customer: { name: "Ravi", phone: "9876543210", addresses: [] },
    address: { id: "1", label: "Home", name: "Ravi", phone: "9876543210", address: "x".repeat(300) },
    subtotal: 200, deliveryFee: 40, discount: 0, total: 240, paymentMethod: "cod", status: "placed", createdAt: now.toISOString(),
  } as Order;
  it("has no note or coupon line when absent", () => {
    const text = buildOrderMessage(base);
    expect(text).not.toContain("Note:");
    expect(text).not.toContain("Coupon:");
    expect(text).toContain("Payment: Cash on delivery");
  });
  it("includes coupon, note, emoji and long address", () => {
    const text = buildOrderMessage({ ...base, couponCode: "SAVE50", discount: 50, total: 190, note: "Call before delivery", paymentMethod: "upi" });
    expect(text).toContain("Coupon: SAVE50");
    expect(text).toContain("Note: Call before delivery");
    expect(text).toContain("Basmati चावल 🍚 & Dal x2");
    expect(text).toContain("x".repeat(300));
    expect(text).toContain("Payment: UPI");
    expect(text).toContain("Discount: ₹50.00");
  });
});

describe("buildOrderMessage pincode and slot", () => {
  it("includes pincode and slot when present", () => {
    const o = { id: "X", items: [{ id: "a", name: "Rice", price: 10, category: "c", quantity: 1 }], customer: { name: "", phone: "", addresses: [] }, address: { id: "1", label: "Home", name: "R", phone: "9", address: "addr", pincode: "700001" }, subtotal: 10, deliveryFee: 0, discount: 0, total: 10, paymentMethod: "cod", status: "placed", slot: { date: "2026-11-15", slotId: "m", label: "Tomorrow, Morning" }, createdAt: "2026-11-14T00:00:00Z" } as Order;
    const text = buildOrderMessage(o);
    expect(text).toContain("Pincode: 700001");
    expect(text).toContain("Delivery slot: Tomorrow, Morning (2026-11-15)");
  });
});
