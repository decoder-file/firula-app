import {
  Bell,
  CircleHelp,
  FileText,
  Settings,
  Shield,
  Star,
  Ticket,
} from "lucide-react-native";

import type { MenuEntry } from "@/features/profile/types";

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
