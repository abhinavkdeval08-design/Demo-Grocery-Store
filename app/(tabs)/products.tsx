import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ProductCard from "../../components/ProductCard";
import { PRODUCTS } from "../../data/products";
import { STORE } from "../../config/store";
import { theme } from "../../theme";
import { useCart } from "../../context/CartContext";

export default function Products() {
  const { addToCart } = useCart();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ filter?: string }>();
  const categories = React.useMemo(() => ["All", ...new Set(PRODUCTS.map((item) => item.category))], []);
  const [activeFilter, setActiveFilter] = React.useState(params.filter && categories.includes(params.filter) ? params.filter : "All");
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<"default" | "low" | "high" | "name">("default");

  React.useEffect(() => {
    if (params.filter && categories.includes(params.filter)) setActiveFilter(params.filter);
  }, [params.filter, categories]);

  const filteredProducts = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = PRODUCTS.filter((product) =>
      (activeFilter === "All" || product.category === activeFilter) &&
      (!query || `${product.name} ${product.unit ?? ""} ${product.category}`.toLowerCase().includes(query)),
    );
    return [...result].sort((a, b) =>
      sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : sort === "name" ? a.name.localeCompare(b.name) : 0,
    );
  }, [activeFilter, search, sort]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 32 }]}>
      <View style={styles.headerRow}>
        <View><Text style={styles.screenTitle}>Shop</Text><Text style={styles.screenSubtitle}>All items from {STORE.name} in one place.</Text></View>
        <Ionicons name="funnel-outline" size={20} color={theme.colors.textSecondary} />
      </View>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
        <TextInput value={search} onChangeText={setSearch} placeholder="Search products" placeholderTextColor="#6B7280" style={styles.search} />
      </View>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => <TouchableOpacity style={[styles.filterChip, activeFilter === item && styles.filterChipActive]} onPress={() => setActiveFilter(item)}><Text style={[styles.filterText, activeFilter === item && styles.filterTextActive]}>{item}</Text></TouchableOpacity>}
      />
      <View style={styles.sortRow}>
        {([["default", "Featured"], ["low", "Price ↑"], ["high", "Price ↓"], ["name", "Name A–Z"]] as const).map(([value, label]) => <TouchableOpacity key={value} onPress={() => setSort(value)}><Text style={[styles.sortText, sort === value && styles.sortActive]}>{label}</Text></TouchableOpacity>)}
      </View>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => <ProductCard product={item} horizontal onAdd={() => addToCart(item)} />}
        ListEmptyComponent={<Text style={styles.empty}>No products found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerRow: { paddingHorizontal: 16, marginBottom: 12, flexDirection: "row", justifyContent: "space-between" },
  screenTitle: { fontSize: 22, fontWeight: "700", color: theme.colors.textPrimary },
  screenSubtitle: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
  searchBox: { marginHorizontal: 16, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderStrong },
  search: { flex: 1, color: theme.colors.textPrimary },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 10 },
  filterChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "rgba(55,65,81,0.8)" },
  filterChipActive: { borderColor: theme.colors.accent, backgroundColor: "rgba(34,197,94,0.12)" },
  filterText: { fontSize: 11, color: theme.colors.textSecondary },
  filterTextActive: { color: theme.colors.accent, fontWeight: "600" },
  sortRow: { flexDirection: "row", gap: 14, paddingHorizontal: 16, paddingBottom: 12 },
  sortText: { fontSize: 11, color: theme.colors.textSecondary },
  sortActive: { color: theme.colors.accent, fontWeight: "600" },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { color: theme.colors.textSecondary, textAlign: "center", marginTop: 30 },
});
