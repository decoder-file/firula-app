import "react-native-reanimated";
import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppProviders } from "@/components/AppProviders";

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#f7f7f7" } }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AppProviders>
  );
}