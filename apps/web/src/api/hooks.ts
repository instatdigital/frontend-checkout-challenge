import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import type { ApiErrorType } from '@/api/errors';

export function useApiQuery<T>(
  key: readonly unknown[],
  fetcher: (signal?: AbortSignal) => Promise<T>,
  options?: Omit<UseQueryOptions<T, ApiErrorType>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<T, ApiErrorType>({
    queryKey: key,
    queryFn: ({ signal }) => fetcher(signal),
    ...options,
  });
}

export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, ApiErrorType, TVariables>, 'mutationFn'>,
) {
  return useMutation<TData, ApiErrorType, TVariables>({
    mutationFn,
    ...options,
  });
}
