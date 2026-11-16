/** Nome de quem é dono do ingresso (o participante), pronto para exibir; `undefined` se vazio. */
export const getTicketHolderName = (attendee?: { name?: string | null } | null): string | undefined => {
  const name = attendee?.name?.replace(/\s+/g, " ").trim();
  return name ? name : undefined;
};
