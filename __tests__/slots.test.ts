import { availableSlots, isServiceablePincode, isSlotBookable, type SlotRules } from "../utils/slots";

const rules: SlotRules = {
  maxDaysAhead: 2,
  closedDays: [],
  slots: [
    { id: "m", label: "Morning", start: "09:00", cutoffMinutes: 60 },
    { id: "a", label: "Afternoon", start: "12:00", cutoffMinutes: 60 },
    { id: "e", label: "Evening", start: "17:00", cutoffMinutes: 60, days: [1, 2, 3, 4, 5, 6] },
  ],
};
// 2026-11-14 is a Saturday, 2026-11-15 a Sunday
const at = (iso: string) => new Date(iso);
const ids = (d: { slots: { id: string; available: boolean }[] }) => d.slots.filter((s) => s.available).map((s) => s.id);

describe("pincode", () => {
  it("must be 6 digits and in the list", () => {
    expect(isServiceablePincode("700001", ["700001"])).toBe(true);
    expect(isServiceablePincode("700009", ["700001"])).toBe(false);
    expect(isServiceablePincode("7000", ["7000"])).toBe(false);
    expect(isServiceablePincode(" 700001 ", ["700001"])).toBe(true);
  });
});

describe("availableSlots", () => {
  it("excludes past slots and slots inside the cutoff", () => {
    const days = availableSlots(at("2026-11-14T10:30:00"), rules);
    expect(days[0].label).toBe("Today");
    expect(ids(days[0])).toEqual(["a", "e"]); // morning passed
    expect(ids(availableSlots(at("2026-11-14T11:30:00"), rules)[0])).toEqual(["e"]); // afternoon inside 60 min cutoff
    expect(ids(availableSlots(at("2026-11-14T11:00:00"), rules)[0])).toEqual(["e"]); // exactly at cutoff is closed
  });
  it("labels days and rolls over after midnight", () => {
    const days = availableSlots(at("2026-11-14T23:30:00"), rules);
    expect(ids(days[0])).toEqual([]);
    expect(days[1].label).toBe("Tomorrow");
    expect(days[2].label).toBe("Mon 16 Nov");
  });
  it("applies per-slot weekdays (no evening on Sunday)", () => {
    const sunday = availableSlots(at("2026-11-14T08:00:00"), rules)[1];
    expect(sunday.slots.map((s) => s.id)).toEqual(["m", "a"]);
  });
  it("skips closed days entirely", () => {
    const days = availableSlots(at("2026-11-14T08:00:00"), { ...rules, closedDays: [0] });
    expect(days.map((d) => d.date)).toEqual(["2026-11-14", "2026-11-16"]);
  });
  it("crosses month and year boundaries", () => {
    const days = availableSlots(at("2026-12-31T08:00:00"), rules);
    expect(days[1].date).toBe("2027-01-01");
  });
});

describe("isSlotBookable", () => {
  it("rejects a slot whose cutoff passed", () => {
    expect(isSlotBookable(at("2026-11-14T08:30:00"), rules, "2026-11-14", "m")).toBe(false);
    expect(isSlotBookable(at("2026-11-14T07:30:00"), rules, "2026-11-14", "m")).toBe(true);
    expect(isSlotBookable(at("2026-11-14T07:30:00"), rules, "2026-11-15", "e")).toBe(false);
  });
});
