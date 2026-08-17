import type { AttendedEvent, FollowPerson } from "@/features/player-profile/types";
import type { LucideIcon } from "lucide-react-native";

export interface MenuEntry {
  icon: LucideIcon;
  label: string;
  subtitle: string;
  key: string;
}

export type OwnProfileStatus = "guest" | "loading" | "error" | "ready";

export interface ProfileScreenProps {
  status: OwnProfileStatus;
  name: string;
  username: string | null;
  photoUrl: string | null;
  bio: string | null;
  city: string | null;
  events: AttendedEvent[];
  eventsCount: number;
  followersCount: number;
  followingCount: number;
  instagramHandle: string | null;
  xHandle: string | null;
  eventsLoading: boolean;
  email: string;
  loggingOut?: boolean;
  isDeletingAccount?: boolean;
  onLogin: () => void;
  onRetry: () => void;
  onEditProfile: () => void;
  onShareProfile: () => void;
  onOpenEvent: (event: AttendedEvent) => void;
  onExploreEvents: () => void;
  onOpenInstagram: () => void;
  onOpenX: () => void;
  onOpenFollowPerson: (person: FollowPerson) => void;
  onNavigate: (key: string) => void;
  onLogout: () => void;
}
