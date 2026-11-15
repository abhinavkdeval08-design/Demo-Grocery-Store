import { en } from "../i18n/en";
import { hi } from "../i18n/hi";
import { categoryLabel, defaultLang, plural, translate } from "../i18n/translate";

const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(",");

describe("dictionaries", () => {
  it("have identical keys", () => expect(Object.keys(hi).sort()).toEqual(Object.keys(en).sort()));
  it("have no empty values", () => {
    for (const [k, v] of Object.entries(hi)) expect([k, v.trim().length > 0]).toEqual([k, true]);
  });
  it("use the same {placeholders} in both languages", () => {
    for (const k of Object.keys(en) as (keyof typeof en)[]) expect([k, placeholders(hi[k])]).toEqual([k, placeholders(en[k])]);
  });
});

describe("translate", () => {
  it("interpolates and keeps unknown placeholders", () => {
    expect(translate("en", "cartbar.delivery", { time: "20 mins" })).toBe("Delivery in 20 mins");
    expect(translate("hi", "cartbar.delivery", { time: "20 मिनट" })).toBe("20 मिनट में डिलीवरी");
    expect(translate("en", "cpn.applied", { code: "X" })).toBe("X applied: ₹{n} off");
  });
  it("pluralises", () => {
    expect(plural("en", "items", 1)).toBe("1 item");
    expect(plural("en", "items", 3)).toBe("3 items");
    expect(plural("hi", "items", 2)).toBe("2 सामान");
  });
  it("translates known categories, passes through unknown ones", () => {
    expect(categoryLabel("hi", "Spices")).toBe("मसाले");
    expect(categoryLabel("hi", "Dairy")).toBe("Dairy");
  });
  it("picks the default language from the locale", () => {
    expect(defaultLang("hi-IN")).toBe("hi");
    expect(defaultLang("en-IN")).toBe("en");
  });
});
