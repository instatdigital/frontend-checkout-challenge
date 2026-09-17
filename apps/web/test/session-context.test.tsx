import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { SessionProvider } from '@/entities/session';
import { useSession } from '@/entities/session/model/session-context';
import { createSession, getSession } from '@/entities/session/api';
import { loadSession, saveSession, clearSession } from '@/entities/session/lib/session';
import { ApiError } from '@/shared/api/errors';

vi.mock('@/entities/session/api');
vi.mock('@/entities/session/lib/session');

const newSession = {
  id: 's-new',
  token: 't-new',
  cart: { id: 'c-1', version: 0, items: [], quantity: 0, subtotal: 0, currency: 'RUB' as const },
};

describe('SessionProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function wrapper({ children }: { children: ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>;
  }

  it('creates session when no stored token', async () => {
    vi.mocked(loadSession).mockReturnValue(null);
    vi.mocked(createSession).mockResolvedValue(newSession);

    const { result } = renderHook(() => useSession(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.token).toBe('t-new');
    expect(result.current.sessionId).toBe('s-new');
    expect(createSession).toHaveBeenCalledOnce();
    expect(saveSession).toHaveBeenCalledWith('t-new', 's-new');
  });

  it('restores valid session from storage', async () => {
    vi.mocked(loadSession).mockReturnValue({ token: 't-saved', sessionId: 's-saved' });
    vi.mocked(getSession).mockResolvedValue({ id: 's-saved', cartId: 'c-1' });

    const { result } = renderHook(() => useSession(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.token).toBe('t-saved');
    expect(result.current.sessionId).toBe('s-saved');
    expect(getSession).toHaveBeenCalledWith('s-saved', 't-saved');
    expect(createSession).not.toHaveBeenCalled();
  });

  it('creates new session when stored token is invalid', async () => {
    vi.mocked(loadSession).mockReturnValue({ token: 't-bad', sessionId: 's-bad' });
    vi.mocked(getSession).mockRejectedValue(
      new ApiError(401, 'SESSION_REQUIRED', 'Токен не передан'),
    );
    vi.mocked(createSession).mockResolvedValue(newSession);

    const { result } = renderHook(() => useSession(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.token).toBe('t-new');
    expect(clearSession).toHaveBeenCalled();
    expect(saveSession).toHaveBeenCalledWith('t-new', 's-new');
  });

  it('sets error when session creation fails', async () => {
    vi.mocked(loadSession).mockReturnValue(null);
    vi.mocked(createSession).mockRejectedValue(new Error('Network failure'));

    const { result } = renderHook(() => useSession(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.token).toBeNull();
    expect(result.current.error).toBe('Network failure');
  });
});
