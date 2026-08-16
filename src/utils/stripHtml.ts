// Extrai só o texto visível de um HTML simples (regex, sem parser de DOM) — a
// descrição do evento agora pode conter HTML (formatação rica definida no b2b),
// e o app ainda exibe esse campo como texto puro, então precisa remover as tags
// antes de mostrar pro usuário.
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
