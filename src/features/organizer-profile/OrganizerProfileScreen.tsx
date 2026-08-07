import React, { useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  AlertCircle,
  AtSign,
  BadgeCheck,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  Globe,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  ShoppingBag,
  Star,
  Sun,
  UserCheck,
  UserX,
} from "lucide-react-native";

import { BottomSheet, Button, Chip, EmptyState, EventCard, IconButton, ListItem, PressScale, Skeleton, TabBar, Text, useTheme } from "@/design-system";
import { ReviewsSheet } from "@/features/organizer-profile/components/ReviewsSheet";
import type {
  OrganizerContactItem,
  OrganizerCourtItem,
  OrganizerCourtSlotItem,
  OrganizerDateOptionItem,
  OrganizerDayUseOfferingItem,
  OrganizerProfileScreenProps,
  OrganizerStoreProductItem,
} from "@/features/organizer-profile/types";

const DESCRIPTION_TRUNCATE_LENGTH = 140;

function contactIcon(label: string) {
  if (label === "Instagram") return AtSign;
  if (label === "Contato") return MessageCircle;
  return Globe;
}

function formatPriceCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function OrganizerProfileScreen({
  status,
  onRetry,
  orgName,
  initials,
  logoUrl,
  location,
  description,
  followersCount,
  eventsCount,
  rating,
  reviewsCount,
  isFollowing,
  isFollowBusy,
  tabs,
  activeTab,
  onChangeTab,
  events,
  contacts,
  storeProducts,
  isStoreLoading,
  dayUseOfferings,
  isDayUseLoading,
  courts,
  isCourtsLoading,
  selectedCourtId,
  onSelectCourt,
  dateOptions,
  selectedDate,
  onSelectDate,
  slots,
  isSlotsLoading,
  selectedSlots,
  onToggleSlot,
  onConfirmBooking,
  onBack,
  onShare,
  onToggleFollow,
  onOpenEvent,
  onOpenStoreProduct,
  onReserveDayUseOffering,
  onOpenContact,
  isContactSheetOpen,
  onOpenContactSheet,
  onCloseContactSheet,
  isReviewsOpen,
  onOpenReviews,
  onCloseReviews,
  reviews,
  isReviewsLoading,
  isReviewSubmitting,
  onSubmitReview,
}: OrganizerProfileScreenProps) {
  const { colors, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const [descExpanded, setDescExpanded] = useState(false);

  if (status === "loading") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style="dark" />
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, alignItems: "center" }}>
          <Skeleton width={72} height={72} radius={radius.xl} />
          <Skeleton width={160} height={20} radius={6} style={{ marginTop: 16 }} />
          <Skeleton width={120} height={13} radius={6} style={{ marginTop: 8 }} />
          <View style={{ flexDirection: "row", gap: 24, marginTop: 22 }}>
            <Skeleton width={40} height={26} radius={8} />
            <Skeleton width={40} height={26} radius={8} />
            <Skeleton width={40} height={26} radius={8} />
          </View>
          <Skeleton width="100%" height={48} radius={radius.lg} style={{ marginTop: 20 }} />
        </View>
      </View>
    );
  }

  if (status === "not-found") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style="dark" />
        <View style={{ flex: 1, justifyContent: "center" }}>
          <EmptyState
            icon={UserX}
            variant="empty"
            title="Produtor não encontrado"
            description="Confira o link informado ou tente acessar outro produtor."
            actionLabel="Voltar"
            onAction={onBack}
          />
        </View>
      </View>
    );
  }

  if (status === "error") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style="dark" />
        <View style={{ flex: 1, justifyContent: "center" }}>
          <EmptyState
            icon={AlertCircle}
            variant="error"
            title="Não foi possível carregar o produtor"
            description="Tente novamente em alguns instantes."
            actionLabel="Tentar novamente"
            onAction={onRetry}
          />
        </View>
      </View>
    );
  }

  const descriptionIsLong = (description?.length ?? 0) > DESCRIPTION_TRUNCATE_LENGTH;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              borderBottomLeftRadius: radius["2xl"],
              borderBottomRightRadius: radius["2xl"],
              paddingTop: insets.top + 8,
            },
          ]}
        >
          <View style={styles.topRow}>
            <IconButton icon={ChevronLeft} variant="tonal" accessibilityLabel="Voltar" onPress={onBack} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              {contacts.length > 0 ? (
                <IconButton icon={Phone} variant="tonal" accessibilityLabel="Contato" onPress={onOpenContactSheet} />
              ) : null}
              <IconButton icon={Share2} variant="tonal" accessibilityLabel="Compartilhar" onPress={onShare} />
            </View>
          </View>

          <View style={styles.identityRow}>
            {logoUrl ? (
              <Image source={{ uri: logoUrl }} style={[styles.logo, { borderRadius: radius.xl }]} />
            ) : (
              <LinearGradient colors={["#3ED97F", "#12813F"]} style={[styles.logo, { borderRadius: radius.xl }]}>
                <Text token="title" style={{ color: "#0A2E1A" }}>
                  {initials}
                </Text>
              </LinearGradient>
            )}

            <View style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text token="title" numberOfLines={2} style={{ flexShrink: 1 }}>
                  {orgName}
                </Text>
                <BadgeCheck size={17} color={colors.primary} fill={colors.primarySoft} />
              </View>
              {location ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 5 }}>
                  <MapPin size={14} color={colors.textMuted} />
                  <Text token="bodySm" color="muted" numberOfLines={1}>
                    {location}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {description ? (
            <View style={{ marginTop: 16 }}>
              <Text token="bodySm" color="muted" numberOfLines={descExpanded || !descriptionIsLong ? undefined : 2}>
                {description}
              </Text>
              {descriptionIsLong ? (
                <PressScale onPress={() => setDescExpanded((value) => !value)} style={{ alignSelf: "flex-start", marginTop: 4 }}>
                  <Text token="caption" color="primary" style={{ textTransform: "none", letterSpacing: 0, fontWeight: "700" }}>
                    {descExpanded ? "Ver menos" : "Ver mais"}
                  </Text>
                </PressScale>
              ) : null}
            </View>
          ) : null}

          <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
            <View style={styles.statItem}>
              <Text token="subtitle" style={{ fontSize: 17 }}>
                {followersCount.toLocaleString("pt-BR")}
              </Text>
              <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0, marginTop: 2 }}>
                Seguidores
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text token="subtitle" style={{ fontSize: 17 }}>
                {eventsCount}
              </Text>
              <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0, marginTop: 2 }}>
                Eventos
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <PressScale
              onPress={onOpenReviews}
              accessibilityRole="button"
              accessibilityLabel={`Avaliação ${rating}, ${reviewsCount} avaliações`}
              style={styles.statItem}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Star size={13} color={colors.warning} fill={colors.warning} />
                <Text token="subtitle" style={{ fontSize: 17 }}>
                  {rating}
                </Text>
              </View>
              <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0, marginTop: 2 }}>
                {reviewsCount} avaliações
              </Text>
            </PressScale>
          </View>

          <View style={styles.actionsRow}>
            <PressScale
              onPress={onToggleFollow}
              disabled={isFollowBusy}
              accessibilityRole="button"
              accessibilityLabel={isFollowing ? "Deixar de seguir" : "Seguir"}
              style={[
                styles.followBtn,
                {
                  borderRadius: radius.lg - 3,
                  backgroundColor: isFollowing ? colors.surface : colors.primary,
                  borderColor: isFollowing ? colors.border : colors.primary,
                  opacity: isFollowBusy ? 0.6 : 1,
                },
              ]}
            >
              {isFollowBusy ? (
                <ActivityIndicator size="small" color={isFollowing ? colors.text : colors.onPrimary} />
              ) : (
                <>
                  {isFollowing ? <UserCheck size={16} color={colors.text} strokeWidth={2} /> : null}
                  <Text token="label" color={isFollowing ? "default" : "onPrimary"}>
                    {isFollowing ? "Seguindo" : "Seguir"}
                  </Text>
                </>
              )}
            </PressScale>
            <IconButton icon={Star} variant="outlined" accessibilityLabel="Ver avaliações" onPress={onOpenReviews} />
          </View>
        </View>

        <TabBar
          tabs={tabs.map((tab) => ({ key: tab.key, label: tab.label }))}
          activeKey={activeTab}
          onChange={(key) => onChangeTab(key as typeof activeTab)}
          scrollable
        />

        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          {activeTab === "events" ? (
            events.length > 0 ? (
              <View style={{ gap: 12 }}>
                {events.map((event, index) => (
                  <EventCard
                    key={`${event.id ?? "event"}-${index}`}
                    variant="compact"
                    onPress={() => onOpenEvent(event)}
                    event={{
                      id: event.id,
                      slug: event.slug ?? undefined,
                      title: event.title,
                      dateLabel: event.dateLabel,
                      city: event.city,
                      eventType: event.eventType,
                      image: event.coverUrl ? { uri: event.coverUrl } : null,
                    }}
                  />
                ))}
              </View>
            ) : (
              <EmptyState icon={CalendarDays} variant="empty" title="Nenhum evento disponível no momento" description="Volte em breve para conferir novas vendas." />
            )
          ) : null}

          {activeTab === "store" ? (
            <StoreProductsGrid products={storeProducts} isLoading={isStoreLoading} onOpenProduct={onOpenStoreProduct} />
          ) : null}

          {activeTab === "dayuse" ? (
            <DayUseOfferingsList offerings={dayUseOfferings} isLoading={isDayUseLoading} onReserve={onReserveDayUseOffering} />
          ) : null}

          {activeTab === "booking" ? (
            <CourtBookingSection
              courts={courts}
              isCourtsLoading={isCourtsLoading}
              selectedCourtId={selectedCourtId}
              onSelectCourt={onSelectCourt}
              dateOptions={dateOptions}
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
              slots={slots}
              isSlotsLoading={isSlotsLoading}
              selectedSlots={selectedSlots}
              onToggleSlot={onToggleSlot}
              onConfirm={onConfirmBooking}
            />
          ) : null}

        </View>
      </ScrollView>

      <ReviewsSheet
        visible={isReviewsOpen}
        onClose={onCloseReviews}
        rating={rating}
        reviews={reviews}
        isLoading={isReviewsLoading}
        isSubmitting={isReviewSubmitting}
        onSubmit={onSubmitReview}
      />

      <ContactSheet visible={isContactSheetOpen} onClose={onCloseContactSheet} contacts={contacts} onOpenContact={onOpenContact} />
    </View>
  );
}

