import { ApiError, NetworkError, parseErrorResponse } from './errors';

const BASE_URL = 'http://127.0.0.1:4000';

type RequestOptions = {
  body?: unknown;
  idempotencyKey?: string;
  signal?: AbortSignal;
  token?: string;
};

export async function apiRequest<T>(
  method: string,
  path: string,
  options?: RequestOptions,
): Promise<T> {
  const headers: Record<string, string> = {};

  if (options?.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options?.token) headers['Authorization'] = `Bearer ${options.token}`;
  if (options?.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options?.signal,
    });

    if (!response.ok) return await parseErrorResponse(response);
    if (response.status === 204) return undefined as T;

    const body = await response.json();
    return body.data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new NetworkError(error);
  }
}
