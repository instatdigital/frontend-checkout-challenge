import type { Delivery } from '@checkout/contracts';
import { apiRequest } from '@/shared/api/transport';
import type { ApiResponseData } from '@/shared/api/api-types';

export const checkoutKeys = {
  options: () => ['checkout', 'options'] as const,
  quote: (id: string) => ['checkout', 'quote', id] as const,
};

export function getCheckoutOptions(token: string, signal?: AbortSignal) {
  return apiRequest<ApiResponseData<'getCheckoutOptions', 200>>('GET', '/api/checkout/options', {
    token,
    signal,
  });
}

export function createQuote(body: { cartVersion: number; delivery: Delivery }, token: string) {
  return apiRequest<ApiResponseData<'createQuote', 201>>('POST', '/api/quotes', { body, token });
}

export function getQuote(quoteId: string, token: string, signal?: AbortSignal) {
  return apiRequest<ApiResponseData<'getQuote', 200>>('GET', `/api/quotes/${quoteId}`, {
    token,
    signal,
  });
}
