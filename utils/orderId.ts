import AsyncStorage from "@react-native-async-storage/async-storage";

const ORDER_SEQ_KEY = "@awad-trading/order-seq";

type Sequence = { day: string; seq: number };

/** Local calendar day as YYYYMMDD. */
export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}${month}${day}`;
}

export function formatOrderId(day: string, seq: number): string {
  return `AT-${day}-${String(seq).padStart(4, "0")}`;
}

/** Sequence restarts at 1 every new day. */
export function nextSequence(previous: Sequence | null, day: string): number {
  return previous && previous.day === day ? previous.seq + 1 : 1;
}

function parseSequence(raw: string | null): Sequence | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<Sequence>;
    if (typeof value.day === "string" && Number.isInteger(value.seq)) {
      return { day: value.day, seq: value.seq as number };
    }
  } catch {
    /* corrupt value: start again from 1 */
  }
  return null;
}

/** Returns e.g. AT-20261114-0001 and remembers the counter on the device. */
export async function getNextOrderId(now: Date = new Date()): Promise<string> {
  const day = dayKey(now);
  let previous: Sequence | null = null;
  try {
    previous = parseSequence(await AsyncStorage.getItem(ORDER_SEQ_KEY));
  } catch {
    previous = null;
  }
  const seq = nextSequence(previous, day);
  try {
    await AsyncStorage.setItem(ORDER_SEQ_KEY, JSON.stringify({ day, seq }));
  } catch {
    /* ignore storage errors; the id is still usable */
  }
  return formatOrderId(day, seq);
}
