export type Product = {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  unit?: string;
  image?: string;
  category: string;
  inStock?: boolean;
};

export type CartItem = Product & {
  quantity: number;
};

export type Address = {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
};

export type Customer = {
  name: string;
  phone: string;
  addresses: Address[];
};

export type PaymentMethod = "cod" | "upi";

export type Order = {
  id: string;
  items: CartItem[];
  customer: Customer;
  address: Address;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  note?: string;
  createdAt: string;
};

export type Coupon = {
  code: string;
  label: string;
  type: "percentage" | "flat";
  value: number;
  minOrder?: number;
  maxDiscount?: number;
};
