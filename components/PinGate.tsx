import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useKhata } from "../context/KhataContext";
import { theme } from "../theme";
import { hasPin, setPin, verifyPin } from "../utils/pin";

const MAX_TRIES = 5;
const LOCK_MS = 30000;

/** Convenience lock for owner mode. It keeps customers out; it is not strong security. */
export default function PinGate({ children }: { children: React.ReactNode }) {
  const { unlocked, unlock } = useKhata();
  const router = useRouter();
  const [exists, setExists] = React.useState<boolean | null>(null);
  const [pin, setPinValue] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState("");
  const [tries, setTries] = React.useState(0);
  const [blockedUntil, setBlockedUntil] = React.useState(0);

  React.useEffect(() => { hasPin().then(setExists).catch(() => setExists(false)); }, []);
  if (unlocked) return <>{children}</>;
  if (exists === null) return <View style={styles.root} />;

  const submit = async () => {
    setError("");
    if (!/^\d{4}$/.test(pin)) return setError("PIN must be 4 digits");
    if (!exists) {
      if (pin !== confirm) return setError("PINs do not match");
      await setPin(pin); setExists(true); unlock(); return;
    }
    if (Date.now() < blockedUntil) return setError("Too many tries. Wait a little and try again.");
    if (await verifyPin(pin)) { setTries(0); unlock(); return; }
    const next = tries + 1;
    setTries(next); setPinValue("");
    if (next >= MAX_TRIES) { setBlockedUntil(Date.now() + LOCK_MS); setTries(0); setError("Too many tries. Wait 30 seconds."); }
    else setError("Wrong PIN");
  };

  return <View style={styles.root}>
    <TouchableOpacity accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={22} color={theme.colors.textPrimary} /></TouchableOpacity>
    <Ionicons name="lock-closed" size={36} color={theme.colors.accent} />
    <Text style={styles.title}>{exists ? "Owner mode" : "Set an owner PIN"}</Text>
    <Text style={styles.muted}>{exists ? "Enter your 4-digit PIN" : "Choose a 4-digit PIN. Only you should know it."}</Text>
    <TextInput accessibilityLabel="PIN" style={styles.input} secureTextEntry keyboardType="number-pad" maxLength={4} value={pin} onChangeText={setPinValue} placeholder="PIN" placeholderTextColor="#6B7280" />
    {!exists && <TextInput accessibilityLabel="Confirm PIN" style={styles.input} secureTextEntry keyboardType="number-pad" maxLength={4} value={confirm} onChangeText={setConfirm} placeholder="Confirm PIN" placeholderTextColor="#6B7280" />}
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <TouchableOpacity style={styles.button} onPress={submit}><Text style={styles.buttonText}>{exists ? "Unlock" : "Save PIN"}</Text></TouchableOpacity>
  </View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  back: { position: "absolute", top: 56, left: 16, padding: 8 },
  title: { color: theme.colors.textPrimary, fontSize: 22, fontWeight: "700" },
  muted: { color: theme.colors.textSecondary, fontSize: 13, textAlign: "center" },
  input: { width: 200, color: theme.colors.textPrimary, backgroundColor: "#020617", borderColor: theme.colors.borderStrong, borderWidth: 1, borderRadius: 10, padding: 12, textAlign: "center", letterSpacing: 6 },
  error: { color: "#FCA5A5", fontSize: 13 },
  button: { backgroundColor: theme.colors.accent, borderRadius: 22, paddingVertical: 12, paddingHorizontal: 32 },
  buttonText: { color: "#022C22", fontWeight: "700" },
});
