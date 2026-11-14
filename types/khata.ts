export type KhataCustomer = { id: string; name: string; phone: string };
export type KhataEntry = {
  id: string;
  customerId: string;
  type: "credit" | "payment";
  amount: number;
  note?: string;
  orderId?: string;
  createdAt: string;
};
export type KhataData = { customers: KhataCustomer[]; entries: KhataEntry[] };
