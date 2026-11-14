import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import PinGate from "../../../components/PinGate";
import { owner as s } from "../../../components/ownerStyles";
import { STORE } from "../../../config/store";
import { useKhata } from "../../../context/KhataContext";
import { theme } from "../../../theme";
import { balanceOf, khataMessage, whatsappPhone } from "../../../utils/khata";

function CustomerView({ id }: { id: string }) {
  const router = useRouter();
  const { data, addEntry, updateEntry, deleteEntry, deleteCustomer } = useKhata();
  const customer = data.customers.find((c) => c.id === id);
  const [kind, setKind] = React.useState<"credit" | "payment" | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState("");
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState("");
  if (!customer) return <View style={s.root}><Text style={[s.text, { padding: 40 }]}>Customer not found.</Text></View>;
  const balance = balanceOf(data.entries, id);
  const entries = data.entries.filter((e) => e.customerId === id).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const reset = () => { setKind(null); setEditingId(null); setAmount(""); setNote(""); setError(""); };

  const save = () => {
    const value = Number(amount.replace(/[₹,\s]/g, ""));
    if (!Number.isFinite(value) || value <= 0) return setError("Enter an amount greater than 0");
    if (editingId) updateEntry(editingId, { amount: value, note: note.trim() });
    else if (kind) addEntry({ customerId: id, type: kind, amount: value, note: note.trim() || undefined });
    reset();
  };
  const remind = async () => {
    const phone = whatsappPhone(customer.phone);
    if (!phone) return Alert.alert("No valid phone", "Add a 10-digit phone number for this customer to send a reminder.");
    try { await Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(khataMessage(customer.name, balance, STORE.name))}`); }
    catch { Alert.alert("WhatsApp unavailable", "Could not open WhatsApp."); }
  };

  return <ScrollView style={s.root} contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
    <View style={s.headerRow}>
      <TouchableOpacity accessibilityLabel="Go back" onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} /></TouchableOpacity>
      <Text style={s.title}>{customer.name}</Text>
      <TouchableOpacity accessibilityLabel="Delete customer" onPress={() => Alert.alert("Delete customer?", "This also deletes all their entries.", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => { deleteCustomer(id); router.back(); } }])}><Ionicons name="trash-outline" size={22} color="#FCA5A5" /></TouchableOpacity>
    </View>
    <View style={s.card}><Text style={s.muted}>{customer.phone || "No phone"}</Text><Text style={balance > 0 ? [s.big, { color: "#FCA5A5" }] : s.big}>₹{Math.abs(balance).toFixed(2)}</Text><Text style={s.muted}>{balance > 0 ? "Customer owes you" : balance < 0 ? "Paid in advance" : "All clear"}</Text></View>
    <View style={s.row}>
      <TouchableOpacity style={s.button} onPress={() => { reset(); setKind("credit"); }}><Text style={s.buttonText}>+ Udhaar</Text></TouchableOpacity>
      <TouchableOpacity style={s.outline} onPress={() => { reset(); setKind("payment"); }}><Text style={s.accent}>+ Payment</Text></TouchableOpacity>
      {balance > 0 && <TouchableOpacity style={s.outline} onPress={remind}><Text style={s.accent}>Remind</Text></TouchableOpacity>}
    </View>
    {(kind || editingId) && <View style={s.card}>
      <Text style={s.text}>{editingId ? "Edit entry" : kind === "credit" ? "New udhaar (credit given)" : "New payment received"}</Text>
      <TextInput accessibilityLabel="Amount" style={s.input} placeholder="Amount ₹" placeholderTextColor="#6B7280" keyboardType="decimal-pad" value={amount} onChangeText={(t) => { setAmount(t); setError(""); }} />
      <TextInput accessibilityLabel="Note" style={s.input} placeholder="Note (optional)" placeholderTextColor="#6B7280" value={note} onChangeText={setNote} />
      {error ? <Text style={s.error}>{error}</Text> : null}
      <View style={s.row}><TouchableOpacity style={s.outline} onPress={reset}><Text style={s.muted}>Cancel</Text></TouchableOpacity><TouchableOpacity style={s.button} onPress={save}><Text style={s.buttonText}>Save</Text></TouchableOpacity></View>
    </View>}
    <Text style={s.section}>History</Text>
    {entries.length === 0 ? <Text style={s.muted}>No entries yet.</Text> : entries.map((e) => <View key={e.id} style={s.between}>
      <View style={{ flex: 1 }}><Text style={s.text}>{e.type === "credit" ? "Udhaar" : "Payment"} · ₹{e.amount.toFixed(2)}</Text><Text style={s.muted}>{new Date(e.createdAt).toLocaleDateString()}{e.note ? ` · ${e.note}` : ""}</Text></View>
      <View style={s.row}>
        <TouchableOpacity accessibilityLabel="Edit entry" onPress={() => { setKind(e.type); setEditingId(e.id); setAmount(String(e.amount)); setNote(e.note ?? ""); setError(""); }}><Ionicons name="create-outline" size={18} color="#A5B4FC" /></TouchableOpacity>
        <TouchableOpacity accessibilityLabel="Delete entry" onPress={() => Alert.alert("Delete this entry?", "The balance will change.", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => deleteEntry(e.id) }])}><Ionicons name="trash-outline" size={18} color="#FCA5A5" /></TouchableOpacity>
      </View>
    </View>)}
  </ScrollView>;
}

export default function CustomerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PinGate><CustomerView id={String(id)} /></PinGate>;
}
