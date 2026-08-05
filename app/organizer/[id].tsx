import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  AtSign,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Globe,
  MapPin,
  MessageCircle,
  Share2,
  Star,
  Store,
  Sun,
  X,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { Avatar } from "@/components/Avatar";
import { EventCard } from "@/components/EventCard";
import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { useIsAuthenticated } from "@/hooks/useAuth";
import {
  useFollowOrganizer,
  useOrganizerProfile,
  useOrganizerRatings,
  useRateOrganizer,
} from "@/hooks/useOrganizer";
import { useScreenLog } from "@/hooks/useScreenLog";
import type { OrganizerProfile } from "@/services/organizer.service";
import { colors } from "@/theme/colors";

const CONTENT_MAX_WIDTH = 640;
type ProfileTab = "home" | "store" | "reservations" | "contact";

const isActiveService = (services?: { status?: string | null }[]) =>
  Boolean(services?.some((service) => !["INACTIVE", "CANCELED", "DELETED"].includes(service.status ?? "")));

const getCapabilities = (organizer: OrganizerProfile) => ({
  courts: Boolean(
    organizer.hasCourts ||
      organizer.has_courts ||
      organizer.courtsEnabled ||
      organizer.courts_enabled ||
      organizer.courtReservationsEnabled ||
      organizer.court_reservations_enabled ||
      organizer.services?.courts ||
      isActiveService(organizer.courts),
  ),
  dayUse: Boolean(
    organizer.hasDayUse ||
      organizer.hasDayUses ||
      organizer.has_day_use ||
      organizer.has_day_uses ||
      organizer.dayUseEnabled ||
      organizer.day_use_enabled ||
      organizer.dayUsesEnabled ||
      organizer.day_uses_enabled ||
      organizer.dayUseReservationsEnabled ||
      organizer.day_use_reservations_enabled ||
      organizer.services?.dayUse ||
      organizer.services?.day_use ||
      organizer.services?.dayUses ||
      organizer.services?.day_uses ||
      isActiveService(organizer.dayUses) ||
      isActiveService(organizer.day_uses),
  ),
});

const normalizeUrl = (value: string, fallbackPrefix = "https://") =>
  /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `${fallbackPrefix}${value.replace(/^\/+/, "")}`;

