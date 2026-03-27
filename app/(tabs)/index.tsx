// app/(tabs)/index.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { PRODUCTS } from "../../data/products";
import { theme } from "../../theme";
import { Product, useCart } from "../cart/CartContext";

const popularItems: Product[] = PRODUCTS.slice(0, 4);

export default function Home() {
  const { addToCart } = useCart();
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter((p) => {
      const haystack = `${p.name} ${p.unit ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [search]);

  const hasSearch = search.trim().length > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ height: 48 }} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.deliveryLabel}>Delivers to</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color="#A5B4FC" />
            <Text style={styles.locationText}>Santosh Nagar</Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={theme.colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <Text style={styles.avatarSub}>Beta access</Text>
        </View>
      </View>

      {/* Hero */}
      <View style={styles.heroCard}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.heroChip}>• Local favourite</Text>
          <Text style={styles.heroTitle} numberOfLines={1}>
            Awad Trading
          </Text>
          <Text
            style={styles.heroSubtitle}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            Curated groceries, delivered faster..
          </Text>

          <View style={styles.heroPillsRow}>
            <View style={styles.heroPill}>
              <Ionicons name="timer" size={16} color="#BBF7D0" />
              <Text style={styles.heroPillText}>Under 30 mins</Text>
            </View>
            <View style={styles.heroPillOutline}>
              <Ionicons name="shield-checkmark" size={16} color="#A5B4FC" />
              <Text
                style={styles.heroPillOutlineText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                No drama
              </Text>
            </View>
          </View>
        </View>

        {/* Collage */}
        <View style={styles.heroCollage}>
          <Image
            source={{ uri: "https://via.placeholder.com/60x60.png?text=Rice" }}
            style={styles.heroImageSmall}
          />
          <Image
            source={{ uri: "https://via.placeholder.com/60x60.png?text=Oil" }}
            style={[styles.heroImageSmall, { marginTop: 6 }]}
          />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          placeholder="Search for rice, sugar, milk..."
          placeholderTextColor="#6B7280"
          style={styles.search}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons
              name="close-circle"
              size={18}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.voiceButton}>
            <Ionicons name="mic" size={18} color={theme.colors.textPrimary} />
          </View>
        )}
      </View>

      {/* Deals strip / Search header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {hasSearch ? "Search results" : "Deals for you"}
        </Text>
        {!hasSearch && <Text style={styles.sectionAction}>View all</Text>}
      </View>

      {!hasSearch && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingRight: 8 }}
        >
          {PRODUCTS.slice(0, 5).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.dealCard}
              activeOpacity={0.9}
              onPress={() => addToCart(item)}
            >
              <View style={styles.dealBadge}>
                <Ionicons name="sparkles" size={11} color="#F9FAFB" />
                <Text style={styles.dealBadgeText}>Awad pick</Text>
              </View>
              <Text style={styles.dealName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.dealMeta}>{item.unit}</Text>
              <View style={styles.dealPriceRow}>
                <Text style={styles.dealPrice}>₹{item.price}</Text>
                <Text style={styles.dealMRP}>
                  ₹{(item.price * 1.3).toFixed(0)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Products grid: popular or search results */}
      {hasSearch && filtered.length === 0 ? (
        <View
          style={{ marginTop: 12, paddingVertical: 40, alignItems: "center" }}
        >
          <Ionicons name="sad-outline" size={28} color="#6B7280" />
          <Text style={{ marginTop: 8, color: "#9CA3AF", fontSize: 13 }}>
            Couldn’t find that item. Try a different name.
          </Text>
        </View>
      ) : (
        <>
          {!hasSearch && (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular picks</Text>
              <Text style={styles.sectionAction}>See more</Text>
            </View>
          )}

          <View style={styles.grid}>
            {(hasSearch ? filtered : popularItems).map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.badge}>
                  <Ionicons name="star" size={12} color="#FDE68A" />
                  <Text style={styles.badgeText}>
                    {hasSearch ? "Result" : "Bestseller"}
                  </Text>
                </View>

                <View style={styles.cardImagePlaceholder}>
                  <Ionicons
                    name="basket"
                    size={30}
                    color={theme.colors.textPrimary}
                  />
                </View>

                <Text style={styles.cardName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.cardMeta}>
                  {item.unit} · Handpicked stock
                </Text>

                <View style={styles.cardBottomRow}>
                  <View>
                    <Text style={styles.cardPrice}>₹{item.price}</Text>
                    <Text style={styles.cardSubPrice}>
                      MRP ₹{(item.price * 1.2).toFixed(0)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addButton}
                    activeOpacity={0.9}
                    onPress={() => addToCart(item)}
                  >
                    <Ionicons name="add" size={16} color="#022C22" />
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  deliveryLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  avatarWrapper: {
    alignItems: "flex-end",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
  },
  avatarText: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
  },
  avatarSub: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.35)",
    marginBottom: 18,
  },
  heroChip: {
    fontSize: 11,
    color: "#A5B4FC",
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 10,
  },
  heroPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.accentSoft,
    gap: 6,
  },
  heroPillText: {
    fontSize: 11,
    color: "#BBF7D0",
    fontWeight: "600",
  },
  heroPillOutline: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.5)",
    gap: 6,
    maxWidth: 130,
  },
  heroPillOutlineText: {
    fontSize: 11,
    color: "#E5E7EB",
    fontWeight: "500",
  },
  heroCollage: {
    marginLeft: 8,
    alignItems: "flex-end",
    width: 72,
  },
  heroImageSmall: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#0F172A",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    marginBottom: 18,
    gap: 10,
  },
  search: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  voiceButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    marginTop: 4,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  sectionAction: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  dealCard: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    minWidth: 150,
  },
  dealBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#22C55E",
    alignSelf: "flex-start",
    marginBottom: 8,
    gap: 4,
  },
  dealBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#022C22",
  },
  dealName: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  dealMeta: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
    marginBottom: 6,
  },
  dealPriceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  dealPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.accent,
  },
  dealMRP: {
    fontSize: 11,
    color: "#6B7280",
    textDecorationLine: "line-through",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 4,
  },
  card: {
    backgroundColor: theme.colors.surface,
    width: "48%",
    padding: 14,
    borderRadius: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(250,204,21,0.10)",
    gap: 4,
  },
  badgeText: {
    color: "#FDE68A",
    fontSize: 10,
    fontWeight: "600",
  },
  cardImagePlaceholder: {
    width: "100%",
    height: 80,
    borderRadius: 18,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  cardName: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 10,
  },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.accent,
  },
  cardSubPrice: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 1,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.accent,
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#022C22",
  },
});
