// app/(tabs)/cart.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as React from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../theme";
import { useCart } from "../cart/CartContext";

const STORE_WHATSAPP_NUMBER = "916377596085";

export default function Cart() {
  const { items, totalItems, totalPrice, addToCart, removeFromCart, clearCart } =
    useCart();
  const router = useRouter();

  const isEmpty = items.length === 0;
  const deliveryFee = isEmpty ? 0 : 0;
  const grandTotal = totalPrice + deliveryFee;

  const [note, setNote] = React.useState("");
  const [customerName, setCustomerName] = React.useState("");
  const [customerAddress, setCustomerAddress] = React.useState("");

  const buildWhatsAppMessage = () => {
    if (items.length === 0) return "";

    const lines = items
      .map(
        (it) =>
          `• ${it.name} x${it.quantity} = ₹${it.price * it.quantity}`
      )
      .join("\n");

    const headerLines: string[] = [];

    if (customerName.trim().length > 0) {
      headerLines.push(`Name: ${customerName.trim()}`);
    }

    if (customerAddress.trim().length > 0) {
      headerLines.push(`Address: ${customerAddress.trim()}`);
    }

    const parts = [
      "🧺 Awad Trading - New order",
      "",
      ...headerLines,
      headerLines.length ? "" : "",
      lines,
      "",
      `Items: ${totalItems}`,
      `Total: ₹${grandTotal.toFixed(2)}`,
    ];

    if (note.trim().length > 0) {
      parts.push("", `Note: ${note.trim()}`);
    }

    return parts.join("\n");
  };

  const handleOrderOnWhatsApp = async () => {
    if (isEmpty) return;

    if (!customerName.trim() || !customerAddress.trim()) {
      Alert.alert(
        "Add your details",
        "Please enter your name and delivery address to place the order."
      );
      return;
    }

    const msg = encodeURIComponent(buildWhatsAppMessage());
    const phone = STORE_WHATSAPP_NUMBER;
    const url = `https://wa.me/${phone}?text=${msg}`;

    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert(
        "WhatsApp not available",
        "Please install WhatsApp to complete your order."
      );
      return;
    }

    await Linking.openURL(url);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <View style={styles.cardWrapper}>
          <Text style={styles.title}>Your Cart</Text>
          <Text style={styles.subtitle}>
            {isEmpty
              ? "Review your picks before checkout."
              : `${totalItems} item${totalItems > 1 ? "s" : ""} in cart`}
          </Text>

          {!isEmpty && (
            <ScrollView
              style={{ marginTop: 8 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Customer details */}
              <View style={styles.addressCard}>
                <View style={styles.addressRow}>
                  <Ionicons name="person-circle-outline" size={20} color="#A5B4FC" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addressLabel}>Who is receiving?</Text>
                    <TextInput
                      style={styles.textField}
                      placeholder="Your full name"
                      placeholderTextColor="#6B7280"
                      value={customerName}
                      onChangeText={setCustomerName}
                    />
                  </View>
                </View>

                <View style={[styles.addressRow, { alignItems: "flex-start" }]}>
                  <Ionicons name="home-outline" size={18} color="#A5B4FC" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addressLabel}>Delivery address</Text>
                    <TextInput
                      style={[styles.textField, { minHeight: 40 }]}
                      placeholder="Village, landmark, pincode"
                      placeholderTextColor="#6B7280"
                      value={customerAddress}
                      onChangeText={setCustomerAddress}
                      multiline
                    />

                    {/* Saved address pills (future-ready) */}
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 8,
                        marginTop: 6,
                      }}
                    >
                      <TouchableOpacity style={styles.addressPillPrimary}>
                        <Text style={styles.addressPillTextPrimary}>Home</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.addressPill}>
                        <Text style={styles.addressPillText}>Work</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.noteBox}>
                  <Ionicons
                    name="chatbox-ellipses-outline"
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Add order note (optional)…"
                    placeholderTextColor="#6B7280"
                    value={note}
                    onChangeText={setNote}
                    multiline
                  />
                </View>
              </View>

              {/* Items list */}
              <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                style={{ marginTop: 12, maxHeight: 260 }}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                renderItem={({ item }) => (
                  <View style={styles.itemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {item.unit ? (
                        <Text style={styles.itemUnit}>{item.unit}</Text>
                      ) : null}
                      <Text style={styles.itemPrice}>
                        ₹{item.price} · ₹{item.price * item.quantity} total
                      </Text>
                    </View>

                    <View style={styles.qtyControl}>
                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => removeFromCart(item.id)}
                      >
                        <Ionicons name="remove" size={16} color="#E5E7EB" />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => addToCart(item)}
                      >
                        <Ionicons name="add" size={16} color="#E5E7EB" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            </ScrollView>
          )}

          {isEmpty && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrapper}>
                <Ionicons name="cart-outline" size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>Cart feels a little light</Text>
              <Text style={styles.emptyText}>
                Add fresh staples from Awad Trading and we will have them at your
                door in minutes.
              </Text>

              {/* Quick category chips */}
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
                {["Daily use", "Staples"].map((label) => (
                  <TouchableOpacity
                    key={label}
                    style={styles.quickFilterChip}
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/products",
                        params: { filter: label },
                      })
                    }
                  >
                    <Text style={styles.quickFilterText}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push("/(tabs)/products")}
              >
                <Text style={styles.browseButtonText}>Browse products</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Checkout bar */}
        <View style={styles.checkoutBar}>
          {/* Compact order summary */}
          <View style={styles.checkoutSummaryTop}>
            <Text style={styles.summaryLeft}>
              {totalItems} items · ₹{grandTotal.toFixed(2)}
            </Text>
            {!isEmpty && (
              <Text style={styles.summaryRight}>Est. delivery 20–30 mins</Text>
            )}
          </View>

          <View style={styles.checkoutSummary}>
            <Text style={styles.totalLabel}>Items total</Text>
            <Text style={styles.totalValue}>₹{totalPrice.toFixed(2)}</Text>
            <Text style={styles.totalMeta}>
              Delivery: {deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(2)}`}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.checkoutButton,
              isEmpty && { opacity: 0.4 },
            ]}
            disabled={isEmpty}
            onPress={handleOrderOnWhatsApp}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#022C22" />
            <Text style={styles.checkoutText}>
              {isEmpty ? "Add items to continue" : "Place order on WhatsApp"}
            </Text>
          </TouchableOpacity>

          {!isEmpty && (
            <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
              <Text style={styles.clearText}>Clear cart</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  cardWrapper: {
    flex: 1,
    marginTop: 64,
    marginHorizontal: 16,
    borderRadius: 26,
    padding: 20,
    backgroundColor: "rgba(15,23,42,0.98)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.40)",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginBottom: 10,
  },
  addressCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.5)",
    backgroundColor: "#020617",
    padding: 12,
    marginBottom: 10,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  addressLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  textField: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    paddingVertical: 4,
  },
  addressPillPrimary: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "rgba(55,65,81,0.9)",
  },
  addressPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(55,65,81,0.5)",
  },
  addressPillTextPrimary: {
    fontSize: 11,
    color: "#E5E7EB",
  },
  addressPillText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  noteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "rgba(55,65,81,0.9)",
  },
  noteInput: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textPrimary,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(55,65,81,0.8)",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E5E7EB",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 18,
  },
  quickFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "rgba(55,65,81,0.8)",
  },
  quickFilterText: {
    fontSize: 12,
    color: "#E5E7EB",
  },
  browseButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  browseButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.accent,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  itemUnit: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 12,
    color: "#A5B4FC",
  },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(55,65,81,0.8)",
  },
  qtyButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    paddingHorizontal: 6,
  },
  checkoutBar: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(55,65,81,0.9)",
    backgroundColor: "rgba(15,23,42,0.99)",
  },
  checkoutSummaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryLeft: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  summaryRight: {
    fontSize: 12,
    color: "#6EE7B7",
  },
  checkoutSummary: {
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  totalMeta: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  checkoutButton: {
    marginTop: 4,
    backgroundColor: theme.colors.accent,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  checkoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#022C22",
  },
  clearButton: {
    marginTop: 8,
    alignItems: "center",
  },
  clearText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});
