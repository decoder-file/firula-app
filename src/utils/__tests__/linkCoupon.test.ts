import { normalizeLinkCoupon } from "../linkCoupon";

describe("normalizeLinkCoupon", () => {
  it("normaliza o código vindo do link", () => {
    expect(normalizeLinkCoupon("50-de-desconto")).toBe("50-DE-DESCONTO");
    expect(normalizeLinkCoupon(["promo10", "x"])).toBe("PROMO10");
    expect(normalizeLinkCoupon(" a<b> ")).toBe("AB");
    expect(normalizeLinkCoupon("")).toBeUndefined();
    expect(normalizeLinkCoupon(undefined)).toBeUndefined();
  });
});