const normalizeContactUrl = (value: string) => {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${value}`;
  if (/^\+?[\d\s().-]{8,}$/.test(value)) return `tel:${value.replace(/[^+\d]/g, "")}`;
  return normalizeUrl(value);
};

export default function OrganizerScreen() {
  useScreenLog();
  const router = useRouter();
  const { id: slugParam } = useLocalSearchParams<{ id: string }>();
  const slug = slugParam ?? "";
  const isAuthenticated = useIsAuthenticated();
  const { data: organizer, isLoading, isError } = useOrganizerProfile(slug);
  const followMutation = useFollowOrganizer(slug);
  const rateMutation = useRateOrganizer(slug);

  const [activeTab, setActiveTab] = useState<ProfileTab>("home");
  const [following, setFollowing] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const ratingsQuery = useOrganizerRatings(slug, reviewOpen);

  useEffect(() => {
    if (organizer) setFollowing(Boolean(organizer.following));
  }, [organizer]);

  const handleFollow = () => {
    if (!isAuthenticated) {
      router.push(`/login-modal?redirectTo=${encodeURIComponent(`/organizer/${slug}`)}`);
      return;
    }

    followMutation.mutate(following, {
      onSuccess: (result) => setFollowing(result.following),
      onError: () => Alert.alert("Não foi possível concluir", "Tente novamente em alguns instantes."),
    });
  };

  const handleShare = async () => {
    if (!organizer) return;
    const websiteUrl = process.env.EXPO_PUBLIC_WEBSITE_URL?.replace(/\/$/, "");
    const profileUrl = websiteUrl ? `${websiteUrl}/pagina-produtor/${encodeURIComponent(organizer.slug)}` : undefined;
    await Share.share({
      title: `${organizer.tradeName} no Firula`,
      message: `Confira o perfil de ${organizer.tradeName} no Firula.${profileUrl ? `\n${profileUrl}` : ""}`,
      url: profileUrl,
    });
  };

  const submitReview = () => {
    if (rating === 0) {
      Alert.alert("Escolha uma nota", "Selecione de 1 a 5 estrelas para enviar sua avaliação.");
      return;
    }
    if (!isAuthenticated) {
      setReviewOpen(false);
      router.push(`/login-modal?redirectTo=${encodeURIComponent(`/organizer/${slug}`)}`);
      return;
    }

    rateMutation.mutate(
      { rating, comment },
      {
        onSuccess: () => {
          setReviewOpen(false);
          setRating(0);
          setComment("");
          Alert.alert("Avaliação enviada", "Obrigado pela sua avaliação!");
        },
        onError: () => Alert.alert("Não foi possível avaliar", "Tente novamente em alguns instantes."),
      },
    );
  };

  if (isLoading) return <OrganizerSkeleton />;

  if (isError || !organizer) {
    return (
      <Screen edges={["top", "left", "right", "bottom"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center font-bold text-lg text-foreground">Produtor não encontrado</Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            Confira o link informado ou tente acessar outro produtor.
          </Text>
          <AnimatedPressable className="mt-5 rounded-2xl bg-primary px-6 py-3" onPress={() => router.back()}>
            <Text className="font-bold text-primary-foreground">Voltar</Text>
          </AnimatedPressable>
        </View>
      </Screen>
    );
  }

  const capabilities = getCapabilities(organizer);
  const hasReservations = capabilities.courts || capabilities.dayUse;
  const contacts = [
    organizer.contact && { label: "Contato", value: organizer.contact, href: normalizeContactUrl(organizer.contact) },
    organizer.website && { label: "Site", value: organizer.website, href: normalizeUrl(organizer.website) },
    organizer.instagram && {
      label: "Instagram",
      value: organizer.instagram,
      href: normalizeUrl(organizer.instagram.replace(/^@/, ""), "https://instagram.com/"),
    },
    organizer.facebook && { label: "Facebook", value: organizer.facebook, href: normalizeUrl(organizer.facebook, "https://facebook.com/") },
    organizer.linkedin && { label: "LinkedIn", value: organizer.linkedin, href: normalizeUrl(organizer.linkedin, "https://linkedin.com/company/") },
  ].filter(Boolean) as { label: string; value: string; href: string }[];
  const hasStore = Boolean(organizer.store?.slug);
  const hasLongBio = (organizer.description?.trim().length ?? 0) > 180;
  const events = organizer.events.map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.name,
    date: event.startsAt.split("T")[0],
    city: `${event.location.city}, ${event.location.state}`,
    eventType: event.status === "PUBLISHED" ? "Vendas abertas" : "Evento",
    image: event.coverUrl ? { uri: event.coverUrl } : null,
  }));

  const openWebPath = (path: string) => {
    const websiteUrl = process.env.EXPO_PUBLIC_WEBSITE_URL?.replace(/\/$/, "");
    if (!websiteUrl) {
      Alert.alert("Indisponível", "O endereço do site não está configurado.");
      return;
    }
    void Linking.openURL(`${websiteUrl}${path}`);
  };

  return (
    <Screen edges={["top", "left", "right", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
        <View className="w-full self-center" style={{ maxWidth: CONTENT_MAX_WIDTH }}>
          <View className="flex-row items-center justify-between px-4 py-2">
            <CircleAction label="Voltar" onPress={() => router.back()} icon={<ArrowLeft size={21} color={colors.foreground} />} />
            <CircleAction label="Compartilhar" onPress={handleShare} icon={<Share2 size={19} color={colors.foreground} />} />
          </View>

          <View className="px-4 pb-5 pt-2">
            <View className="rounded-3xl bg-card p-5">
              <View className="items-center">
                {organizer.logoUrl ? (
                  <Image source={{ uri: organizer.logoUrl }} className="h-24 w-24 rounded-full" resizeMode="cover" />
                ) : (
                  <Avatar name={organizer.tradeName} size={96} />
                )}
                <View className="mt-3 flex-row items-center justify-center gap-1.5 px-4">
                  <Text className="flex-shrink text-center font-bold text-2xl text-foreground" numberOfLines={2}>
                    {organizer.tradeName}
                  </Text>
                  <BadgeCheck size={19} color={colors.primary} />
                </View>
                <View className="mt-1.5 flex-row items-center gap-1">
                  <MapPin size={13} color={colors.mutedForeground} />
                  <Text className="text-xs text-muted-foreground">{organizer.city}, {organizer.state}</Text>
                </View>
              </View>

              {organizer.description ? (
                <View className="mt-4">
                  <Text className="leading-5 text-sm text-muted-foreground" numberOfLines={hasLongBio && !bioExpanded ? 4 : undefined}>
                    {organizer.description}
                  </Text>
                  {hasLongBio ? (
                    <AnimatedPressable className="mt-1 self-start" onPress={() => setBioExpanded((value) => !value)}>
                      <Text className="font-bold text-sm text-primary">{bioExpanded ? "Ver menos" : "Ver mais"}</Text>
                    </AnimatedPressable>
                  ) : null}
                </View>
              ) : null}

              <View className="mt-5 flex-row rounded-2xl bg-background py-3">
                <Stat value={organizer.followersCount} label="Seguidores" />
                <Stat value={organizer.events.length} label="Eventos" bordered />
                <AnimatedPressable className="min-w-0 flex-1 items-center border-l border-border px-1" onPress={() => setReviewOpen(true)}>
                  <View className="flex-row items-center gap-1">
                    <Star size={13} color={colors.primary} fill={colors.primary} />
                    <Text className="font-bold text-sm text-foreground">
                      {(Number(organizer.averageRating) || 0).toFixed(1)} ({Number(organizer.ratingsCount) || 0})
                    </Text>
                  </View>
                  <Text className="mt-0.5 text-center text-[10px] text-muted-foreground">Ver avaliações</Text>
                </AnimatedPressable>
              </View>

              <View className="mt-4 flex-row gap-2">
                <AnimatedPressable
                  className={`flex-1 items-center rounded-2xl px-3 py-3.5 ${following ? "bg-secondary" : "bg-primary"}`}
                  disabled={followMutation.isPending}
                  onPress={handleFollow}
                >
                  {followMutation.isPending ? (
                    <ActivityIndicator color={following ? colors.foreground : "#ffffff"} />
                  ) : (
                    <Text className={`font-bold ${following ? "text-foreground" : "text-primary-foreground"}`}>
                      {following ? "Seguindo" : "Seguir"}
                    </Text>
                  )}
                </AnimatedPressable>
                <AnimatedPressable className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-border px-3 py-3.5" onPress={handleShare}>
                  <Share2 size={16} color={colors.foreground} />
                  <Text className="font-bold text-foreground">Compartilhar</Text>
                </AnimatedPressable>
              </View>

              {hasStore && organizer.store ? (
                <AnimatedPressable className="mt-2 flex-row items-center justify-center gap-2 rounded-2xl border border-border py-3.5" onPress={() => openWebPath(`/lojas/${organizer.store!.slug}`)}>
                  <Store size={16} color={colors.foreground} />
                  <Text className="font-bold text-foreground">Ver loja</Text>
                </AnimatedPressable>
              ) : null}
            </View>
          </View>

          <ProfileTabs
            active={activeTab}
            onChange={setActiveTab}
            showStore={hasStore}
            showReservations={hasReservations}
            showContact={contacts.length > 0}
          />

          {activeTab === "home" ? (
            <View className="px-4 pt-6">
              {hasReservations ? (
                <ReservationSection
                  slug={organizer.slug}
                  courts={capabilities.courts}
                  dayUse={capabilities.dayUse}
                  onOpen={openWebPath}
                />
              ) : null}
              <SectionTitle title="Acontecendo agora" subtitle="Eventos com vendas liberadas" />
              {events.length ? (
                <View className="mt-4 gap-3">{events.map((event) => <EventCard key={event.id} event={event} variant="compact" />)}</View>
              ) : (
                <EmptyState title="Nenhum evento disponível no momento." subtitle="Volte em breve para conferir novas vendas." />
              )}
            </View>
          ) : null}

          {activeTab === "store" && organizer.store ? (
            <WebModuleCard
              icon={<Store size={22} color={colors.primary} />}
              title="Loja oficial"
              subtitle="Confira os produtos oficiais deste produtor."
              action="Ver loja completa"
              onPress={() => openWebPath(`/lojas/${organizer.store!.slug}`)}
            />
          ) : null}

          {activeTab === "reservations" ? (
            <View className="px-4 pt-6">
              <ReservationSection slug={organizer.slug} courts={capabilities.courts} dayUse={capabilities.dayUse} onOpen={openWebPath} />
            </View>
          ) : null}

          {activeTab === "contact" ? <ContactSection contacts={contacts} /> : null}
        </View>
      </ScrollView>

      <ReviewModal
        visible={reviewOpen}
        organizerName={organizer.tradeName}
        ratings={ratingsQuery.data ?? []}
        loading={ratingsQuery.isLoading}
        rating={rating}
        comment={comment}
        submitting={rateMutation.isPending}
        onRating={setRating}
        onComment={setComment}
        onClose={() => setReviewOpen(false)}
        onSubmit={submitReview}
      />
    </Screen>
  );
}

function OrganizerSkeleton() {
  return (
    <Screen edges={["top", "left", "right", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="w-full self-center px-4 pt-14" style={{ maxWidth: CONTENT_MAX_WIDTH }}>
        <View className="items-center rounded-3xl bg-card p-5">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="mt-4 h-6 w-44 rounded-full" />
          <Skeleton className="mt-2 h-4 w-28 rounded-full" />
          <Skeleton className="mt-6 h-16 w-full rounded-2xl" />
          <Skeleton className="mt-4 h-12 w-full rounded-2xl" />
        </View>
      </View>
    </Screen>
  );
}

function CircleAction({ label, onPress, icon }: { label: string; onPress: () => void; icon: React.ReactNode }) {
  return (
    <AnimatedPressable accessibilityLabel={label} accessibilityRole="button" className="h-11 w-11 items-center justify-center rounded-full bg-card" hitSlop={8} onPress={onPress}>
      {icon}
    </AnimatedPressable>
  );
}

function Stat({ value, label, bordered = false }: { value: number; label: string; bordered?: boolean }) {
  return (
    <View className={`min-w-0 flex-1 items-center px-1 ${bordered ? "border-l border-border" : ""}`}>
      <Text className="font-bold text-base text-foreground" numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text className="mt-0.5 text-[10px] text-muted-foreground">{label}</Text>
    </View>
  );
}

function ProfileTabs({ active, onChange, showStore, showReservations, showContact }: {
  active: ProfileTab;
  onChange: (tab: ProfileTab) => void;
  showStore: boolean;
  showReservations: boolean;
  showContact: boolean;
}) {
  const tabs = useMemo(() => [
    { key: "home" as const, label: "Home" },
    ...(showStore ? [{ key: "store" as const, label: "Loja" }] : []),
    ...(showReservations ? [{ key: "reservations" as const, label: "Reservas" }] : []),
    ...(showContact ? [{ key: "contact" as const, label: "Contato" }] : []),
  ], [showContact, showReservations, showStore]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
      {tabs.map((tab) => (
        <AnimatedPressable key={tab.key} className={`rounded-full px-5 py-2.5 ${active === tab.key ? "bg-foreground" : "bg-card"}`} onPress={() => onChange(tab.key)}>
          <Text className={`font-bold text-sm ${active === tab.key ? "text-background" : "text-muted-foreground"}`}>{tab.label}</Text>
        </AnimatedPressable>
      ))}
    </ScrollView>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <View><Text className="font-bold text-xl text-foreground">{title}</Text><Text className="mt-1 text-sm text-muted-foreground">{subtitle}</Text></View>;
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return <View className="mt-4 rounded-3xl bg-card p-5"><Text className="font-bold text-foreground">{title}</Text><Text className="mt-1 text-sm text-muted-foreground">{subtitle}</Text></View>;
}

function ReservationSection({ slug, courts, dayUse, onOpen }: { slug: string; courts: boolean; dayUse: boolean; onOpen: (path: string) => void }) {
  return (
    <View className="mb-7">
      <SectionTitle title="Estrutura disponível para você" subtitle="Serviços recorrentes do Produtor" />
      <View className="mt-4 gap-3">
        {courts ? <ServiceCard icon={<CalendarDays size={20} color={colors.primary} />} eyebrow="Quadras esportivas" title="Reservar horário" onPress={() => onOpen(`/quadras/${slug}`)} /> : null}
        {dayUse ? <ServiceCard icon={<Sun size={20} color={colors.primary} />} eyebrow="Acesso à estrutura completa" title="Comprar Day Use" onPress={() => onOpen(`/quadras/${slug}`)} /> : null}
      </View>
    </View>
  );
}

function ServiceCard({ icon, eyebrow, title, onPress }: { icon: React.ReactNode; eyebrow: string; title: string; onPress: () => void }) {
  return (
    <AnimatedPressable className="flex-row items-center gap-3 rounded-3xl bg-card p-4" onPress={onPress}>
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">{icon}</View>
      <View className="min-w-0 flex-1"><Text className="text-xs text-muted-foreground">{eyebrow}</Text><Text className="mt-0.5 font-bold text-foreground">{title}</Text></View>
      <ChevronRight size={19} color={colors.mutedForeground} />
    </AnimatedPressable>
  );
}

function WebModuleCard({ icon, title, subtitle, action, onPress }: { icon: React.ReactNode; title: string; subtitle: string; action: string; onPress: () => void }) {
  return <View className="px-4 pt-6"><View className="rounded-3xl bg-card p-5"><View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">{icon}</View><Text className="mt-4 font-bold text-xl text-foreground">{title}</Text><Text className="mt-1 text-sm text-muted-foreground">{subtitle}</Text><AnimatedPressable className="mt-5 items-center rounded-2xl bg-primary py-4" onPress={onPress}><Text className="font-bold text-primary-foreground">{action}</Text></AnimatedPressable></View></View>;
}

function ContactSection({ contacts }: { contacts: { label: string; value: string; href: string }[] }) {
  return (
    <View className="px-4 pt-6">
      <SectionTitle title="Contato" subtitle="Canais públicos de atendimento" />
      <View className="mt-4 gap-3">
        {contacts.map((contact) => (
          <AnimatedPressable key={`${contact.label}-${contact.value}`} className="flex-row items-center gap-3 rounded-3xl bg-card p-4" onPress={() => Linking.openURL(contact.href)}>
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
              {contact.label === "Instagram" ? <AtSign size={20} color={colors.primary} /> : contact.label === "Contato" ? <MessageCircle size={20} color={colors.primary} /> : <Globe size={20} color={colors.primary} />}
            </View>
            <View className="min-w-0 flex-1"><Text className="text-xs text-muted-foreground">{contact.label}</Text><Text className="mt-0.5 font-bold text-foreground" numberOfLines={1}>{contact.value}</Text></View>
            <ChevronRight size={19} color={colors.mutedForeground} />
          </AnimatedPressable>
        ))}
      </View>
    </View>
  );
}

function ReviewModal({ visible, organizerName, ratings, loading, rating, comment, submitting, onRating, onComment, onClose, onSubmit }: {
  visible: boolean;
  organizerName: string;
  ratings: import("@/services/organizer.service").OrganizerRating[];
  loading: boolean;
  rating: number;
  comment: string;
  submitting: boolean;
  onRating: (rating: number) => void;
  onComment: (comment: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="max-h-[88%] rounded-t-[32px] bg-background px-4 pb-8 pt-4">
          <View className="flex-row items-center justify-between"><View><Text className="font-bold text-xl text-foreground">Avaliações</Text><Text className="text-sm text-muted-foreground">{organizerName}</Text></View><AnimatedPressable className="h-10 w-10 items-center justify-center rounded-full bg-card" onPress={onClose}><X size={20} color={colors.foreground} /></AnimatedPressable></View>
          <ScrollView className="mt-5" showsVerticalScrollIndicator={false}>
            {loading ? <ActivityIndicator color={colors.primary} /> : ratings.length ? ratings.map((item) => {
              const author = item.user?.name || item.author?.name || item.userName || item.authorName || "Usuário Firula";
              const stars = Math.min(5, Math.max(1, Math.round(item.stars)));
              return <View key={item.id} className="mb-3 rounded-2xl bg-card p-4"><View className="flex-row items-center justify-between gap-2"><Text className="flex-1 font-bold text-foreground">{author}</Text><Text className="text-primary">{"★".repeat(stars)}{"☆".repeat(5 - stars)}</Text></View>{item.comment ? <Text className="mt-2 text-sm text-muted-foreground">{item.comment}</Text> : null}</View>;
            }) : <EmptyState title="Nenhuma avaliação ainda." subtitle="Seja a primeira pessoa a avaliar esta organização." />}

            <Text className="mt-5 font-bold text-base text-foreground">Deixe sua avaliação</Text>
            <View className="mt-3 flex-row gap-2">{[1, 2, 3, 4, 5].map((value) => <AnimatedPressable key={value} onPress={() => onRating(value)}><Star size={34} color={value <= rating ? colors.primary : colors.mutedForeground} fill={value <= rating ? colors.primary : "transparent"} /></AnimatedPressable>)}</View>
            <TextInput className="mt-4 min-h-24 rounded-2xl bg-card px-4 py-3 text-foreground" multiline placeholder="Comentário opcional" placeholderTextColor={colors.mutedForeground} textAlignVertical="top" value={comment} onChangeText={onComment} />
            <AnimatedPressable className="mb-2 mt-4 items-center rounded-2xl bg-primary py-4" disabled={submitting} onPress={onSubmit}>{submitting ? <ActivityIndicator color="#ffffff" /> : <Text className="font-bold text-primary-foreground">Enviar avaliação</Text>}</AnimatedPressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
