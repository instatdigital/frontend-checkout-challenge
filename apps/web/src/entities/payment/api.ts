import { apiRequest } from '@/shared/api/transport';
import type { ApiResponseData, ApiRequestBody } from '@/shared/api/api-types';

export function listPayments(orderId: string, token: string) {
  return apiRequest<ApiResponseData<'listPayments', 200>>(
    'GET',
    `/api/orders/${orderId}/payments`,
    {
      token,
    },
  );
}

export function createPayment(orderId: string, token: string, idempotencyKey: string) {
  const body: ApiRequestBody<'createPayment'> = {};
  return apiRequest<ApiResponseData<'createPayment', 201>>(
    'POST',
    `/api/orders/${orderId}/payments`,
    { body, token, idempotencyKey },
  );
}

export function getPayment(paymentId: string, token: string, signal?: AbortSignal) {
  return apiRequest<ApiResponseData<'getPayment', 200>>('GET', `/api/payments/${paymentId}`, {
    token,
    signal,
  });
}

export function createSimulation(
  paymentId: string,
  body: ApiRequestBody<'createSimulation'>,
  token: string,
) {
  return apiRequest<ApiResponseData<'createSimulation', 201>>(
    'POST',
    `/api/payments/${paymentId}/simulations`,
    { body, token },
  );
}

export function getSimulation(
  paymentId: string,
  simulationId: string,
  token: string,
  signal?: AbortSignal,
) {
  return apiRequest<ApiResponseData<'getSimulation', 200>>(
    'GET',
    `/api/payments/${paymentId}/simulations/${simulationId}`,
    { token, signal },
  );
}
