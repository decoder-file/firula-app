import { useRouter } from "expo-router";
import { Image, View, type ImageSourcePropType } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Heart, Share2 } from "lucide-react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { colors } from "@/theme/colors";

interface EventDetailHeaderProps {
  eventImage?: ImageSourcePropType | { uri: string } | null;
  isFavorited?: boolean;
  isFavoritePending?: boolean;
  onToggleFavorite?: () => void;
}

export function EventDetailHeader({ eventImage, isFavorited = false, isFavoritePending = false, onToggleFavorite }: EventDetailHeaderProps) {
  const router = useRouter();

  return (
    <View className="bg-black">
      <View className="relative">
        {eventImage ? (
          <Image source={eventImage} className="h-64 w-full" resizeMode="cover" />
        ) : (
          <LinearGradient colors={["#1a3a2a", "#0f2218"]} className="h-64 w-full" />
        )}
        <View className="absolute inset-0 bg-black/30" />
        <View className="absolute left-0 right-0 top-0 flex-row items-center justify-between p-4 pt-14">
          <AnimatedPressable className="rounded-full bg-white/85 p-2" onPress={() => router.back()}>
            <ArrowLeft color={colors.foreground} size={20} strokeWidth={1.5} />
          </AnimatedPressable>
          <View className="flex-row gap-2">
            <AnimatedPressable className="rounded-full bg-white/85 p-2">
              <Share2 color={colors.foreground} size={20} strokeWidth={1.5} />
            </AnimatedPressable>
            <AnimatedPressable
              className="rounded-full bg-white/85 p-2"
              disabled={isFavoritePending}
              onPress={onToggleFavorite}
            >
              <Heart
                color={isFavorited ? colors.primary : colors.foreground}
                fill={isFavorited ? colors.primary : "transparent"}
                size={20}
                strokeWidth={1.5}
              />
            </AnimatedPressable>
          </View>
        </View>
      </View>
    </View>
  );
}
