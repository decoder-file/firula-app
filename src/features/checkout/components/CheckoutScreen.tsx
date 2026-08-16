import { useMemo, useState } from "react";
import { Image, View } from "react-native";
import { CreditCard, Lock, QrCode, RotateCcw, ShieldCheck, Tag, UserCheck, X } from "lucide-react-native";

import { Button, PressScale, Text, TextField, useTheme } from "@/design-system";
import { formatCpf, formatPhone } from "@/utils/mask";
import { isValidCpf } from "@/utils/cpf";
import { formatCurrencyFromCents } from "@/utils/format";
import { resolvePlatformEventImageUrl } from "@/services/events.service";
import { AttendeesFieldset } from "@/features/checkout/components/AttendeesFieldset";
import { CustomFieldsStep } from "@/features/checkout/components/CustomFieldsStep";
import { CardStep } from "@/features/checkout/components/CardStep";
import type { UseCheckoutReturn } from "@/features/checkout/useCheckout";

function formatEventDateShort(startsAt: string) {
  return new Date(startsAt).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export function CheckoutScreen({ checkout }: { checkout: UseCheckoutReturn }) {
  const { colors, radius } = useTheme();
  const { event, quote } = checkout;

  if (!event) return null;

  const cardStyle = {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 16,
  };

  const imageUrl = resolvePlatformEventImageUrl({ coverUrl: event.coverUrl, imageUrl: null });

  return (
    <View style={{ gap: 12 }}>
      {/* ── Resumo do pedido ── */}
      <View style={cardStyle}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={{ width: 52, height: 52, borderRadius: 13, backgroundColor: colors.surfaceAlt }} />
          ) : (
            <View style={{ width: 52, height: 52, borderRadius: 13, backgroundColor: colors.surfaceAlt }} />
          )}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text token="bodySm" numberOfLines={2} style={{ fontWeight: "800" }}>
              {event.name}
            </Text>
            <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0, marginTop: 3 }}>
              {formatEventDateShort(event.startsAt)} · {event.location.city}, {event.location.state}
            </Text>
          </View>
        </View>

        {quote ? (
          <View style={{ marginTop: 13, paddingTop: 13, borderTopWidth: 1, borderTopColor: colors.border, gap: 9 }}>
            {quote.items.map((item) => (
              <View key={item.ticketLotId} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text token="bodySm" style={{ flex: 1 }}>
                  <Text token="bodySm" style={{ fontWeight: "800" }}>
                    {item.quantity}×{" "}
                  </Text>
                  {item.name}
                </Text>
                <Text token="bodySm" style={{ fontWeight: "700" }}>
                  {formatCurrencyFromCents(item.subtotalCents)}
                </Text>
              </View>
            ))}
            {quote.discountCents > 0 ? (
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <Tag size={13} color={colors.primaryText} strokeWidth={2} />
                  <Text token="bodySm" style={{ fontWeight: "700", color: colors.primaryText }}>
                    {checkout.couponCode}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text token="bodySm" style={{ fontWeight: "800", color: colors.primaryText }}>
                    − {formatCurrencyFromCents(quote.discountCents)}
                  </Text>
                  <PressScale onPress={checkout.removeCoupon} accessibilityLabel="Remover cupom">
                    <X size={14} color={colors.textMuted} strokeWidth={2} />
                  </PressScale>
                </View>
              </View>
            ) : null}
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 4 }}>
              <Text token="bodySm" style={{ fontWeight: "800" }}>
                Total
              </Text>
              <Text token="bodySm" style={{ fontWeight: "800" }}>
                {formatCurrencyFromCents(quote.finalAmountCents)}
              </Text>
            </View>
          </View>
        ) : null}

        {!quote?.coupon ? <CouponField checkout={checkout} /> : null}
      </View>

      {/* ── Dados do comprador ── */}
      <BuyerCard checkout={checkout} />

      {checkout.additionalAttendees.length > 0 ? <AttendeesCard checkout={checkout} /> : null}

      {checkout.hasCustomFields && !checkout.perAttendeeCustomFields ? (
        <View style={cardStyle}>
          <Text token="bodySm" style={{ fontWeight: "800", marginBottom: 12 }}>
            Informações adicionais
          </Text>
          <CustomFieldsStep checkout={checkout} />
        </View>
      ) : null}

      {/* ── Pagamento ── */}
      <PaymentSection checkout={checkout} />

      {/* ── Confiança ── */}
      {/* <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 13, paddingHorizontal: 4, paddingTop: 4 }}>
        <TrustBadge icon={ShieldCheck} label="Pagamento seguro" />
        <TrustBadge icon={RotateCcw} label="Reembolso até 7 dias" />
        <TrustBadge icon={Lock} label="Dados criptografados" />
      </View> */}
    </View>
  );
}

