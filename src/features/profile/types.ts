import type { LucideIcon } from "lucide-react-native";

export interface ProfileScreenProps {
  name: string;
  photoUrl?: string | null;
  email: string;
  memberSince: string;
  eventsAttended: number;
  level?: string;
  isAuthenticated?: boolean;
  onLogin?: () => void;
  onEditProfile?: () => void;
  onNavigate?: (key: string) => void;
  onLogout?: () => void;
  loggingOut?: boolean;
}

export interface MenuEntry {
  icon: LucideIcon;
  label: string;
  subtitle: string;
  key: string;
}

export interface Achievement {
  icon: string;
  label: string;
  unlocked: boolean;
}
