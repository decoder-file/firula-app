import { useRouter } from "expo-router";
import { AlertCircle, CheckCircle2, Clock3, Lock, LogIn, PauseCircle } from "lucide-react-native";
import { View } from "react-native";

import { EmptyState, Skeleton, useTheme } from "@/design-system";
import type { VotingErrorView } from "../errors";

export function VotingErrorState({ error, actionLabel, onAction }: { error: VotingErrorView; actionLabel?: string; onAction?: () => void }) {
  const icon =
    error.code === "VOTING_ALREADY_VOTED"
      ? CheckCircle2
      : error.code === "VOTING_PAUSED"
        ? PauseCircle
        : error.code === "VOTING_CATEGORY_NOT_OPEN"
          ? Clock3
          : error.code === "VOTING_CLOSED" || error.code === "VOTING_NOT_ELIGIBLE" || error.code === "VOTING_PUBLIC_DISABLED"
            ? Lock
            : AlertCircle;
  return <EmptyState icon={icon} title={error.title} description={error.description} actionLabel={actionLabel} onAction={onAction} />;
}

/** Login só depois de escolher a categoria: abre o modal e volta pra esta rota. */
export function VotingLoginRequired({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  return (
    <EmptyState
      icon={LogIn}
      title="Entre para montar sua seleção"
      description="Leva alguns segundos — Google, Apple ou um código no seu e-mail. Votantes convidados: use o mesmo e-mail do convite."
      actionLabel="Entrar"
      onAction={() => router.push({ pathname: "/login-modal", params: { redirectTo } })}
    />
  );
}

export function PitchSkeleton() {
  const { spacing, radius } = useTheme();
  return (
    <View style={{ gap: spacing.s3 }}>
      <Skeleton width="60%" height={28} radius={radius.md} />
      <Skeleton width="100%" height={420} radius={radius.lg} />
    </View>
  );
}
