import {
  Bell,
  CircleHelp,
  FileText,
  ScanFace,
  Settings,
  Shield,
  Star,
  Ticket,
} from "lucide-react-native";

import type { Achievement, MenuEntry } from "@/features/profile/types";

export const PROFILE_MENU: MenuEntry[] = [
  {
    key: "tickets",
    icon: Ticket,
    label: "Meus ingressos",
    subtitle: "Ingressos comprados",
  },
  // {
  //   key: "facial",
  //   icon: ScanFace,
  //   label: "Facial ID Firula",
  //   subtitle: "Reconhecimento facial",
  // },
  {
    key: "favorites",
    icon: Star,
    label: "Favoritos",
    subtitle: "Eventos salvos",
  },
  {
    key: "notifications",
    icon: Bell,
    label: "Notificações",
    subtitle: "Lembretes e alertas",
  },
  {
    key: "privacy",
    icon: Shield,
    label: "Privacidade",
    subtitle: "Dados e segurança",
  },
  {
    key: "terms",
    icon: FileText,
    label: "Termos de uso",
    subtitle: "Políticas e termos",
  },
  {
    key: "settings",
    icon: Settings,
    label: "Configurações",
    subtitle: "Preferências do app",
  },
  {
    key: "help",
    icon: CircleHelp,
    label: "Ajuda",
    subtitle: "Central de suporte",
  },
];

export const PROFILE_ACHIEVEMENTS: Achievement[] = [
  { icon: "🏅", label: "Primeiro evento", unlocked: true },
  { icon: "🥉", label: "5 eventos", unlocked: true },
  { icon: "🥈", label: "10 eventos", unlocked: true },
  { icon: "🔒", label: "Facial ID", unlocked: true },
  { icon: "🥇", label: "25 eventos", unlocked: false },
  { icon: "🏆", label: "50 eventos", unlocked: false },
];
