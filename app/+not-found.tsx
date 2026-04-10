import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { Screen } from "@/components/Screen";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="font-bold text-xl text-foreground">Página não encontrada</Text>
        <Text className="mt-2 text-center text-sm text-muted-foreground">A rota acessada não existe nesta primeira versão do app mobile.</Text>
        <AnimatedPressable className="mt-4 rounded-2xl bg-primary px-6 py-3" onPress={() => router.replace("/") }>
          <Text className="font-bold text-sm text-primary-foreground">Voltar ao início</Text>
        </AnimatedPressable>
      </View>
    </Screen>
  );
}