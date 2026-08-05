export interface AttendedEvent {
  id: string;
  slug: string | null;
  title: string;
  dateLabel: string;
  organizationName: string;
  statusLabel: string;
  coverUrl: string | null;
}

export interface FollowPerson {
  identityId: string;
  username: string | null;
  name: string;
  photoUrl: string | null;
  isFollowing: boolean;
}

export type FollowTab = "followers" | "following";

export type PlayerProfileStatus = "loading" | "not-found" | "error" | "ready";

export type ReportReason = "SPAM" | "INAPPROPRIATE_CONTENT" | "HARASSMENT" | "FAKE_PROFILE" | "OTHER";

export interface PlayerProfileScreenProps {
  status: PlayerProfileStatus;
  onRetry: () => void;

  name: string;
  username: string;
  handle: string;
  photoUrl: string | null;
  initials: string;
  city: string | null;
  instagramUrl: string | null;
  instagramHandle: string | null;

  followersCount: number;
  followingCount: number;
  eventsCount: number;
  events: AttendedEvent[];

  isAuthenticated: boolean;
  isFollowing: boolean;
  isFollowedBy: boolean;
  isFollowBusy: boolean;
  isBlocked: boolean;
  isBlockBusy: boolean;
  isReportBusy: boolean;
  hasReported: boolean;

  onBack: () => void;
  onOpenInstagram: () => void;
  onToggleFollow: () => void;
  onUnfollow: () => void;
  onRemoveFollower: () => void;
  onChallenge: () => void;
  onShareProfile: () => void;
  onToggleBlock: () => void;
  onSubmitReport: (reason: ReportReason, details?: string) => Promise<void>;
  onOpenEvent: (event: AttendedEvent) => void;
  onOpenFollowPerson: (person: FollowPerson) => void;
}
