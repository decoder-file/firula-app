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
  /** Datas/horários válidos, presente quando este lote é um ingresso passaporte. */
  passportValidDates?: string[];
}

export interface Organizer {
  slug: string;
  name: string;
  initials: string;
  verified?: boolean;
  eventsCount?: number;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  websiteLabel?: string | null;
}

export interface EventDaySchedule {
  id: string;
  startsAt: string;
  endsAt: string;
}

export interface EventTerm {
  id: string;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  bodyHtml?: string | null;
  displayMode?: "MODAL" | "INLINE" | null;
}

export interface SocialProof {
  count: number;
  friendsText?: string;
  avatars?: { initials: string; bg: string; fg: string }[];
  rating?: number;
  reviews?: number;
}

export interface FeaturedPerson {
  id: string;
  name: string;
  photoUrl?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  instagram?: string | null;
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
}

export interface Supporter {
  id: string;
  name: string;
  logoUrl: string;
}

export interface EventDetail {
  id: string;
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
  showParticipants?: boolean;
  speakers?: FeaturedPerson[];
  sponsors?: Sponsor[];
  sponsorsBackgroundColor?: string | null;
  supporters?: Supporter[];
  coProducer?: { name: string; logoUrl?: string | null };
  primaryOrganizer?: "ORGANIZATION" | "CO_PRODUCER" | null;
  daySchedules?: EventDaySchedule[];
  schedule?: { title: string; description?: string | null; pdfUrl: string };
  terms?: EventTerm[];
  /** Cor de destaque customizada do evento (hex #RRGGBB), definida pelo dono da plataforma. */
  accentColor?: string | null;
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
  onOpenOrganizer?: () => void;
  onOpenOrganizerWebsite?: () => void;
  onFollowOrganizer?: () => void;
  onCheckout?: (selection: Record<string, number>, totalCents: number) => void;
}
