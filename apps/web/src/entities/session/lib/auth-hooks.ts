import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { useSession } from '../model/session-context';
import type { ApiErrorType } from '@/shared/api/errors';

export function useAuthQuery<T>(
  key: readonly unknown[],
  fetcher: (token: string, signal: AbortSignal) => Promise<T>,
  options?: Omit<UseQueryOptions<T, ApiErrorType>, 'queryKey' | 'queryFn'>,
) {
  const { token } = useSession();
  return useQuery<T, ApiErrorType>({
    queryKey: key,
    queryFn: ({ signal }) => {
      if (!token) throw new Error('No token');
      return fetcher(token, signal);
    },
    enabled: !!token && (options?.enabled ?? true),
    ...options,
  });
}

export function useAuthMutation<TData, TVariables>(
  mutationFn: (variables: TVariables, token: string) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, ApiErrorType, TVariables>, 'mutationFn'>,
) {
  const { token } = useSession();
  return useMutation<TData, ApiErrorType, TVariables>({
    mutationFn: (variables) => {
      if (!token) throw new Error('No token');
      return mutationFn(variables, token);
    },
    ...options,
  });
}
