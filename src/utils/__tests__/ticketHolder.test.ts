import { getTicketHolderName } from "@/utils/ticketHolder";

describe("getTicketHolderName", () => {
  it("devolve o nome do participante sem espaços sobrando", () => {
    expect(getTicketHolderName({ name: "  Ana   Souza " })).toBe("Ana Souza");
  });

  it("sem participante ou sem nome: undefined", () => {
    expect(getTicketHolderName(undefined)).toBeUndefined();
    expect(getTicketHolderName(null)).toBeUndefined();
    expect(getTicketHolderName({ name: null })).toBeUndefined();
    expect(getTicketHolderName({ name: "   " })).toBeUndefined();
  });
});
