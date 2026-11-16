/** Quem está logado, na forma que o PostHog recebe: id estável e propriedades sem dado pessoal. */
export interface AnalyticsIdentitySource {
  identityId: string;
  scope: string;
  adminProfiles?: unknown[] | null;
}

export interface AnalyticsPerson {
  distinctId: string;
  properties: { scope: string; is_organizer: boolean };
}

export function toAnalyticsPerson(customer: AnalyticsIdentitySource | null | undefined): AnalyticsPerson | null {
  if (!customer?.identityId) return null;
  return {
    distinctId: customer.identityId,
    properties: {
      scope: customer.scope,
      is_organizer: (customer.adminProfiles?.length ?? 0) > 0,
    },
  };
}

export type IdentityChange = { type: "identify"; person: AnalyticsPerson } | { type: "reset" } | null;

/** O que fazer quando a sessão muda: entrar identifica, sair zera, o resto não faz nada. */
export function identityChange(
  previous: AnalyticsIdentitySource | null | undefined,
  next: AnalyticsIdentitySource | null | undefined,
): IdentityChange {
  const prevId = previous?.identityId ?? null;
  const person = toAnalyticsPerson(next);
  if (person && person.distinctId !== prevId) return { type: "identify", person };
  if (!person && prevId) return { type: "reset" };
  return null;
}
