// app/(tabs)/products.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PRODUCTS } from "../../data/products";
import { theme } from "../../theme";
import { useCart } from "../cart/CartContext";

const FILTERS = ["All", "Daily use", "Staples", "Snacks"];

export default function Products() {
  const { addToCart } = useCart();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = React.useState("All");

  const filteredProducts = React.useMemo(() => {
    if (activeFilter === "All") return PRODUCTS;
    // Abhi ke liye simple static mapping; baad me product data me tag daal sakta hai
    if (activeFilter === "Daily use") return PRODUCTS.slice(0, 6);
    if (activeFilter === "Staples") return PRODUCTS.slice(2, 10);
    return PRODUCTS;
  }, [activeFilter]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 32 },
      ]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.screenTitle}>Shop</Text>
          <Text style={styles.screenSubtitle}>
            All items from Awad Trading in one place.
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Ionicons
            name="funnel-outline"
            size={20}
            color={theme.colors.textSecondary}
          />
        </View>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = activeFilter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                active && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.9}
            >
              <Text
                style={[
                  styles.filterText,
                  active && styles.filterTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={styles.name} numberOfLines={2}>
                  {item.name}
                </Text>
                <Ionicons name="heart-outline" size={20} color="#6B7280" />
              </View>

              <Text style={styles.weight}>{item.unit}</Text>

              <View style={styles.priceRow}>
                <View style={styles.priceBlock}>
                  <Text style={styles.currentPrice}>₹{item.price}</Text>
                  <Text style={styles.mrp}>
                    ₹{(item.price * 1.25).toFixed(0)}
                  </Text>
                </View>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>Save 25%</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Ionicons
                  name="leaf-outline"
                  size={13}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.metaText}>Fresh stock · Store pick</Text>
              </View>

              <View style={styles.bottomRow}>
                <Text style={styles.subPrice}>Incl. of all taxes</Text>
                <TouchableOpacity
                  style={styles.button}
                  activeOpacity={0.9}
                  onPress={() => addToCart(item)}
                >
                  <Ionicons name="add" size={16} color="#022C22" />
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerRow: {
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  screenSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(55,65,81,0.8)",
    backgroundColor: "rgba(15,23,42,0.8)",
  },
  filterChipActive: {
    borderColor: theme.colors.accent,
    backgroundColor: "rgba(34,197,94,0.12)",
  },
  filterText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  filterTextActive: {
    color: theme.colors.accent,
    fontWeight: "600",
  },
  card: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  image: {
    width: 90,
    height: 90,
    marginRight: 16,
    borderRadius: 18,
    backgroundColor: "#0F172A",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginRight: 8,
  },
  weight: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  priceBlock: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.accent,
  },
  mrp: {
    fontSize: 12,
    color: "#6B7280",
    textDecorationLine: "line-through",
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(34,197,94,0.15)",
  },
  discountText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.accent,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subPrice: {
    fontSize: 11,
    color: "#6B7280",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    gap: 4,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#022C22",
  },
});
