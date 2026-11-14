import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCatalog } from "../../context/CatalogContext";
import { useCart } from "../../context/CartContext";
import { planReorder, reorderMessage } from "../../utils/buyAgain";
import { theme } from "../../theme";

export default function Orders() {
  const { products } = useCatalog();
  const { orders, addToCart } = useCart();
  const router = useRouter();
  const reorder = (order: (typeof orders)[number]) => {
    const plan = planReorder(order, products);
    plan.lines.forEach(({ product, quantity }) => { for (let i = 0; i < quantity; i += 1) addToCart(product); });
    const message = reorderMessage(plan);
    if (message) Alert.alert(plan.lines.length ? "Reorder note" : "Nothing could be added", message);
    if (plan.lines.length) router.push("/(tabs)/cart");
  };
  return <ScrollView style={styles.root} contentContainerStyle={styles.container}>
    <Text style={styles.title}>Orders</Text><Text style={styles.subtitle}>Your saved order history</Text>
    {!orders.length ? <View style={styles.empty}><Ionicons name="receipt-outline" size={40} color="#9CA3AF" /><Text style={styles.text}>No orders yet</Text><TouchableOpacity style={styles.button} onPress={() => router.push("/(tabs)/products")}><Text style={styles.buttonText}>Start shopping</Text></TouchableOpacity></View> : orders.map((order) => <View style={styles.card} key={order.id}><View style={styles.row}><View><Text style={styles.id}>{order.id}</Text><Text style={styles.muted}>{new Date(order.createdAt).toLocaleDateString()} · {order.paymentMethod === "upi" ? "UPI" : "COD"}</Text></View><Text style={styles.total}>₹{order.total.toFixed(2)}</Text></View><Text style={styles.items}>{order.items.map((item) => `${item.name} ×${item.quantity}`).join(" · ")}</Text><TouchableOpacity style={styles.outline} onPress={() => reorder(order)}><Text style={styles.accent}>Reorder</Text></TouchableOpacity></View>)}
  </ScrollView>;
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: theme.colors.background }, container: { padding: 20, paddingTop: 64, paddingBottom: 100 }, title: { color: theme.colors.textPrimary, fontSize: 24, fontWeight: "700" }, subtitle: { color: theme.colors.textSecondary, marginTop: 4, marginBottom: 18 }, empty: { alignItems: "center", gap: 14, paddingTop: 100 }, text: { color: theme.colors.textPrimary, fontSize: 16 }, card: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.borderStrong }, row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, id: { color: theme.colors.textPrimary, fontWeight: "700" }, muted: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 }, total: { color: theme.colors.accent, fontWeight: "700" }, items: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 19, marginVertical: 12 }, outline: { alignSelf: "flex-start", borderWidth: 1, borderColor: theme.colors.accent, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 }, accent: { color: theme.colors.accent, fontWeight: "600" }, button: { backgroundColor: theme.colors.accent, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 11 }, buttonText: { color: "#022C22", fontWeight: "700" } });
