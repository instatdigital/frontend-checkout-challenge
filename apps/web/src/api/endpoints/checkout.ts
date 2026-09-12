import { apiRequest } from '@/api/transport';
import type { CheckoutOptions, CreateQuote, Quote } from '@checkout/contracts';

export function getCheckoutOptions(token: string) {
  return apiRequest<CheckoutOptions>('GET', '/api/checkout/options', { token });
}

export function createQuote(body: CreateQuote, token: string) {
  return apiRequest<Quote>('POST', '/api/quotes', { body, token });
}

export function getQuote(quoteId: string, token: string) {
  return apiRequest<Quote>('GET', `/api/quotes/${quoteId}`, { token });
}
