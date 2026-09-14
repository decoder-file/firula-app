import { isApiError, isNetworkError, isTimeoutError } from "@/api/errors";

export interface VotingErrorView {
  code: string;
  title: string;
  description: string;
}

const MESSAGES: Record<string, { title: string; description: string }> = {
  VOTING_NOT_FOUND: { title: "Votação não encontrada", description: "Confira o link ou volte para a lista de categorias." },
  VOTING_CATEGORY_NOT_OPEN: { title: "Votação ainda não aberta", description: "Esta categoria ainda não começou a receber votos. Volte em breve." },
  VOTING_PAUSED: { title: "Votação pausada", description: "A organização pausou esta categoria temporariamente. Tente mais tarde." },
  VOTING_CLOSED: { title: "Essa votação já foi encerrada", description: "Esta categoria não recebe mais votos." },
  VOTING_NOT_ELIGIBLE: { title: "Você não está habilitado nesta categoria", description: "Seu cadastro de votante vale para outras categorias desta edição." },
  VOTING_PUBLIC_DISABLED: { title: "Votação restrita a convidados", description: "Esta edição aceita apenas votantes cadastrados pela organização." },
  VOTING_ALREADY_VOTED: { title: "Você já votou nesta categoria", description: "Cada pessoa vota uma vez por categoria. Você pode votar nas outras." },
  VOTING_INVALID_SELECTION: { title: "Seleção inválida", description: "Algum jogador escolhido não é mais elegível. Revise seu time." },
  VOTING_RESULTS_NOT_PUBLISHED: { title: "Resultados ainda não publicados", description: "A organização vai liberar o resultado em breve." },
  VOTING_SHARE_NOT_FOUND: { title: "Seleção não encontrada", description: "Esse link pode ter sido copiado errado." },
  UNAUTHORIZED: { title: "Sessão expirada", description: "Entre de novo para continuar votando." },
  NETWORK: { title: "Sem conexão", description: "Verifique sua internet e tente novamente." },
  UNKNOWN: { title: "Não foi possível concluir", description: "Tente novamente em instantes." },
};

export function describeVotingError(error: unknown): VotingErrorView {
  if (isNetworkError(error) || isTimeoutError(error)) return { code: "NETWORK", ...MESSAGES.NETWORK };
  if (isApiError(error)) {
    if (error.statusCode === 401) return { code: "UNAUTHORIZED", ...MESSAGES.UNAUTHORIZED };
    const known = error.code ? MESSAGES[error.code] : undefined;
    if (known) return { code: error.code!, ...known };
    return { code: error.code ?? "UNKNOWN", title: MESSAGES.UNKNOWN.title, description: error.message || MESSAGES.UNKNOWN.description };
  }
  return { code: "UNKNOWN", ...MESSAGES.UNKNOWN };
}
