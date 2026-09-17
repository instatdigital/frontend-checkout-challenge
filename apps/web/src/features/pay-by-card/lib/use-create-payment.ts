import { useAuthMutation } from '@/entities/session';
import { createPayment } from '@/entities/payment';
import type { ApiResponseData } from '@/shared/api/api-types';

type CreatePaymentVars = { orderId: string; idempotencyKey: string };
type PaymentResponse = ApiResponseData<'createPayment', 201>;

export function useCreatePayment() {
  return useAuthMutation<PaymentResponse, CreatePaymentVars>(({ orderId, idempotencyKey }, token) =>
    createPayment(orderId, token, idempotencyKey),
  );
}
