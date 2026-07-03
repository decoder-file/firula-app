import type { LucideIcon } from "lucide-react-native";

export interface ProfileScreenProps {
  name: string;
  email: string;
  memberSince: string;
  eventsAttended: number;
  level?: string;
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
