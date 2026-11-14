import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { STORE } from "../config/store";
import { PRODUCTS } from "../data/products";
import { fetchCatalog, loadCachedCatalog, saveCachedCatalog } from "../services/catalog";
import type { Product } from "../types/product";
import { reconcileCart } from "../utils/catalog";
import { useCart } from "./CartContext";

type Source = "bundled" | "cache" | "remote";

type CatalogContextType = {
  products: Product[];
  categories: string[];
  loading: boolean;
  /** Set when the last refresh failed; products then come from the saved copy or the bundled list. */
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: string | null;
  source: Source;
};

const CatalogContext = createContext<CatalogContextType | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [source, setSource] = useState<Source>("bundled");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(STORE.catalogUrl));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!STORE.catalogUrl) return;
    setLoading(true);
    try {
      const { products: fresh } = await fetchCatalog(STORE.catalogUrl);
      const updatedAt = new Date().toISOString();
      setProducts(fresh); setSource("remote"); setLastUpdated(updatedAt); setError(null);
      await saveCachedCatalog({ products: fresh, updatedAt });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not refresh prices");
    } finally {
      setLoading(false);
    }
  }, []);

  // Stale-while-revalidate: show the saved copy immediately, then refresh in the background.
  useEffect(() => {
    if (!STORE.catalogUrl) return;
    let active = true;
    loadCachedCatalog().then((cached) => {
      if (active && cached) { setProducts(cached.products); setSource("cache"); setLastUpdated(cached.updatedAt); }
    }).finally(() => { if (active) void refresh(); });
    return () => { active = false; };
  }, [refresh]);

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], [products]);
  const value = useMemo(() => ({ products, categories, loading, error, refresh, lastUpdated, source }), [products, categories, loading, error, refresh, lastUpdated, source]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextType {
  const value = useContext(CatalogContext);
  if (!value) throw new Error("useCatalog must be used within CatalogProvider");
  return value;
}

/**
 * Keeps the persisted cart in line with the catalog. Only runs against an authoritative list
 * (fresh download, or the bundled list when no remote catalog is configured), never against a stale cache.
 */
export function CartCatalogSync() {
  const { products, source } = useCatalog();
  const { items, hydrated, replaceItems } = useCart();
  useEffect(() => {
    const authoritative = source === "remote" || !STORE.catalogUrl;
    if (!hydrated || !authoritative) return;
    const result = reconcileCart(items, products);
    if (!result.didChange) return;
    replaceItems(result.items);
    const lines = [
      ...(result.removed.length ? [`Removed (no longer available): ${result.removed.join(", ")}`] : []),
      ...result.changed.map((line) => `Price updated - ${line}`),
    ];
    if (lines.length) Alert.alert("Cart updated", lines.join("\n"));
  }, [products, source, hydrated, items, replaceItems]);
  return null;
}
