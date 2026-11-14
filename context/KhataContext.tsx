import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { KhataCustomer, KhataData, KhataEntry } from "../types/khata";
import { newId, sanitizeKhata } from "../utils/khata";

const KEY = "@awad-trading/khata";

type Ctx = {
  data: KhataData;
  hydrated: boolean;
  /** Owner mode is unlocked for this app session only (memory), never persisted. */
  unlocked: boolean;
  unlock: () => void;
  lock: () => void;
  addCustomer: (name: string, phone: string) => KhataCustomer;
  deleteCustomer: (id: string) => void;
  addEntry: (entry: Omit<KhataEntry, "id" | "createdAt">) => void;
  updateEntry: (id: string, patch: { amount: number; note?: string }) => void;
  deleteEntry: (id: string) => void;
  replaceAll: (data: KhataData) => void;
};

const KhataContext = createContext<Ctx | null>(null);

export function KhataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<KhataData>({ customers: [], entries: [] });
  const [hydrated, setHydrated] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (!raw) return;
      try { setData(sanitizeKhata(JSON.parse(raw)).data); } catch { /* ignore corrupt data */ }
    }).catch(() => undefined).finally(() => setHydrated(true));
  }, []);
  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => undefined);
  }, [data, hydrated]);

  const addCustomer = useCallback((name: string, phone: string) => {
    const customer = { id: newId(), name: name.trim(), phone: phone.trim() };
    setData((d) => ({ ...d, customers: [...d.customers, customer] }));
    return customer;
  }, []);
  const deleteCustomer = useCallback((id: string) => setData((d) => ({ customers: d.customers.filter((c) => c.id !== id), entries: d.entries.filter((e) => e.customerId !== id) })), []);
  const addEntry = useCallback((entry: Omit<KhataEntry, "id" | "createdAt">) => setData((d) => ({ ...d, entries: [...d.entries, { ...entry, id: newId(), createdAt: new Date().toISOString() }] })), []);
  const updateEntry = useCallback((id: string, patch: { amount: number; note?: string }) => setData((d) => ({ ...d, entries: d.entries.map((e) => (e.id === id ? { ...e, amount: patch.amount, note: patch.note || undefined } : e)) })), []);
  const deleteEntry = useCallback((id: string) => setData((d) => ({ ...d, entries: d.entries.filter((e) => e.id !== id) })), []);
  const replaceAll = useCallback((next: KhataData) => setData(next), []);
  const unlock = useCallback(() => setUnlocked(true), []);
  const lock = useCallback(() => setUnlocked(false), []);

  const value = useMemo(() => ({ data, hydrated, unlocked, unlock, lock, addCustomer, deleteCustomer, addEntry, updateEntry, deleteEntry, replaceAll }),
    [data, hydrated, unlocked, unlock, lock, addCustomer, deleteCustomer, addEntry, updateEntry, deleteEntry, replaceAll]);
  return <KhataContext.Provider value={value}>{children}</KhataContext.Provider>;
}

export function useKhata(): Ctx {
  const v = useContext(KhataContext);
  if (!v) throw new Error("useKhata must be used within KhataProvider");
  return v;
}
