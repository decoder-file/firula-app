/**
 * Cupom vindo de link (firula.com.br/eventos/:id?cupom=PROMO10), normalizado como o backend.
 */
export function normalizeLinkCoupon(raw: string | string[] | undefined | null): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return undefined;
  // Mesma normalização do backend (trim + maiúsculas): espaço e "%" fazem parte do código
  // ("DESCONTO 50% MASTER"). Só tira caracteres de controle e espaços repetidos.
  // eslint-disable-next-line no-control-regex
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, "").trim().toUpperCase().slice(0, 50);
  return cleaned || undefined;
}
