import type { ImageSourcePropType } from "react-native";

export interface HomeEvent {
  id: string;
  type: string;
  category: string;
  title: string;
  city: string;
  dateLabel: string;
  day: string;
  mon: string;
  price: string;
  attendeesLabel: string;
  hot: boolean;
  image: ImageSourcePropType;
}

export interface HomeScreenProps {
  userName: string;
  city: string;
  events: HomeEvent[];
  notificationCount?: number;
  onOpenNotifications?: () => void;
  onChangeCity?: () => void;
  onOpenEvent?: (id: string) => void;
  onSeeAll?: () => void;
}
