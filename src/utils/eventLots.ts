/**
 * Quais lotes a página pública do evento deve exibir.
 *
 * O endpoint por slug devolve todos os lotes do evento, inclusive os que o
 * organizador desativou no painel. Mesma regra do site e do endpoint público
 * do backend (`filterTicketLotsForPublicEvent`):
 * - lote desativado nunca aparece;
 * - lote esgotado só some quando o organizador ligou "ocultar lotes esgotados".
 */
export interface VisibleLotInput {
  active: boolean;
  quantity: number;
  quantitySold: number;
}

export interface VisibleLotSettings {
  hideSoldOutLots?: boolean;
}

export function selectVisibleLots<T extends VisibleLotInput>(lots: T[], settings?: VisibleLotSettings | null): T[] {
  const hideSoldOut = settings?.hideSoldOutLots === true;
  return lots.filter((lot) => {
    if (!lot.active) return false;
    if (hideSoldOut && lot.quantitySold >= lot.quantity) return false;
    return true;
  });
}
