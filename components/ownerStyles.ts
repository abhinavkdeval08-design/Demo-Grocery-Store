import { StyleSheet } from "react-native";
import { theme } from "../theme";

export const owner = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: 20, paddingTop: 60, paddingBottom: 80, gap: 10 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: theme.colors.textPrimary, fontSize: 24, fontWeight: "700" },
  section: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: "600", marginTop: 14 },
  muted: { color: theme.colors.textSecondary, fontSize: 12 },
  text: { color: theme.colors.textPrimary },
  card: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 14, gap: 4 },
  big: { color: theme.colors.textPrimary, fontSize: 28, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  between: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.borderStrong },
  input: { color: theme.colors.textPrimary, backgroundColor: "#020617", borderColor: theme.colors.borderStrong, borderWidth: 1, borderRadius: 10, padding: 11 },
  button: { flex: 1, alignItems: "center", backgroundColor: theme.colors.accent, borderRadius: 20, padding: 12 },
  buttonText: { color: "#022C22", fontWeight: "700" },
  outline: { alignItems: "center", borderWidth: 1, borderColor: theme.colors.accent, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  accent: { color: theme.colors.accent, fontWeight: "600" },
  owed: { color: "#FCA5A5", fontWeight: "700" },
  clear: { color: theme.colors.accent, fontWeight: "700" },
  error: { color: "#FCA5A5", fontSize: 12 },
});
