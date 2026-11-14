import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import PinGate from "../../../components/PinGate";
import { owner as s } from "../../../components/ownerStyles";
import { useCart } from "../../../context/CartContext";
import { useKhata } from "../../../context/KhataContext";
import { theme } from "../../../theme";
import { balanceOf } from "../../../utils/khata";

function AddOrder({ id }: { id: string }) {
  const router = useRouter();
  const { orders } = useCart();
  const { data, addCustomer, addEntry } = useKhata();
  const order = orders.find((o) => o.id === id);
  if (!order) return <View style={s.root}><Text style={[s.text, { padding: 40 }]}>Order not found.</Text></View>;
  const already = data.entries.some((e) => e.orderId === order.id);
  const phone = order.address.phone.replace(/\D/g, "");
  const match = data.customers.find((c) => phone && c.phone === phone);

  const credit = (customerId: string) => {
    if (already) return Alert.alert("Already added", "This order is already in the khata.");
    addEntry({ customerId, type: "credit", amount: order.total, orderId: order.id, note: `Order ${order.id}` });
    router.replace({ pathname: "/owner/customer/[id]", params: { id: customerId } });
  };

  return <ScrollView style={s.root} contentContainerStyle={s.container}>
    <View style={s.headerRow}>
      <TouchableOpacity accessibilityLabel="Go back" onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} /></TouchableOpacity>
      <Text style={s.title}>Add to khata</Text><View style={{ width: 24 }} />
    </View>
    <View style={s.card}><Text style={s.text}>{order.id}</Text><Text style={s.muted}>{order.address.name} · {order.address.phone}</Text><Text style={s.big}>₹{order.total.toFixed(2)}</Text></View>
    {already && <Text style={s.error}>This order is already added to the khata.</Text>}
    {match ? <TouchableOpacity style={s.button} onPress={() => credit(match.id)}><Text style={s.buttonText}>Add to {match.name} (matched by phone)</Text></TouchableOpacity>
      : <TouchableOpacity style={s.button} onPress={() => credit(addCustomer(order.address.name, phone).id)}><Text style={s.buttonText}>Create {order.address.name} and add</Text></TouchableOpacity>}
    <Text style={s.section}>Or choose an existing customer</Text>
    {data.customers.length === 0 ? <Text style={s.muted}>No customers yet.</Text> : data.customers.map((c) => <TouchableOpacity key={c.id} style={s.between} onPress={() => credit(c.id)}><Text style={s.text}>{c.name}</Text><Text style={s.muted}>₹{balanceOf(data.entries, c.id).toFixed(2)}</Text></TouchableOpacity>)}
  </ScrollView>;
}

export default function AddOrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PinGate><AddOrder id={String(id)} /></PinGate>;
}
