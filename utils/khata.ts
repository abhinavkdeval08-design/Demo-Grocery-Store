import type { KhataCustomer, KhataData, KhataEntry } from "../types/khata";

const paise = (amount: number) => Math.round(amount * 100);

/** Amount the customer owes (negative = paid in advance). Computed in paise to avoid float drift. */
export function balanceOf(entries: KhataEntry[], customerId: string): number {
  let total = 0;
  for (const e of entries) {
    if (e.customerId !== customerId) continue;
    total += e.type === "credit" ? paise(e.amount) : -paise(e.amount);
  }
  return total / 100;
}

export function totalOutstanding(data: KhataData): number {
  return data.customers.reduce((sum, c) => sum + Math.max(0, paise(balanceOf(data.entries, c.id))), 0) / 100;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0;

/** Keeps only valid customers/entries; entries for unknown customers are dropped. */
export function sanitizeKhata(value: unknown): { data: KhataData; dropped: number } {
  const empty = { data: { customers: [], entries: [] }, dropped: 0 };
  if (!isObj(value)) return empty;
  let dropped = 0;
  const customers: KhataCustomer[] = [];
  const ids = new Set<string>();
  for (const c of Array.isArray(value.customers) ? value.customers : []) {
    if (isObj(c) && isStr(c.id) && isStr(c.name) && typeof c.phone === "string" && !ids.has(c.id)) {
      ids.add(c.id); customers.push({ id: c.id, name: c.name, phone: c.phone });
    } else dropped += 1;
  }
  const entries: KhataEntry[] = [];
  const entryIds = new Set<string>();
  for (const e of Array.isArray(value.entries) ? value.entries : []) {
    if (
      isObj(e) && isStr(e.id) && isStr(e.customerId) && ids.has(e.customerId) && !entryIds.has(e.id) &&
      (e.type === "credit" || e.type === "payment") &&
      typeof e.amount === "number" && Number.isFinite(e.amount) && e.amount > 0 &&
      typeof e.createdAt === "string" && !Number.isNaN(Date.parse(e.createdAt))
    ) {
      entryIds.add(e.id);
      entries.push({ id: e.id, customerId: e.customerId, type: e.type, amount: e.amount, createdAt: e.createdAt,
        ...(typeof e.note === "string" && e.note ? { note: e.note } : {}),
        ...(typeof e.orderId === "string" && e.orderId ? { orderId: e.orderId } : {}) });
    } else dropped += 1;
  }
  return { data: { customers, entries }, dropped };
}

export const exportBackup = (data: KhataData): string => JSON.stringify({ version: 1, ...data }, null, 2);

export type BackupResult = { ok: true; data: KhataData; dropped: number } | { ok: false; error: string };

export function parseBackup(text: string): BackupResult {
  let json: unknown;
  try { json = JSON.parse(text.trim()); } catch { return { ok: false, error: "This is not valid backup text." }; }
  if (!isObj(json) || json.version !== 1 || !Array.isArray(json.customers) || !Array.isArray(json.entries)) {
    return { ok: false, error: "This does not look like a khata backup." };
  }
  const { data, dropped } = sanitizeKhata(json);
  if (data.customers.length === 0 && json.customers.length > 0) return { ok: false, error: "No valid customers found in the backup." };
  return { ok: true, data, dropped };
}

export function khataMessage(name: string, balance: number, storeName: string): string {
  return `Namaste ${name},\nThis is a gentle reminder from ${storeName}: your pending khata balance is ₹${balance.toFixed(2)}.\nPlease pay when convenient. Thank you!`;
}

export function whatsappPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return null;
}

export const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
