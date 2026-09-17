import { apiRequest } from '@/shared/api/transport';
import type { ApiResponseData } from '@/shared/api/api-types';

export const sandboxKeys = {
  cards: () => ['sandbox', 'cards'] as const,
};

export function getSandbox(token: string) {
  return apiRequest<ApiResponseData<'getSandbox', 200>>('GET', '/api/sandbox', { token });
}
