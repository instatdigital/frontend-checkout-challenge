import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ApiError } from '@/shared/api/errors';
import { createSession, getSession } from '../api';
import { clearSession, loadSession, saveSession } from './session';
import { SessionContext } from '../model/session-context';
import type { SessionState } from '../model/session-context';

function restoreSession(stored: {
  token: string;
  sessionId: string;
}): Promise<SessionState | null> {
  return getSession(stored.sessionId, stored.token)
    .then(() => ({
      token: stored.token,
      sessionId: stored.sessionId,
      isLoading: false,
      error: null,
    }))
    .catch((e) => {
      if (e instanceof ApiError && e.status === 401) clearSession();
      return null;
    });
}

function initSession(): Promise<SessionState> {
  const stored = loadSession();
  if (stored) {
    return restoreSession(stored).then((state) => state ?? initFresh());
  }
  return initFresh();
}

async function initFresh(): Promise<SessionState> {
  try {
    const session = await createSession();
    saveSession(session.token, session.id);
    return { token: session.token, sessionId: session.id, isLoading: false, error: null };
  } catch (e) {
    return {
      token: null,
      sessionId: null,
      isLoading: false,
      error: e instanceof Error ? e.message : 'Не удалось создать сессию',
    };
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({
    token: null,
    sessionId: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    void initSession().then((result) => {
      if (!cancelled) setState(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return <SessionContext.Provider value={state}>{children}</SessionContext.Provider>;
}
