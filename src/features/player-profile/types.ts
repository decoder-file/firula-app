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

  isFollowing: boolean;
  isFollowBusy: boolean;
  isBlocked: boolean;

  onBack: () => void;
  onOpenInstagram: () => void;
  onToggleFollow: () => void;
  onUnfollow: () => void;
  onChallenge: () => void;
  onShareProfile: () => void;
  onToggleBlock: () => void;
  onReport: () => void;
  onOpenEvent: (event: AttendedEvent) => void;
  onOpenFollowPerson: (person: FollowPerson) => void;
}
