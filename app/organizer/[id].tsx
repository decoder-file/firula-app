import { Stack, useLocalSearchParams } from "expo-router";
import { CheckCircle2 } from "lucide-react-native";
import { Text, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { Screen } from "@/components/Screen";
import { useScreenLog } from "@/hooks/useScreenLog";
import { events, getEventByOrganizerSlug } from "@/data/mockData";
import { colors } from "@/theme/colors";

export default function OrganizerScreen() {
  useScreenLog();
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = id ? getEventByOrganizerSlug(id) : undefined;
  const organizer = event?.organizer ?? events[0].organizer;

  return (
    <Screen>
      <Stack.Screen options={{ title: "Organizador", headerShadowVisible: false, headerStyle: { backgroundColor: "#ffffff" } }} />
      <View className="flex-1 px-4 py-6">
        <View className="items-center rounded-3xl bg-card p-6">
          <Avatar uri={organizer.avatar} name={organizer.name} size={72} />
          <View className="mt-4 flex-row items-center gap-1">
            <Text className="font-bold text-lg text-foreground">{organizer.name}</Text>
            {organizer.verified ? <CheckCircle2 color={colors.primary} size={16} strokeWidth={1.5} /> : null}
          </View>
          <Text className="mt-2 text-center text-sm text-muted-foreground">Perfil inicial do organizador já disponível para a navegação. A próxima etapa é portar o catálogo completo e métricas dessa entidade.</Text>
        </View>
      </View>
    </Screen>
  );
}