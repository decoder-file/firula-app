import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { championshipService } from "@/services/championship.service";

import { queryKeys } from "./queryKeys";

const VERSION_POLL_MS = 8_000;

/**
 * Tabela ao vivo sem WebSocket: a cada 8 s consulta só a versão (uma linha
 * no backend) e, quando ela muda, refaz o payload completo. O react-query
 * pausa o intervalo com o app em segundo plano. Campeonato encerrado para.
 */
export function useChampionshipLive(slug: string | undefined) {
  const queryClient = useQueryClient();
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);

  const detail = useQuery({
    queryKey: queryKeys.championships.detail(slug ?? ""),
    queryFn: () => championshipService.getBySlug(slug!),
    enabled: Boolean(slug),
    staleTime: 60_000,
    retry: false,
  });

  const finished = detail.data?.status === "FINISHED";

  const version = useQuery({
    queryKey: queryKeys.championships.version(slug ?? ""),
    queryFn: () => championshipService.getVersion(slug!),
    enabled: Boolean(slug) && detail.isSuccess && !finished,
    refetchInterval: VERSION_POLL_MS,
    refetchIntervalInBackground: false,
    retry: false,
  });

  useEffect(() => {
    if (detail.data) setLastSyncAt(Date.now());
  }, [detail.data]);

  useEffect(() => {
    if (!slug || !version.data || !detail.data) return;
    if (version.data.version !== detail.data.version) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.championships.detail(slug) });
    }
  }, [slug, version.data, detail.data, queryClient]);

  return { ...detail, lastSyncAt, isLive: !finished && detail.isSuccess };
}

/** "agora", "há 12 s", "há 3 min" — reavaliado a cada 5 s. */
export function useRelativeTime(timestamp: number | null): string {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 5_000);
    return () => clearInterval(id);
  }, []);
  if (!timestamp) return "";
  const seconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
  if (seconds < 8) return "agora";
  if (seconds < 60) return `há ${seconds} s`;
  return `há ${Math.round(seconds / 60)} min`;
}
