import React, { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";

import { TopBar, useTheme } from "@/design-system";

interface InAppWebViewScreenProps {
  title: string;
  url: string;
}

export function InAppWebViewScreen({ title, url }: InAppWebViewScreenProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="auto" />

      <TopBar
        title={title}
        variant="detail"
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }
          router.replace("/(tabs)/profile");
        }}
      />

      <View style={{ flex: 1 }}>
        <WebView
          source={{ uri: url }}
          startInLoadingState
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          style={{ flex: 1, backgroundColor: colors.background }}
        />

        {loading ? (
          <View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.background,
            }}
          >
            <ActivityIndicator size="small" color={colors.primaryText} />
          </View>
        ) : null}
      </View>
    </View>
  );
}
