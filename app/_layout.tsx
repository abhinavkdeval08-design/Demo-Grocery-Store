// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform } from "react-native";
import { theme } from "../theme";
import { CartProvider } from "./cart/CartContext";

export default function RootLayout() {
  return (
    <CartProvider>
      <StatusBar
        style="light"
        backgroundColor={theme.colors.background}
        translucent={true}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: "transparent",
          },
          headerTintColor: theme.colors.textPrimary,
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 18,
            letterSpacing: 0.4,
          },
          headerShadowVisible: false,
          headerTransparent: true,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
          animation: Platform.select({
            ios: "slide_from_right",
            android: "fade",
          }),
          gestureEnabled: true,
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </CartProvider>
  );
}
