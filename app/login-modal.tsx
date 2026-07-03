import { useLocalSearchParams, useRouter } from "expo-router";

import { LoginScreen } from "./login";

export default function LoginModalRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ redirectTo?: string }>();
  const redirectTo =
    typeof params.redirectTo === "string" && params.redirectTo.trim().length > 0
      ? params.redirectTo
      : undefined;

  return (
    <LoginScreen
      lockMode="login"
      onAuthenticated={() => {
        if (redirectTo) {
          router.replace(redirectTo as never);
          return;
        }

        router.back();
      }}
      onRequestRegister={() =>
        router.replace(
          redirectTo
            ? ({ pathname: "/register", params: { redirectTo } } as never)
            : ("/register" as never),
        )
      }
    />
  );
}
