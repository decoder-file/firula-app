import { Download } from "lucide-react-native";
import { Linking, Text, View } from "react-native";

import { AnimatedPressable } from "./AnimatedPressable";
import { Screen } from "./Screen";

interface ForceUpdateScreenProps {
  storeUrl: string;
  message?: string | null;
}

const DEFAULT_MESSAGE =
  "Uma nova versão do Firula está disponível. Atualize o app para continuar usando.";

export const ForceUpdateScreen = ({ storeUrl, message }: ForceUpdateScreenProps) => {
  const handleUpdate = async () => {
    const canOpen = await Linking.canOpenURL(storeUrl);
    if (canOpen) await Linking.openURL(storeUrl);
  };

  return (
    <Screen edges={["top", "left", "right", "bottom"]}>
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-[360px] rounded-[28px] bg-card p-6">
          <View className="h-16 w-16 items-center justify-center rounded-3xl bg-accent">
            <Download color="#1fbd63" size={28} strokeWidth={1.75} />
          </View>

          <Text className="mt-6 font-bold text-2xl text-foreground">Atualize o Firula</Text>
          <Text className="mt-2 text-sm leading-5 text-muted-foreground">
            {message || DEFAULT_MESSAGE}
          </Text>

          <View className="mt-8 gap-3">
            <AnimatedPressable
              className="items-center rounded-2xl bg-primary px-4 py-4"
              onPress={handleUpdate}
            >
              <Text className="font-bold text-base text-primary-foreground">Atualizar agora</Text>
            </AnimatedPressable>
          </View>
        </View>
      </View>
    </Screen>
  );
};
