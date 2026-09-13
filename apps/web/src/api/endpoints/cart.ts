import { apiRequest } from '@/api/transport';
import type { ApiResponseData, ApiRequestBody } from '@/api/api-types';

export function getCart(token: string) {
  return apiRequest<ApiResponseData<'getCart', 200>>('GET', '/api/cart', { token });
}

export function getCartItem(productId: string, token: string) {
  return apiRequest<ApiResponseData<'getCartItem', 200>>('GET', `/api/cart/items/${productId}`, {
    token,
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
