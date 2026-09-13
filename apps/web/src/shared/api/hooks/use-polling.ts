import { useQuery } from '@tanstack/react-query';
import type { ApiErrorType } from '../errors';

export function usePolling<T>(
  key: readonly unknown[],
  fetcher: (signal: AbortSignal) => Promise<T>,
  shouldStop: (data: T) => boolean,
  interval = 1000,
  options?: { enabled?: boolean },
) {
  return useQuery<T, ApiErrorType>({
    queryKey: key,
    queryFn: ({ signal }) => fetcher(signal),
    refetchInterval: ({ state }) => {
      if (!state.data) return interval;
      return shouldStop(state.data) ? false : interval;
    },
    enabled: options?.enabled,
  });
}
