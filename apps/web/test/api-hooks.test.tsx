import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ReactNode } from 'react';
import { useApiQuery, useApiMutation } from '@/api/hooks';
import { usePolling } from '@/api/hooks/use-polling';
import { ApiError } from '@/api/errors';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useApiQuery', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('returns data after successful fetch', async () => {
    const data = { id: 'p1', title: 'Lamp' };
    const fetcher = vi.fn().mockResolvedValue(data);

    const { result } = renderHook(() => useApiQuery(['product', 'p1'], fetcher), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
  });

  it('returns error on failed fetch', async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValue(new ApiError(401, 'SESSION_REQUIRED', 'Токен не передан'));

    const { result } = renderHook(() => useApiQuery(['cart'], fetcher), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
  });

  it('refetches data', async () => {
    const fetcher = vi.fn().mockResolvedValue({ id: 'p1' });

    const { result } = renderHook(() => useApiQuery(['product', 'p1'], fetcher), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetcher).toHaveBeenCalledTimes(1);

    await result.current.refetch();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});

describe('useApiMutation', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('executes mutation and returns data', async () => {
    const mutationFn = vi.fn().mockResolvedValue({ id: 'order-1' });

    const { result } = renderHook(() => useApiMutation(mutationFn), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ quoteId: 'q1' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ id: 'order-1' });
  });

  it('returns error on failed mutation', async () => {
    const mutationFn = vi
      .fn()
      .mockRejectedValue(new ApiError(409, 'CART_VERSION_CONFLICT', 'Конфликт версии'));

    const { result } = renderHook(() => useApiMutation(mutationFn), {
      wrapper: createWrapper(),
    });

    result.current.mutate({});
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
  });
});

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stops polling when shouldStop returns true', async () => {
    const fetcher = vi
      .fn((_signal: AbortSignal) => Promise.resolve({ status: 'pending' }))
      .mockResolvedValueOnce({ status: 'pending' })
      .mockResolvedValueOnce({ status: 'succeeded' });
    const shouldStop = (d: { status: string }) => d.status !== 'pending';

    const { result } = renderHook(() => usePolling(['payment', 'p1'], fetcher, shouldStop, 1000), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.status).toBe('pending');

    await vi.advanceTimersByTimeAsync(1500);
    await waitFor(() => expect(result.current.data!.status).toBe('succeeded'));
    expect(fetcher).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(2000);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('stops polling on unmount', async () => {
    const fetcher = vi.fn((_signal: AbortSignal) => Promise.resolve({ status: 'pending' }));
    const shouldStop = () => false;

    const { unmount } = renderHook(() => usePolling(['payment', 'p2'], fetcher, shouldStop, 1000), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    unmount();

    await vi.advanceTimersByTimeAsync(3000);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
