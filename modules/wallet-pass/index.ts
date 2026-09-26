import { requireOptionalNativeModule } from "expo";

type WalletPassModule = {
  canAddPasses(): boolean;
  addPassFromUrl(url: string): Promise<"presented" | "alreadyAdded">;
};

export const WalletPass = requireOptionalNativeModule<WalletPassModule>("WalletPass");
