import { apiClient } from "@/api/client";
import { dayUseService } from "@/services/dayUse.service";

jest.mock("@/api/client", () => ({
  apiClient: { delete: jest.fn(), get: jest.fn(), post: jest.fn() },
}));

const deleteRequest = apiClient.delete as jest.Mock;
const get = apiClient.get as jest.Mock;
const post = apiClient.post as jest.Mock;

describe("dayUseService", () => {
  beforeEach(() => {
    deleteRequest.mockReset();
    get.mockReset();
    post.mockReset();
  });

  it("lista e cancela as reservas de Day Use do cliente autenticado", async () => {
    get.mockResolvedValue({ data: { data: [{ id: "reservation-1" }] } });
    deleteRequest.mockResolvedValue({ data: { data: { id: "reservation-1", status: "CANCELED" } } });

    await dayUseService.listMine();
    await dayUseService.cancel("reservation-1");

    expect(get).toHaveBeenCalledWith("/public/courts/day-uses/reservations/my");
    expect(deleteRequest).toHaveBeenCalledWith("/public/courts/day-uses/reservations/reservation-1");
  });

  it("cria a reserva com idempotência e cupom", async () => {
    post.mockResolvedValue({
      data: { data: { reservation: { id: "reservation-1", status: "PENDING_PAYMENT" }, payment: null } },
    });

    await dayUseService.reserve("day-use-1", {
      idempotencyKey: "attempt-1",
      couponCode: "DAY10",
    });

    expect(post).toHaveBeenCalledWith("/public/courts/day-uses/day-use-1/reserve", {
      idempotencyKey: "attempt-1",
      couponCode: "DAY10",
    });
  });

  it("gera o Pix e consulta o status da mesma reserva", async () => {
    post.mockResolvedValue({ data: { data: { method: "PIX", qrCodeText: "pix-code" } } });
    get.mockResolvedValue({ data: { data: { status: "CONFIRMED" } } });

    await dayUseService.pay("reservation-1", { method: "PIX", idempotencyKey: "payment-1" });
    await dayUseService.getPaymentStatus("reservation-1");

    expect(post).toHaveBeenCalledWith("/public/courts/day-uses/reservations/reservation-1/pay", {
      method: "PIX",
      idempotencyKey: "payment-1",
    });
    expect(get).toHaveBeenCalledWith("/public/courts/day-uses/reservations/reservation-1/payment-status");
  });
});
