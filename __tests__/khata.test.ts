import { balanceOf, exportBackup, khataMessage, parseBackup, sanitizeKhata, totalOutstanding, whatsappPhone } from "../utils/khata";
import type { KhataData } from "../types/khata";

const data: KhataData = {
  customers: [{ id: "c1", name: "Ravi", phone: "9876543210" }, { id: "c2", name: "Sita", phone: "" }],
  entries: [
    { id: "e1", customerId: "c1", type: "credit", amount: 0.1, createdAt: "2026-11-01T00:00:00Z" },
    { id: "e2", customerId: "c1", type: "credit", amount: 0.2, createdAt: "2026-11-02T00:00:00Z" },
    { id: "e3", customerId: "c2", type: "credit", amount: 100, createdAt: "2026-11-02T00:00:00Z" },
    { id: "e4", customerId: "c2", type: "payment", amount: 150, createdAt: "2026-11-03T00:00:00Z" },
  ],
};

describe("balances", () => {
  it("has no float drift", () => expect(balanceOf(data.entries, "c1")).toBe(0.3));
  it("goes negative on advance payments", () => expect(balanceOf(data.entries, "c2")).toBe(-50));
  it("total outstanding counts only money owed", () => expect(totalOutstanding(data)).toBe(0.3));
  it("updates after editing/deleting entries", () => {
    expect(balanceOf(data.entries.filter((e) => e.id !== "e4"), "c2")).toBe(100);
  });
});

describe("backup", () => {
  it("round-trips", () => {
    const r = parseBackup(exportBackup(data));
    expect(r).toMatchObject({ ok: true, dropped: 0 });
    if (r.ok) expect(r.data).toEqual(data);
  });
  it("rejects garbage and wrong formats", () => {
    expect(parseBackup("nope")).toMatchObject({ ok: false });
    expect(parseBackup('{"version":2,"customers":[],"entries":[]}')).toMatchObject({ ok: false });
    expect(parseBackup('{"version":1,"customers":[{"x":1}],"entries":[]}')).toMatchObject({ ok: false });
  });
  it("drops invalid entries instead of crashing", () => {
    const bad = { version: 1, customers: data.customers, entries: [...data.entries, { id: "x", customerId: "ghost", type: "credit", amount: 5, createdAt: "2026-11-01T00:00:00Z" }, { id: "y", customerId: "c1", type: "credit", amount: -5, createdAt: "2026-11-01T00:00:00Z" }, { id: "e1", customerId: "c1", type: "credit", amount: 1, createdAt: "2026-11-01T00:00:00Z" }, null] };
    const r = parseBackup(JSON.stringify(bad));
    expect(r.ok && r.dropped).toBe(4);
  });
  it("sanitize handles non-objects", () => expect(sanitizeKhata("x").data).toEqual({ customers: [], entries: [] }));
});

describe("reminder", () => {
  it("builds a polite message", () => {
    const m = khataMessage("Ravi", 250, "Awad Trading");
    expect(m).toContain("Ravi");
    expect(m).toContain("₹250.00");
    expect(m).toContain("Awad Trading");
  });
  it("normalises phones for wa.me", () => {
    expect(whatsappPhone("98765 43210")).toBe("919876543210");
    expect(whatsappPhone("+91 9876543210")).toBe("919876543210");
    expect(whatsappPhone("123")).toBeNull();
  });
});
