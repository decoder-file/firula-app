import { View } from "react-native";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import { WifiOff } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/design-system";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  const insets = useSafeAreaInsets();

  if (isOnline) return null;

  return (
    <Animated.View
      entering={SlideInDown.duration(300).springify().damping(18)}
      exiting={SlideOutDown.duration(250)}
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: "#1C1C1E",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: Math.max(insets.bottom, 14),
      }}
    >
      <WifiOff size={18} color="#ffffff" strokeWidth={1.75} />
      <View>
        <Text
          style={{
            color: "#ffffff",
            fontFamily: "PlusJakartaSans-Bold",
            fontSize: 13,
            lineHeight: 18,
          }}
        >
          Você está offline
        </Text>
        <Text
          style={{
            color: "rgba(255,255,255,0.55)",
            fontFamily: "PlusJakartaSans-Regular",
            fontSize: 12,
            lineHeight: 16,
          }}
        >
          Verifique sua conexão com a internet
        </Text>
      </View>
    </Animated.View>
  );
}
