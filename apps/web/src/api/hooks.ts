import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import type { ApiError, NetworkError } from '@/api/errors';

type ApiErrorType = ApiError | NetworkError;

export function useApiQuery<T>(
  key: readonly unknown[],
  fetcher: () => Promise<T>,
  options?: Omit<UseQueryOptions<T, ApiErrorType>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<T, ApiErrorType>({
    queryKey: key,
    queryFn: fetcher,
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
