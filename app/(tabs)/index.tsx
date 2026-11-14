import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { BANNERS } from "../../data/banners";
import { PRODUCTS } from "../../data/products";
import { STORE } from "../../config/store";
import { useCart } from "../../context/CartContext";
import { useProductSearch } from "../../hooks/useProductSearch";
import { theme } from "../../theme";
import ProductCard from "../../components/ProductCard";
import CartBar from "../../components/CartBar";

const CATEGORIES = [
  ["Staples", "basket-outline"], ["Daily use", "water-outline"], ["Snacks", "fast-food-outline"],
  ["Spices", "flame-outline"], ["Home care", "sparkles-outline"],
] as const;

export default function Home() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { query, setQuery, results, recent, submitSearch } = useProductSearch(PRODUCTS);
  const [banner, setBanner] = React.useState(0);
  React.useEffect(() => { const timer = setInterval(() => setBanner((value) => (value + 1) % BANNERS.length), 4500); return () => clearInterval(timer); }, []);
  const sections = [
    { title: "Popular picks", items: PRODUCTS.slice(0, 6) },
    { title: "Under ₹100", items: PRODUCTS.filter((item) => item.price < 100).slice(0, 6) },
  ];
  const searchActive = query.trim().length > 0;
  return <View style={styles.screen}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.top}><View><Text style={styles.label}>Delivers to</Text><Text style={styles.location}><Ionicons name="location" size={15} color="#A5B4FC" /> {STORE.deliveryAddress}</Text></View><View style={styles.avatar}><Text style={styles.avatarText}>A</Text></View></View>
      <View style={[styles.banner, { backgroundColor: BANNERS[banner].color }]}><View style={{ flex: 1 }}><Text style={styles.bannerTitle}>{BANNERS[banner].title}</Text><Text style={styles.bannerSubtitle}>{BANNERS[banner].subtitle}</Text></View><Ionicons name={BANNERS[banner].icon} size={54} color="#BBF7D0" /></View>
      <View style={styles.dots}>{BANNERS.map((item, index) => <View key={item.id} style={[styles.dot, index === banner && styles.activeDot]} />)}</View>
      <View style={styles.searchBox}><Ionicons name="search" size={19} color={theme.colors.textSecondary} /><TextInput accessibilityLabel="Search products" value={query} onChangeText={setQuery} onSubmitEditing={() => submitSearch()} returnKeyType="search" placeholder="Search rice, sugar, milk..." placeholderTextColor="#6B7280" style={styles.search} />{query ? <TouchableOpacity accessibilityLabel="Clear search" onPress={() => setQuery("")}><Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} /></TouchableOpacity> : null}</View>
      {searchActive ? <View><Text style={styles.heading}>Search results</Text>{results.length ? <View style={styles.grid}>{results.map((item) => <ProductCard key={item.id} product={item} />)}</View> : <View style={styles.empty}><Ionicons name="search-outline" size={34} color="#6B7280" /><Text style={styles.emptyText}>No matches yet. Try another item.</Text></View>}{recent.length ? <Text style={styles.recent}>Recent: {recent.join("  ·  ")}</Text> : null}</View> : <>
        <Text style={styles.heading}>Shop by category</Text><View style={styles.categories}>{CATEGORIES.map(([name, icon]) => <TouchableOpacity accessibilityLabel={`Shop ${name}`} key={name} style={styles.category} onPress={() => router.push({ pathname: "/(tabs)/products", params: { filter: name } })}><Ionicons name={icon} size={23} color={theme.colors.accent} /><Text style={styles.categoryText}>{name}</Text></TouchableOpacity>)}</View>
        <Text style={styles.heading}>Buy again</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>{PRODUCTS.slice(0, 4).map((item) => <TouchableOpacity accessibilityLabel={`Quick add ${item.name}`} key={item.id} style={styles.quick} onPress={() => addToCart(item)}><Image source={item.image} style={styles.quickImage} /><Text style={styles.quickName} numberOfLines={1}>{item.name}</Text><Text style={styles.quickPrice}>₹{item.price}</Text></TouchableOpacity>)}</ScrollView>
        {sections.map((section) => <View key={section.title}><View style={styles.headingRow}><Text style={styles.heading}>{section.title}</Text><TouchableOpacity accessibilityLabel={`See all ${section.title}`} onPress={() => router.push("/(tabs)/products")}><Text style={styles.seeAll}>See all</Text></TouchableOpacity></View><View style={styles.grid}>{section.items.map((item) => <ProductCard key={item.id} product={item} />)}</View></View>)}
      </>}
    </ScrollView><CartBar />
  </View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background }, content: { padding: 16, paddingTop: 54, paddingBottom: 130 }, top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }, label: { color: theme.colors.textSecondary, fontSize: 11 }, location: { color: theme.colors.textPrimary, fontWeight: "700", marginTop: 4 }, avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: theme.colors.surfaceElevated, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: theme.colors.borderStrong }, avatarText: { color: theme.colors.textPrimary, fontWeight: "800" }, banner: { minHeight: 150, borderRadius: 24, padding: 20, flexDirection: "row", alignItems: "center" }, bannerTitle: { color: theme.colors.textPrimary, fontSize: 20, fontWeight: "800", lineHeight: 25 }, bannerSubtitle: { color: "#BBF7D0", marginTop: 10, fontSize: 12 }, dots: { flexDirection: "row", justifyContent: "center", gap: 5, marginVertical: 10 }, dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#374151" }, activeDot: { width: 18, backgroundColor: theme.colors.accent }, searchBox: { flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: theme.colors.surface, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.borderStrong, paddingHorizontal: 14, minHeight: 50 }, search: { flex: 1, color: theme.colors.textPrimary }, heading: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "800", marginTop: 24, marginBottom: 12 }, headingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, seeAll: { color: theme.colors.accent, fontSize: 12 }, categories: { flexDirection: "row", flexWrap: "wrap", gap: 9 }, category: { width: "18%", minWidth: 60, minHeight: 74, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: theme.colors.surfaceElevated, borderWidth: 1, borderColor: theme.colors.borderStrong, padding: 7 }, categoryText: { color: theme.colors.textSecondary, fontSize: 10, textAlign: "center", marginTop: 7 }, row: { gap: 10 }, quick: { width: 130, padding: 10, borderRadius: 17, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderStrong }, quickImage: { width: "100%", height: 72, borderRadius: 12, backgroundColor: theme.colors.surfaceElevated }, quickName: { color: theme.colors.textPrimary, fontSize: 11, marginTop: 8 }, quickPrice: { color: theme.colors.accent, fontWeight: "800", marginTop: 4 }, grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }, empty: { alignItems: "center", paddingVertical: 36 }, emptyText: { color: theme.colors.textSecondary, marginTop: 10 }, recent: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 16 },
});
