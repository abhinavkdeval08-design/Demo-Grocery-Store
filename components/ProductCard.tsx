import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useT } from "../i18n";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { theme } from "../theme";
import type { Product } from "../types/product";
import { useCart } from "../context/CartContext";

type Props = {
  product: Product;
  onAdd?: () => void;
  onPress?: () => void;
  horizontal?: boolean;
  badgeText?: string;
};

export default function ProductCard({ product, onAdd, onPress, horizontal = false, badgeText }: Props) {
  const { t } = useT();
  const router = useRouter();
  const { items, addToCart, removeFromCart } = useCart();
  const quantity = items.find((item) => item.id === product.id)?.quantity ?? 0;
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const openDetail = onPress ?? (() => router.push(`/product/${product.id}`));
  useEffect(() => { scale.value = withSpring(quantity ? 1.02 : 1); }, [quantity, scale]);
  const discounted = product.mrp !== undefined && product.mrp > product.price;
  return (
    <TouchableOpacity accessibilityLabel={`View ${product.name}`} activeOpacity={0.92} onPress={openDetail} style={[styles.card, horizontal && styles.horizontalCard]}>
      <View style={[styles.imageWrap, horizontal && styles.horizontalImage]}>
        {product.image ? <Image source={product.image} style={styles.image} contentFit="cover" placeholder={{ blurhash: "LEHV6nWB2yk8pyo0adR*.7kCMdnj" }} cachePolicy="memory-disk" /> : <Ionicons name="basket" size={30} color={theme.colors.textPrimary} />}
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
          {product.inStock === false ? <Text style={styles.outOfStock}>{t("product.outOfStock")}</Text> : (
            <Animated.View style={animatedStyle}>
              {quantity === 0 ? <TouchableOpacity accessibilityLabel={`Add ${product.name} to cart`} style={styles.addButton} onPress={() => { (onAdd ?? (() => addToCart(product)))(); Haptics.selectionAsync(); }} activeOpacity={0.9}>
                <Ionicons name="add" size={16} color="#022C22" /><Text style={styles.addText}>{t("product.add")}</Text>
              </TouchableOpacity> : <View style={styles.stepper}>
                <TouchableOpacity accessibilityLabel={`Remove one ${product.name}`} hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }} style={styles.stepButton} onPress={() => { removeFromCart(product.id); Haptics.selectionAsync(); }}><Ionicons name="remove" size={16} color={theme.colors.textPrimary} /></TouchableOpacity>
                <Text style={styles.quantity}>{quantity}</Text>
                <TouchableOpacity accessibilityLabel={`Add one ${product.name}`} hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }} style={styles.stepButton} onPress={() => { addToCart(product); Haptics.selectionAsync(); }}><Ionicons name="add" size={16} color={theme.colors.textPrimary} /></TouchableOpacity>
              </View>}
            </Animated.View>
          )}
        </View>
      </View>
    </TouchableOpacity>
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
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 },
  price: { fontSize: 16, fontWeight: "700", color: theme.colors.accent },
  mrp: { fontSize: 11, color: "#6B7280", textDecorationLine: "line-through" },
  addButton: { minHeight: 44, flexDirection: "row", alignItems: "center", paddingHorizontal: 10, borderRadius: 999, backgroundColor: theme.colors.accent, gap: 4 },
  addText: { fontSize: 12, fontWeight: "700", color: "#022C22" },
  stepper: { flexDirection: "row", alignItems: "center", borderRadius: 999, backgroundColor: theme.colors.accent, minHeight: 34 },
  stepButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  quantity: { minWidth: 18, textAlign: "center", fontSize: 13, fontWeight: "700", color: "#022C22" },
  outOfStock: { fontSize: 11, color: "#FCA5A5", fontWeight: "600" },
});
