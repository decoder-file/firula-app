import type { SearchEvent, SearchOrganization, SearchUser } from "@/services/search.service";

export interface GlobalSearchScreenProps {
  query: string;
  onQueryChange: (value: string) => void;
  organizations: SearchOrganization[];
  events: SearchEvent[];
  users: SearchUser[];
  isEnabled: boolean;
  isLoading: boolean;
  isError: boolean;
  onClose: () => void;
  onOpenOrganization: (organization: SearchOrganization) => void;
  onOpenEvent: (event: SearchEvent) => void;
  onOpenUser: (user: SearchUser) => void;
}
