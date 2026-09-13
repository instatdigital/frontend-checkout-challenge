import { describe, it, expect, beforeEach } from 'vitest';
import { generateKey, saveKey, loadKey, clearKey } from '@/lib/idempotency';

describe('idempotency keys', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('generateKey returns UUID format', () => {
    const key = generateKey();
    expect(key).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('generateKey returns unique values', () => {
    const keys = new Set(Array.from({ length: 10 }, () => generateKey()));
    expect(keys.size).toBe(10);
  });

  it.each([
    { action: 'order' as const, key: 'key-order-1' },
    { action: 'payment' as const, key: 'key-payment-1' },
  ])('saves and loads $action key', ({ action, key }) => {
    saveKey(action, key);
    expect(loadKey(action)).toBe(key);
  });

  it.each([{ action: 'order' as const }, { action: 'payment' as const }])(
    'returns null when no $action key saved',
    ({ action }) => {
      expect(loadKey(action)).toBeNull();
    },
  );

  it('clearKey removes only the specified action', () => {
    saveKey('order', 'key-order-1');
    saveKey('payment', 'key-payment-1');
    clearKey('order');
    expect(loadKey('order')).toBeNull();
    expect(loadKey('payment')).toBe('key-payment-1');
  });
});
