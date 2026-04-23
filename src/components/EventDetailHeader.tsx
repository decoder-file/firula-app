import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, View } from "react-native";
import { ArrowLeft, Heart, Share2 } from "lucide-react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { colors } from "@/theme/colors";

interface EventDetailHeaderProps {
  eventImage: any;
  onLikeChange?: (liked: boolean) => void;
}

export function EventDetailHeader({ eventImage, onLikeChange }: EventDetailHeaderProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);

  const handleLikePress = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    onLikeChange?.(newLiked);
  };

  return (
    <View className="bg-black">
      <View className="relative">
        <Image source={eventImage} className="h-64 w-full" resizeMode="cover" />
        <View className="absolute inset-0 bg-black/30" />
        <View className="absolute left-0 right-0 top-0 flex-row items-center justify-between p-4 pt-14">
          <AnimatedPressable className="rounded-full bg-white/85 p-2" onPress={() => router.back()}>
            <ArrowLeft color={colors.foreground} size={20} strokeWidth={1.5} />
          </AnimatedPressable>
          <View className="flex-row gap-2">
            <AnimatedPressable className="rounded-full bg-white/85 p-2">
              <Share2 color={colors.foreground} size={20} strokeWidth={1.5} />
            </AnimatedPressable>
            <AnimatedPressable className="rounded-full bg-white/85 p-2" onPress={handleLikePress}>
              <Heart color={liked ? colors.primary : colors.foreground} fill={liked ? colors.primary : "transparent"} size={20} strokeWidth={1.5} />
            </AnimatedPressable>
          </View>
        </View>
      </View>
    </View>
  );
}
