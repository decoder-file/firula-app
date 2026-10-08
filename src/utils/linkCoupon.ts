/**
 * Cupom vindo de link (firula.com.br/eventos/:id?cupom=PROMO10). Mesma limpeza do site:
 * maiúsculas e só letras, números, hífen e sublinhado.
 */
export function normalizeLinkCoupon(raw: string | string[] | undefined | null): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return undefined;
  const cleaned = value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 50);
  return cleaned || undefined;
}
