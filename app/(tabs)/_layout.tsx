// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Animated, Text, View } from "react-native";
import { theme } from "../../theme";
import { useCart } from "../cart/CartContext";

function PillIcon({
  label,
  icon,
  color,
  focused,
  badgeCount,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
  badgeCount?: number;
}) {
  const scale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.05 : 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  const activeBg = "rgba(15,23,42,0.95)";
  const inactiveBg = "transparent";

  const iconColor = focused ? theme.colors.accent : color; // icon green when focused

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        paddingHorizontal: focused ? 18 : 0,
        paddingVertical: focused ? 8 : 0,
        borderRadius: 999,
        backgroundColor: focused ? activeBg : inactiveBg,
        flexDirection: "row",
        alignItems: "center",
        gap: focused ? 8 : 0,
        borderWidth: focused ? 1 : 0,
        borderColor: focused ? "rgba(34,197,94,0.5)" : "transparent",
      }}
    >
      <View>
        <Ionicons name={icon} size={22} color={iconColor} />
        {badgeCount && badgeCount > 0 && (
          <View
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 16,
              height: 16,
              borderRadius: 999,
              backgroundColor: "#EF4444",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 3,
            }}
          >
            <Text
              style={{
                color: "#F9FAFB",
                fontSize: 10,
                fontWeight: "700",
              }}
            >
              {badgeCount > 9 ? "9+" : badgeCount}
            </Text>
          </View>
        )}
      </View>
      {focused && (
        <Text
          style={{
            color: iconColor,
            fontWeight: "600",
            fontSize: 12,
          }}
        >
          {label}
        </Text>
      )}
    </Animated.View>
  );
}

export default function TabLayout() {
  const { totalItems } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 86,
          paddingBottom: 18,
          paddingTop: 10,
          backgroundColor: "rgba(2,6,23,0.96)",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0.18,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 10,
        },
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <PillIcon
              label="Home"
              icon="home"
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="products"
        options={{
          title: "Shop",
          tabBarIcon: ({ color, focused }) => (
            <PillIcon
              label="Shop"
              icon="grid"
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, focused }) => (
            <PillIcon
              label="Cart"
              icon="cart"
              color={color}
              focused={focused}
              badgeCount={totalItems}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="store"
        options={{
          title: "Store",
          tabBarIcon: ({ color, focused }) => (
            <PillIcon
              label="Store"
              icon="storefront"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
