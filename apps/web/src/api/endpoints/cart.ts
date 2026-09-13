import { apiRequest } from '@/api/transport';
import type { ApiResponseData, ApiRequestBody } from '@/api/api-types';

export function getCart(token: string, signal?: AbortSignal) {
  return apiRequest<ApiResponseData<'getCart', 200>>('GET', '/api/cart', { token, signal });
}

export function getCartItem(productId: string, token: string, signal?: AbortSignal) {
  return apiRequest<ApiResponseData<'getCartItem', 200>>('GET', `/api/cart/items/${productId}`, {
    token,
    signal,
  });
}

export function setCartItem(productId: string, body: ApiRequestBody<'setCartItem'>, token: string) {
  return apiRequest<ApiResponseData<'setCartItem', 200>>('PUT', `/api/cart/items/${productId}`, {
    body,
    token,
  });
}

export function removeCartItem(productId: string, token: string) {
  return apiRequest<void>('DELETE', `/api/cart/items/${productId}`, { token });
}
