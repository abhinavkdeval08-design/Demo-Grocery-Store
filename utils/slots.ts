export type SlotConfig = {
  id: string;
  label: string;
  /** 24h "HH:MM" start of the slot */
  start: string;
  /** Orders for this slot close this many minutes before it starts. */
  cutoffMinutes: number;
  /** Weekdays (0 = Sunday) this slot runs on. Omit for every open day. */
  days?: readonly number[];
};

export type SlotRules = {
  slots: readonly SlotConfig[];
  /** Weekdays (0 = Sunday) the store does not deliver at all. */
  closedDays: readonly number[];
  maxDaysAhead: number;
};

export type DaySlots = {
  /** YYYY-MM-DD in local time */
  date: string;
  label: string;
  slots: { id: string; label: string; available: boolean }[];
};

const pad = (n: number) => String(n).padStart(2, "0");
export const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function isServiceablePincode(pincode: string, serviceable: readonly string[]): boolean {
  const pin = pincode.trim();
  return /^\d{6}$/.test(pin) && serviceable.includes(pin);
}

/** Days (today first) with their slots; a slot is unavailable once its cutoff has passed. Days with no running slot are omitted. */
export function availableSlots(now: Date, rules: SlotRules): DaySlots[] {
  const days: DaySlots[] = [];
  for (let i = 0; i <= rules.maxDaysAhead; i += 1) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const weekday = day.getDay();
    if (rules.closedDays.includes(weekday)) continue;
    const running = rules.slots.filter((s) => !s.days || s.days.includes(weekday));
    if (!running.length) continue;
    const slots = running.map((s) => {
      const [h, m] = s.start.split(":").map(Number);
      const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m);
      return { id: s.id, label: s.label, available: start.getTime() - s.cutoffMinutes * 60000 > now.getTime() };
    });
    const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : `${WEEKDAYS[weekday]} ${day.getDate()} ${MONTHS[day.getMonth()]}`;
    days.push({ date: dateKey(day), label, slots });
  }
  return days;
}

/** True if the chosen date + slot can still be booked at `now`. */
export function isSlotBookable(now: Date, rules: SlotRules, date: string, slotId: string): boolean {
  return availableSlots(now, rules).some((d) => d.date === date && d.slots.some((s) => s.id === slotId && s.available));
}
