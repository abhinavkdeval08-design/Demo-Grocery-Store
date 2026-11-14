import type { Address, CartItem, Customer, Order } from "../types/product";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === "string";
const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

/** Keep only well-formed cart items; anything else in storage is dropped. */
export function sanitizeItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is CartItem =>
      isObject(item) &&
      isString(item.id) &&
      isString(item.name) &&
      isNumber(item.price) &&
      item.price >= 0 &&
      isNumber(item.quantity) &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0,
  );
}

export function sanitizeAddress(value: unknown): Address | null {
  if (
    isObject(value) &&
    isString(value.id) &&
    isString(value.label) &&
    isString(value.name) &&
    isString(value.phone) &&
    isString(value.address)
  ) {
    return value as Address;
  }
  return null;
}

export function sanitizeCustomer(value: unknown): Customer {
  const empty: Customer = { name: "", phone: "", addresses: [] };
  if (!isObject(value)) return empty;
  const addresses = Array.isArray(value.addresses)
    ? value.addresses.map(sanitizeAddress).filter((a): a is Address => a !== null)
    : [];
  return {
    name: isString(value.name) ? value.name : "",
    phone: isString(value.phone) ? value.phone : "",
    addresses,
  };
}

export function sanitizeOrders(value: unknown): Order[] {
  if (!Array.isArray(value)) return [];
  const orders: Order[] = [];
  for (const raw of value) {
    if (!isObject(raw)) continue;
    const address = sanitizeAddress(raw.address);
    const items = sanitizeItems(raw.items);
    if (
      !address ||
      items.length === 0 ||
      !isString(raw.id) ||
      !isString(raw.createdAt) ||
      !isNumber(raw.subtotal) ||
      !isNumber(raw.deliveryFee) ||
      !isNumber(raw.discount) ||
      !isNumber(raw.total) ||
      (raw.paymentMethod !== "cod" && raw.paymentMethod !== "upi")
    ) {
      continue;
    }
    orders.push({
      ...(raw as unknown as Order),
      items,
      address,
      customer: sanitizeCustomer(raw.customer),
    });
  }
  return orders;
}
