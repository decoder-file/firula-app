import { Tabs } from "expo-router";
import { useRouter } from "expo-router";
import { Home, Search, Ticket, User } from "lucide-react-native";

import { useIsAuthenticated } from "@/hooks/useAuth";
import { colors } from "@/theme/colors";

export default function TabsLayout() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 80,
          paddingTop: 10,
          paddingBottom: 28,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "PlusJakartaSans-Medium",
        },
      }}

    >
      <Tabs.Screen name="index" options={{ title: "Início", tabBarIcon: ({ color }) => <Home color={color} size={22} strokeWidth={1.5} /> }} />
      <Tabs.Screen name="explore" options={{ title: "Explorar", tabBarIcon: ({ color }) => <Search color={color} size={22} strokeWidth={1.5} /> }} />
      <Tabs.Screen
        name="tickets"
        listeners={{
          tabPress: (event) => {
            if (!isAuthenticated) {
              event.preventDefault();
              router.push({
                pathname: "/login-modal",
                params: { redirectTo: "/(tabs)/tickets" },
              } as never);
            }
          },
        }}
        options={{
          title: "Ingressos",
          tabBarIcon: ({ color }) => <Ticket color={color} size={22} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <User color={color} size={22} strokeWidth={1.5} />,
        }}
      />
    </Tabs>
  );
}