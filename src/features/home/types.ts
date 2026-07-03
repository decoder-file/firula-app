import type { ImageSourcePropType } from "react-native";
import type { LucideIcon } from "lucide-react-native";

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

export interface HomeCategory {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface HomeScreenProps {
  userName: string;
  userAvatar?: ImageSourcePropType;
  city: string;
  events: HomeEvent[];
  categories?: HomeCategory[];
  query?: string;
  selectedCategory?: string;
  onQueryChange?: (value: string) => void;
  onCategoryChange?: (value: string) => void;
  searchResults?: HomeEvent[];
  isSearchLoading?: boolean;
  isSearchFetchingMore?: boolean;
  canLoadMoreSearchResults?: boolean;
  onLoadMoreSearchResults?: () => void;
  isLoading?: boolean;
  notificationCount?: number;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onChangeCity?: () => void;
  onOpenEvent?: (id: string) => void;
  onSeeAll?: () => void;
}
