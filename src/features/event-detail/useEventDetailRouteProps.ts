import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Linking, Share } from 'react-native';

import { useIsAuthenticated } from '@/hooks/useAuth';
import { useEventBySlug } from '@/hooks/useEvents';
import { useCheckFavorite, useToggleFavorite } from '@/hooks/useFavorites';
import {
  resolvePlatformEventImageUrl,
  type AdminEventDetail,
  type AdminEventTicketLot,
} from '@/services/events.service';

import type { EventDetail, EventDetailScreenProps, TicketLot } from '@/features/event-detail/types';

const FALLBACK_EVENT_IMAGE = require('../../../assets/events/event-running.jpg');

const formatDateLabel = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

const formatTimeLabel = (isoDate: string): string =>
  new Date(isoDate).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return 'EV';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

const isAdminLotAvailable = (lot: AdminEventTicketLot): boolean => {
  if (!lot.active) return false;
  const now = new Date();
  return now < new Date(lot.salesEnd) && lot.quantity - lot.quantitySold > 0;
};

const mapLot = (lot: AdminEventTicketLot): TicketLot => {
  const available = Math.max(lot.quantity - lot.quantitySold, 0);

  return {
    id: lot.id,
    name: lot.name,
    description: lot.description ?? 'Ingresso para o evento',
    priceCents: lot.price,
    available,
    total: lot.quantity,
    soldOut: !isAdminLotAvailable(lot),
    popular: lot.quantity > 0 && lot.quantitySold / lot.quantity >= 0.6,
  };
};

const getLotDeadlineText = (lots: AdminEventTicketLot[]): string | undefined => {
  const now = Date.now();

  const nearestDeadline = lots
    .filter((lot) => lot.active)
    .map((lot) => new Date(lot.salesEnd).getTime())
    .filter((time) => Number.isFinite(time) && time > now)
    .sort((a, b) => a - b)[0];

  if (!nearestDeadline) return undefined;

  const diffMs = nearestDeadline - now;
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  if (diffHours < 24) return `Lote atual acaba em ${diffHours}h`;

  const diffDays = Math.ceil(diffHours / 24);
  return `Lote atual acaba em ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
};

const mapEventToDetail = (event: AdminEventDetail): EventDetail => {
  const imageUrl = resolvePlatformEventImageUrl({
    coverUrl: event.coverUrl,
    imageUrl: null,
  });

  return {
    title: event.name,
    category: event.sports[0]?.name ?? 'Evento',
    image: imageUrl ? { uri: imageUrl } : FALLBACK_EVENT_IMAGE,
    hot: event.soldCount > 80,
    dateLabel: formatDateLabel(event.startsAt),
    timeLabel: formatTimeLabel(event.startsAt),
    venueName: `${event.location.address}, ${event.location.addressNumber}`,
    address: `${event.location.neighborhood}, ${event.location.city} - ${event.location.state}`,
    about: event.description || 'Sem descrição disponível para este evento.',
    organizer: {
      name: event.organization.tradeName,
      initials: getInitials(event.organization.tradeName),
      verified: true,
    },
    social: event.soldCount > 0 ? { count: event.soldCount } : undefined,
    lotDeadlineText: getLotDeadlineText(event.ticketLots),
    lots: event.ticketLots.map(mapLot),
  };
};

const buildCheckoutUrl = (eventSlug: string, selection: Record<string, number>) => {
  const websiteUrl = process.env.EXPO_PUBLIC_WEBSITE_URL;
  if (!websiteUrl) return null;

  const ticketsParam = Object.entries(selection)
    .filter(([, qty]) => qty > 0)
    .map(([lotId, qty]) => `${lotId}:${qty}`)
    .join(',');

  return `${websiteUrl}/eventos/${eventSlug}?tickets=${ticketsParam}&checkout=1`;
};

const buildEventUrl = (eventSlug: string) => {
  const websiteUrl = process.env.EXPO_PUBLIC_WEBSITE_URL;
  return websiteUrl ? `${websiteUrl}/eventos/${eventSlug}` : null;
};

export const useEventDetailRouteProps = (): EventDetailScreenProps => {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const eventSlug = slug ?? '';

  const isAuthenticated = useIsAuthenticated();
  const { data: event, isLoading, isError } = useEventBySlug(eventSlug);
  const { data: favoriteStatus } = useCheckFavorite(event?.id ?? '');
  const { mutate: toggleFavorite, isPending: isFavoritePending } = useToggleFavorite();

  const detail = useMemo(() => {
    if (!event) return null;
    return mapEventToDetail(event);
  }, [event]);

  const isFavorited = favoriteStatus?.isFavorited ?? false;

  return {
    event: detail,
    isLoading,
    isError,
    favorite: isFavorited,
    onBack: () => router.back(),
    onToggleFavorite: () => {
      if (!event) return;

      if (!isAuthenticated) {
        router.push(`/login-modal?redirectTo=/event/${eventSlug}`);
        return;
      }

      if (isFavoritePending) return;
      toggleFavorite({ eventId: event.id, isFavorited });
    },
    onCheckout: async (selection: Record<string, number>) => {
      if (!event) return;
      const checkoutUrl = buildCheckoutUrl(event.slug, selection);
      if (!checkoutUrl) return;
      await Linking.openURL(checkoutUrl);
    },
    onShare: async () => {
      if (!event) return;
      const eventUrl = buildEventUrl(event.slug);
      await Share.share({ message: eventUrl ? `${event.name}\n${eventUrl}` : event.name });
    },
    onOpenMap: async () => {
      if (!event) return;
      const query = encodeURIComponent(
        `${event.location.address}, ${event.location.addressNumber}, ${event.location.city}, ${event.location.state}`,
      );
      await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    },
    onAddToCalendar: async () => {
      if (!event) return;

      const startDate = new Date(event.startsAt);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
      const toGoogleDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      const detailsValue = encodeURIComponent(event.description || 'Evento Firula');
      const location = encodeURIComponent(
        `${event.location.address}, ${event.location.addressNumber}, ${event.location.city}, ${event.location.state}`,
      );
      const text = encodeURIComponent(event.name);

      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${detailsValue}&location=${location}&dates=${toGoogleDate(startDate)}/${toGoogleDate(endDate)}`;
      await Linking.openURL(url);
    },
  };
};
