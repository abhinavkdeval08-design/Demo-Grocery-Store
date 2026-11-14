import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Product } from "../types/product";
import { normalizeRecords, parseCatalog, type ParseResult } from "../utils/catalog";

const CACHE_KEY = "@awad-trading/catalog-cache";

export type CachedCatalog = { products: Product[]; updatedAt: string };

/** Downloads and parses the catalog. Rejects on network errors, timeouts, HTTP errors or an empty/invalid catalog. */
export async function fetchCatalog(url: string, fetchImpl: typeof fetch = fetch, timeoutMs = 10000): Promise<ParseResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { signal: controller.signal, headers: { "Cache-Control": "no-cache" } });
    if (!response.ok) throw new Error(`Catalog request failed (${response.status})`);
    const result = parseCatalog(await response.text());
    if (__DEV__ && result.skipped.length) console.warn("Catalog rows skipped:", result.skipped);
    return result;
  } finally {
    clearTimeout(timer);
  }
}

export async function loadCachedCatalog(): Promise<CachedCatalog | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { products?: unknown; updatedAt?: unknown };
    if (!Array.isArray(data.products) || typeof data.updatedAt !== "string") return null;
    const { products } = normalizeRecords(data.products);
    return products.length ? { products, updatedAt: data.updatedAt } : null;
  } catch {
    return null;
  }
}

export async function saveCachedCatalog(catalog: CachedCatalog): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(catalog));
  } catch {
    /* cache is best-effort */
  }
}
