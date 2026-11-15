import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useT } from "../../i18n";
import React from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ProductCard from "../../components/ProductCard";
import { useCatalog } from "../../context/CatalogContext";
import { STORE } from "../../config/store";
import { theme } from "../../theme";
import { useProductSearch } from "../../hooks/useProductSearch";
import CartBar from "../../components/CartBar";

export default function Products() {
  const { t, cat } = useT();
  const { products, refresh, error } = useCatalog();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ filter?: string }>();
  const categories = React.useMemo(() => ["All", ...new Set(products.map((item) => item.category))], [products]);
  const [activeFilter, setActiveFilter] = React.useState(params.filter && categories.includes(params.filter) ? params.filter : "All");
  const { query: search, setQuery: setSearch, results: searchedProducts } = useProductSearch(products);
  const [sort, setSort] = React.useState<"default" | "low" | "high" | "name">("default");
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (params.filter && categories.includes(params.filter)) setActiveFilter(params.filter);
  }, [params.filter, categories]);

  const filteredProducts = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = products.filter((product) =>
      (activeFilter === "All" || product.category === activeFilter) &&
      (!query || searchedProducts.some((result) => result.id === product.id)),
    );
    return [...result].sort((a, b) =>
      sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : sort === "name" ? a.name.localeCompare(b.name) : 0,
    );
  }, [activeFilter, search, sort, searchedProducts, products]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 32 }]}>
      <View style={styles.headerRow}>
        <View><Text style={styles.screenTitle}>{t("shop.title")}</Text><Text style={styles.screenSubtitle}>All items from {STORE.name} in one place.</Text></View>
        <Ionicons name="funnel-outline" size={20} color={theme.colors.textSecondary} />
      </View>
      {error ? <Text accessibilityRole="alert" style={styles.notice}>{t("shop.saved")}</Text> : null}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
        <TextInput accessibilityLabel="Search products" value={search} onChangeText={setSearch} placeholder={t("shop.search")} placeholderTextColor="#6B7280" style={styles.search} />
      </View>
      <FlatList
        horizontal
        style={{ flexGrow: 0, flexShrink: 0 }}
        data={categories}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => <TouchableOpacity style={[styles.filterChip, activeFilter === item && styles.filterChipActive]} onPress={() => setActiveFilter(item)}><Text style={[styles.filterText, activeFilter === item && styles.filterTextActive]}>{item === "All" ? t("filter.all") : cat(item)}</Text></TouchableOpacity>}
      />
      <View style={styles.sortRow}>
        {([["default", t("sort.featured")], ["low", t("sort.low")], ["high", t("sort.high")], ["name", t("sort.name")]] as const).map(([value, label]) => <TouchableOpacity key={value} onPress={() => setSort(value)}><Text style={[styles.sortText, sort === value && styles.sortActive]}>{label}</Text></TouchableOpacity>)}
      </View>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await refresh(); setRefreshing(false); }} tintColor={theme.colors.accent} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => <ProductCard product={item} horizontal />}
        ListEmptyComponent={<Text style={styles.empty}>{t("shop.empty")}</Text>}
      />
      <CartBar />
    </View>
  );
}

const styles = StyleSheet.create({
  notice: { color: "#FACC15", fontSize: 12, marginHorizontal: 16, marginBottom: 8 },
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
