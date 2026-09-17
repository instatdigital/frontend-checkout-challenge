import { useAuthPolling } from '@/entities/session';
import { getPayment } from '@/entities/payment';
import type { ApiResponseData } from '@/shared/api/api-types';

type Payment = ApiResponseData<'getPayment', 200>;

const TERMINAL_STATUSES = new Set(['succeeded', 'failed', 'cancelled']);

function isTerminal(payment: Payment) {
  return TERMINAL_STATUSES.has(payment.status);
}

export function usePaymentStatus(paymentId: string | undefined, enabled = false) {
  return useAuthPolling<Payment>(
    ['payment', paymentId ?? ''],
    (token, signal) => {
      if (!paymentId) throw new Error('Payment id is required');
      return getPayment(paymentId, token, signal);
    },
    isTerminal,
    1000,
    { enabled: enabled && !!paymentId },
  );
}
