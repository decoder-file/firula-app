import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { isApiError } from "@/api/errors";
import { queryKeys } from "@/hooks/queryKeys";
import { useAuthUser, useAuthUserProfile } from "@/hooks/useAuth";
import { checkoutService } from "@/services/checkout.service";
import type { AdminEventDetail } from "@/services/events.service";
import { onlyDigits } from "@/utils/mask";
import type {
  AttendeeInput,
  CheckoutOrderData,
  CreatePurchasePayload,
  CustomFieldAnswerInput,
  PurchaseQuote,
  TicketLotSelectionInput,
} from "@/features/checkout/types";

export type CheckoutStep = "review" | "custom" | "info" | "pix" | "success";

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 30 * 60 * 1000;
const ORDER_TERMINAL_FAILURE_STATUSES = ["CANCELED", "EXPIRED"];
const PIX_EXPIRES_IN_MINUTES = 30;

function generateIdempotencyKey(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export interface AdditionalAttendee {
  sameAsBuyer: boolean;
  name: string;
  cpf: string;
  phone: string;
  customFieldValues: Record<string, string>;
}

export interface SuccessTicket {
  id: string;
  qrCode: string;
  attendeeName: string;
  lotName: string;
}

export function useCheckout(event: AdminEventDetail | undefined, selection: Record<string, number>) {
  const authUser = useAuthUser();
  const authProfile = useAuthUserProfile();

  const ticketLotsPayload: TicketLotSelectionInput[] = useMemo(
    () =>
      Object.entries(selection)
        .filter(([, qty]) => qty > 0)
        .map(([ticketLotId, quantity]) => ({ ticketLotId, quantity })),
    [selection],
  );

  const totalQuantity = useMemo(
    () => ticketLotsPayload.reduce((sum, item) => sum + item.quantity, 0),
    [ticketLotsPayload],
  );

  // ── Cupom ────────────────────────────────────────────────────────────────
  const [couponCode, setCouponCode] = useState<string | undefined>(undefined);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // ── Cotação ──────────────────────────────────────────────────────────────
  const {
    data: quote,
    isLoading: quoteLoading,
    error: quoteError,
  } = useQuery<PurchaseQuote>({
    queryKey: queryKeys.checkout.quote(event?.id ?? "", selection, couponCode),
    queryFn: () => checkoutService.getQuote(event!.id, ticketLotsPayload, couponCode),
    enabled: !!event?.id && ticketLotsPayload.length > 0,
  });

  const applyCoupon = useCallback(async () => {
    if (!event || !couponInput.trim() || !quote) return;
    setIsValidatingCoupon(true);
    setCouponError(null);
    try {
      const result = await checkoutService.validateCoupon(
        event.id,
        couponInput.trim(),
        quote.grossAmountCents,
      );
      if (!result.valid) {
        setCouponError(result.message || "Cupom inválido.");
        return;
      }
      setCouponCode(couponInput.trim());
    } catch (err) {
      setCouponError(isApiError(err) ? err.message : "Não foi possível validar o cupom.");
    } finally {
      setIsValidatingCoupon(false);
    }
  }, [event, couponInput, quote]);

  const removeCoupon = useCallback(() => {
    setCouponCode(undefined);
    setCouponInput("");
    setCouponError(null);
  }, []);

  // ── Termos ───────────────────────────────────────────────────────────────
  const requiresTermsAcceptance = useMemo(
    () => !!event?.policies.hasTerms && (event?.eventTerms ?? []).some((term) => term.required),
    [event],
  );
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // ── Dados do comprador ───────────────────────────────────────────────────
  const buyerEmail = authUser?.email ?? "";
  const [buyerName, setBuyerName] = useState(authUser?.name ?? "");
  const [buyerCpf, setBuyerCpf] = useState(authProfile?.cpf ?? "");
  const [buyerPhone, setBuyerPhone] = useState(authProfile?.phone ?? "");

  useEffect(() => {
    if (authUser?.name) setBuyerName((prev) => prev || authUser.name);
  }, [authUser?.name]);
  useEffect(() => {
    if (authProfile?.cpf) setBuyerCpf((prev) => prev || authProfile.cpf);
  }, [authProfile?.cpf]);
  useEffect(() => {
    if (authProfile?.phone) setBuyerPhone((prev) => prev || authProfile.phone);
  }, [authProfile?.phone]);

  // ── Campos customizados ──────────────────────────────────────────────────
  const hasCustomFields = (event?.customFields.length ?? 0) > 0;
  const attendeeDataStrategy = event?.settings.attendeeDataStrategy ?? "OPTIONAL_AFTER_PAYMENT";
  const perAttendeeCustomFields =
    hasCustomFields && attendeeDataStrategy === "REQUIRED_BEFORE_PAYMENT" && totalQuantity > 1;

  const [sharedCustomFieldValues, setSharedCustomFieldValues] = useState<Record<string, string>>({});

  const relevantCustomFields = useMemo(() => {
    if (!event) return [];
    const selectedLotIds = new Set(ticketLotsPayload.map((item) => item.ticketLotId));
    return event.customFields.filter(
      (field) => field.ticketLotIds.length === 0 || field.ticketLotIds.some((id) => selectedLotIds.has(id)),
    );
  }, [event, ticketLotsPayload]);

  const filterCustomFieldsForLot = useCallback(
    (ticketLotId: string) =>
      relevantCustomFields.filter(
        (field) => field.ticketLotIds.length === 0 || field.ticketLotIds.includes(ticketLotId),
      ),
    [relevantCustomFields],
  );

  const areRequiredCustomFieldsFilled = useMemo(() => {
    if (!hasCustomFields || perAttendeeCustomFields) return true;
    return relevantCustomFields
      .filter((field) => field.required)
      .every((field) => (sharedCustomFieldValues[field.key] ?? "").trim().length > 0);
  }, [hasCustomFields, perAttendeeCustomFields, relevantCustomFields, sharedCustomFieldValues]);

  // ── Participantes adicionais (quando exigido antes do pagamento) ────────
  const additionalAttendeeCount =
    attendeeDataStrategy === "REQUIRED_BEFORE_PAYMENT" && totalQuantity > 1 ? totalQuantity - 1 : 0;

  const [additionalAttendees, setAdditionalAttendees] = useState<AdditionalAttendee[]>([]);

  useEffect(() => {
    setAdditionalAttendees((prev) => {
      const next: AdditionalAttendee[] = [];
      for (let i = 0; i < additionalAttendeeCount; i++) {
        next.push(
          prev[i] ?? { sameAsBuyer: true, name: "", cpf: "", phone: "", customFieldValues: {} },
        );
      }
      return next;
    });
  }, [additionalAttendeeCount]);

  const updateAdditionalAttendee = useCallback((index: number, patch: Partial<AdditionalAttendee>) => {
    setAdditionalAttendees((prev) =>
      prev.map((attendee, i) => (i === index ? { ...attendee, ...patch } : attendee)),
    );
  }, []);

  const isAdditionalAttendeeValid = useCallback(
    (attendee: AdditionalAttendee, lotId: string) => {
      if (attendee.sameAsBuyer) return true;
      const fieldsForLot = filterCustomFieldsForLot(lotId).filter((field) => field.required);
      const customFieldsOk = fieldsForLot.every(
        (field) => (attendee.customFieldValues[field.key] ?? "").trim().length > 0,
      );
      return (
        attendee.name.trim().length >= 3 &&
        onlyDigits(attendee.cpf).length === 11 &&
        onlyDigits(attendee.phone).length >= 10 &&
        customFieldsOk
      );
    },
    [filterCustomFieldsForLot],
  );

  // ── Payload de attendees, na mesma ordem/agrupamento de ticketLots[] ────
  const buildAttendeesPayload = useCallback((): AttendeeInput[] => {
    const buyerCustomFields: CustomFieldAnswerInput[] = Object.entries(sharedCustomFieldValues)
      .filter(([, value]) => value.trim().length > 0)
      .map(([key, value]) => ({ key, value }));

    let unitIndex = 0;
    const attendees: AttendeeInput[] = [];

    for (const lot of ticketLotsPayload) {
      for (let i = 0; i < lot.quantity; i++) {
        if (unitIndex === 0) {
          // Ticket #1 é sempre o próprio comprador.
          attendees.push({
            name: buyerName.trim(),
            cpf: onlyDigits(buyerCpf),
            phone: onlyDigits(buyerPhone),
            customFields: buyerCustomFields.filter((field) =>
              filterCustomFieldsForLot(lot.ticketLotId).some((f) => f.key === field.key),
            ),
          });
        } else {
          const additional = additionalAttendees[unitIndex - 1];
          if (!additional || additional.sameAsBuyer) {
            attendees.push({
              name: buyerName.trim(),
              cpf: onlyDigits(buyerCpf),
              phone: onlyDigits(buyerPhone),
              customFields: buyerCustomFields.filter((field) =>
                filterCustomFieldsForLot(lot.ticketLotId).some((f) => f.key === field.key),
              ),
            });
          } else {
            attendees.push({
              name: additional.name.trim(),
              cpf: onlyDigits(additional.cpf),
              phone: onlyDigits(additional.phone),
              customFields: Object.entries(additional.customFieldValues)
                .filter(([, value]) => value.trim().length > 0)
                .map(([key, value]) => ({ key, value })),
            });
          }
        }
        unitIndex += 1;
      }
    }

    return attendees;
  }, [
    ticketLotsPayload,
    buyerName,
    buyerCpf,
    buyerPhone,
    additionalAttendees,
    sharedCustomFieldValues,
    filterCustomFieldsForLot,
  ]);

  // ── Passos ───────────────────────────────────────────────────────────────
  const steps = useMemo<CheckoutStep[]>(() => {
    const list: CheckoutStep[] = ["review"];
    if (hasCustomFields && !perAttendeeCustomFields) list.push("custom");
    list.push("info");
    if (!quote || !quote.isFree) list.push("pix");
    list.push("success");
    return list;
  }, [hasCustomFields, perAttendeeCustomFields, quote]);

  const [step, setStep] = useState<CheckoutStep>("review");

  const goNext = useCallback(() => {
    setStep((current) => {
      const index = steps.indexOf(current);
      return steps[index + 1] ?? current;
    });
  }, [steps]);

  const goBack = useCallback(() => {
    setStep((current) => {
      const index = steps.indexOf(current);
      return index > 0 ? steps[index - 1] : current;
    });
  }, [steps]);

  // ── Compra + pagamento PIX ───────────────────────────────────────────────
  const idempotencyKeyRef = useRef(generateIdempotencyKey());
  const startNewAttempt = useCallback(() => {
    idempotencyKeyRef.current = generateIdempotencyKey();
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pixError, setPixError] = useState<string | null>(null);
  const [pixSession, setPixSession] = useState<{
    orderId: string;
    qrCodeText: string;
    qrCodeImage: string | null;
    expiresAt: string;
  } | null>(null);
  const [isPollingPix, setIsPollingPix] = useState(false);
  const [orderData, setOrderData] = useState<CheckoutOrderData | null>(null);
  const [successTickets, setSuccessTickets] = useState<SuccessTicket[]>([]);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [successTotalCents, setSuccessTotalCents] = useState(0);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    pollIntervalRef.current = null;
    pollTimeoutRef.current = null;
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const pollOrderStatus = useCallback(
    (orderId: string): Promise<CheckoutOrderData> => {
      stopPolling();
      return new Promise<CheckoutOrderData>((resolve, reject) => {
        const tick = async () => {
          try {
            const order = await checkoutService.getOrder(orderId);
            setOrderData(order);
            if (order.status === "PAID") {
              stopPolling();
              resolve(order);
            } else if (ORDER_TERMINAL_FAILURE_STATUSES.includes(order.status)) {
              stopPolling();
              reject(new Error("O pagamento não foi concluído. Tente novamente."));
            }
          } catch {
            // Falha pontual de rede numa tentativa: ignora, a próxima tenta de novo.
          }
        };

        pollIntervalRef.current = setInterval(tick, POLL_INTERVAL_MS);
        pollTimeoutRef.current = setTimeout(() => {
          stopPolling();
          reject(new Error("Tempo esgotado aguardando a confirmação do pagamento."));
        }, POLL_TIMEOUT_MS);

        void tick();
      });
    },
    [stopPolling],
  );

  const buildBasePayload = useCallback(
    (): Omit<CreatePurchasePayload, "payment"> => ({
      fullName: buyerName.trim(),
      phone: onlyDigits(buyerPhone),
      cpf: onlyDigits(buyerCpf),
      email: buyerEmail,
      ticketLots: ticketLotsPayload,
      attendees: buildAttendeesPayload(),
      ...(couponCode ? { couponCode } : {}),
    }),
    [buyerName, buyerPhone, buyerCpf, buyerEmail, ticketLotsPayload, buildAttendeesPayload, couponCode],
  );

  const handlePurchaseError = useCallback(
    (err: unknown) => {
      let message = "Não foi possível concluir a compra. Tente novamente.";
      if (isApiError(err)) {
        message = err.message || message;
        if (message.includes("Idempotency key already used")) {
          startNewAttempt();
        }
        if (err.code?.startsWith("COUPON_")) {
          removeCoupon();
        }
      }
      return message;
    },
    [startNewAttempt, removeCoupon],
  );

  const runPixPayment = useCallback(async () => {
    if (!event) return;
    setIsSubmitting(true);
    setPixError(null);
    try {
      const response = await checkoutService.createPurchase(event.id, {
        ...buildBasePayload(),
        payment: {
          method: "PIX",
          expiresInMinutes: PIX_EXPIRES_IN_MINUTES,
          idempotencyKey: idempotencyKeyRef.current,
        },
      });

      const pix = response.payment?.pix;
      if (!pix?.qrCodeText) {
        throw new Error("Resposta de pagamento PIX incompleta.");
      }

      setPixSession({
        orderId: response.order.id,
        qrCodeText: pix.qrCodeText,
        qrCodeImage: pix.qrCodeImage,
        expiresAt: pix.expiresAt,
      });
      setIsSubmitting(false);
      setIsPollingPix(true);

      const finalOrder = await pollOrderStatus(response.order.id);
      setSuccessOrderId(finalOrder.id);
      setSuccessTotalCents(finalOrder.totalAmount);
      setSuccessTickets(
        finalOrder.items
          .filter((item) => item.ticket)
          .map((item) => ({
            id: item.ticket!.id,
            qrCode: item.ticket!.qrCode,
            attendeeName: item.ticket!.attendee?.name ?? "",
            lotName: item.ticketLot?.name ?? "",
          })),
      );
      setIsPollingPix(false);
      setStep("success");
    } catch (err) {
      setIsPollingPix(false);
      setPixError(handlePurchaseError(err));
    } finally {
      setIsSubmitting(false);
    }
  }, [event, buildBasePayload, pollOrderStatus, handlePurchaseError]);

  const createPixPayment = useCallback(() => {
    startNewAttempt();
    void runPixPayment();
  }, [startNewAttempt, runPixPayment]);

  const retryPixPayment = useCallback(() => {
    void runPixPayment();
  }, [runPixPayment]);

  const createFreeOrder = useCallback(async () => {
    if (!event) return false;
    setIsSubmitting(true);
    setPixError(null);
    try {
      const response = await checkoutService.createPurchase(event.id, buildBasePayload());
      setSuccessOrderId(response.order.id);
      setSuccessTotalCents(response.order.totalAmountCents);
      setSuccessTickets(
        response.tickets.map((ticket) => ({
          id: ticket.id,
          qrCode: ticket.qrCode,
          attendeeName: ticket.attendee?.name ?? "",
          lotName: ticket.orderItem?.ticketLot?.name ?? "",
        })),
      );
      setStep("success");
      return true;
    } catch (err) {
      setPixError(handlePurchaseError(err));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [event, buildBasePayload, handlePurchaseError]);

  return {
    event,
    ticketLotsPayload,
    totalQuantity,
    quote,
    quoteLoading,
    quoteError,
    couponCode,
    couponInput,
    setCouponInput,
    couponError,
    isValidatingCoupon,
    applyCoupon,
    removeCoupon,
    requiresTermsAcceptance,
    acceptedTerms,
    setAcceptedTerms,
    buyerEmail,
    buyerName,
    setBuyerName,
    buyerCpf,
    setBuyerCpf,
    buyerPhone,
    setBuyerPhone,
    hasCustomFields,
    perAttendeeCustomFields,
    relevantCustomFields,
    filterCustomFieldsForLot,
    sharedCustomFieldValues,
    setSharedCustomFieldValues,
    areRequiredCustomFieldsFilled,
    additionalAttendees,
    updateAdditionalAttendee,
    isAdditionalAttendeeValid,
    step,
    steps,
    setStep,
    goNext,
    goBack,
    isSubmitting,
    pixError,
    pixSession,
    isPollingPix,
    orderData,
    successTickets,
    successOrderId,
    successTotalCents,
    createPixPayment,
    retryPixPayment,
    createFreeOrder,
  };
}

export type UseCheckoutReturn = ReturnType<typeof useCheckout>;
