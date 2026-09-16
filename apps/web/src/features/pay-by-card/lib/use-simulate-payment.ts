import { useAuthMutation } from '@/entities/session';
import { createSimulation } from '@/entities/payment';
import type { ApiRequestBody, ApiResponseData } from '@/shared/api/api-types';

type SimulationBody = ApiRequestBody<'createSimulation'>;
type SimulationResponse = ApiResponseData<'createSimulation', 201>;

type SimulatePaymentVars = { paymentId: string; body: SimulationBody };

export function useSimulatePayment() {
  return useAuthMutation<SimulationResponse, SimulatePaymentVars>(({ paymentId, body }, token) =>
    createSimulation(paymentId, body, token),
  );
}
