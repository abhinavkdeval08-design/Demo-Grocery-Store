import { en, type Dict } from "./en";
import { hi } from "./hi";

export type Lang = "en" | "hi";
export type Key = keyof Dict;
export const DICTS: Record<Lang, Dict> = { en, hi };

export function translate(lang: Lang, key: Key, params?: Record<string, string | number>): string {
  const template = DICTS[lang][key] ?? en[key] ?? key;
  return params ? template.replace(/\{(\w+)\}/g, (m, name: string) => (name in params ? String(params[name]) : m)) : template;
}

/** Singular/plural key pair, e.g. plural("items", 3) uses items.one / items.other. */
export function plural(lang: Lang, base: "items", n: number): string {
  return translate(lang, n === 1 ? `${base}.one` : `${base}.other`, { n });
}

/** Display name for a category; unknown categories (from the catalog sheet) are shown as written. */
export function categoryLabel(lang: Lang, category: string): string {
  const key = `cat.${category}`;
  return key in en ? translate(lang, key as Key) : category;
}

export function defaultLang(locale?: string): Lang {
  let value = locale;
  if (!value) {
    try { value = Intl.DateTimeFormat().resolvedOptions().locale; } catch { value = "en"; }
  }
  return value.toLowerCase().startsWith("hi") ? "hi" : "en";
}
