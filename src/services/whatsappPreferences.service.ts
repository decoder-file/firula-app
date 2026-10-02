import { apiClient } from "@/api/client";

export interface WhatsappPreferences {
  /** O canal está ligado na plataforma. Se não estiver, a opção nem aparece. */
  available: boolean;
  enabled: boolean;
  hasValidPhone: boolean;
  phoneMasked: string | null;
}

export const whatsappPreferencesService = {
  get: async (): Promise<WhatsappPreferences> => {
    const { data } = await apiClient.get("/public/customer/whatsapp");
    return data.data;
  },
  /** Aceitar exige celular válido no perfil (a API devolve WHATSAPP_PHONE_REQUIRED). */
  set: async (enabled: boolean): Promise<WhatsappPreferences> => {
    const { data } = await apiClient.put("/public/customer/whatsapp", { enabled });
    return data.data;
  },
};
