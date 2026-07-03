import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { useTheme } from "@/design-system";

interface InAppWebViewScreenProps {
  title: string;
  url: string;
}

export function InAppWebViewScreen({ title, url }: InAppWebViewScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="auto" />

      <View
        style={{
          backgroundColor: colors.surface,
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceAlt,
          }}
        >
          <ArrowLeft size={19} color={colors.text} strokeWidth={1.75} />
        </Pressable>

        <Text
          style={{
            color: colors.text,
            fontFamily: "PlusJakartaSans-Bold",
            fontSize: 19,
            flex: 1,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

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
