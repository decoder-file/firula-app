import { useRef, useState } from "react";
import { Platform, Share, type View } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";

import { useSnackbar } from "@/design-system";
import { votingService, type ShareView, type VoteView } from "@/services/voting.service";
import { defaultShareTitle } from "@/utils/votingBallot";

/**
 * Compartilhar a seleção: cria o link, captura os cards (9:16 e 1:1) que
 * estão renderizados fora da tela, manda pro backend (preview do link) e
 * abre a folha de compartilhamento nativa com a imagem.
 */
export function useShareSelection(vote: VoteView) {
  const storyRef = useRef<View>(null);
  const squareRef = useRef<View>(null);
  const [share, setShare] = useState<ShareView | null>(null);
  const [busy, setBusy] = useState(false);
  const { show: showSnackbar } = useSnackbar();

  const title = vote.edition.shareTitle?.trim() || defaultShareTitle(vote.edition.shortName);

  async function prepare(displayName: string | null): Promise<{ share: ShareView; storyUri: string }> {
    const created = await votingService.createShare(vote.id, displayName);
    const [storyUri, squareUri] = await Promise.all([
      captureRef(storyRef, { format: "png", quality: 1, result: "tmpfile" }),
      captureRef(squareRef, { format: "png", quality: 1, result: "tmpfile" }),
    ]);
    let latest = created;
    try {
      await votingService.uploadShareImage(vote.id, "9x16", storyUri);
      latest = await votingService.uploadShareImage(vote.id, "1x1", squareUri);
    } catch {
      // Sem preview de imagem no link, mas o compartilhamento continua.
    }
    setShare(latest);
    return { share: latest, storyUri };
  }

  async function shareNow(displayName: string | null) {
    setBusy(true);
    try {
      const { share: current, storyUri } = await prepare(displayName);
      const message = `${title} — ${vote.category.name}. Monte a sua: ${current.publicUrl}`;
      if (Platform.OS === "ios") {
        await Share.share({ title, message, url: storyUri });
      } else if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(storyUri, { mimeType: "image/png", dialogTitle: title });
      } else {
        await Share.share({ title, message });
      }
    } catch (error) {
      if ((error as Error)?.message !== "User did not share") showSnackbar({ message: "Não foi possível compartilhar agora. Tente de novo." });
    } finally {
      setBusy(false);
    }
  }

  async function copyLink(displayName: string | null) {
    setBusy(true);
    try {
      const current = share ?? (await prepare(displayName)).share;
      await Clipboard.setStringAsync(current.publicUrl);
      showSnackbar({ message: "Link copiado!" });
    } catch {
      showSnackbar({ message: "Não foi possível copiar o link." });
    } finally {
      setBusy(false);
    }
  }

  return { storyRef, squareRef, share, busy, title, shareNow, copyLink };
}
