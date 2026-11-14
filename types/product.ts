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
