declare namespace NodeJS {
  interface ProcessEnv {
    readonly EXPO_PUBLIC_API_URL: string;
    readonly EXPO_PUBLIC_WEBSITE_URL: string;
    readonly EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: string;
    readonly EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME: string;
  }
}