function TrustBadge({ icon: Icon, label }: { icon: typeof ShieldCheck; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <Icon size={15} color={colors.primaryText} strokeWidth={2} />
      <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0, fontWeight: "600" }}>
        {label}
      </Text>
    </View>
  );
}

function CouponField({ checkout }: { checkout: UseCheckoutReturn }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <PressScale
        onPress={() => setOpen(true)}
        style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, alignSelf: "flex-start" }}
      >
        <Tag size={14} color={colors.primaryText} strokeWidth={2} />
        <Text token="bodySm" style={{ fontWeight: "700", color: colors.primaryText }}>
          Tenho um cupom
        </Text>
      </PressScale>
    );
  }

  return (
    <View style={{ marginTop: 12, gap: 7 }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <TextField
            label=""
            value={checkout.couponInput}
            onChangeText={checkout.setCouponInput}
            placeholder="Código do cupom"
            autoCapitalize="characters"
          />
        </View>
        <Button
          label="Aplicar"
          variant="secondary"
          loading={checkout.isValidatingCoupon}
          disabled={!checkout.couponInput.trim()}
          onPress={() => void checkout.applyCoupon()}
        />
      </View>
      {checkout.couponError ? (
        <Text token="caption" color="error" style={{ textTransform: "none", letterSpacing: 0 }}>
          {checkout.couponError}
        </Text>
      ) : null}
    </View>
  );
}

function BuyerCard({ checkout }: { checkout: UseCheckoutReturn }) {
  const { colors, radius } = useTheme();
  const [expanded, setExpanded] = useState(() => !checkout.isBuyerValid);

  const cardStyle = {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 16,
  };

  if (!expanded && checkout.isBuyerValid) {
    return (
      <View style={cardStyle}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              backgroundColor: colors.primarySoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserCheck size={19} color={colors.primaryText} strokeWidth={2} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text token="bodySm" style={{ fontWeight: "800" }}>
              {checkout.buyerName}
            </Text>
            <Text token="caption" color="muted" numberOfLines={1} style={{ textTransform: "none", letterSpacing: 0, marginTop: 2 }}>
              {checkout.buyerEmail} · CPF {formatCpf(checkout.buyerCpf)}
            </Text>
          </View>
          <Button label="Editar" variant="secondary" size="sm" onPress={() => setExpanded(true)} />
        </View>
      </View>
    );
  }

  return (
    <View style={cardStyle}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <Text token="bodySm" style={{ fontWeight: "800" }}>
          Dados do comprador
        </Text>
        {checkout.isBuyerValid ? (
          <PressScale onPress={() => setExpanded(false)}>
            <Text token="bodySm" style={{ fontWeight: "700", color: colors.primaryText }}>
              Concluído
            </Text>
          </PressScale>
        ) : null}
      </View>
      <View style={{ gap: 9 }}>
        <TextField label="E-mail" value={checkout.buyerEmail} onChangeText={() => {}} disabled />
        <TextField label="Nome completo" value={checkout.buyerName} onChangeText={checkout.setBuyerName} />
        <TextField
          label="CPF"
          value={formatCpf(checkout.buyerCpf)}
          onChangeText={checkout.setBuyerCpf}
          keyboardType="number-pad"
          maxLength={14}
          error={checkout.buyerCpf && !isValidCpf(checkout.buyerCpf) ? "CPF inválido" : undefined}
        />
        <TextField
          label="Telefone"
          value={formatPhone(checkout.buyerPhone)}
          onChangeText={checkout.setBuyerPhone}
          keyboardType="phone-pad"
          maxLength={15}
        />
      </View>
    </View>
  );
}

function AttendeesCard({ checkout }: { checkout: UseCheckoutReturn }) {
  const { colors, radius } = useTheme();
  const { event, ticketLotsPayload, additionalAttendees, updateAdditionalAttendee, filterCustomFieldsForLot } = checkout;

  const attendeeLots = useMemo(() => {
    if (!event) return [];
    const flat: { lotId: string; lotName: string }[] = [];
    for (const item of ticketLotsPayload) {
      const lot = event.ticketLots.find((l) => l.id === item.ticketLotId);
      for (let i = 0; i < item.quantity; i++) {
        flat.push({ lotId: item.ticketLotId, lotName: lot?.name ?? "" });
      }
    }
    return flat.slice(1);
  }, [event, ticketLotsPayload]);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.xl,
        padding: 16,
        gap: 12,
      }}
    >
      <Text token="bodySm" style={{ fontWeight: "800" }}>
        Participantes
      </Text>
      {additionalAttendees.map((attendee, index) => (
        <AttendeesFieldset
          key={index}
          index={index}
          lotName={attendeeLots[index]?.lotName ?? ""}
          customFields={filterCustomFieldsForLot(attendeeLots[index]?.lotId ?? "")}
          attendee={attendee}
          onChange={(patch) => updateAdditionalAttendee(index, patch)}
        />
      ))}
    </View>
  );
}

