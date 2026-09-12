import { apiRequest } from '@/api/transport';
import type { CreateOrder, Order } from '@checkout/contracts';

export function createOrder(body: CreateOrder, token: string, idempotencyKey: string) {
  return apiRequest<Order>('POST', '/api/orders', { body, token, idempotencyKey });
}

export function listOrders(token: string) {
  return apiRequest<Order[]>('GET', '/api/orders', { token });
}

export function getOrder(orderId: string, token: string) {
  return apiRequest<Order>('GET', `/api/orders/${orderId}`, { token });
}
