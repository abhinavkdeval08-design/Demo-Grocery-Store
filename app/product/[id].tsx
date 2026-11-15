import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useT } from "../../i18n";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ProductCard from "../../components/ProductCard";
import { useCatalog } from "../../context/CatalogContext";
import { useCart } from "../../context/CartContext";
import { theme } from "../../theme";

export default function ProductDetail() {
  const { t } = useT();
  const { products } = useCatalog();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const product = products.find((item) => item.id === id);
  const { items, addToCart, removeFromCart } = useCart();
  if (!product) return <View style={styles.center}><Text style={styles.title}>{t("pd.notfound")}</Text></View>;
  const quantity = items.find((item) => item.id === product.id)?.quantity ?? 0;
  return <View style={styles.container}>
    <Stack.Screen options={{ presentation: "modal" }} />
    <TouchableOpacity accessibilityLabel="Close product details" style={styles.close} onPress={() => router.back()}><Ionicons name="close" size={22} color={theme.colors.textPrimary} /></TouchableOpacity>
    <ScrollView contentContainerStyle={styles.content}>
      <Image source={product.image} style={styles.image} contentFit="cover" placeholder={{ blurhash: "LEHV6nWB2yk8pyo0adR*.7kCMdnj" }} />
      <Text style={styles.category}>{product.category}</Text><Text style={styles.title}>{product.name}</Text><Text style={styles.unit}>{product.unit}</Text>
      <View style={styles.priceRow}><Text style={styles.price}>₹{product.price}</Text>{product.mrp ? <Text style={styles.mrp}>MRP ₹{product.mrp}</Text> : null}</View>
      <Text style={styles.description}>{product.description ?? `Quality ${product.name.toLowerCase()} selected for everyday cooking and value.`}</Text>
      {product.inStock === false ? <Text style={styles.out}>{t("pd.oos")}</Text> : <View style={styles.actionRow}>
        {quantity > 0 && <View style={styles.stepper}><TouchableOpacity accessibilityLabel="Remove item" onPress={() => { removeFromCart(product.id); Haptics.selectionAsync(); }}><Ionicons name="remove" size={20} color={theme.colors.textPrimary} /></TouchableOpacity><Text style={styles.quantity}>{quantity}</Text><TouchableOpacity accessibilityLabel="Add item" onPress={() => { addToCart(product); Haptics.selectionAsync(); }}><Ionicons name="add" size={20} color={theme.colors.textPrimary} /></TouchableOpacity></View>}
        <TouchableOpacity accessibilityLabel={`Add ${product.name} to cart`} style={styles.add} onPress={() => { addToCart(product); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}><Text style={styles.addText}>{quantity ? t("pd.more") : t("pd.add")}</Text></TouchableOpacity>
      </View>}
      <Text style={styles.section}>{t("pd.related")}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.related}>{products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4).map((item) => <View key={item.id} style={styles.relatedCard}><ProductCard product={item} /></View>)}</ScrollView>
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background }, content: { padding: 20, paddingTop: 70, paddingBottom: 40 }, close: { position: "absolute", right: 18, top: 52, zIndex: 2, width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.surfaceElevated }, image: { width: "100%", aspectRatio: 1, borderRadius: 24, backgroundColor: theme.colors.surfaceElevated }, category: { color: theme.colors.accent, marginTop: 20, fontSize: 12, fontWeight: "700" }, title: { color: theme.colors.textPrimary, fontSize: 26, fontWeight: "800", marginTop: 6 }, unit: { color: theme.colors.textSecondary, marginTop: 6 }, priceRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 }, price: { color: theme.colors.accent, fontSize: 22, fontWeight: "800" }, mrp: { color: theme.colors.textSecondary, textDecorationLine: "line-through" }, description: { color: theme.colors.textSecondary, lineHeight: 22, marginTop: 18 }, actionRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 24 }, add: { flex: 1, minHeight: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.accent }, addText: { color: "#022C22", fontWeight: "800" }, stepper: { flexDirection: "row", alignItems: "center", gap: 18, paddingHorizontal: 14, minHeight: 48, borderRadius: 16, backgroundColor: theme.colors.surfaceElevated }, quantity: { color: theme.colors.textPrimary, fontWeight: "800" }, out: { color: "#FCA5A5", marginTop: 24 }, section: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 32, marginBottom: 12 }, related: { gap: 12 }, relatedCard: { width: 190 }, center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background } });
