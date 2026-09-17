import { ApiError, NetworkError, parseErrorResponse } from './errors';
import type { RequestOptions } from './api-types';

const BASE_URL = 'http://127.0.0.1:4000';

export async function apiRequest<T>(
  method: string,
  path: string,
  options?: RequestOptions,
): Promise<T> {
  const body = options?.body;
  const headers: Record<string, string> = {};

  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (options?.token) headers['Authorization'] = `Bearer ${options.token}`;
  if (options?.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    });

    if (!response.ok) return await parseErrorResponse(response);
    // 204 no-content и развёртка конверта — единственные места с `as T`:
    // generic-транспорт не может статически проверить runtime-тип, его гарантирует вызывающий через T.
    if (response.status === 204) return undefined as T;

    const envelope = await response.json();
    return envelope.data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new NetworkError(error);
  }
}
