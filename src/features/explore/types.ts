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

export interface ExploreCategory {
  id: string;
  label: string;
}

export interface ExploreScreenProps {
  events: ExploreEvent[];
  categories?: ExploreCategory[];
  query?: string;
  selectedCategory?: string;
  onQueryChange?: (value: string) => void;
  onCategoryChange?: (value: string) => void;
  isLoading?: boolean;
  isFetchingMore?: boolean;
  canLoadMore?: boolean;
  onLoadMore?: () => void;
  onOpenEvent?: (id: string) => void;
}

export interface ExploreRouteProps extends ExploreScreenProps {}
