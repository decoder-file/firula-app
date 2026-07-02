import { useRouter } from "expo-router";
import { CalendarDays, MapPin } from "lucide-react-native";
import { Image, Text, View, type ImageSourcePropType } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { formatDateShort } from "@/utils/format";

export interface EventCardItem {
  id: string;
  slug?: string;
  title: string;
  date: string;
  city: string;
  eventType: string;
  image?: ImageSourcePropType | null;
}

interface EventCardProps {
  event: EventCardItem;
  variant?: "default" | "featured" | "compact";
}

export const EventCard = ({ event, variant = "default" }: EventCardProps) => {
  const router = useRouter();

  if (variant === "featured") {
    return (
      <AnimatedPressable
        className="mr-3 w-[300px] overflow-hidden rounded-3xl bg-card"
        onPress={() => router.push(`/event/${event.slug || event.id}`)}
      >
        <View className="relative h-44">
          {event.image ? (
            <Image source={event.image} className="h-44 w-full" resizeMode="cover" />
          ) : (
            <LinearGradient colors={["#1a3a2a", "#0f2218"]} className="h-full w-full" />
          )}
          <LinearGradient colors={["transparent", "rgba(20,24,33,0.72)"]} className="absolute inset-0" />
          <View className="absolute left-3 top-3 rounded-full border border-white/60 px-3 py-1">
            <Text className="font-medium text-[10px] uppercase tracking-[1px] text-white">{event.eventType}</Text>
          </View>
          <View className="absolute bottom-3 left-3 right-3">
            <Text numberOfLines={2} className="font-bold text-sm text-white">
              {event.title}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1.5 p-3">
          <CalendarDays color="#727985" size={13} strokeWidth={1.5} />
          <Text className="font-medium text-xs text-muted-foreground">{formatDateShort(event.date)}</Text>
          <Text className="text-xs text-muted-foreground">·</Text>
          <MapPin color="#727985" size={13} strokeWidth={1.5} />
          <Text numberOfLines={1} className="flex-1 text-xs text-muted-foreground">
            {event.city}
          </Text>
        </View>
      </AnimatedPressable>
    );
  }

  if (variant === "compact") {
    return (
      <AnimatedPressable
        className="flex-row gap-3 rounded-2xl bg-card p-3"
        onPress={() => router.push(`/event/${event.slug || event.id}`)}
      >
        {event.image ? (
          <Image source={event.image} className="h-20 w-20 rounded-xl" resizeMode="cover" />
        ) : (
          <LinearGradient colors={["#1a3a2a", "#0f2218"]} className="h-20 w-20 rounded-xl" />
        )}
        <View className="flex-1 justify-between py-0.5">
          <View>
            <View className="self-start rounded-full border border-primary px-2 py-1">
              <Text className="font-medium text-[10px] text-primary">{event.eventType}</Text>
            </View>
            <Text numberOfLines={2} className="mt-1 font-semibold text-sm text-foreground">
              {event.title}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <CalendarDays color="#727985" size={12} strokeWidth={1.5} />
            <Text className="text-xs text-muted-foreground">{formatDateShort(event.date)}</Text>
            <Text className="text-xs text-muted-foreground">·</Text>
            <MapPin color="#727985" size={12} strokeWidth={1.5} />
            <Text numberOfLines={1} className="flex-1 text-xs text-muted-foreground">
              {event.city}
            </Text>
          </View>
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable className="flex-1 overflow-hidden rounded-3xl bg-card" onPress={() => router.push(`/event/${event.slug || event.id}`)}>
      <View className="relative h-40">
        {event.image ? (
          <Image source={event.image} className="h-40 w-full" resizeMode="cover" />
        ) : (
          <LinearGradient colors={["#1a3a2a", "#0f2218"]} className="h-full w-full" />
        )}
        <View className="absolute left-3 top-3 rounded-full border border-white/60 px-3 py-1">
          <Text className="font-medium text-[10px] text-white">{event.eventType}</Text>
        </View>
      </View>
      <View className="p-3">
        <Text numberOfLines={2} className="font-bold text-sm text-foreground">
          {event.title}
        </Text>
        <View className="mt-2 flex-row items-center gap-1.5">
          <CalendarDays color="#727985" size={13} strokeWidth={1.5} />
          <Text className="text-xs text-muted-foreground">{formatDateShort(event.date)}</Text>
          <Text className="text-xs text-muted-foreground">·</Text>
          <MapPin color="#727985" size={13} strokeWidth={1.5} />
          <Text numberOfLines={1} className="flex-1 text-xs text-muted-foreground">
            {event.city}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
};