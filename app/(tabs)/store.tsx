import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const STORE_INFO = {
  name: "AWAD TRADING COMPANY",
  owner: "LOON DAN",
  phone: "+91 63775 96085",
  phone2: "+91 78782 77563",
  address:
    "Shree Ram Market, Ravat Abadi Fanta,\nDistt. Bikaner, Rajasthan – 334001",
  timing: "Mon–Sat · 7:00 AM – 9:00 PM\nSunday · 8:00 AM – 2:00 PM",
  delivery:
    "Free delivery within 5 km radius.\nMinimum order · ₹500\nDelivery time · Same day or next morning.",
  upi: "awadtrading@upi",
  established: "April 2024",
};

export default function Store() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ height: 32 }} />

      {/* Header / Brand block */}
      <View style={styles.headerCard}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>A</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.storeName}>{STORE_INFO.name}</Text>
          <Text style={styles.storeTagline}>
            Your neighbourhood partner for everyday essentials.
          </Text>

          <View style={styles.chipRow}>
            <View style={styles.chipPrimary}>
              <Ionicons name="checkmark-circle" size={14} color="#BBF7D0" />
              <Text style={styles.chipTextPrimary}>Trusted local store</Text>
            </View>
            <View style={styles.chip}>
              <Ionicons name="time" size={14} color="#FACC15" />
              <Text style={styles.chipText}>Since {STORE_INFO.established}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick meta row */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="star" size={14} color="#FBBF24" />
          <Text style={styles.metaLabel}>Quality staples</Text>
        </View>
        <View style={styles.metaDot} />
        <View style={styles.metaItem}>
          <Ionicons name="bicycle" size={14} color="#22C55E" />
          <Text style={styles.metaLabel}>Local delivery</Text>
        </View>
      </View>

      {/* Owner */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="person-circle" size={20} color="#A5B4FC" />
          <Text style={styles.cardTitle}>Owner</Text>
        </View>
        <Text style={styles.cardValue}>{STORE_INFO.owner}</Text>
        <Text style={styles.cardHint}>Personally curating quality and prices.</Text>
      </View>

      {/* Phone */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="call" size={20} color="#F97316" />
          <Text style={styles.cardTitle}>Contact</Text>
        </View>
        <Text style={styles.cardValueLabel}>Primary</Text>
        <Text style={styles.cardValue}>{STORE_INFO.phone}</Text>
        <Text style={[styles.cardValueLabel, { marginTop: 8 }]}>Alternate</Text>
        <Text style={styles.cardValue}>{STORE_INFO.phone2}</Text>
        <Text style={styles.cardHint}>
          Call or WhatsApp for urgent orders and bulk enquiries.
        </Text>
      </View>

      {/* Address */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="location" size={20} color="#22C55E" />
          <Text style={styles.cardTitle}>Store address</Text>
        </View>
        <Text style={styles.cardValue}>{STORE_INFO.address}</Text>
        <View style={styles.inlineTagRow}>
          <Ionicons name="navigate" size={12} color="#9CA3AF" />
          <Text style={styles.inlineTagText}>
            Landmark · Shree Ram Market, Ravat Abadi Fanta
          </Text>
        </View>
      </View>

      {/* Timing */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="time" size={20} color="#FACC15" />
          <Text style={styles.cardTitle}>Store timings</Text>
        </View>
        <Text style={styles.cardValue}>{STORE_INFO.timing}</Text>
        <Text style={styles.cardHint}>
          Hours may extend on festive days and weekends.
        </Text>
      </View>

      {/* Delivery */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="bicycle" size={20} color="#2DD4BF" />
          <Text style={styles.cardTitle}>Delivery details</Text>
        </View>
        <Text style={styles.cardValue}>{STORE_INFO.delivery}</Text>
        <View style={styles.deliveryTagRow}>
          <View style={styles.deliveryTag}>
            <Ionicons name="checkmark-circle" size={12} color="#6EE7B7" />
            <Text style={styles.deliveryTagText}>Within 5 km radius</Text>
          </View>
          <View style={styles.deliveryTagGhost}>
            <Text style={styles.deliveryTagGhostText}>Same-day slots</Text>
          </View>
        </View>
      </View>

      {/* UPI */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="qr-code" size={20} color="#22C55E" />
          <Text style={styles.cardTitle}>UPI payments</Text>
        </View>
        <Text style={styles.cardValue}>{STORE_INFO.upi}</Text>
        <Text style={styles.cardHint}>
          Secure digital payments accepted for all orders.
        </Text>
      </View>

      {/* Bottom info */}
      <View style={styles.footerNote}>
        <Ionicons name="information-circle" size={16} color="#6B7280" />
        <Text style={styles.footerText}>
          Store details are maintained by Awad Trading. For corrections, reach
          out on the contact numbers above.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 16,
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 24,
    backgroundColor: "rgba(15,23,42,0.98)",
    borderWidth: 1,
    borderColor: "rgba(55,65,81,0.9)",
    marginBottom: 10,
  },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
  },
  logoText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#E5E7EB",
  },
  storeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F9FAFB",
    marginBottom: 4,
  },
  storeTagline: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  chipPrimary: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(22,163,74,0.18)",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.45)",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(31,41,55,0.9)",
    gap: 6,
  },
  chipTextPrimary: {
    fontSize: 11,
    color: "#BBF7D0",
    fontWeight: "500",
  },
  chipText: {
    fontSize: 11,
    color: "#E5E7EB",
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaLabel: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#374151",
  },
  card: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "rgba(55,65,81,0.85)",
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#E5E7EB",
  },
  cardValue: {
    fontSize: 13,
    color: "#F9FAFB",
    lineHeight: 18,
  },
  cardValueLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
    marginBottom: 2,
  },
  cardHint: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 6,
  },
  inlineTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  inlineTagText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  deliveryTagRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    flexWrap: "wrap",
  },
  deliveryTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(22,163,74,0.14)",
  },
  deliveryTagText: {
    fontSize: 11,
    color: "#BBF7D0",
  },
  deliveryTagGhost: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(75,85,99,0.8)",
  },
  deliveryTagGhostText: {
    fontSize: 11,
    color: "#E5E7EB",
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 4,
    paddingVertical: 10,
  },
  footerText: {
    flex: 1,
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 16,
  },
});
