import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type State = { failed: boolean };

/**
 * Last line of defence: shows a friendly screen instead of a blank crash.
 * Deliberately independent of every provider so it still works if one of them fails.
 */
export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    if (__DEV__) console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <View style={styles.root} accessibilityRole="alert">
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.title}>कुछ गड़बड़ हो गई</Text>
        <Text style={styles.text}>Your cart and orders are safe. Please try again.</Text>
        <TouchableOpacity accessibilityRole="button" style={styles.button} onPress={() => this.setState({ failed: false })}>
          <Text style={styles.buttonText}>Try again · फिर कोशिश करें</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 24, backgroundColor: "#020617" },
  title: { color: "#F9FAFB", fontSize: 20, fontWeight: "700", textAlign: "center" },
  text: { color: "#9CA3AF", textAlign: "center" },
  button: { marginTop: 12, backgroundColor: "#22C55E", borderRadius: 22, paddingVertical: 12, paddingHorizontal: 24 },
  buttonText: { color: "#022C22", fontWeight: "700" },
});
