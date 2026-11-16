declare namespace NodeJS {
  interface ProcessEnv {
    readonly EXPO_PUBLIC_API_URL: string;
    readonly EXPO_PUBLIC_WEBSITE_URL: string;
    readonly EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: string;
    readonly EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME: string;
    /** Token do projeto PostHog (phc_...). Sem ele o analytics fica desligado. */
    readonly EXPO_PUBLIC_POSTHOG_KEY?: string;
    /** Padrão: https://us.i.posthog.com (use https://eu.i.posthog.com para a nuvem europeia). */
    readonly EXPO_PUBLIC_POSTHOG_HOST?: string;
    /** "true" para enviar eventos também em desenvolvimento. */
    readonly EXPO_PUBLIC_POSTHOG_ENABLE_IN_DEV?: string;
  }
}
