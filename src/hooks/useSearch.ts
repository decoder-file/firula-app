import { useQuery } from "@tanstack/react-query";

import { searchService, type GlobalSearchResult } from "@/services/search.service";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { queryKeys } from "@/hooks/queryKeys";

export function useGlobalSearch(query: string) {
  const debounced = useDebouncedValue(query.trim(), 300);
  const enabled = debounced.length >= 2;

  const result = useQuery<GlobalSearchResult>({
    queryKey: queryKeys.search.query(debounced),
    queryFn: () => searchService.search(debounced),
    enabled,
    staleTime: 30_000,
  });

  return { ...result, enabled, debounced };
}
