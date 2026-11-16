/**
 * Configuração do PostHog a partir das variáveis EXPO_PUBLIC_*. Sem chave, o analytics fica
 * desligado (nada é enviado). Em desenvolvimento fica desligado, salvo
 * EXPO_PUBLIC_POSTHOG_ENABLE_IN_DEV=true — para não misturar testes locais com dados reais.
 */
export interface AnalyticsConfig {
  enabled: boolean;
  projectToken: string;
  host: string;
}

export const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";

export function resolveAnalyticsConfig(
  env: Record<string, string | undefined>,
  isDev: boolean,
): AnalyticsConfig {
  const projectToken = env.EXPO_PUBLIC_POSTHOG_KEY?.trim() ?? "";
  const host = env.EXPO_PUBLIC_POSTHOG_HOST?.trim() || DEFAULT_POSTHOG_HOST;
  const allowedInThisBuild = !isDev || env.EXPO_PUBLIC_POSTHOG_ENABLE_IN_DEV === "true";
  return { enabled: Boolean(projectToken) && allowedInThisBuild, projectToken, host };
}
