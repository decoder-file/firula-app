import { Linking, Pressable, View } from "react-native";
import { ExternalLink, MapPin } from "lucide-react-native";
import { Text, useTheme } from "@/design-system";
import type { VenueAddress } from "@/services/organizer.service";

/** Endereço do local com toque para abrir no mapa. Não renderiza nada sem endereço. */
export function VenueAddressRow({ address, border = false }: { address?: VenueAddress | null; border?: boolean }) {
  const { colors, radius } = useTheme();
  if (!address) return null;
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Abrir ${address.formatted} no mapa`}
      onPress={() => void Linking.openURL(address.mapsUrl)}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 11,
        padding: 15,
        borderTopWidth: border ? 1 : 0,
        borderTopColor: colors.border,
        borderRadius: border ? 0 : radius.xl,
        borderWidth: border ? 0 : 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <MapPin size={18} color={colors.primaryText} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text token="bodySm">{address.formatted}</Text>
        <Text token="caption" color="primary" style={{ textTransform: "none", letterSpacing: 0 }}>Como chegar</Text>
      </View>
      <ExternalLink size={16} color={colors.primaryText} />
    </Pressable>
  );
}