function PaymentSection({ checkout }: { checkout: UseCheckoutReturn }) {
  const { colors, radius } = useTheme();
  const { quote, paymentMethod, setPaymentMethod } = checkout;

  const available = quote?.availablePaymentMethods ?? [];
  const flow = quote?.card?.flow ?? "TRANSPARENT";

  if (!quote) return null;

  if (available.length === 0) {
    return (
      <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: 16 }}>
        <Text token="bodySm" style={{ fontWeight: "800", marginBottom: 6 }}>
          Pagamento
        </Text>
        <Text token="bodySm" color="muted">
          Nenhuma forma de pagamento está disponível para este evento no momento.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 9 }}>
      <Text token="bodySm" style={{ fontWeight: "800", paddingHorizontal: 4 }}>
        Como você quer pagar?
      </Text>

      {available.includes("PIX") ? (
        <PaymentOptionRow
          selected={paymentMethod === "PIX"}
          onPress={() => setPaymentMethod("PIX")}
          icon={QrCode}
          iconBg={colors.primarySoft}
          iconColor={colors.primaryText}
          title="Pix"
          // badge="MAIS RÁPIDO"
          subtitle="Aprovação imediata · ingresso na hora"
        />
      ) : null}

      {available.includes("CARD") ? (
        <View
          style={{
            backgroundColor: paymentMethod === "CARD" ? colors.primarySoft : colors.surface,
            borderWidth: 1.5,
            borderColor: paymentMethod === "CARD" ? colors.primary : colors.border,
            borderRadius: radius.lg,
            padding: 15,
          }}
        >
          <PressScale
            onPress={() => setPaymentMethod("CARD")}
            style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            accessibilityRole="button"
            accessibilityState={{ selected: paymentMethod === "CARD" }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                backgroundColor: colors.infoSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CreditCard size={20} color={colors.info} strokeWidth={2} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text token="bodySm" style={{ fontWeight: "800" }}>
                Novo cartão
              </Text>
              <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0, marginTop: 2 }}>
                {flow === "REDIRECT" ? "Crédito · pagamento em página segura" : "Crédito · parcelamento disponível"}
              </Text>
            </View>
            <RadioDot selected={paymentMethod === "CARD"} />
          </PressScale>

          {paymentMethod === "CARD" ? (
            flow === "REDIRECT" ? (
              <View style={{ marginTop: 13, paddingTop: 13, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0, lineHeight: 16 }}>
                  Ao continuar, você será redirecionado para concluir o pagamento com cartão de forma segura.
                </Text>
              </View>
            ) : (
              <CardStep checkout={checkout} />
            )
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function PaymentOptionRow({
  selected,
  onPress,
  icon: Icon,
  iconBg,
  iconColor,
  title,
  badge,
  subtitle,
}: {
  selected: boolean;
  onPress: () => void;
  icon: typeof QrCode;
  iconBg: string;
  iconColor: string;
  title: string;
  badge?: string;
  subtitle: string;
}) {
  const { colors, radius } = useTheme();

  return (
    <PressScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: selected ? colors.primarySoft : colors.surface,
        borderWidth: 1.5,
        borderColor: selected ? colors.primary : colors.border,
        borderRadius: radius.lg,
        padding: 15,
      }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 11, backgroundColor: iconBg, alignItems: "center", justifyContent: "center" }}>
        <Icon size={20} color={iconColor} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          <Text token="bodySm" style={{ fontWeight: "800" }}>
            {title}
          </Text>
          {badge ? (
            <View style={{ backgroundColor: colors.primary, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={{ fontSize: 9.5, fontWeight: "800", color: colors.onPrimary, letterSpacing: 0.3 }}>{badge}</Text>
            </View>
          ) : null}
        </View>
        <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0, marginTop: 2 }}>
          {subtitle}
        </Text>
      </View>
      <RadioDot selected={selected} />
    </PressScale>
  );
}

function RadioDot({ selected }: { selected: boolean }) {
  const { colors } = useTheme();
  return selected ? (
    <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 6.5, borderColor: colors.primary, backgroundColor: colors.surface }} />
  ) : (
    <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border }} />
  );
}
