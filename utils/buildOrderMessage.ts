import { STORE } from "../config/store";
import type { Order } from "../types/product";

export function buildOrderMessage(order: Order): string {
  const lines = order.items.map((item) => `• ${item.name} x${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`);
  return [
    `🧺 ${STORE.name} - New order`,
    `Order ID: ${order.id}`,
    "",
    `Name: ${order.address.name}`,
    `Phone: ${order.address.phone}`,
    `Address: ${order.address.address}`,
    ...(order.address.pincode ? [`Pincode: ${order.address.pincode}`] : []),
    ...(order.slot ? [`Delivery slot: ${order.slot.label} (${order.slot.date})`] : []),
    "",
    ...lines,
    "",
    `Items: ${order.items.reduce((sum, item) => sum + item.quantity, 0)}`,
    `Subtotal: ₹${order.subtotal.toFixed(2)}`,
    `Delivery: ₹${order.deliveryFee.toFixed(2)}`,
    `Discount: ₹${order.discount.toFixed(2)}`,
    `Total: ₹${order.total.toFixed(2)}`,
    `Payment: ${order.paymentMethod === "upi" ? "UPI" : "Cash on delivery"}`,
    ...(order.couponCode ? [`Coupon: ${order.couponCode}`] : []),
    ...(order.note ? ["", `Note: ${order.note}`] : []),
  ].join("\n");
}

export default buildOrderMessage;
