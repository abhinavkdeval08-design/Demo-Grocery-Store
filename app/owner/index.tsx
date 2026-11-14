import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, Share, Text, TextInput, TouchableOpacity, View } from "react-native";
import PinGate from "../../components/PinGate";
import { owner as s } from "../../components/ownerStyles";
import { useKhata } from "../../context/KhataContext";
import { theme } from "../../theme";
import { balanceOf, exportBackup, parseBackup, totalOutstanding } from "../../utils/khata";

function OwnerHome() {
  const router = useRouter();
  const { data, lock, addCustomer, replaceAll } = useKhata();
  const [search, setSearch] = React.useState("");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [error, setError] = React.useState("");
  const [backupText, setBackupText] = React.useState("");
  const [backupMsg, setBackupMsg] = React.useState("");

  const rows = data.customers
    .map((c) => ({ ...c, balance: balanceOf(data.entries, c.id) }))
    .filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase()) || c.phone.includes(search.trim()))
    .sort((a, b) => b.balance - a.balance);

  const add = () => {
    if (!name.trim()) return setError("Enter the customer's name");
    if (phone.trim() && !/^\d{10}$/.test(phone.replace(/\D/g, ""))) return setError("Phone must be 10 digits");
    setError(""); addCustomer(name, phone.replace(/\D/g, "")); setName(""); setPhone("");
  };
  const restore = () => {
    const result = parseBackup(backupText);
    if (!result.ok) return setBackupMsg(result.error);
    Alert.alert("Replace all khata data?", `This replaces the current data with ${result.data.customers.length} customers and ${result.data.entries.length} entries.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Replace", style: "destructive", onPress: () => { replaceAll(result.data); setBackupText(""); setBackupMsg(result.dropped ? `Restored. ${result.dropped} invalid items were skipped.` : "Restored."); } },
    ]);
  };

  return <ScrollView style={s.root} contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
    <View style={s.headerRow}>
      <TouchableOpacity accessibilityLabel="Go back" onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} /></TouchableOpacity>
      <Text style={s.title}>Khata</Text>
      <TouchableOpacity accessibilityLabel="Lock owner mode" onPress={() => { lock(); router.back(); }}><Ionicons name="lock-closed-outline" size={22} color={theme.colors.accent} /></TouchableOpacity>
    </View>
    <View style={s.card}><Text style={s.muted}>Total outstanding</Text><Text style={s.big}>₹{totalOutstanding(data).toFixed(2)}</Text><Text style={s.muted}>{data.customers.length} customers</Text></View>
    <Text style={s.section}>Add customer</Text>
    <TextInput accessibilityLabel="Customer name" style={s.input} placeholder="Name" placeholderTextColor="#6B7280" value={name} onChangeText={setName} />
    <TextInput accessibilityLabel="Customer phone" style={s.input} placeholder="10-digit phone (optional)" placeholderTextColor="#6B7280" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
    {error ? <Text style={s.error}>{error}</Text> : null}
    <View style={s.row}><TouchableOpacity style={s.button} onPress={add}><Text style={s.buttonText}>Add customer</Text></TouchableOpacity></View>
    <Text style={s.section}>Customers</Text>
    <TextInput accessibilityLabel="Search customers" style={s.input} placeholder="Search name or phone" placeholderTextColor="#6B7280" value={search} onChangeText={setSearch} />
    {rows.length === 0 ? <Text style={s.muted}>No customers yet.</Text> : rows.map((c) => <TouchableOpacity key={c.id} style={s.between} onPress={() => router.push({ pathname: "/owner/customer/[id]", params: { id: c.id } })}>
      <View><Text style={s.text}>{c.name}</Text><Text style={s.muted}>{c.phone || "No phone"}</Text></View>
      <Text style={c.balance > 0 ? s.owed : s.clear}>{c.balance > 0 ? `₹${c.balance.toFixed(2)} due` : c.balance < 0 ? `₹${(-c.balance).toFixed(2)} advance` : "Clear"}</Text>
    </TouchableOpacity>)}
    <Text style={s.section}>Backup</Text>
    <Text style={s.muted}>Data lives only on this phone. Export a backup regularly (share it to WhatsApp or email yourself).</Text>
    <View style={s.row}><TouchableOpacity style={s.outline} onPress={() => Share.share({ message: exportBackup(data) })}><Text style={s.accent}>Export backup</Text></TouchableOpacity></View>
    <TextInput accessibilityLabel="Paste backup" style={[s.input, { minHeight: 70 }]} multiline placeholder="Paste backup text here to restore" placeholderTextColor="#6B7280" value={backupText} onChangeText={(t) => { setBackupText(t); setBackupMsg(""); }} />
    {backupMsg ? <Text style={backupMsg.startsWith("Restored") ? s.muted : s.error}>{backupMsg}</Text> : null}
    <View style={s.row}><TouchableOpacity style={s.outline} onPress={restore}><Text style={s.accent}>Import backup</Text></TouchableOpacity></View>
  </ScrollView>;
}

export default function OwnerScreen() {
  return <PinGate><OwnerHome /></PinGate>;
}
