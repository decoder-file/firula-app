import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { ArrowLeft, Heart, Share2 } from "lucide-react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { colors } from "@/theme/colors";

interface EventDetailHeaderCompactProps {
  onLikeChange?: (liked: boolean) => void;
}

export function EventDetailHeaderCompact({ onLikeChange }: EventDetailHeaderCompactProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);

  const handleLikePress = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    onLikeChange?.(newLiked);
  };

  return (
    <View className="flex-row items-center justify-between border-b border-border bg-white px-4 py-3">
      <AnimatedPressable className="rounded-full p-2" onPress={() => router.back()}>
        <ArrowLeft color={colors.foreground} size={20} strokeWidth={1.5} />
      </AnimatedPressable>
      <View className="flex-row gap-2">
        <AnimatedPressable className="rounded-full p-2">
          <Share2 color={colors.foreground} size={20} strokeWidth={1.5} />
        </AnimatedPressable>
        <AnimatedPressable className="rounded-full p-2" onPress={handleLikePress}>
          <Heart color={liked ? colors.primary : colors.foreground} fill={liked ? colors.primary : "transparent"} size={20} strokeWidth={1.5} />
        </AnimatedPressable>
      </View>
    </View>
  );
}
