import { apiRequest } from '@/api/transport';
import type { ApiResponseData, ApiRequestBody } from '@/api/api-types';

export function createOrder(
  body: ApiRequestBody<'createOrder'>,
  token: string,
  idempotencyKey: string,
) {
  return apiRequest<ApiResponseData<'createOrder', 201>>('POST', '/api/orders', {
    body,
    token,
    idempotencyKey,
  });
}

export function listOrders(token: string) {
  return apiRequest<ApiResponseData<'listOrders', 200>>('GET', '/api/orders', { token });
}

export function getOrder(orderId: string, token: string) {
  return apiRequest<ApiResponseData<'getOrder', 200>>('GET', `/api/orders/${orderId}`, { token });
}
