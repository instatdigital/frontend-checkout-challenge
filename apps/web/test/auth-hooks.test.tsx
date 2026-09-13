import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useAuthQuery, useAuthMutation } from '@/api/auth-hooks';

vi.mock('@/lib/session-context', () => ({
  useSession: vi.fn(),
}));

import { useSession } from '@/lib/session-context';

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useAuthQuery', () => {
  it('does not fetch when token is null', () => {
    vi.mocked(useSession).mockReturnValue({
      token: null,
      sessionId: null,
      isLoading: true,
      error: null,
    });
    const fetcher = vi.fn();

    renderHook(() => useAuthQuery(['test'], fetcher), { wrapper });

    expect(fetcher).not.toHaveBeenCalled();
  });

  it('fetches with token when available', async () => {
    vi.mocked(useSession).mockReturnValue({
      token: 'abc-123',
      sessionId: 's-1',
      isLoading: false,
      error: null,
    });
    const fetcher = vi.fn().mockResolvedValue({ data: 'ok' });

    renderHook(() => useAuthQuery(['test'], fetcher), { wrapper });

    await waitFor(() => expect(fetcher).toHaveBeenCalledWith('abc-123', expect.any(AbortSignal)));
  });
});

describe('useAuthMutation', () => {
  it('passes variables and token to mutationFn', async () => {
    vi.mocked(useSession).mockReturnValue({
      token: 'abc-123',
      sessionId: 's-1',
      isLoading: false,
      error: null,
    });
    const mutationFn = vi.fn().mockResolvedValue({});

    const { result } = renderHook(() => useAuthMutation(mutationFn), { wrapper });

    result.current.mutate({ productId: 'p-1' });
    await waitFor(() => expect(mutationFn).toHaveBeenCalledWith({ productId: 'p-1' }, 'abc-123'));
  });

  it('throws when token is null', async () => {
    vi.mocked(useSession).mockReturnValue({
      token: null,
      sessionId: null,
      isLoading: true,
      error: null,
    });
    const mutationFn = vi.fn();

    const { result } = renderHook(() => useAuthMutation(mutationFn), { wrapper });

    result.current.mutate({});
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mutationFn).not.toHaveBeenCalled();
  });
});
