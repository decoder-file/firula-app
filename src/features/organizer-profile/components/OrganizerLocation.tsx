import React from "react";
import { Linking, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Copy, MapPin, Navigation } from "lucide-react-native";

import { Button, Surface, Text, useSnackbar, useTheme } from "@/design-system";

export function OrganizerLocation({ address }: { address: string }) {
  const { colors } = useTheme();
  const { show } = useSnackbar();

  const openMap = async (provider: "google" | "waze") => {
    const query = encodeURIComponent(address);
    const url = provider === "google"
      ? `https://www.google.com/maps/search/?api=1&query=${query}`
      : `https://waze.com/ul?q=${query}&navigate=yes`;
    try {
      await Linking.openURL(url);
    } catch {
      show({ message: "Não foi possível abrir o mapa. Tente novamente.", variant: "error" });
    }
  };

  const copyAddress = async () => {
    try {
      const copied = await Clipboard.setStringAsync(address);
      if (!copied) throw new Error("Clipboard unavailable");
      show({ message: "Endereço copiado.", variant: "success" });
    } catch {
      show({ message: "Não foi possível copiar o endereço. Tente novamente.", variant: "error" });
    }
  };

  return (
    <Surface level={1} radius="xl" style={{ padding: 16, gap: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <MapPin size={20} color={colors.primaryText} />
        <Text token="subtitle">Localização</Text>
      </View>
      <Text token="bodySm" color="muted" selectable>{address}</Text>
      <View style={{ gap: 8 }}>
        <Button label="Abrir no Google Maps" icon={Navigation} variant="tonal" onPress={() => void openMap("google")} />
        <Button label="Abrir no Waze" variant="secondary" onPress={() => void openMap("waze")} />
        <Button label="Copiar endereço" icon={Copy} variant="ghost" onPress={() => void copyAddress()} />
      </View>
    </Surface>
  );
}
