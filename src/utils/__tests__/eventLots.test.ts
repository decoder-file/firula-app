import { selectVisibleLots } from "@/utils/eventLots";

const lots = [
  { id: "ativo", active: true, quantity: 100, quantitySold: 10 },
  { id: "desativado", active: false, quantity: 100, quantitySold: 0 },
  { id: "esgotado", active: true, quantity: 50, quantitySold: 50 },
];

describe("selectVisibleLots", () => {
  it("nunca exibe lote desativado", () => {
    const ids = selectVisibleLots(lots).map((lot) => lot.id);
    expect(ids).toEqual(["ativo", "esgotado"]);
  });

  it("oculta esgotados só quando o organizador ligou a opção", () => {
    expect(selectVisibleLots(lots, { hideSoldOutLots: true }).map((lot) => lot.id)).toEqual(["ativo"]);
    expect(selectVisibleLots(lots, { hideSoldOutLots: false }).map((lot) => lot.id)).toEqual(["ativo", "esgotado"]);
    expect(selectVisibleLots(lots, null).map((lot) => lot.id)).toEqual(["ativo", "esgotado"]);
  });

  it("preserva a ordem original", () => {
    const ordered = [lots[2], lots[0]];
    expect(selectVisibleLots(ordered).map((lot) => lot.id)).toEqual(["esgotado", "ativo"]);
  });
});
