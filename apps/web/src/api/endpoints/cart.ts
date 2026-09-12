import { apiRequest } from '@/api/transport';
import type { Cart, CartItem, SetCartItem } from '@checkout/contracts';

export function getCart(token: string) {
  return apiRequest<Cart>('GET', '/api/cart', { token });
}

export function getCartItem(productId: string, token: string) {
  return apiRequest<CartItem>('GET', `/api/cart/items/${productId}`, { token });
}

export function setCartItem(productId: string, body: SetCartItem, token: string) {
  return apiRequest<CartItem>('PUT', `/api/cart/items/${productId}`, { body, token });
}

export function removeCartItem(productId: string, token: string) {
  return apiRequest<void>('DELETE', `/api/cart/items/${productId}`, { token });
}
