import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Tag } from "lucide-react-native";
import { Image, ScrollView, Text, TextInput, View } from "react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { Screen } from "@/components/Screen";
import { useApp } from "@/contexts/AppContext";
import { getEventById } from "@/data/mockData";
import { colors } from "@/theme/colors";
import { formatCurrency } from "@/utils/format";

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, completePurchase, walletBalance, couponCode, setCouponCode, appliedDiscount } = useApp();

  if (!cart.length) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-sm text-muted-foreground">Seu carrinho está vazio</Text>
          <AnimatedPressable className="mt-4 rounded-2xl bg-primary px-6 py-3" onPress={() => router.replace("/") }>
            <Text className="font-bold text-sm text-primary-foreground">Explorar eventos</Text>
          </AnimatedPressable>
        </View>
      </Screen>
    );
  }

  const item = cart[0];
  const event = getEventById(item.eventId);

  if (!event) {
    return null;
  }

  const subtotal = item.price * item.quantity;
  const discount = subtotal * appliedDiscount;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal - discount + serviceFee;
  const cashback = Math.round(total * 0.1);

  return (
    <Screen edges={["top", "left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1">
        <View className="flex-row items-center gap-3 bg-card px-4 py-4">
          <AnimatedPressable onPress={() => router.back()}>
            <ArrowLeft color={colors.foreground} size={22} strokeWidth={1.5} />
          </AnimatedPressable>
          <Text className="font-bold text-lg text-foreground">Checkout</Text>
        </View>

        <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          <View className="flex-row gap-3 rounded-2xl bg-card p-3">
            <Image source={event.image} className="h-20 w-20 rounded-xl" resizeMode="cover" />
            <View className="flex-1">
              <Text numberOfLines={2} className="font-bold text-sm text-foreground">
                {event.title}
              </Text>
              <Text className="mt-1 text-xs text-muted-foreground">{event.city}</Text>
              <Text className="mt-1 font-medium text-xs text-primary">{item.ticketTypeName} x {item.quantity}</Text>
            </View>
          </View>

          <View className="mt-4 rounded-2xl bg-card p-4">
            <View className="flex-row items-center gap-2">
              <Tag color={colors.primary} size={16} strokeWidth={1.5} />
              <Text className="font-medium text-sm text-foreground">Cupom de desconto</Text>
            </View>
            <View className="mt-3 flex-row gap-2">
              <TextInput
                value={couponCode}
                onChangeText={(value) => setCouponCode(value.toUpperCase())}
                placeholder="Digite o código"
                placeholderTextColor={colors.mutedForeground}
                className="flex-1 rounded-2xl bg-secondary px-3 py-3 text-sm text-foreground"
              />
              <AnimatedPressable className="rounded-2xl bg-primary px-4 py-3">
                <Text className="font-bold text-xs text-primary-foreground">Aplicar</Text>
              </AnimatedPressable>
            </View>
            {appliedDiscount > 0 ? <Text className="mt-2 font-medium text-xs text-primary">Cupom aplicado - {appliedDiscount * 100}% de desconto</Text> : null}
            <Text className="mt-1 text-[10px] text-muted-foreground">Dica: use FIRULA10 para 10% off</Text>
          </View>

          <View className="mt-4 rounded-2xl bg-card p-4">
            <Text className="font-bold text-sm text-foreground">Resumo</Text>
            <View className="mt-3 gap-2">
              <PriceRow label="Subtotal" value={formatCurrency(subtotal)} />
              {discount > 0 ? <PriceRow label="Desconto" value={`-${formatCurrency(discount)}`} valueClassName="text-primary" labelClassName="text-primary" /> : null}
              <PriceRow label="Taxa de serviço" value={formatCurrency(serviceFee)} />
              <View className="mt-1 border-t border-border pt-3">
                <View className="flex-row items-center justify-between">
                  <Text className="font-bold text-sm text-foreground">Total</Text>
                  <Text className="font-extrabold text-lg text-foreground">{formatCurrency(total)}</Text>
                </View>
              </View>
            </View>
            <View className="mt-3 rounded-2xl bg-accent px-3 py-3">
              <Text className="text-xs text-accent-foreground">Você vai ganhar <Text className="font-bold">{formatCurrency(cashback)}</Text> de cashback</Text>
            </View>
          </View>

          <View className="mt-4 rounded-2xl bg-card p-4">
            <Text className="font-bold text-sm text-foreground">Forma de pagamento</Text>
            <View className="mt-3 gap-2">
              <PaymentRow title="Carteira Firula" subtitle={`Saldo: ${formatCurrency(walletBalance)}`} active />
              <PaymentRow title="Cartão de crédito" subtitle="Em breve" />
              <PaymentRow title="PIX" subtitle="Em breve" />
            </View>
          </View>
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-card px-4 pb-8 pt-4">
          <AnimatedPressable
            className="rounded-2xl bg-primary py-4"
            onPress={() => {
              completePurchase(item.eventId, item.ticketTypeName, total);
              router.replace("/purchase-success");
            }}
          >
            <Text className="text-center font-bold text-sm text-primary-foreground">Confirmar compra - {formatCurrency(total)}</Text>
          </AnimatedPressable>
        </View>
      </View>
    </Screen>
  );
}

const PriceRow = ({ label, value, labelClassName = "text-muted-foreground", valueClassName = "text-foreground" }: { label: string; value: string; labelClassName?: string; valueClassName?: string }) => (
  <View className="flex-row items-center justify-between">
    <Text className={`text-sm ${labelClassName}`}>{label}</Text>
    <Text className={`text-sm ${valueClassName}`}>{value}</Text>
  </View>
);

const PaymentRow = ({ title, subtitle, active = false }: { title: string; subtitle: string; active?: boolean }) => (
  <View className={`rounded-2xl border p-3 ${active ? "border-primary bg-accent" : "border-border bg-card opacity-60"}`}>
    <Text className="font-medium text-sm text-foreground">{title}</Text>
    <Text className="text-xs text-muted-foreground">{subtitle}</Text>
  </View>
);