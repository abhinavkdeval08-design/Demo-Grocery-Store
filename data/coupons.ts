import type { Coupon } from "../types/product";

export const COUPONS: Coupon[] = [
  { code: "WELCOME10", label: "10% off for new orders", type: "percentage", value: 10, minOrder: 500, maxDiscount: 100, expiresAt: "2099-12-31" },
  { code: "SAVE50", label: "₹50 off your order", type: "flat", value: 50, minOrder: 700, expiresAt: "2099-12-31" },
  { code: "FESTIVE20", label: "20% off festive orders", type: "percentage", value: 20, minOrder: 800, maxDiscount: 200, expiresAt: "2020-01-01" },
];

export function findCoupon(code: string): Coupon | undefined {
  return COUPONS.find((coupon) => coupon.code.toUpperCase() === code.trim().toUpperCase());
}

export function isExpired(coupon: Coupon, now: Date = new Date()): boolean {
  return new Date(coupon.expiresAt).getTime() < now.getTime();
}

export function calculateDiscount(coupon: Coupon, subtotal: number, now: Date = new Date()): number {
  if (isExpired(coupon, now)) return 0;
  if (coupon.minOrder && subtotal < coupon.minOrder) return 0;
  const discount = coupon.type === "percentage" ? (subtotal * coupon.value) / 100 : coupon.value;
  return Math.min(Math.max(0, discount), coupon.maxDiscount ?? Number.POSITIVE_INFINITY, subtotal);
}

export type CouponCheck =
  | { ok: true; coupon: Coupon; discount: number }
  | { ok: false; reason: "invalid" | "expired" | "min_order" | "no_discount"; message: string };

/** Single place that explains why a coupon does or does not apply to a subtotal. */
export function checkCoupon(code: string, subtotal: number, now: Date = new Date()): CouponCheck {
  const coupon = findCoupon(code);
  if (!coupon) return { ok: false, reason: "invalid", message: "Invalid coupon code" };
  if (isExpired(coupon, now)) return { ok: false, reason: "expired", message: "Coupon expired" };
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return { ok: false, reason: "min_order", message: `Minimum order ₹${coupon.minOrder} required` };
  }
  const discount = calculateDiscount(coupon, subtotal, now);
  if (!discount) return { ok: false, reason: "no_discount", message: "Coupon could not be applied" };
  return { ok: true, coupon, discount };
}
