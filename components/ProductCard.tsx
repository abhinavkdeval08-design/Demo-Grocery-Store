import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../theme";
import type { Product } from "../types/product";

type Props = {
  product: Product;
  onAdd: () => void;
  horizontal?: boolean;
  badgeText?: string;
};

export default function ProductCard({ product, onAdd, horizontal = false, badgeText }: Props) {
  const discounted = product.mrp !== undefined && product.mrp > product.price;
  return (
    <View style={[styles.card, horizontal && styles.horizontalCard]}>
      <View style={[styles.imageWrap, horizontal && styles.horizontalImage]}>
        {product.image ? <Image source={{ uri: product.image }} style={styles.image} /> : <Ionicons name="basket" size={30} color={theme.colors.textPrimary} />}
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          {badgeText ? <Text style={styles.badge}>{badgeText}</Text> : null}
        </View>
        <Text style={styles.meta}>{product.unit ?? product.category}</Text>
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>₹{product.price}</Text>
            {discounted ? <Text style={styles.mrp}>MRP ₹{product.mrp}</Text> : null}
          </View>
          <TouchableOpacity style={styles.addButton} onPress={onAdd} activeOpacity={0.9}>
            <Ionicons name="add" size={16} color="#022C22" />
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.surface, width: "48%", padding: 14, borderRadius: 22, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.borderStrong },
  horizontalCard: { width: "100%", flexDirection: "row", marginBottom: 0 },
  imageWrap: { height: 80, borderRadius: 18, backgroundColor: "#0F172A", overflow: "hidden", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  horizontalImage: { width: 90, height: 90, marginRight: 16, marginBottom: 0 },
  image: { width: "100%", height: "100%" },
  content: { flex: 1 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", gap: 6 },
  name: { flex: 1, fontSize: 13, fontWeight: "600", color: theme.colors.textPrimary, marginBottom: 4 },
  badge: { fontSize: 10, color: theme.colors.accent },
  meta: { fontSize: 11, color: theme.colors.textSecondary, marginBottom: 10 },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  price: { fontSize: 16, fontWeight: "700", color: theme.colors.accent },
  mrp: { fontSize: 11, color: "#6B7280", textDecorationLine: "line-through" },
  addButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: theme.colors.accent, gap: 4 },
  addText: { fontSize: 12, fontWeight: "700", color: "#022C22" },
});
