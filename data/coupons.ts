import type { Coupon } from "../types/product";

export const COUPONS: Coupon[] = [
  { code: "WELCOME10", label: "10% off for new orders", type: "percentage", value: 10, minOrder: 500, maxDiscount: 100, expiresAt: "2099-12-31" },
  { code: "SAVE50", label: "₹50 off your order", type: "flat", value: 50, minOrder: 700, expiresAt: "2099-12-31" },
  { code: "FESTIVE20", label: "20% off festive orders", type: "percentage", value: 20, minOrder: 800, maxDiscount: 200, expiresAt: "2020-01-01" },
];

export function findCoupon(code: string): Coupon | undefined {
  return COUPONS.find((coupon) => coupon.code.toUpperCase() === code.trim().toUpperCase());
}

export function calculateDiscount(coupon: Coupon, subtotal: number): number {
  if (new Date(coupon.expiresAt).getTime() < Date.now()) return 0;
  if (coupon.minOrder && subtotal < coupon.minOrder) return 0;
  const discount = coupon.type === "percentage" ? subtotal * coupon.value / 100 : coupon.value;
  return Math.min(Math.max(0, discount), coupon.maxDiscount ?? Number.POSITIVE_INFINITY, subtotal);
}
