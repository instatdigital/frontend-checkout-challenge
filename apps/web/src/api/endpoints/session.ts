import { apiRequest } from '@/api/transport';
import type { Session, SessionInfo } from '@checkout/contracts';

export function createSession() {
  return apiRequest<Session>('POST', '/api/sessions');
}

export function getSession(sessionId: string, token: string) {
  return apiRequest<SessionInfo>('GET', `/api/sessions/${sessionId}`, { token });
}
