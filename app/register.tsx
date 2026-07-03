import { useRouter } from "expo-router";

import { LoginScreen } from "./login";

export default function RegisterRoute() {
  const router = useRouter();

  return (
    <LoginScreen
      lockMode="register"
      onAuthenticated={() => router.replace("/(tabs)")}
    />
  );
}
