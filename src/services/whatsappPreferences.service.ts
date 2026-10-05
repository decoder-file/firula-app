import { apiClient } from "@/api/client";

export interface WhatsappPreferences {
  /** O canal está ligado na plataforma. Se não estiver, a opção nem aparece. */
  available: boolean;
  /** Ligado por padrão; false só para quem desativou. */
  enabled: boolean;
  hasValidPhone: boolean;
  phoneMasked: string | null;
}

export const whatsappPreferencesService = {
  get: async (): Promise<WhatsappPreferences> => {
    const { data } = await apiClient.get("/public/customer/whatsapp");
    return data.data;
  },
  /** false desativa os avisos; true volta ao padrão (receber). */
  set: async (enabled: boolean): Promise<WhatsappPreferences> => {
    const { data } = await apiClient.put("/public/customer/whatsapp", { enabled });
    return data.data;
  },
};
