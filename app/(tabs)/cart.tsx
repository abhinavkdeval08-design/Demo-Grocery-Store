import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { STORE } from "../../config/store";
import { COUPONS, calculateDiscount, findCoupon } from "../../data/coupons";
import { useCart } from "../../context/CartContext";
import { buildOrderMessage } from "../../utils/buildOrderMessage";
import type { Address, Order, PaymentMethod } from "../../types/product";
import { theme } from "../../theme";

const emptyAddress = (): Address => ({ id: `${Date.now()}`, label: "Home", name: "", phone: "", address: "" });
export default function Cart() {
  const { items, totalItems, totalPrice, addToCart, removeFromCart, clearCart, addresses, saveAddress, deleteAddress, customer, saveOrder } = useCart();
  const router = useRouter();
  const [selectedId, setSelectedId] = React.useState<string | undefined>(addresses[0]?.id);
  const [editing, setEditing] = React.useState<Address | null>(null);
  const [addressError, setAddressError] = React.useState("");
  const [note, setNote] = React.useState("");
  const [couponCode, setCouponCode] = React.useState("");
  const [couponMessage, setCouponMessage] = React.useState("");
  const [couponDiscount, setCouponDiscount] = React.useState(0);
  const [payment, setPayment] = React.useState<PaymentMethod>("cod");
  const selected = addresses.find((address) => address.id === selectedId);
  React.useEffect(() => {
    if (!selectedId && addresses[0]) setSelectedId(addresses[0].id);
  }, [addresses, selectedId]);
  const subtotal = totalPrice;
  const deliveryFee = subtotal >= STORE.freeDeliveryAbove ? 0 : STORE.deliveryFee;
  const grandTotal = Math.max(0, subtotal + deliveryFee - couponDiscount);
  const minimumMet = subtotal >= STORE.minOrder;
  const minimumProgress = Math.min(1, subtotal / STORE.minOrder);
  const freeDeliveryProgress = Math.min(1, subtotal / STORE.freeDeliveryAbove);

  const validate = (address: Address) => {
    if (!address.name.trim()) return "Enter your name";
    if (!/^\d{10}$/.test(address.phone.replace(/\D/g, ""))) return "Phone must be exactly 10 digits";
    if (address.address.trim().length < 10) return "Address must be at least 10 characters";
    return "";
  };
  const save = () => {
    if (!editing) return;
    const error = validate(editing);
    if (error) { setAddressError(error); return; }
    setAddressError("");
    saveAddress({ ...editing, phone: editing.phone.replace(/\D/g, "") });
    setSelectedId(editing.id); setEditing(null);
  };
  const applyCoupon = () => {
    const coupon = findCoupon(couponCode);
    if (!coupon) { setCouponDiscount(0); setCouponMessage("Invalid coupon code"); return; }
    const discount = calculateDiscount(coupon, subtotal);
    if (new Date(coupon.expiresAt).getTime() < Date.now()) { setCouponDiscount(0); setCouponMessage("Coupon expired"); return; }
    if (coupon.minOrder && subtotal < coupon.minOrder) { setCouponDiscount(0); setCouponMessage(`Minimum order ₹${coupon.minOrder} required`); return; }
    if (!discount) { setCouponDiscount(0); setCouponMessage("Coupon could not be applied"); return; }
    setCouponDiscount(discount); setCouponMessage(`${coupon.code} applied: ₹${discount.toFixed(2)} off`);
  };
  const checkout = async () => {
    if (!items.length) return;
    if (!minimumMet) return Alert.alert("Minimum order", `Add ₹${(STORE.minOrder - subtotal).toFixed(2)} more to continue.`);
    if (!selected) return Alert.alert("Add an address", "Choose or add a delivery address.");
    const date = new Date();
    const order: Order = { id: `AT-${date.toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString().slice(-4)}`, items, customer, address: selected, subtotal, deliveryFee, discount: couponDiscount, total: grandTotal, couponCode: couponDiscount ? couponCode.trim().toUpperCase() : undefined, paymentMethod: payment, status: "placed", note: note.trim() || undefined, createdAt: date.toISOString() };
    if (payment === "upi") {
      const upiUrl = `upi://pay?pa=${STORE.upiId}&pn=${encodeURIComponent(STORE.name)}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(order.id)}`;
      if (await Linking.canOpenURL(upiUrl)) await Linking.openURL(upiUrl);
      else { await Clipboard.setStringAsync(STORE.upiId); Alert.alert("UPI app unavailable", `UPI ID ${STORE.upiId} copied. Pay ₹${grandTotal.toFixed(2)} and then place the WhatsApp order.`); }
    }
    const url = `https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent(buildOrderMessage(order))}`;
    if (!(await Linking.canOpenURL(url))) return Alert.alert("WhatsApp unavailable", "Please install WhatsApp to complete your order.");
    await Linking.openURL(url); saveOrder(order); clearCart(); setNote(""); router.push("/(tabs)/orders");
  };
  return <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Cart</Text><Text style={styles.subtitle}>{items.length ? `${totalItems} item${totalItems === 1 ? "" : "s"} in cart` : "Review your picks before checkout."}</Text>
      {items.length === 0 ? <View style={styles.empty}><Ionicons name="cart-outline" size={40} color="#9CA3AF" /><Text style={styles.emptyTitle}>Cart feels a little light</Text><TouchableOpacity style={styles.outline} onPress={() => router.push("/(tabs)/products")}><Text style={styles.accent}>Browse products</Text></TouchableOpacity></View> : <>
        <View style={styles.progress}><Text style={styles.muted}>{minimumMet ? "Minimum order reached" : `₹${(STORE.minOrder - subtotal).toFixed(0)} more to reach minimum order`}</Text><View style={styles.track}><View style={[styles.fill, { width: `${minimumProgress * 100}%` }]} /></View><Text style={styles.muted}>{deliveryFee ? `₹${(STORE.freeDeliveryAbove - subtotal).toFixed(0)} more for free delivery` : "Free delivery unlocked"}</Text><View style={styles.track}><View style={[styles.fill, { width: `${freeDeliveryProgress * 100}%` }]} /></View></View>
        {items.map((item) => <View style={styles.item} key={item.id}><View style={{ flex: 1 }}><Text style={styles.itemName}>{item.name}</Text><Text style={styles.muted}>{item.unit} · ₹{item.price * item.quantity}</Text></View><View style={styles.qty}><TouchableOpacity onPress={() => removeFromCart(item.id)}><Ionicons name="remove" size={17} color="#E5E7EB" /></TouchableOpacity><Text style={styles.qtyText}>{item.quantity}</Text><TouchableOpacity onPress={() => addToCart(item)}><Ionicons name="add" size={17} color="#E5E7EB" /></TouchableOpacity></View></View>)}
        <Text style={styles.section}>Delivery address</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{addresses.map((address) => <TouchableOpacity key={address.id} style={[styles.pill, selectedId === address.id && styles.pillSelected]} onPress={() => setSelectedId(address.id)}><Text style={styles.pillText}>{address.label}: {address.name}</Text><TouchableOpacity onPress={() => setEditing(address)}><Ionicons name="create-outline" size={14} color="#A5B4FC" /></TouchableOpacity><TouchableOpacity onPress={() => { deleteAddress(address.id); if (selectedId === address.id) setSelectedId(undefined); }}><Ionicons name="trash-outline" size={14} color="#FCA5A5" /></TouchableOpacity></TouchableOpacity>)}<TouchableOpacity style={styles.pill} onPress={() => setEditing(emptyAddress())}><Text style={styles.accent}>＋ Add address</Text></TouchableOpacity></ScrollView>
        {editing && <View style={styles.editor}><Text style={styles.section}>{addresses.some((a) => a.id === editing.id) ? "Edit address" : "New address"}</Text><TextInput style={styles.input} placeholder="Name" placeholderTextColor="#6B7280" value={editing.name} onChangeText={(name) => { setEditing({ ...editing, name }); setAddressError(""); }} /><TextInput style={styles.input} placeholder="10-digit phone" placeholderTextColor="#6B7280" keyboardType="phone-pad" value={editing.phone} onChangeText={(phone) => { setEditing({ ...editing, phone }); setAddressError(""); }} /><TextInput style={[styles.input, { minHeight: 55 }]} placeholder="Full delivery address" placeholderTextColor="#6B7280" multiline value={editing.address} onChangeText={(address) => { setEditing({ ...editing, address }); setAddressError(""); }} />{addressError ? <Text style={styles.error}>{addressError}</Text> : null}<View style={styles.row}><TouchableOpacity style={styles.outline} onPress={() => { setEditing(null); setAddressError(""); }}><Text style={styles.muted}>Cancel</Text></TouchableOpacity><TouchableOpacity style={styles.button} onPress={save}><Text style={styles.buttonText}>Save address</Text></TouchableOpacity></View></View>}
        <Text style={styles.section}>Coupon</Text><View style={styles.row}><TextInput style={[styles.input, { flex: 1 }]} placeholder="WELCOME10" placeholderTextColor="#6B7280" autoCapitalize="characters" value={couponCode} onChangeText={setCouponCode} /><TouchableOpacity style={styles.outline} onPress={applyCoupon}><Text style={styles.accent}>Apply</Text></TouchableOpacity></View>{couponMessage ? <Text style={styles.muted}>{couponMessage}</Text> : <Text style={styles.muted}>Try {COUPONS.map((c) => c.code).join(" or ")}</Text>}
        <Text style={styles.section}>Payment</Text><View style={styles.row}><TouchableOpacity style={[styles.payment, payment === "cod" && styles.pillSelected]} onPress={() => setPayment("cod")}><Text style={styles.pillText}>Cash on delivery</Text></TouchableOpacity><TouchableOpacity style={[styles.payment, payment === "upi" && styles.pillSelected]} onPress={() => setPayment("upi")}><Text style={styles.pillText}>UPI · {STORE.upiId}</Text></TouchableOpacity></View><TextInput style={styles.input} placeholder="Order note (optional)" placeholderTextColor="#6B7280" value={note} onChangeText={setNote} />
      </>}
    </ScrollView>
    {items.length > 0 && <View style={styles.footer}><View style={styles.row}><Text style={styles.muted}>Subtotal</Text><Text style={styles.muted}>₹{subtotal.toFixed(2)}</Text></View><View style={styles.row}><Text style={styles.muted}>Delivery</Text><Text style={styles.muted}>₹{deliveryFee.toFixed(2)}</Text></View>{couponDiscount > 0 && <View style={styles.row}><Text style={styles.muted}>Discount</Text><Text style={styles.muted}>-₹{couponDiscount.toFixed(2)}</Text></View>}<View style={styles.row}><Text style={styles.muted}>Total</Text><Text style={styles.total}>₹{grandTotal.toFixed(2)}</Text></View><TouchableOpacity disabled={!minimumMet} style={[styles.button, !minimumMet && { opacity: .45 }]} onPress={checkout}><Ionicons name="logo-whatsapp" size={18} color="#022C22" /><Text style={styles.buttonText}>{minimumMet ? "Place order on WhatsApp" : `Add ₹${(STORE.minOrder - subtotal).toFixed(0)} more`}</Text></TouchableOpacity></View>}
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: theme.colors.background }, container: { padding: 20, paddingTop: 64, paddingBottom: 170 }, title: { color: theme.colors.textPrimary, fontSize: 24, fontWeight: "700" }, subtitle: { color: theme.colors.textSecondary, marginTop: 4, marginBottom: 16 }, progress: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 12, marginBottom: 10, gap: 8 }, track: { height: 7, backgroundColor: "#1E293B", borderRadius: 9 }, fill: { height: 7, backgroundColor: theme.colors.accent, borderRadius: 9 }, muted: { color: theme.colors.textSecondary, fontSize: 12 }, error: { color: "#FCA5A5", fontSize: 12, marginBottom: 8 }, item: { flexDirection: "row", alignItems: "center", paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: theme.colors.borderStrong }, itemName: { color: theme.colors.textPrimary, fontWeight: "600", marginBottom: 4 }, qty: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: theme.colors.surface, padding: 7, borderRadius: 18 }, qtyText: { color: theme.colors.textPrimary }, section: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: "600", marginTop: 18, marginBottom: 9 }, pill: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.borderStrong }, pillSelected: { borderColor: theme.colors.accent, backgroundColor: "rgba(34,197,94,.12)" }, pillText: { color: theme.colors.textPrimary, fontSize: 12 }, accent: { color: theme.colors.accent, fontWeight: "600" }, editor: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 12 }, input: { color: theme.colors.textPrimary, backgroundColor: "#020617", borderColor: theme.colors.borderStrong, borderWidth: 1, borderRadius: 10, padding: 11, marginBottom: 8 }, row: { flexDirection: "row", alignItems: "center", gap: 8 }, outline: { borderWidth: 1, borderColor: theme.colors.accent, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 9 }, button: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, backgroundColor: theme.colors.accent, borderRadius: 22, padding: 13 }, buttonText: { color: "#022C22", fontWeight: "700" }, payment: { flex: 1, padding: 11, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.borderStrong }, empty: { alignItems: "center", gap: 14, paddingTop: 100 }, emptyTitle: { color: theme.colors.textPrimary, fontSize: 17 }, footer: { padding: 16, gap: 10, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.borderStrong }, total: { color: theme.colors.textPrimary, fontSize: 20, fontWeight: "700" } });
