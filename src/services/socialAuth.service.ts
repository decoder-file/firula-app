import { GoogleSignin, isErrorWithCode, statusCodes } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";

import { apiClient } from "@/api/client";
import { tokenStorage } from "@/api/tokenStorage";
import type { LoginResponseData } from "./auth.service";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: "664340745471-arlfoapbgtkn230b0jcljneurkni5185.apps.googleusercontent.com",
});

export interface SocialLoginResult {
  sessionData: LoginResponseData;
  email: string;
}

export const socialAuthService = {
  googleSignIn: async (): Promise<SocialLoginResult> => {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();

    if (response.type === "cancelled") {
      throw Object.assign(new Error("cancelled"), { code: statusCodes.SIGN_IN_CANCELLED });
    }

    const { idToken } = await GoogleSignin.getTokens();

    if (!idToken) throw new Error("Google Sign In falhou: idToken ausente");

    const { data } = await apiClient.post<{ success: boolean; data: LoginResponseData }>(
      "/auth/google/login",
      { idToken },
    );

    tokenStorage.setAccessToken(data.data.accessToken);

    return {
      sessionData: data.data,
      email: response.data?.user.email ?? "",
    };
  },

  appleSignIn: async (): Promise<SocialLoginResult> => {
    const result = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      ],
    });

    if (!result.identityToken) throw new Error("Apple Sign In falhou: identityToken ausente");

    const name = result.fullName?.givenName
      ? [result.fullName.givenName, result.fullName.familyName].filter(Boolean).join(" ")
      : undefined;

    const { data } = await apiClient.post<{ success: boolean; data: LoginResponseData }>(
      "/auth/apple/login",
      {
        identityToken: result.identityToken,
        ...(name && { name }),
      },
    );

    tokenStorage.setAccessToken(data.data.accessToken);

    return {
      sessionData: data.data,
      email: result.email ?? "",
    };
  },

  isGoogleSignInCancelled: (error: unknown): boolean => {
    return isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED;
  },

  isAppleSignInCancelled: (error: unknown): boolean => {
    return (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "ERR_REQUEST_CANCELED"
    );
  },
};
