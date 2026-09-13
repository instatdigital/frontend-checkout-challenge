import { apiRequest } from '@/api/transport';
import type { ApiResponseData, ApiRequestBody } from '@/api/api-types';

export function getCheckoutOptions(token: string) {
  return apiRequest<ApiResponseData<'getCheckoutOptions', 200>>('GET', '/api/checkout/options', {
    token,
  });
}

export function createQuote(body: ApiRequestBody<'createQuote'>, token: string) {
  return apiRequest<ApiResponseData<'createQuote', 201>>('POST', '/api/quotes', { body, token });
}

export function getQuote(quoteId: string, token: string) {
  return apiRequest<ApiResponseData<'getQuote', 200>>('GET', `/api/quotes/${quoteId}`, { token });
}
