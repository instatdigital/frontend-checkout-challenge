import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ApiError } from '@/shared/api/errors';
import { createSession, getSession } from '../api';
import { clearSession, loadSession, saveSession } from './session';
import { SessionContext } from '../model/session-context';
import type { SessionState } from '../model/session-context';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({
    token: null,
    sessionId: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const stored = loadSession();

      if (stored) {
        try {
          await getSession(stored.sessionId, stored.token);
          if (!cancelled) {
            setState({
              token: stored.token,
              sessionId: stored.sessionId,
              isLoading: false,
              error: null,
            });
            return;
          }
        } catch (e) {
          if (e instanceof ApiError && e.status === 401) {
            clearSession();
          }
        }
      }

      try {
        const session = await createSession();
        if (!cancelled) {
          saveSession(session.token, session.id);
          setState({ token: session.token, sessionId: session.id, isLoading: false, error: null });
        }
      } catch (e) {
        if (!cancelled) {
          setState({
            token: null,
            sessionId: null,
            isLoading: false,
            error: e instanceof Error ? e.message : 'Не удалось создать сессию',
          });
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  return <SessionContext.Provider value={state}>{children}</SessionContext.Provider>;
}
