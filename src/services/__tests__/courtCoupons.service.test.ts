import { apiClient } from "@/api/client";
import { courtCouponsService } from "@/services/courtCoupons.service";

jest.mock("@/api/client", () => ({ apiClient: { post: jest.fn() } }));

const post = apiClient.post as jest.Mock;

describe("courtCouponsService.validate", () => {
  beforeEach(() => post.mockReset());

  it("envia o alvo da reserva sem nenhum valor — o preço é do servidor", async () => {
    post.mockResolvedValue({ data: { data: { valid: true, code: "QUADRA10", discountCents: 500, finalAmountCents: 4500 } } });

    const result = await courtCouponsService.validate(" QUADRA10 ", {
      target: "COURT_RESERVATION",
      courtId: "court-1",
      date: "2026-10-01",
      startTime: "09:00",
      endTime: "10:00",
    });

    expect(post).toHaveBeenCalledWith("/public/courts/coupons/validate", {
      code: "QUADRA10",
      target: "COURT_RESERVATION",
      courtId: "court-1",
      date: "2026-10-01",
      startTime: "09:00",
      endTime: "10:00",
    });
    expect(result).toMatchObject({ valid: true, finalAmountCents: 4500 });
  });

  it("devolve a recusa do servidor para Day Use", async () => {
    post.mockResolvedValue({ data: { data: { valid: false, error: "COURT_COUPON_EXPIRED", message: "Este cupom expirou." } } });

    await expect(courtCouponsService.validate("VELHO", { target: "DAY_USE", dayUseId: "du-1" })).resolves.toEqual({
      valid: false,
      error: "COURT_COUPON_EXPIRED",
      message: "Este cupom expirou.",
    });
  });
});
