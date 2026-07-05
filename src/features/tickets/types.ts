import type { ImageSourcePropType } from "react-native";

export type TicketStatus = "active" | "used";

export interface AppTicket {
  id: string;
  event: string;
  tier: string;
  dateLabel: string;
  city: string;
  code: string;
  status: TicketStatus;
  facial?: boolean;
  image?: ImageSourcePropType;
}

export interface TicketsScreenProps {
  tickets: AppTicket[];
  isLoading?: boolean;
  renderQr?: (value: string, size: number) => React.ReactNode;
  onExplore?: () => void;
  onAddToWallet?: (ticketId: string) => void;
  isAddingToWallet?: boolean;
}
