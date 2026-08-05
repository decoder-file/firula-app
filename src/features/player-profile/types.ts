export interface AttendedEvent {
  id: string;
  title: string;
  date: string;
  city: string;
  tag: string;
  image: number | { uri: string };
}

export interface FollowPerson {
  id: string;
  initials: string;
  name: string;
  meta: string;
  isFollowing: boolean;
}

export type FollowTab = "followers" | "following";

export interface PlayerProfileScreenProps {
  name: string;
  handle: string;
  city: string;
  initials: string;
  instagramHandle: string;
  instagramUrl: string;
  followersCount: number;
  followingCount: number;
  eventsCount: number;
  events: AttendedEvent[];
  followers: FollowPerson[];
  following: FollowPerson[];

  isFollowing: boolean;
  isBlocked: boolean;

  onBack: () => void;
  onOpenInstagram: () => void;
  onToggleFollow: () => void;
  onUnfollow: () => void;
  onChallenge: () => void;
  onShareProfile: () => void;
  onToggleBlock: () => void;
  onReport: () => void;
  onToggleFollowPerson: (tab: FollowTab, personId: string) => void;
}