function IconTile({ icon: Icon }: { icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }> }) {
  const { colors, radius } = useTheme();
  return (
    <View style={[styles.iconTile, { backgroundColor: colors.primarySoft, borderRadius: radius.md }]}>
      <Icon size={18} color={colors.primaryText} strokeWidth={1.75} />
    </View>
  );
}

function ContactSheet({
  visible,
  onClose,
  contacts,
  onOpenContact,
}: {
  visible: boolean;
  onClose: () => void;
  contacts: OrganizerContactItem[];
  onOpenContact: (contact: OrganizerContactItem) => void;
}) {
  return (
    <BottomSheet visible={visible} title="Contato" onClose={onClose}>
      <View style={{ paddingBottom: 4 }}>
        {contacts.map((contact) => (
          <ListItem
            key={contact.label}
            title={contact.label}
            subtitle={contact.value}
            leading={<IconTile icon={contactIcon(contact.label)} />}
            trailing="chevron"
            onPress={() => {
              onClose();
              onOpenContact(contact);
            }}
          />
        ))}
      </View>
    </BottomSheet>
  );
}

function StoreProductsGrid({
  products,
  isLoading,
  onOpenProduct,
}: {
  products: OrganizerStoreProductItem[];
  isLoading: boolean;
  onOpenProduct: (product: OrganizerStoreProductItem) => void;
}) {
  const { colors, radius } = useTheme();

  if (isLoading) {
    return (
      <View style={styles.storeGrid}>
        {[0, 1, 2, 3].map((item) => (
          <View key={item} style={styles.storeCard}>
            <Skeleton width="100%" height={100} radius={0} />
            <View style={{ padding: 12, gap: 7 }}>
              <Skeleton width="80%" height={13} />
              <Skeleton width="45%" height={14} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (products.length === 0) {
    return <EmptyState icon={ShoppingBag} variant="empty" title="Nenhum produto disponível no momento" />;
  }

  return (
    <View style={styles.storeGrid}>
      {products.map((product) => (
        <PressScale
          key={product.id}
          onPress={() => onOpenProduct(product)}
          accessibilityRole="button"
          accessibilityLabel={`${product.name}, ${product.priceLabel}`}
          style={[styles.storeCard, { backgroundColor: colors.surface, borderRadius: radius.lg, borderColor: colors.border, borderWidth: 1 }]}
        >
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.storeCardImage} resizeMode="cover" />
          ) : (
            <View style={[styles.storeCardImage, { backgroundColor: colors.surfaceAlt }]} />
          )}
          <View style={{ padding: 12 }}>
            <Text token="bodySm" style={{ fontWeight: "700" }} numberOfLines={2}>
              {product.name}
            </Text>
            {product.priceLabel ? (
              <Text token="label" color="primary" style={{ marginTop: 7 }}>
                {product.priceLabel}
              </Text>
            ) : null}
          </View>
        </PressScale>
      ))}
    </View>
  );
}

function DayUseOfferingsList({
  offerings,
  isLoading,
  onReserve,
}: {
  offerings: OrganizerDayUseOfferingItem[];
  isLoading: boolean;
  onReserve: (offering: OrganizerDayUseOfferingItem) => void;
}) {
  const { colors, radius } = useTheme();

  if (isLoading) {
    return (
      <View style={{ gap: 12 }}>
        {[0, 1].map((item) => (
          <Skeleton key={item} width="100%" height={110} radius={radius.xl} />
        ))}
      </View>
    );
  }

  if (offerings.length === 0) {
    return <EmptyState icon={Sun} variant="empty" title="Nenhum Day Use disponível no momento" />;
  }

  return (
    <View style={{ gap: 12 }}>
      {offerings.map((offering) => (
        <View
          key={offering.id}
          style={[styles.dayUseCard, { backgroundColor: colors.surface, borderRadius: radius.xl, borderColor: colors.border }]}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text token="subtitle" style={{ fontSize: 14, fontWeight: "800" }}>
                {offering.name}
              </Text>
              {offering.description ? (
                <Text token="bodySm" color="muted" style={{ marginTop: 4 }}>
                  {offering.description}
                </Text>
              ) : null}
            </View>
            <Text token="subtitle" style={{ fontSize: 15, fontWeight: "800" }}>
              {offering.priceLabel}
            </Text>
          </View>
          <View style={{ marginTop: 13 }}>
            <Button
              label={offering.soldOut ? "Esgotado" : "Reservar Day Use"}
              onPress={() => onReserve(offering)}
              disabled={offering.soldOut}
              fullWidth
            />
          </View>
        </View>
      ))}
    </View>
  );
}

function CourtBookingSection({
  courts,
  isCourtsLoading,
  selectedCourtId,
  onSelectCourt,
  dateOptions,
  selectedDate,
  onSelectDate,
  slots,
  isSlotsLoading,
  selectedSlots,
  onToggleSlot,
  onConfirm,
}: {
  courts: OrganizerCourtItem[];
  isCourtsLoading: boolean;
  selectedCourtId: string | null;
  onSelectCourt: (courtId: string) => void;
  dateOptions: OrganizerDateOptionItem[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  slots: OrganizerCourtSlotItem[];
  isSlotsLoading: boolean;
  selectedSlots: OrganizerCourtSlotItem[];
  onToggleSlot: (slot: OrganizerCourtSlotItem) => void;
  onConfirm: () => void;
}) {
  const { colors } = useTheme();

  if (isCourtsLoading) {
    return (
      <View style={{ gap: 18 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Skeleton width={140} height={38} radius={999} />
          <Skeleton width={140} height={38} radius={999} />
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 9 }}>
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} width="31%" height={46} radius={12} />
          ))}
        </View>
      </View>
    );
  }

  if (courts.length === 0) {
    return <EmptyState icon={CalendarClock} variant="empty" title="Nenhuma quadra disponível no momento" />;
  }

  const selectedDateLabel = dateOptions.find((option) => option.iso === selectedDate)?.label ?? "";

  return (
    <View>
      <Text token="bodySm" style={{ fontWeight: "700" }} color="muted">
        Escolha a quadra
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 10, marginBottom: 18 }}>
        {courts.map((court) => (
          <Chip key={court.id} label={court.name} selected={court.id === selectedCourtId} onPress={() => onSelectCourt(court.id)} />
        ))}
      </ScrollView>

      <Text token="bodySm" style={{ fontWeight: "700" }} color="muted">
        Escolha o dia
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 10, marginBottom: 18 }}>
        {dateOptions.map((option) => (
          <Chip key={option.iso} label={option.label} selected={option.iso === selectedDate} onPress={() => onSelectDate(option.iso)} />
        ))}
      </ScrollView>

      <Text token="bodySm" style={{ fontWeight: "700" }} color="muted">
        Horários {selectedDateLabel ? `— ${selectedDateLabel.toLowerCase()}` : ""}
      </Text>

      {isSlotsLoading ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 9, marginTop: 10 }}>
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} width="31%" height={46} radius={12} />
          ))}
        </View>
      ) : slots.length === 0 ? (
        <View style={{ marginTop: 10 }}>
          <EmptyState
            icon={CalendarClock}
            variant="empty"
            title="Nenhum horário disponível nesse dia"
            description="Tente escolher outro dia ou outra quadra."
          />
        </View>
      ) : (
        <>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 9, marginTop: 10 }}>
            {slots.map((slot) => {
              const isSelected = selectedSlots.some((item) => item.startTime === slot.startTime);
              return (
                <PressScale
                  key={slot.startTime}
                  onPress={() => onToggleSlot(slot)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${slot.startTime}, ${slot.priceLabel}`}
                  style={[
                    styles.slotChip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text token="label" style={{ fontSize: 13 }} color={isSelected ? "onPrimary" : "default"}>
                    {slot.startTime}
                  </Text>
                </PressScale>
              );
            })}
          </View>

          {selectedSlots.length > 0 ? (
            <View style={[styles.selectionSummary, { backgroundColor: colors.primarySoft }]}>
              <Text token="bodySm" style={{ fontWeight: "700" }}>
                {selectedSlots[0].startTime} – {selectedSlots[selectedSlots.length - 1].endTime}
              </Text>
              <Text token="bodySm" color="primary" style={{ fontWeight: "800" }}>
                {formatPriceCents(selectedSlots.reduce((sum, item) => sum + item.priceCents, 0))}
              </Text>
            </View>
          ) : null}
        </>
      )}

      <View style={{ marginTop: 18 }}>
        <Button
          label={
            selectedSlots.length > 0
              ? `Reservar ${selectedSlots[0].startTime} – ${selectedSlots[selectedSlots.length - 1].endTime}`
              : "Selecione um horário"
          }
          onPress={onConfirm}
          disabled={selectedSlots.length === 0}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  identityRow: { flexDirection: "row", gap: 16, alignItems: "flex-start", marginTop: 14 },
  logo: { width: 72, height: 72, alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 18, marginTop: 20, paddingTop: 18, borderTopWidth: 1 },
  statItem: { alignItems: "center" },
  statDivider: { width: 1, height: 30 },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  followBtn: { flex: 1, height: 48, borderWidth: 1.5, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  iconTile: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  storeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  storeCard: { width: "47%", overflow: "hidden" },
  storeCardImage: { width: "100%", height: 100 },
  dayUseCard: { padding: 16, borderWidth: 1 },
  slotChip: { width: "31%", height: 46, borderRadius: 12, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  selectionSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
  },
});
