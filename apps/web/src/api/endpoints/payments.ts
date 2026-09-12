import { apiRequest } from '@/api/transport';
import type { Payment, Scenario, Simulation } from '@checkout/contracts';

export function listPayments(orderId: string, token: string) {
  return apiRequest<Payment[]>('GET', `/api/orders/${orderId}/payments`, { token });
}

export function createPayment(orderId: string, token: string, idempotencyKey: string) {
  return apiRequest<Payment>('POST', `/api/orders/${orderId}/payments`, {
    body: {},
    token,
    idempotencyKey,
  });
}

export function getPayment(paymentId: string, token: string) {
  return apiRequest<Payment>('GET', `/api/payments/${paymentId}`, { token });
}

export function createSimulation(paymentId: string, scenario: Scenario, token: string) {
  return apiRequest<Simulation>('POST', `/api/payments/${paymentId}/simulations`, {
    body: { scenario },
    token,
  });
}

export function getSimulation(paymentId: string, simulationId: string, token: string) {
  return apiRequest<Simulation>(
    'GET',
    `/api/payments/${paymentId}/simulations/${simulationId}`,
    { token },
  );
}
