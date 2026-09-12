import { createContext, useContext } from 'react';

export interface SessionState {
  token: string | null;
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
}

export const SessionContext = createContext<SessionState>({
  token: null,
  sessionId: null,
  isLoading: true,
  error: null,
});

export function useSession(): SessionState {
  return useContext(SessionContext);
}
