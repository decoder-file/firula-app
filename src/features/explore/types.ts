import type { ImageSourcePropType } from "react-native";

export interface ExploreEvent {
  id: string;
  type: string;
  category: string;
  title: string;
  city: string;
  dateLabel: string;
  price: string;
  attendeesLabel: string;
  hot: boolean;
  image: ImageSourcePropType;
}

export interface ExploreScreenProps {
  events: ExploreEvent[];
  onOpenEvent?: (id: string) => void;
}

export interface ExploreRouteProps extends ExploreScreenProps {}
