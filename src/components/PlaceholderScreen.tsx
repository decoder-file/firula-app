import { Stack } from "expo-router";
import { Text, View } from "react-native";

import { Screen } from "@/components/Screen";

export const PlaceholderScreen = ({ title, description }: { title: string; description: string }) => {
  return (
    <Screen>
      <Stack.Screen options={{ title, headerShadowVisible: false, headerStyle: { backgroundColor: "#ffffff" } }} />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="font-bold text-xl text-foreground">{title}</Text>
        <Text className="mt-2 text-center text-sm text-muted-foreground">{description}</Text>
      </View>
    </Screen>
  );
};