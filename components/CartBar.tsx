import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import { useCart } from "../context/CartContext";
import { STORE } from "../config/store";
import { theme } from "../theme";

export default function CartBar() {
  const { totalItems, totalPrice } = useCart();
  const router = useRouter();
  if (!totalItems) return null;
  return <Animated.View entering={SlideInDown.duration(220)} exiting={SlideOutDown.duration(180)} style={styles.wrap}>
    <TouchableOpacity accessibilityLabel="View cart" style={styles.button} onPress={() => router.push("/(tabs)/cart")}>
      <Text style={styles.summary}>{totalItems} item{totalItems === 1 ? "" : "s"} · ₹{totalPrice}</Text>
      <Text style={styles.promise}>Delivery in {STORE.deliveryPromise}</Text>
      <Ionicons name="arrow-forward" size={20} color="#022C22" />
    </TouchableOpacity>
  </Animated.View>;
}
const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 16, right: 16, bottom: 92, zIndex: 5 },
  button: { minHeight: 58, borderRadius: 18, paddingHorizontal: 16, backgroundColor: theme.colors.accent, flexDirection: "row", alignItems: "center", gap: 10, elevation: 8 },
  summary: { color: "#022C22", fontWeight: "800", fontSize: 14 },
  promise: { flex: 1, color: "#14532D", fontSize: 11 },
});
