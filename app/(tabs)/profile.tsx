import { useRouter } from "expo-router";
import { Bell, ChevronRight, FileText, HelpCircle, LogOut, ScanFace, Settings, Shield, Star, Ticket, Trophy } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { Avatar } from "@/components/Avatar";
import { Screen } from "@/components/Screen";
import { useApp } from "@/contexts/AppContext";
import { useScreenLog } from "@/hooks/useScreenLog";

const achievements = [
  { label: "Primeiro evento", unlocked: true, icon: "🏅" },
  { label: "5 eventos", unlocked: true, icon: "🥉" },
  { label: "10 eventos", unlocked: true, icon: "🥈" },
  { label: "25 eventos", unlocked: false, icon: "🥇" },
  { label: "50 eventos", unlocked: false, icon: "🏆" },
  { label: "Facial ID", unlocked: true, icon: "🔒" },
];

export default function ProfileScreen() {
  useScreenLog();
  const router = useRouter();
  const { profile } = useApp();

  const menuItems = [
    { icon: Ticket, label: "Meus ingressos", subtitle: "Ingressos comprados", href: "/(tabs)/tickets" },
    { icon: ScanFace, label: "Facial ID Firula", subtitle: "Reconhecimento facial", href: "/facial-id" },
    { icon: Star, label: "Favoritos", subtitle: "Eventos salvos", href: "/favorites" },
    { icon: Bell, label: "Notificações", subtitle: "Lembretes e alertas", href: "/notifications" },
    { icon: Shield, label: "Privacidade", subtitle: "Dados e segurança", href: "/privacy" },
    { icon: FileText, label: "Termos de uso", subtitle: "Políticas e termos", href: "/terms" },
    { icon: Settings, label: "Configurações", subtitle: "Preferências do app", href: "/settings" },
    { icon: HelpCircle, label: "Ajuda", subtitle: "Central de suporte", href: "/help" },
  ] as const;

  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View className="bg-card px-4 pb-6 pt-4">
          <Text className="font-bold text-lg text-foreground">Perfil</Text>
          <View className="mt-4 flex-row items-center gap-4">
            <Avatar uri={profile.avatar} name={profile.name} size={64} />
            <View className="flex-1">
              <Text className="font-bold text-base text-foreground">{profile.name}</Text>
              <Text className="mt-1 text-xs text-muted-foreground">{profile.email}</Text>
            </View>
          </View>
          <View className="mt-4 flex-row gap-3">
            {[
              { label: "Eventos", value: String(profile.eventsAttended) },
              { label: "Membro desde", value: new Date(`${profile.memberSince}T00:00:00`).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }) },
              { label: "Nível", value: "Gold" },
            ].map((item) => (
              <View key={item.label} className="flex-1 rounded-2xl bg-secondary p-3">
                <Text className="text-center font-bold text-sm text-foreground">{item.value}</Text>
                <Text className="mt-1 text-center text-[10px] text-muted-foreground">{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="px-4 pt-5">
          <View className="mb-3 flex-row items-center gap-2">
            <Trophy color="#1fbd63" size={16} strokeWidth={1.5} />
            <Text className="font-bold text-sm text-foreground">Conquistas</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
            {achievements.map((achievement) => (
              <View
                key={achievement.label}
                className={`w-[100px] items-center rounded-2xl p-3 ${achievement.unlocked ? "bg-card" : "bg-secondary opacity-40"}`}
              >
                <Text className="text-2xl">{achievement.icon}</Text>
                <Text className="mt-1 text-center font-medium text-[10px] text-foreground">{achievement.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className="gap-2 px-4 pt-5">
          {menuItems.map((item) => (
            <AnimatedPressable key={item.label} className="flex-row items-center gap-3 rounded-2xl bg-card p-4" onPress={() => router.push(item.href)}>
              <item.icon color="#141821" size={20} strokeWidth={1.5} />
              <View className="flex-1">
                <Text className="font-medium text-sm text-foreground">{item.label}</Text>
                <Text className="text-xs text-muted-foreground">{item.subtitle}</Text>
              </View>
              <ChevronRight color="#727985" size={18} strokeWidth={1.5} />
            </AnimatedPressable>
          ))}

          <AnimatedPressable className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl bg-red-50 py-3.5">
            <LogOut color="#ef4444" size={16} strokeWidth={1.5} />
            <Text className="font-medium text-sm text-destructive">Sair da conta</Text>
          </AnimatedPressable>
        </View>
      </ScrollView>
    </Screen>
  );
}