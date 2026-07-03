import type { ImageSourcePropType } from 'react-native';

export interface TicketLot {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  available: number;
  total: number;
  popular?: boolean;
  soldOut?: boolean;
}

export interface Organizer {
  name: string;
  initials: string;
  verified?: boolean;
  eventsCount?: number;
}

export interface SocialProof {
  count: number;
  friendsText?: string;
  avatars?: { initials: string; bg: string; fg: string }[];
  rating?: number;
  reviews?: number;
}

export interface EventDetail {
  title: string;
  category: string;
  image: ImageSourcePropType;
  hot?: boolean;
  dateLabel: string;
  timeLabel: string;
  venueName: string;
  address: string;
  about: string;
  lots: TicketLot[];
  organizer?: Organizer;
  social?: SocialProof;
  lotDeadlineText?: string;
}

export interface EventDetailScreenProps {
  event: EventDetail | null;
  isLoading: boolean;
  isError: boolean;
  favorite?: boolean;
  onToggleFavorite?: () => void;
  onBack?: () => void;
  onShare?: () => void;
  onOpenMap?: () => void;
  onAddToCalendar?: () => void;
  onFollowOrganizer?: () => void;
  onCheckout?: (selection: Record<string, number>, totalCents: number) => void;
}
