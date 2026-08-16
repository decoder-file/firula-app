import { Tabs } from "expo-router";
import { useRouter } from "expo-router";
import { Home, Search, Ticket, User } from "lucide-react-native";

import { useTheme } from "@/design-system";
import { useIsAuthenticated } from "@/hooks/useAuth";

export default function TabsLayout() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const { colors, scheme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryText,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingTop: 10,
          paddingBottom: 28,
          shadowColor: scheme === "dark" ? "#000000" : colors.text,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: scheme === "dark" ? 0.32 : 0.06,
          shadowRadius: 8,
          elevation: 8,
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
