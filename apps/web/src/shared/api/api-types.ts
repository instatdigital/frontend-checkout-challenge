import type { operations } from './openapi-types';

// --- Envelope helpers ---

type JsonContent<T> = T extends { content: { 'application/json': infer B } } ? B : never;
type DataFromEnvelope<T> = T extends { data: infer D } ? D : never;

export type ApiRequestBody<T extends keyof operations> = operations[T]['requestBody'] extends {
  content: { 'application/json': infer B };
}
  ? B
  : undefined;

export type ApiResponseData<
  T extends keyof operations,
  Status extends keyof operations[T]['responses'],
> = DataFromEnvelope<JsonContent<operations[T]['responses'][Status]>>;

// --- Transport types ---

export type RequestOptions = {
  idempotencyKey?: string;
  signal?: AbortSignal;
  token?: string;
  body?: unknown;
};

export interface ApiRequest {
  <T>(method: string, path: string, options?: RequestOptions): Promise<T>;
}
