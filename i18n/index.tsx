import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { categoryLabel, defaultLang, plural, translate, type Key, type Lang } from "./translate";

const KEY = "@awad-trading/lang";

type Ctx = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: Key, params?: Record<string, string | number>) => string;
  items: (n: number) => string;
  cat: (category: string) => string;
};
const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(defaultLang());
  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => { if (v === "en" || v === "hi") setLangState(v); }).catch(() => undefined);
  }, []);
  const setLang = useCallback((next: Lang) => { setLangState(next); AsyncStorage.setItem(KEY, next).catch(() => undefined); }, []);
  const value = useMemo<Ctx>(() => ({
    lang, setLang,
    t: (key, params) => translate(lang, key, params),
    items: (n) => plural(lang, "items", n),
    cat: (c) => categoryLabel(lang, c),
  }), [lang, setLang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useT(): Ctx {
  const v = useContext(LanguageContext);
  if (!v) throw new Error("useT must be used within LanguageProvider");
  return v;
}
