import { View } from "react-native";
import { ChevronLeft, Timer } from "lucide-react-native";

import { PressScale, Text, useTheme } from "@/design-system";

export function CheckoutHeader({
  title,
  onBack,
  timerLabel,
}: {
  title: string;
  onBack: () => void;
  timerLabel?: string;
}) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <PressScale
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.surfaceAlt,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronLeft size={20} color={colors.text} strokeWidth={2} />
      </PressScale>

      <Text token="label" style={{ fontSize: 15, fontWeight: "800" }}>
        {title}
      </Text>

      {timerLabel ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            backgroundColor: colors.warningSoft,
            borderRadius: 999,
            paddingHorizontal: 11,
            paddingVertical: 6,
          }}
        >
          <Timer size={13} color={colors.warning} strokeWidth={2} />
          <Text style={{ fontSize: 12, fontWeight: "800", color: colors.warning, fontVariant: ["tabular-nums"] }}>
            {timerLabel}
          </Text>
        </View>
      ) : (
        <View style={{ width: 40 }} />
      )}
    </View>
  );
}
