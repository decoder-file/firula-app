export type OrganizerProfileStatus = "loading" | "not-found" | "error" | "ready";

export type OrganizerTab = "events" | "store" | "dayuse" | "booking";

export interface OrganizerTabItem {
  key: OrganizerTab;
  label: string;
}

export interface OrganizerEventItem {
  id: string;
  slug: string | null;
  title: string;
  dateLabel: string;
  city: string;
  eventType: string;
  coverUrl: string | null;
}

export interface OrganizerContactItem {
  label: string;
  value: string;
  href: string;
}

export interface OrganizerReviewItem {
  id: string;
  name: string;
  stars: number;
  comment: string | null;
  timeLabel: string;
}

export interface OrganizerStoreProductItem {
  id: string;
  slug: string;
  name: string;
  priceLabel: string;
  imageUrl: string | null;
}

export interface OrganizerDayUseOfferingItem {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  soldOut: boolean;
}

export interface OrganizerCourtItem {
  id: string;
  name: string;
  requiresApproval: boolean;
}

export interface OrganizerCourtSlotItem {
  startTime: string;
  endTime: string;
  priceCents: number;
  priceLabel: string;
}

export interface OrganizerDateOptionItem {
  iso: string;
  label: string;
}

export interface OrganizerProfileScreenProps {
  status: OrganizerProfileStatus;
  onRetry: () => void;

  orgName: string;
  initials: string;
  logoUrl: string | null;
  location: string | null;
  description: string | null;

  followersCount: number;
  eventsCount: number;
  rating: string;
  reviewsCount: number;

  isFollowing: boolean;
  isFollowBusy: boolean;

  tabs: OrganizerTabItem[];
  activeTab: OrganizerTab;
  onChangeTab: (tab: OrganizerTab) => void;

  events: OrganizerEventItem[];
  hasStore: boolean;
  hasDayUse: boolean;
  hasBooking: boolean;
  contacts: OrganizerContactItem[];

  storeProducts: OrganizerStoreProductItem[];
  isStoreLoading: boolean;
  dayUseOfferings: OrganizerDayUseOfferingItem[];
  isDayUseLoading: boolean;

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
  onConfirmBooking: () => void;

  onBack: () => void;
  onShare: () => void;
  onToggleFollow: () => void;
  onOpenEvent: (event: OrganizerEventItem) => void;
  onOpenStoreProduct: (product: OrganizerStoreProductItem) => void;
  onReserveDayUseOffering: (offering: OrganizerDayUseOfferingItem) => void;
  onOpenContact: (contact: OrganizerContactItem) => void;
  isContactSheetOpen: boolean;
  onOpenContactSheet: () => void;
  onCloseContactSheet: () => void;

  isReviewsOpen: boolean;
  onOpenReviews: () => void;
  onCloseReviews: () => void;
  reviews: OrganizerReviewItem[];
  isReviewsLoading: boolean;
  isReviewSubmitting: boolean;
  onSubmitReview: (stars: number, comment?: string) => Promise<void>;
}
