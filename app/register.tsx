import { useLocalSearchParams, useRouter } from "expo-router";

import { LoginScreen } from "./login";

export default function RegisterRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ redirectTo?: string }>();
  const redirectTo =
    typeof params.redirectTo === "string" && params.redirectTo.trim().length > 0
      ? params.redirectTo
      : undefined;

  return (
    <LoginScreen
      lockMode="register"
      onAuthenticated={() =>
        router.replace((redirectTo ?? "/(tabs)") as never)
      }
    />
  );
}
