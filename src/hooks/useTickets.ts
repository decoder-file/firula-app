import { Linking, Platform } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { WalletPass } from "../../modules/wallet-pass";
import { ticketsService } from "@/services/tickets.service";
import type { PurchaseTicketPayload } from "@/services/tickets.service";
import { useIsCustomerScoped } from "./useAuth";
import { queryKeys } from "./queryKeys";

// /public/customer/tickets só aceita sessão com scope "customer" — sem esse
// gate, uma sessão de admin/organizador (que também passa por essa tela)
// ficaria em loop de 401 tentando renovar um token que nunca vai servir.
export const useMyTickets = () => {
  const isCustomerScoped = useIsCustomerScoped();
  return useQuery({
    queryKey: queryKeys.tickets.mine(),
    queryFn: ticketsService.getMyTickets,
    enabled: isCustomerScoped,
  });
};

export const useTicket = (id: string) => {
  const isCustomerScoped = useIsCustomerScoped();
  return useQuery({
    queryKey: queryKeys.tickets.detail(id),
    queryFn: async () => {
      const tickets = await ticketsService.getMyTickets();
      const ticket = tickets.find((item) => item.id === id);

      if (!ticket) {
        throw new Error("Ingresso não encontrado");
      }

      return ticket;
    },
    enabled: isCustomerScoped && Boolean(id),
  });
};

/** Etapa em que a adição à carteira falhou — vai no log e decide a mensagem do alerta. */
export type WalletStep = "native-module" | "can-add-passes" | "request-pass" | "add-pass" | "open-google-wallet";

export class WalletError extends Error {
  constructor(
    readonly step: WalletStep,
    readonly cause: unknown,
    message?: string,
  ) {
    super(message ?? (cause instanceof Error ? cause.message : String(cause)));
    this.name = "WalletError";
  }

  /** Código do erro nativo (ex.: ERR_PASS_INVALID, ERR_PASS_DOWNLOAD) quando houver. */
  get code(): string | undefined {
    const code = (this.cause as { code?: unknown } | null)?.code;
    return typeof code === "string" ? code : undefined;
  }
}

const walletLog = (message: string, extra?: Record<string, unknown>) =>
  console.log(`[Wallet] ${message}`, extra ? JSON.stringify(extra) : "");

async function step<T>(name: WalletStep, run: () => Promise<T> | T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    throw error instanceof WalletError ? error : new WalletError(name, error);
  }
}

export const useAddToWallet = () =>
  useMutation({
    mutationFn: async (ticketId: string) => {
      walletLog("start", { ticketId, platform: Platform.OS });

      if (Platform.OS === "ios") {
        const walletPass = WalletPass;
        if (!walletPass) {
          // Build sem o módulo nativo (Expo Go ou build anterior ao módulo wallet-pass).
          throw new WalletError("native-module", null, "WalletPass native module not found in this build");
        }
        const canAdd = await step("can-add-passes", () => walletPass.canAddPasses());
        walletLog("canAddPasses", { canAdd });
        if (!canAdd) throw new WalletError("can-add-passes", null, "PKAddPassesViewController.canAddPasses() returned false");

        const url = await step("request-pass", () => ticketsService.getAppleWalletPassUrl(ticketId));
        walletLog("pass url received", { url });

        const result = await step("add-pass", () => walletPass.addPassFromUrl(url));
        walletLog("addPassFromUrl finished", { result });
      } else {
        const url = await step("request-pass", () => ticketsService.getGoogleWalletUrl(ticketId));
        walletLog("google wallet url received", { length: url.length });
        await step("open-google-wallet", () => Linking.openURL(url));
        walletLog("google wallet opened");
      }
    },
  });

export const usePurchaseTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PurchaseTicketPayload) =>
      ticketsService.purchase(payload),
    onSuccess: () => {
      // Invalidate the full tickets scope so "my tickets" refreshes
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });
};
