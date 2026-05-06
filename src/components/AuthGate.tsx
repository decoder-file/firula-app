import { useRouter } from "expo-router";
import { LockKeyhole } from "lucide-react-native";
import { Text, View } from "react-native";

import { useAuthHydrated, useIsAuthenticated } from "@/hooks/useAuth";

import { AnimatedPressable } from "./AnimatedPressable";
import { Screen } from "./Screen";

interface AuthGateProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const AuthGate = ({
  children,
  title = "Faça login para acessar seu perfil",
  description = "Entre na sua conta para ver seus ingressos, preferências e dados pessoais.",
}: AuthGateProps) => {
  const router = useRouter();
  const isHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();

  if (!isHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Screen edges={["top", "left", "right"]}>
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full max-w-[360px] rounded-[28px] bg-card p-6">
            <View className="h-16 w-16 items-center justify-center rounded-3xl bg-accent">
              <LockKeyhole color="#1fbd63" size={28} strokeWidth={1.75} />
            </View>

            <Text className="mt-6 font-bold text-2xl text-foreground">{title}</Text>
            <Text className="mt-2 text-sm leading-5 text-muted-foreground">{description}</Text>

            <View className="mt-8 gap-3">
              <AnimatedPressable
                className="items-center rounded-2xl bg-primary px-4 py-4"
                onPress={() => router.push("/login" as never)}
              >
                <Text className="font-bold text-base text-primary-foreground">Entrar</Text>
              </AnimatedPressable>

              <AnimatedPressable
                className="items-center rounded-2xl bg-secondary px-4 py-4"
                onPress={() =>
                  router.push({ pathname: "/login", params: { mode: "register" } } as never)
                }
              >
                <Text className="font-medium text-base text-foreground">Criar conta</Text>
              </AnimatedPressable>
            </View>
          </View>
        </View>
      </Screen>
    );
  }

  return <>{children}</>;
};