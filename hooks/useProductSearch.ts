import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import type { Product } from "../types/product";

const RECENT_KEY = "@awad-trading/recent-searches";

export function useProductSearch(products: Product[]) {
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [recent, setRecent] = React.useState<string[]>([]);

  React.useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then((value) => {
      if (value) setRecent(JSON.parse(value) as string[]);
    }).catch(() => {});
  }, []);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 180);
    return () => clearTimeout(timer);
  }, [query]);

  const results = React.useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => `${p.name} ${p.unit ?? ""} ${p.category}`.toLowerCase().includes(q));
  }, [debouncedQuery, products]);

  const submitSearch = React.useCallback((value = query) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setRecent((previous) => {
      const next = [trimmed, ...previous.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, [query]);

  return { query, setQuery, results, recent, submitSearch };
}
