import { apiRequest } from '@/shared/api/transport';
import type { ApiResponseData, ApiRequestBody } from '@/shared/api/api-types';

export function createSession() {
  const body: ApiRequestBody<'createSession'> = {};
  return apiRequest<ApiResponseData<'createSession', 201>>('POST', '/api/sessions', { body });
}

export function getSession(sessionId: string, token: string) {
  return apiRequest<ApiResponseData<'getSession', 200>>('GET', `/api/sessions/${sessionId}`, {
    token,
  });
}
