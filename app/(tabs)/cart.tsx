import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useT } from "../../i18n";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { STORE } from "../../config/store";
import { COUPONS, checkCoupon, findCoupon, calculateDiscount } from "../../data/coupons";
import { useCart } from "../../context/CartContext";
import { buildOrderMessage } from "../../utils/buildOrderMessage";
import { getNextOrderId } from "../../utils/orderId";
import { availableSlots, isServiceablePincode, isSlotBookable } from "../../utils/slots";
import type { Address, Order, PaymentMethod } from "../../types/product";
import { theme } from "../../theme";

const emptyAddress = (): Address => ({ id: `${Date.now()}`, label: "Home", name: "", phone: "", address: "" });
export default function Cart() {
  const { t, items: itemsLabel } = useT();
  const couponError = (reason: "invalid" | "expired" | "min_order" | "no_discount", code: string) =>
    reason === "invalid" ? t("cpn.invalid") : reason === "expired" ? t("cpn.expired") : reason === "min_order" ? t("cpn.min", { n: findCoupon(code)?.minOrder ?? 0 }) : t("cpn.none");
  const { items, totalItems, totalPrice, addToCart, removeFromCart, clearCart, addresses, saveAddress, deleteAddress, customer, saveOrder } = useCart();
  const router = useRouter();
  const [selectedId, setSelectedId] = React.useState<string | undefined>(addresses[0]?.id);
  const [editing, setEditing] = React.useState<Address | null>(null);
  const [addressError, setAddressError] = React.useState("");
  const [note, setNote] = React.useState("");
  const [couponCode, setCouponCode] = React.useState("");
  const [couponMessage, setCouponMessage] = React.useState("");
  const [appliedCode, setAppliedCode] = React.useState<string | null>(null);
  const [payment, setPayment] = React.useState<PaymentMethod>("cod");
  const [upiFallback, setUpiFallback] = React.useState(false);
  const [pendingOrder, setPendingOrder] = React.useState<Order | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [slotDate, setSlotDate] = React.useState<string | null>(null);
  const [slotId, setSlotId] = React.useState<string | null>(null);
  const slotRules = { slots: STORE.deliverySlots, closedDays: STORE.closedDays, maxDaysAhead: STORE.maxDaysAhead };
  const slotDays = availableSlots(new Date(), slotRules).filter((day) => day.slots.some((slot) => slot.available));
  const selected = addresses.find((address) => address.id === selectedId);
  React.useEffect(() => {
    if (!selectedId && addresses[0]) setSelectedId(addresses[0].id);
  }, [addresses, selectedId]);
  const subtotal = totalPrice;
  const deliveryFee = subtotal >= STORE.freeDeliveryAbove ? 0 : STORE.deliveryFee;
  // The discount is always derived from the applied coupon and the current subtotal,
  // so it can never go stale when the cart changes.
  const appliedCoupon = appliedCode ? findCoupon(appliedCode) : undefined;
  const couponDiscount = appliedCoupon ? calculateDiscount(appliedCoupon, subtotal) : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee - couponDiscount);
  const minimumMet = subtotal >= STORE.minOrder;
  const minimumProgress = Math.min(1, subtotal / STORE.minOrder);
  const freeDeliveryProgress = Math.min(1, subtotal / STORE.freeDeliveryAbove);

  const validate = (address: Address) => {
    if (!address.name.trim()) return t("err.name");
    if (!/^\d{10}$/.test(address.phone.replace(/\D/g, ""))) return t("err.phone");
    if (address.address.trim().length < 10) return t("err.addr");
    if (!/^\d{6}$/.test((address.pincode ?? "").trim())) return t("err.pin6");
    if (!isServiceablePincode(address.pincode ?? "", STORE.servicePincodes)) return t("err.pinNo");
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
  // If the cart changes so that the applied coupon no longer applies, remove it.
  React.useEffect(() => {
    if (!appliedCode) return;
    const result = checkCoupon(appliedCode, subtotal);
    if (!result.ok) {
      setAppliedCode(null);
      setCouponMessage(t("cpn.removed", { reason: couponError(result.reason, appliedCode) }));
    }
  // Only re-check when the coupon or subtotal changes, not when the language changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedCode, subtotal]);
  // A pending UPI order is a snapshot of the cart; discard it when anything it depends on changes.
  React.useEffect(() => { setPendingOrder(null); }, [items, couponDiscount, deliveryFee, payment, selectedId, note, slotDate, slotId]);
  const applyCoupon = () => {
    const result = checkCoupon(couponCode, subtotal);
    if (!result.ok) { setAppliedCode(null); setCouponMessage(couponError(result.reason, couponCode)); return; }
    setAppliedCode(result.coupon.code);
    setCouponMessage(t("cpn.applied", { code: result.coupon.code, n: result.discount.toFixed(2) }));
  };
  const confirmClearCart = () =>
    Alert.alert(t("al.clear.t"), t("al.clear.m"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.clear"), style: "destructive", onPress: () => { clearCart(); setAppliedCode(null); setCouponMessage(""); } },
    ]);
  const buildOrder = async (): Promise<Order | null> => {
    if (!items.length) return null;
    if (!minimumMet) { Alert.alert(t("al.min.t"), t("al.min.m", { n: (STORE.minOrder - subtotal).toFixed(2) })); return null; }
    if (!selected) { Alert.alert(t("al.addr.t"), t("al.addr.m")); return null; }
    if (!selected.pincode || !isServiceablePincode(selected.pincode, STORE.servicePincodes)) { Alert.alert(t("al.pin.t"), t("al.pin.m")); return null; }
    if (!slotDate || !slotId) { Alert.alert(t("al.slot.t"), t("al.slot.m")); return null; }
    const now = new Date();
    if (!isSlotBookable(now, slotRules, slotDate, slotId)) { setSlotId(null); Alert.alert(t("al.slotGone.t"), t("al.slotGone.m")); return null; }
    const slotLabel = `${slotDays.find((d) => d.date === slotDate)?.label ?? slotDate}, ${STORE.deliverySlots.find((x) => x.id === slotId)?.label ?? slotId}`;
    const id = await getNextOrderId();
    return { id, items, customer, address: selected, subtotal, deliveryFee, discount: couponDiscount, total: grandTotal, couponCode: couponDiscount ? appliedCode ?? undefined : undefined, paymentMethod: payment, status: "placed", slot: { date: slotDate, slotId, label: slotLabel }, note: note.trim() || undefined, createdAt: new Date().toISOString() };
  };
  // Sends the order to the store on WhatsApp. The order is saved and the cart cleared only if WhatsApp opened.
  const sendOnWhatsApp = async (order: Order) => {
    try {
      await Linking.openURL(`https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent(buildOrderMessage(order))}`);
    } catch {
      Alert.alert(t("al.wa.t"), t("al.wa.m"));
      return;
    }
    saveOrder(order); clearCart(); setNote(""); setSlotId(null); setAppliedCode(null); setCouponMessage(""); setPendingOrder(null); setUpiFallback(false);
    router.push("/(tabs)/orders");
  };
  const checkout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const order = await buildOrder();
      if (!order) return;
      if (order.paymentMethod === "cod") { await sendOnWhatsApp(order); return; }
      // UPI: open the UPI app first and wait for the customer to confirm the payment.
      setPendingOrder(order);
      setUpiFallback(false);
      try {
        await Linking.openURL(`upi://pay?pa=${encodeURIComponent(STORE.upiId)}&pn=${encodeURIComponent(STORE.name)}&am=${order.total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(order.id)}`);
      } catch {
        setUpiFallback(true);
      }
    } finally {
      setBusy(false);
    }
  };
  return <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t("cart.title")}</Text><Text style={styles.subtitle}>{items.length ? t("cart.inCart", { items: itemsLabel(totalItems) }) : t("cart.sub")}</Text>
      {items.length === 0 ? <View style={styles.empty}><Ionicons name="cart-outline" size={40} color="#9CA3AF" /><Text style={styles.emptyTitle}>{t("cart.empty")}</Text><TouchableOpacity style={styles.outline} onPress={() => router.push("/(tabs)/products")}><Text style={styles.accent}>{t("cart.browse")}</Text></TouchableOpacity></View> : <>
        <View style={styles.progress}><Text style={styles.muted}>{minimumMet ? t("cart.minMet") : t("cart.minMore", { n: (STORE.minOrder - subtotal).toFixed(0) })}</Text><View style={styles.track}><View style={[styles.fill, { width: `${minimumProgress * 100}%` }]} /></View><Text style={styles.muted}>{deliveryFee ? t("cart.freeMore", { n: (STORE.freeDeliveryAbove - subtotal).toFixed(0) }) : t("cart.freeOn")}</Text><View style={styles.track}><View style={[styles.fill, { width: `${freeDeliveryProgress * 100}%` }]} /></View></View>
        {items.map((item) => <View style={styles.item} key={item.id}><View style={{ flex: 1 }}><Text style={styles.itemName}>{item.name}</Text><Text style={styles.muted}>{item.unit} · ₹{item.price * item.quantity}</Text></View><View style={styles.qty}><TouchableOpacity onPress={() => removeFromCart(item.id)}><Ionicons name="remove" size={17} color="#E5E7EB" /></TouchableOpacity><Text style={styles.qtyText}>{item.quantity}</Text><TouchableOpacity onPress={() => addToCart(item)}><Ionicons name="add" size={17} color="#E5E7EB" /></TouchableOpacity></View></View>)}
        <Text style={styles.section}>{t("cart.address")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{addresses.map((address) => <TouchableOpacity key={address.id} style={[styles.pill, selectedId === address.id && styles.pillSelected]} onPress={() => setSelectedId(address.id)}><Text style={styles.pillText}>{address.label}: {address.name}</Text><TouchableOpacity onPress={() => setEditing(address)}><Ionicons name="create-outline" size={14} color="#A5B4FC" /></TouchableOpacity><TouchableOpacity onPress={() => { deleteAddress(address.id); if (selectedId === address.id) setSelectedId(undefined); }}><Ionicons name="trash-outline" size={14} color="#FCA5A5" /></TouchableOpacity></TouchableOpacity>)}<TouchableOpacity style={styles.pill} onPress={() => setEditing(emptyAddress())}><Text style={styles.accent}>{t("cart.addAddress")}</Text></TouchableOpacity></ScrollView>
        {editing && <View style={styles.editor}><Text style={styles.section}>{addresses.some((a) => a.id === editing.id) ? t("cart.editAddress") : t("cart.newAddress")}</Text><TextInput style={styles.input} placeholder={t("ph.name")} placeholderTextColor="#6B7280" value={editing.name} onChangeText={(name) => { setEditing({ ...editing, name }); setAddressError(""); }} /><TextInput style={styles.input} placeholder={t("ph.phone")} placeholderTextColor="#6B7280" keyboardType="phone-pad" value={editing.phone} onChangeText={(phone) => { setEditing({ ...editing, phone }); setAddressError(""); }} /><TextInput style={[styles.input, { minHeight: 55 }]} placeholder={t("ph.address")} placeholderTextColor="#6B7280" multiline value={editing.address} onChangeText={(address) => { setEditing({ ...editing, address }); setAddressError(""); }} /><TextInput accessibilityLabel="Pincode" style={styles.input} placeholder={t("ph.pincode")} placeholderTextColor="#6B7280" keyboardType="number-pad" maxLength={6} value={editing.pincode ?? ""} onChangeText={(pincode) => { setEditing({ ...editing, pincode: pincode.replace(/\D/g, "") }); setAddressError(""); }} />{(editing.pincode ?? "").length === 6 ? <Text style={isServiceablePincode(editing.pincode ?? "", STORE.servicePincodes) ? styles.ok : styles.error}>{isServiceablePincode(editing.pincode ?? "", STORE.servicePincodes) ? t("pin.ok") : t("err.pinNo")}</Text> : null}{addressError ? <Text style={styles.error}>{addressError}</Text> : null}<View style={styles.row}><TouchableOpacity style={styles.outline} onPress={() => { setEditing(null); setAddressError(""); }}><Text style={styles.muted}>{t("common.cancel")}</Text></TouchableOpacity><TouchableOpacity style={styles.button} onPress={save}><Text style={styles.buttonText}>{t("cart.saveAddress")}</Text></TouchableOpacity></View></View>}
        <Text style={styles.section}>{t("cart.slot")}</Text>
        {slotDays.length === 0 ? <Text style={styles.muted}>{t("cart.slotNone")}</Text> : <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{slotDays.map((day) => <TouchableOpacity accessibilityLabel={`Delivery day ${day.label}`} key={day.date} style={[styles.pill, slotDate === day.date && styles.pillSelected]} onPress={() => { setSlotDate(day.date); setSlotId(null); }}><Text style={styles.pillText}>{day.label}</Text></TouchableOpacity>)}</ScrollView>
          {slotDate ? <View style={{ gap: 8, marginTop: 8 }}>{(slotDays.find((day) => day.date === slotDate)?.slots ?? []).map((slot) => <TouchableOpacity accessibilityLabel={`Slot ${slot.label}`} disabled={!slot.available} key={slot.id} style={[styles.payment, slotId === slot.id && styles.pillSelected, !slot.available && { opacity: .4 }]} onPress={() => setSlotId(slot.id)}><Text style={styles.pillText}>{slot.label}{slot.available ? "" : " (closed)"}</Text></TouchableOpacity>)}</View> : <Text style={styles.muted}>{t("cart.slotDay")}</Text>}
        </>}
        <Text style={styles.section}>{t("cart.coupon")}</Text><View style={styles.row}><TextInput style={[styles.input, { flex: 1 }]} placeholder="WELCOME10" placeholderTextColor="#6B7280" autoCapitalize="characters" value={couponCode} onChangeText={setCouponCode} /><TouchableOpacity style={styles.outline} onPress={applyCoupon}><Text style={styles.accent}>{t("cart.apply")}</Text></TouchableOpacity></View>{couponMessage ? <Text style={styles.muted}>{couponMessage}</Text> : <Text style={styles.muted}>Try {COUPONS.map((c) => c.code).join(" or ")}</Text>}
        <Text style={styles.section}>{t("cart.payment")}</Text><View style={styles.row}><TouchableOpacity style={[styles.payment, payment === "cod" && styles.pillSelected]} onPress={() => setPayment("cod")}><Text style={styles.pillText}>{t("cart.cod")}</Text></TouchableOpacity><TouchableOpacity style={[styles.payment, payment === "upi" && styles.pillSelected]} onPress={() => setPayment("upi")}><Text style={styles.pillText}>UPI · {STORE.upiId}</Text></TouchableOpacity></View>{upiFallback && <View style={styles.upiFallback}><Text style={styles.muted}>{t("cart.noUpi")}</Text><Text style={styles.upiId}>{STORE.upiId}</Text><TouchableOpacity style={styles.outline} onPress={() => Clipboard.setStringAsync(STORE.upiId)}><Text style={styles.accent}>{t("cart.copyUpi")}</Text></TouchableOpacity></View>}<TextInput style={styles.input} placeholder={t("cart.note")} placeholderTextColor="#6B7280" value={note} onChangeText={setNote} />
      </>}
    </ScrollView>
    {items.length > 0 && <View style={styles.footer}><View style={styles.row}><Text style={styles.muted}>{t("cart.subtotal")}</Text><Text style={styles.muted}>₹{subtotal.toFixed(2)}</Text></View><View style={styles.row}><Text style={styles.muted}>{t("cart.delivery")}</Text><Text style={styles.muted}>₹{deliveryFee.toFixed(2)}</Text></View>{couponDiscount > 0 && <View style={styles.row}><Text style={styles.muted}>{t("cart.discount")}</Text><Text style={styles.muted}>-₹{couponDiscount.toFixed(2)}</Text></View>}<View style={styles.row}><Text style={styles.muted}>{t("cart.total")}</Text><Text style={styles.total}>₹{grandTotal.toFixed(2)}</Text></View>{pendingOrder ? <><TouchableOpacity accessibilityLabel="Confirm UPI payment and send order on WhatsApp" style={styles.button} onPress={() => sendOnWhatsApp(pendingOrder)}><Ionicons name="logo-whatsapp" size={18} color="#022C22" /><Text style={styles.buttonText}>{t("cart.paid")}</Text></TouchableOpacity><TouchableOpacity onPress={() => setPendingOrder(null)}><Text style={[styles.muted, { textAlign: "center" }]}>{t("cart.cancelPay")}</Text></TouchableOpacity></> : <TouchableOpacity disabled={!minimumMet || busy} style={[styles.button, (!minimumMet || busy) && { opacity: .45 }]} onPress={checkout}><Ionicons name={payment === "upi" ? "wallet-outline" : "logo-whatsapp"} size={18} color="#022C22" /><Text style={styles.buttonText}>{!minimumMet ? t("cart.addMore", { n: (STORE.minOrder - subtotal).toFixed(0) }) : payment === "upi" ? t("cart.payUpi", { n: grandTotal.toFixed(2) }) : t("cart.place")}</Text></TouchableOpacity>}<TouchableOpacity accessibilityLabel="Clear cart" onPress={confirmClearCart}><Text style={[styles.muted, { textAlign: "center" }]}>{t("cart.clear")}</Text></TouchableOpacity></View>}
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: theme.colors.background }, container: { padding: 20, paddingTop: 64, paddingBottom: 170 }, title: { color: theme.colors.textPrimary, fontSize: 24, fontWeight: "700" }, subtitle: { color: theme.colors.textSecondary, marginTop: 4, marginBottom: 16 }, progress: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 12, marginBottom: 10, gap: 8 }, track: { height: 7, backgroundColor: "#1E293B", borderRadius: 9 }, fill: { height: 7, backgroundColor: theme.colors.accent, borderRadius: 9 }, muted: { color: theme.colors.textSecondary, fontSize: 12 }, error: { color: "#FCA5A5", fontSize: 12, marginBottom: 8 }, ok: { color: theme.colors.accent, fontSize: 12, marginBottom: 8 }, item: { flexDirection: "row", alignItems: "center", paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: theme.colors.borderStrong }, itemName: { color: theme.colors.textPrimary, fontWeight: "600", marginBottom: 4 }, qty: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: theme.colors.surface, padding: 7, borderRadius: 18 }, qtyText: { color: theme.colors.textPrimary }, section: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: "600", marginTop: 18, marginBottom: 9 }, pill: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.borderStrong }, pillSelected: { borderColor: theme.colors.accent, backgroundColor: "rgba(34,197,94,.12)" }, pillText: { color: theme.colors.textPrimary, fontSize: 12 }, accent: { color: theme.colors.accent, fontWeight: "600" }, editor: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 12 }, upiFallback: { backgroundColor: theme.colors.surface, borderRadius: 12, padding: 12, gap: 8, marginTop: 8 }, upiId: { color: theme.colors.textPrimary, fontWeight: "700" }, input: { color: theme.colors.textPrimary, backgroundColor: "#020617", borderColor: theme.colors.borderStrong, borderWidth: 1, borderRadius: 10, padding: 11, marginBottom: 8 }, row: { flexDirection: "row", alignItems: "center", gap: 8 }, outline: { borderWidth: 1, borderColor: theme.colors.accent, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 9 }, button: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, backgroundColor: theme.colors.accent, borderRadius: 22, padding: 13 }, buttonText: { color: "#022C22", fontWeight: "700" }, payment: { flex: 1, padding: 11, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.borderStrong }, empty: { alignItems: "center", gap: 14, paddingTop: 100 }, emptyTitle: { color: theme.colors.textPrimary, fontSize: 17 }, footer: { padding: 16, gap: 10, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.borderStrong }, total: { color: theme.colors.textPrimary, fontSize: 20, fontWeight: "700" } });
