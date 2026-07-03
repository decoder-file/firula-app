import { useRouter } from "expo-router";

import { LoginScreen } from "./login";

export default function LoginModalRoute() {
  const router = useRouter();

  return (
    <LoginScreen
      lockMode="login"
      onAuthenticated={() => router.back()}
      onRequestRegister={() => router.replace("/register")}
    />
  );
}
