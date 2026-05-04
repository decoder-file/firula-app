import { useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, Text, View } from "react-native";

import type { EventData, UserTicket } from "@/data/mockData";
import { addToWallet } from "@/utils/walletPass";

interface WalletButtonProps {
  ticket: UserTicket;
  event: EventData;
}

export function WalletButton({ ticket, event }: WalletButtonProps) {
  const [loading, setLoading] = useState(false);

  const isDisabled = ticket.status !== "active";

  const handlePress = async () => {
    if (isDisabled || loading) return;
    setLoading(true);
    try {
      await addToWallet(ticket, event);
    } catch (err) {
      Alert.alert(
        "Não foi possível salvar",
        "Ocorreu um erro ao tentar salvar o ingresso. Tente novamente.",
        [{ text: "OK" }],
      );
    } finally {
      setLoading(false);
    }
  };

  if (Platform.OS === "ios") {
    return (
      <Pressable
        onPress={handlePress}
        disabled={isDisabled || loading}
        style={({ pressed }) => ({ opacity: pressed || isDisabled ? 0.6 : 1 })}
        className="mx-4 mt-4 overflow-hidden rounded-xl"
        accessibilityRole="button"
        accessibilityLabel="Adicionar à Apple Wallet"
        accessibilityState={{ disabled: isDisabled }}
      >
        <View className="flex-row items-center justify-center gap-2.5 bg-black py-4">
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <AppleWalletIcon />
              <Text className="font-semibold text-base text-white">Adicionar à Apple Wallet</Text>
            </>
          )}
        </View>
      </Pressable>
    );
  }

  // Android – Google Wallet
  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled || loading}
      style={({ pressed }) => ({ opacity: pressed || isDisabled ? 0.6 : 1 })}
      className="mx-4 mt-4 overflow-hidden rounded-xl border border-border"
      accessibilityRole="button"
      accessibilityLabel="Salvar no Google Wallet"
      accessibilityState={{ disabled: isDisabled }}
    >
      <View className="flex-row items-center justify-center gap-2.5 bg-white py-4">
        {loading ? (
          <ActivityIndicator color="#1A73E8" size="small" />
        ) : (
          <>
            <GoogleWalletIcon />
            <Text className="font-medium text-base text-[#1A73E8]">Salvar no Google Wallet</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function AppleWalletIcon() {
  const Svg = require("react-native-svg").Svg;
  const Path = require("react-native-svg").Path;
  const Rect = require("react-native-svg").Rect;

  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      {/* Simplified Apple Wallet card stack */}
      <Rect x="2" y="7" width="20" height="14" rx="3" fill="white" opacity="0.3" />
      <Rect x="2" y="5" width="20" height="14" rx="3" fill="white" opacity="0.6" />
      <Rect x="2" y="3" width="20" height="14" rx="3" fill="white" />
      <Path d="M2 9h20" stroke="black" strokeWidth="1.5" opacity="0.15" />
      <Rect x="4" y="12" width="5" height="3" rx="1" fill="black" opacity="0.2" />
    </Svg>
  );
}

function GoogleWalletIcon() {
  const Svg = require("react-native-svg").Svg;
  const Path = require("react-native-svg").Path;

  // Google "G" logo colours
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}
