import "react-native-reanimated";
import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { ThemeProvider, SnackbarProvider } from '@/design-system';

import { AppProviders } from "@/components/AppProviders";
import { OfflineBanner } from "@/components/OfflineBanner";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppProviders>
        <SnackbarProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#f7f7f7" } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login-modal" options={{ presentation: "modal" }} />
            <Stack.Screen name="register" />
            <Stack.Screen name="profile-edit" />
          </Stack>
          <OfflineBanner />
        </SnackbarProvider>
      </AppProviders>
    </ThemeProvider>
  );
}