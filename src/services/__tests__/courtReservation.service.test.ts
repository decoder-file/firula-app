import { apiClient } from "@/api/client";
import { courtReservationService } from "@/services/courtReservation.service";

jest.mock("@/api/client", () => ({ apiClient: { get: jest.fn(), post: jest.fn() } }));

const get = apiClient.get as jest.Mock;
const post = apiClient.post as jest.Mock;

describe("courtReservationService", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it("envia a seleção completa com idempotência e cupom", async () => {
    post.mockResolvedValue({ data: { data: { reservation: { id: "reservation-1" }, payment: null } } });

    await courtReservationService.create({
      courtId: "court-1",
      date: "2026-10-10",
      startTime: "09:00",
      endTime: "11:00",
      notes: "Treino",
      idempotencyKey: "attempt-1",
      couponCode: "QUADRA10",
    });

    expect(post).toHaveBeenCalledWith("/public/courts/reservations", {
      courtId: "court-1",
      date: "2026-10-10",
      startTime: "09:00",
      endTime: "11:00",
      notes: "Treino",
      idempotencyKey: "attempt-1",
      couponCode: "QUADRA10",
    });
  });

  it("paga e acompanha a confirmação da reserva", async () => {
    post.mockResolvedValue({ data: { data: { method: "PIX", qrCodeText: "pix-code" } } });
    get.mockResolvedValue({ data: { data: { status: "CONFIRMED" } } });

    await courtReservationService.pay("reservation-1", { method: "PIX", idempotencyKey: "payment-1" });
    await courtReservationService.getPaymentStatus("reservation-1");

    expect(post).toHaveBeenCalledWith("/public/courts/reservations/reservation-1/pay", {
      method: "PIX",
      idempotencyKey: "payment-1",
    });
    expect(get).toHaveBeenCalledWith("/public/courts/reservations/reservation-1/payment-status");
  });
});
