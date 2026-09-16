import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuthQuery, useAuthMutation } from '@/entities/session';
import { createTestWrapper } from './helpers/create-wrapper';
import { defaultSession } from './helpers/mock-session';

vi.mock('@/entities/session/model/session-context', () => ({
  useSession: vi.fn(),
}));

import { useSession } from '@/entities/session/model/session-context';

describe('useAuthQuery', () => {
  it('does not fetch when token is null', () => {
    vi.mocked(useSession).mockReturnValue({ ...defaultSession, token: null });
    const fetcher = vi.fn();

    renderHook(() => useAuthQuery(['test'], fetcher), { wrapper: createTestWrapper() });

    expect(fetcher).not.toHaveBeenCalled();
  });

  it('fetches with token when available', async () => {
    vi.mocked(useSession).mockReturnValue(defaultSession);
    const fetcher = vi.fn().mockResolvedValue({ data: 'ok' });

    renderHook(() => useAuthQuery(['test'], fetcher), { wrapper: createTestWrapper() });

    await waitFor(() =>
      expect(fetcher).toHaveBeenCalledWith('test-token', expect.any(AbortSignal)),
    );
  });
});

describe('useAuthMutation', () => {
  it('passes variables and token to mutationFn', async () => {
    vi.mocked(useSession).mockReturnValue(defaultSession);
    const mutationFn = vi.fn().mockResolvedValue({});

    const { result } = renderHook(() => useAuthMutation(mutationFn), {
      wrapper: createTestWrapper(),
    });

    result.current.mutate({ productId: 'p-1' });
    await waitFor(() =>
      expect(mutationFn).toHaveBeenCalledWith({ productId: 'p-1' }, 'test-token'),
    );
  });

  it('throws when token is null', async () => {
    vi.mocked(useSession).mockReturnValue({ ...defaultSession, token: null });
    const mutationFn = vi.fn();

    const { result } = renderHook(() => useAuthMutation(mutationFn), {
      wrapper: createTestWrapper(),
    });

    result.current.mutate({});
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mutationFn).not.toHaveBeenCalled();
  });
});
