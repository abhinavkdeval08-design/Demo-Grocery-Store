import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const KEY = "awad-trading-owner-pin";

async function read(): Promise<string | null> {
  try { return await SecureStore.getItemAsync(KEY); } catch { return AsyncStorage.getItem(KEY); }
}
async function write(value: string): Promise<void> {
  try { await SecureStore.setItemAsync(KEY, value); } catch { await AsyncStorage.setItem(KEY, value); }
}
const hash = (salt: string, pin: string) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);

export async function hasPin(): Promise<boolean> { return Boolean(await read()); }

export async function setPin(pin: string): Promise<void> {
  const salt = Crypto.randomUUID();
  await write(`${salt}:${await hash(salt, pin)}`);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await read();
  if (!stored) return false;
  const [salt, expected] = stored.split(":");
  return (await hash(salt, pin)) === expected;
}
