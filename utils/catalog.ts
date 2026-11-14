import type { CartItem, Product } from "../types/product";

export type ParseResult = { products: Product[]; skipped: string[] };

const TRUE_WORDS = ["true", "yes", "y", "1", "in stock", "instock", "available"];
const FALSE_WORDS = ["false", "no", "n", "0", "out", "out of stock", "outofstock", "unavailable"];

/** Minimal RFC-4180 style CSV parser (quotes, escaped quotes, CRLF, commas/newlines in quotes). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const input = text.replace(/^﻿/, "");
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"' && input[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && input[i + 1] === "\n") i++;
      row.push(field); field = "";
      rows.push(row); row = [];
    } else field += ch;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string") return undefined;
  const cleaned = value.replace(/[₹,\s]|rs\.?/gi, "");
  if (cleaned === "") return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

function toStock(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  const word = String(value ?? "").trim().toLowerCase();
  if (FALSE_WORDS.includes(word)) return false;
  if (word === "" || TRUE_WORDS.includes(word)) return true;
  return true;
}

const text = (value: unknown): string => (typeof value === "string" ? value.trim() : typeof value === "number" ? String(value) : "");

/** Validates loose records (CSV rows or JSON objects) into Products. Bad rows are skipped with a reason. */
export function normalizeRecords(records: unknown[]): ParseResult {
  const products: Product[] = [];
  const skipped: string[] = [];
  const seen = new Set<string>();
  records.forEach((raw, index) => {
    const label = `row ${index + 1}`;
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) { skipped.push(`${label}: not an object`); return; }
    const rec: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(raw)) rec[key.trim().toLowerCase()] = value;
    const id = text(rec.id);
    const name = text(rec.name);
    const price = toNumber(rec.price);
    if (!id) { skipped.push(`${label}: missing id`); return; }
    if (!name) { skipped.push(`${label} (${id}): missing name`); return; }
    if (price === undefined || price <= 0) { skipped.push(`${label} (${id}): invalid price`); return; }
    if (seen.has(id)) { skipped.push(`${label} (${id}): duplicate id`); return; }
    seen.add(id);
    const mrp = toNumber(rec.mrp);
    const image = text(rec.image);
    const product: Product = {
      id, name, price,
      category: text(rec.category) || "Other",
      inStock: toStock(rec.instock ?? rec.in_stock ?? rec["in stock"]),
    };
    if (mrp !== undefined && mrp > price) product.mrp = mrp;
    if (text(rec.unit)) product.unit = text(rec.unit);
    if (/^https?:\/\//i.test(image)) product.image = image;
    if (text(rec.description)) product.description = text(rec.description);
    products.push(product);
  });
  return { products, skipped };
}

/** Accepts a CSV export of a Google Sheet or a JSON file (array, or { products: [] }). Throws if nothing valid. */
export function parseCatalog(body: string): ParseResult {
  const trimmed = body.trim();
  let records: unknown[];
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    const json: unknown = JSON.parse(trimmed);
    const list = Array.isArray(json) ? json : (json as { products?: unknown }).products;
    if (!Array.isArray(list)) throw new Error("JSON must be an array or { \"products\": [...] }");
    records = list;
  } else {
    const rows = parseCsv(trimmed);
    if (rows.length < 2) throw new Error("Catalog has no rows");
    const headers = rows[0].map((h) => h.trim().toLowerCase());
    records = rows.slice(1).map((cells) => Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""])));
  }
  const result = normalizeRecords(records);
  if (result.products.length === 0) throw new Error("Catalog has no valid products");
  return result;
}

export type Reconciled = { items: CartItem[]; removed: string[]; changed: string[]; didChange: boolean };

/** Updates prices of items already in the cart and removes items that no longer exist or are out of stock. */
export function reconcileCart(items: CartItem[], products: Product[]): Reconciled {
  const byId = new Map(products.map((p) => [p.id, p]));
  const removed: string[] = [];
  const changed: string[] = [];
  const next: CartItem[] = [];
  for (const item of items) {
    const fresh = byId.get(item.id);
    if (!fresh || fresh.inStock === false) { removed.push(item.name); continue; }
    if (fresh.price !== item.price || fresh.name !== item.name || fresh.mrp !== item.mrp || fresh.unit !== item.unit) {
      if (fresh.price !== item.price) changed.push(`${fresh.name}: ₹${item.price} → ₹${fresh.price}`);
      next.push({ ...fresh, quantity: item.quantity });
    } else next.push(item);
  }
  const didChange = next.length !== items.length || next.some((item, i) => item !== items[i]);
  return { items: next, removed, changed, didChange };
}
