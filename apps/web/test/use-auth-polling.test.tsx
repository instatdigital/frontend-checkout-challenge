import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuthPolling } from '@/entities/session';
import { createTestWrapper } from './helpers/create-wrapper';
import { defaultSession } from './helpers/mock-session';

vi.mock('@/entities/session/model/session-context', () => ({
  useSession: vi.fn(),
}));

import { useSession } from '@/entities/session/model/session-context';

const wrapper = createTestWrapper();

afterEach(() => {
  vi.useRealTimers();
});

describe('useAuthPolling', () => {
  it('does not poll when token is null', () => {
    vi.mocked(useSession).mockReturnValue({ ...defaultSession, token: null });
    const fetcher = vi.fn();
    const shouldStop = () => false;

    renderHook(() => useAuthPolling(['payment', 'p1'], fetcher, shouldStop, 1000), { wrapper });

    expect(fetcher).not.toHaveBeenCalled();
  });

  it('passes the session token to the fetcher', async () => {
    vi.mocked(useSession).mockReturnValue(defaultSession);
    const fetcher = vi.fn().mockResolvedValue({ status: 'pending' });
    const shouldStop = (d: { status: string }) => d.status !== 'pending';

    renderHook(() => useAuthPolling(['payment', 'p2'], fetcher, shouldStop, 1000), { wrapper });

    await waitFor(() =>
      expect(fetcher).toHaveBeenCalledWith('test-token', expect.any(AbortSignal)),
    );
  });

  it('stops polling once shouldStop returns true', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(useSession).mockReturnValue(defaultSession);
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ status: 'pending' })
      .mockResolvedValueOnce({ status: 'succeeded' });
    const shouldStop = (d: { status: string }) => d.status !== 'pending';

    const { result } = renderHook(
      () => useAuthPolling(['payment', 'p3'], fetcher, shouldStop, 1000),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.status).toBe('pending');

    await vi.advanceTimersByTimeAsync(1500);
    await waitFor(() => expect(result.current.data?.status).toBe('succeeded'));
    expect(fetcher).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(2000);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
