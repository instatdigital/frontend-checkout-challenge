import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiRequest } from '@/api/transport';
import { ApiError, ConflictError, NetworkError } from '@/api/errors';

beforeEach(() => {
  vi.restoreAllMocks();
});

function mockFetch(response: Partial<Response>): ReturnType<typeof vi.spyOn> {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({}),
    ...response,
  } as Response);
}

function apiEnvelope(data: unknown) {
  return { data, meta: { requestId: 'test-id' }, links: {} };
}

function apiErrorEnvelope(code: string, message: string, fields?: unknown) {
  const error: Record<string, unknown> = { code, message };
  if (fields) error.fields = fields;
  return { error, meta: { requestId: 'test-id' } };
}

describe('apiRequest', () => {
  it('extracts data from envelope on success', async () => {
    const product = { id: 'lamp-orbit', title: 'Orbit Lamp', price: 249000 };
    mockFetch({ json: async () => apiEnvelope(product) });

    const result = await apiRequest('GET', '/api/products');

    expect(result).toEqual(product);
  });

  it('sends Content-Type and serialized body for POST', async () => {
    const body = { quantity: 2 };
    const fetchSpy = mockFetch({ status: 201, json: async () => apiEnvelope({}) });

    await apiRequest('POST', '/api/cart/items/lamp-orbit', { body });

    expect(fetchSpy).toHaveBeenCalledWith('http://127.0.0.1:4000/api/cart/items/lamp-orbit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  });

  it('injects Authorization header when token provided', async () => {
    const fetchSpy = mockFetch({ json: async () => apiEnvelope([]) });

    await apiRequest('GET', '/api/cart', { token: 'abc-123' });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: { Authorization: 'Bearer abc-123' },
      }),
    );
  });

  it('sends Idempotency-Key header when provided', async () => {
    const fetchSpy = mockFetch({ status: 201, json: async () => apiEnvelope({}) });

    await apiRequest('POST', '/api/orders', { body: {}, idempotencyKey: 'key-1' });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ 'Idempotency-Key': 'key-1' }),
      }),
    );
  });

  it.each([
    {
      status: 409,
      code: 'CART_VERSION_CONFLICT',
      message: 'Конфликт версии корзины',
      ErrorType: ConflictError,
    },
    {
      status: 401,
      code: 'SESSION_REQUIRED',
      message: 'Передайте токен',
      ErrorType: ApiError,
    },
    {
      status: 404,
      code: 'ROUTE_NOT_FOUND',
      message: 'Маршрут не найден',
      ErrorType: ApiError,
    },
  ] as const)('throws $ErrorType.name on $status $code', async ({ status, code, message, ErrorType }) => {
    mockFetch({ ok: false, status, json: async () => apiErrorEnvelope(code, message) });

    await expect(apiRequest('GET', '/api/test')).rejects.toSatisfy(
      (e: ApiError) => e instanceof ErrorType && e.code === code && e.status === status,
    );
  });

  it('returns undefined for 204', async () => {
    mockFetch({ ok: true, status: 204 });

    const result = await apiRequest('DELETE', '/api/cart/items/lamp-orbit');

    expect(result).toBeUndefined();
  });

  it('throws NetworkError on fetch failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(apiRequest('GET', '/api/products')).rejects.toThrow(NetworkError);
  });

  it('preserves ApiError fields on validation error', async () => {
    const fields = [{ path: 'body/customer/email', message: 'must match format email' }];
    mockFetch({
      ok: false,
      status: 400,
      json: async () => apiErrorEnvelope('VALIDATION_ERROR', 'Проверьте формат', fields),
    });

    await expect(apiRequest('POST', '/api/orders', { body: {} })).rejects.toSatisfy(
      (e: ApiError) => e.code === 'VALIDATION_ERROR' && e.status === 400 && e.fields?.length === 1,
    );
  });
});
