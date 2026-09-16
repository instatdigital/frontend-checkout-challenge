import { useAuthMutation } from '@/entities/session';
import { createOrder } from '@/entities/order';
import { clearKey, saveKey } from '@/shared/lib/idempotency';
import type { ApiRequestBody, ApiResponseData } from '@/shared/api/api-types';

type OrderBody = ApiRequestBody<'createOrder'>;
type OrderResponse = ApiResponseData<'createOrder', 201>;

type CreateOrderVars = {
  body: OrderBody;
  idempotencyKey: string;
};

export function useCreateOrder() {
  return useAuthMutation<OrderResponse, CreateOrderVars>(
    ({ body, idempotencyKey }, token) => {
      saveKey('order', idempotencyKey);
      return createOrder(body, token, idempotencyKey);
    },
    {
      onSuccess: () => clearKey('order'),
    },
  );
}
