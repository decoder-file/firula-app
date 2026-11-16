import React, { useEffect } from "react";
import { usePathname, useSegments } from "expo-router";
import { PostHog, PostHogProvider } from "posthog-react-native";

import { useAuthStore } from "@/stores/authStore";
import { resolveAnalyticsConfig } from "./config";
import type { AnalyticsEventName, AnalyticsEvents } from "./events";
import { identityChange } from "./identity";
import { screenNameFromSegments } from "./screens";

export type { AnalyticsEventName, AnalyticsEvents } from "./events";

const config = resolveAnalyticsConfig(
  {
    EXPO_PUBLIC_POSTHOG_KEY: process.env.EXPO_PUBLIC_POSTHOG_KEY,
    EXPO_PUBLIC_POSTHOG_HOST: process.env.EXPO_PUBLIC_POSTHOG_HOST,
    EXPO_PUBLIC_POSTHOG_ENABLE_IN_DEV: process.env.EXPO_PUBLIC_POSTHOG_ENABLE_IN_DEV,
  },
  __DEV__,
);

/** null quando o analytics está desligado (sem chave, ou em desenvolvimento). */
const client: PostHog | null = config.enabled
  ? new PostHog(config.projectToken, {
      host: config.host,
      // Perfil de pessoa só para quem fez login; visitante anônimo não cria perfil.
      personProfiles: "identified_only",
      captureAppLifecycleEvents: true,
      enableSessionReplay: false,
    })
  : null;

/** Envia um evento do catálogo. Nunca lança: analytics não pode quebrar o app. */
export function track<E extends AnalyticsEventName>(event: E, properties: AnalyticsEvents[E]): void {
  try {
    client?.capture(event, properties as Record<string, string | number | boolean | null>);
  } catch {
    // ignora
  }
}

/** Acompanha login/logout pelo authStore — cobre todos os pontos que mudam a sessão. */
function startIdentitySync(posthog: PostHog) {
  const apply = (change: ReturnType<typeof identityChange>) => {
    if (change?.type === "identify") posthog.identify(change.person.distinctId, change.person.properties);
    if (change?.type === "reset") posthog.reset();
  };
  apply(identityChange(null, useAuthStore.getState().customer));
  return useAuthStore.subscribe((state, previous) => {
    if (state.customer !== previous.customer) apply(identityChange(previous.customer, state.customer));
  });
}

function ScreenTracker() {
  const segments = useSegments();
  const pathname = usePathname();
  const screenName = screenNameFromSegments(segments);

  useEffect(() => {
    void client?.screen(screenName, { path: pathname }).catch(() => undefined);
  }, [screenName, pathname]);

  return null;
}

/**
 * Liga o PostHog no app: telas (expo-router), toques e login. Toques gravam só o nome do
 * componente, `testID` e `ph-label` — nunca o texto nem o accessibilityLabel, que trazem nomes
 * de participantes. Para esconder uma área inteira dos toques, use a prop `ph-no-capture`.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => (client ? startIdentitySync(client) : undefined), []);

  if (!client) return <>{children}</>;

  return (
    <PostHogProvider
      client={client}
      autocapture={{
        captureScreens: false,
        captureTouches: true,
        propsToCapture: ["testID", "ph-label"],
      }}
    >
      <ScreenTracker />
      {children}
    </PostHogProvider>
  );
}
