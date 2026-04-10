import { useRouter } from "expo-router";
import { ArrowRight, CheckCircle2 } from "lucide-react-native";
import { Text, View } from "react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { Screen } from "@/components/Screen";
import { colors } from "@/theme/colors";

export default function PurchaseSuccessScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View className="flex-1 items-center justify-center px-6">
        <CheckCircle2 color={colors.primary} size={80} strokeWidth={1.5} />
        <Text className="mt-6 text-center font-extrabold text-2xl text-foreground">Compra confirmada!</Text>
        <Text className="mt-2 text-center text-sm text-muted-foreground">Seu ingresso já está disponível. Aproveite o evento!</Text>
        <View className="mt-8 w-full gap-3">
          <AnimatedPressable className="flex-row items-center justify-center gap-2 rounded-2xl bg-primary py-4" onPress={() => router.replace("/(tabs)/tickets") }>
            <Text className="font-bold text-sm text-primary-foreground">Ver meus ingressos</Text>
            <ArrowRight color="#ffffff" size={16} strokeWidth={1.5} />
          </AnimatedPressable>
          <AnimatedPressable className="rounded-2xl bg-secondary py-4" onPress={() => router.replace("/") }>
            <Text className="text-center font-bold text-sm text-secondary-foreground">Voltar ao início</Text>
          </AnimatedPressable>
        </View>
      </View>
    </Screen>
  );
}