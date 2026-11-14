jest.mock("@react-native-async-storage/async-storage", () => {
  let store: Record<string, string> = {};
  return { __esModule: true, default: {
    getItem: jest.fn(async (k: string) => store[k] ?? null),
    setItem: jest.fn(async (k: string, v: string) => { store[k] = v; }),
    __reset: () => { store = {}; },
  } };
});
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchCatalog, loadCachedCatalog, saveCachedCatalog } from "../services/catalog";
import { parseCatalog, parseCsv, reconcileCart } from "../utils/catalog";
import type { CartItem, Product } from "../types/product";

const CSV = `id,name,unit,price,mrp,category,image,inStock,description
a,"Rice, Basmati",5 kg,"₹1,200",1400,Staples,https://x.test/a.jpg,yes,"Line ""one"""
b,Dal,1 kg,160,100,Staples,not-a-url,no,
,NoId,1,10,,Staples,,yes,
c,NoPrice,1,abc,,Staples,,yes,
a,Duplicate,1,5,,Staples,,yes,
d,Oil,1 L,145,,,,,
`;

describe("csv", () => {
  it("handles quotes, commas, CRLF", () => {
    expect(parseCsv('a,b\r\n"x,1","y ""q"""\r\n')).toEqual([["a", "b"], ["x,1", 'y "q"']]);
  });
});

describe("parseCatalog", () => {
  it("normalises rows and skips bad ones", () => {
    const { products, skipped } = parseCatalog(CSV);
    expect(products.map((p) => p.id)).toEqual(["a", "b", "d"]);
    expect(products[0]).toMatchObject({ name: "Rice, Basmati", price: 1200, mrp: 1400, image: "https://x.test/a.jpg", description: 'Line "one"', inStock: true });
    expect(products[1]).toMatchObject({ inStock: false });
    expect(products[1].mrp).toBeUndefined();
    expect(products[1].image).toBeUndefined();
    expect(products[2]).toMatchObject({ category: "Other", inStock: true });
    expect(skipped).toHaveLength(3);
  });
  it("accepts JSON array and { products }", () => {
    const row = { id: "x", name: "X", price: 10 };
    expect(parseCatalog(JSON.stringify([row])).products).toHaveLength(1);
    expect(parseCatalog(JSON.stringify({ products: [row] })).products).toHaveLength(1);
  });
  it("throws on garbage or empty catalogs instead of returning nothing", () => {
    expect(() => parseCatalog("")).toThrow();
    expect(() => parseCatalog("id,name,price\n,,")).toThrow();
    expect(() => parseCatalog("{bad json")).toThrow();
    expect(() => parseCatalog('{"x":1}')).toThrow();
  });
});

describe("reconcileCart", () => {
  const p = (id: string, price: number, extra: Partial<Product> = {}): Product => ({ id, name: id, price, category: "c", ...extra });
  const cart: CartItem[] = [{ ...p("a", 100), quantity: 2 }, { ...p("b", 50), quantity: 1 }, { ...p("c", 20), quantity: 1 }];
  it("updates prices, removes missing and out-of-stock", () => {
    const r = reconcileCart(cart, [p("a", 110), p("c", 20, { inStock: false })]);
    expect(r.items).toEqual([{ ...p("a", 110), quantity: 2 }]);
    expect(r.removed).toEqual(["b", "c"]);
    expect(r.changed).toEqual(["a: ₹100 → ₹110"]);
    expect(r.didChange).toBe(true);
  });
  it("reports no change when nothing differs", () => {
    const r = reconcileCart(cart, [p("a", 100), p("b", 50), p("c", 20)]);
    expect(r.didChange).toBe(false);
  });
});

describe("fetchCatalog and cache", () => {
  const ok = (body: string) => (async () => ({ ok: true, status: 200, text: async () => body })) as unknown as typeof fetch;
  it("fetches and parses", async () => {
    const r = await fetchCatalog("https://x.test", ok(CSV));
    expect(r.products).toHaveLength(3);
  });
  it("rejects on HTTP error", async () => {
    const bad = (async () => ({ ok: false, status: 404, text: async () => "" })) as unknown as typeof fetch;
    await expect(fetchCatalog("https://x.test", bad)).rejects.toThrow("404");
  });
  it("cache round-trips and ignores corrupt data", async () => {
    (AsyncStorage as unknown as { __reset: () => void }).__reset();
    expect(await loadCachedCatalog()).toBeNull();
    await saveCachedCatalog({ products: [p1()], updatedAt: "2026-11-15T00:00:00.000Z" });
    expect((await loadCachedCatalog())?.products[0].id).toBe("z");
    await AsyncStorage.setItem("@awad-trading/catalog-cache", "{oops");
    expect(await loadCachedCatalog()).toBeNull();
  });
});
function p1(): Product { return { id: "z", name: "Z", price: 5, category: "c" }; }
