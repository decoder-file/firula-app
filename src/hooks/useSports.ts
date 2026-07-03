import { useQuery } from "@tanstack/react-query";

import { sportsService } from "@/services/sports.service";
import { queryKeys } from "@/hooks/queryKeys";

export const useSports = () =>
  useQuery({
    queryKey: queryKeys.sports.list(),
    queryFn: sportsService.getPublicSports,
  });
