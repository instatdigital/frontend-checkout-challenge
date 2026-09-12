import { describe, it, expect, beforeEach } from 'vitest';
import { generateKey, saveKey, loadKey, clearKey } from '@/lib/idempotency';

describe('idempotency keys', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('generateKey returns UUID format', () => {
    const key = generateKey();
    expect(key).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('generateKey returns unique values', () => {
    const keys = new Set(Array.from({ length: 10 }, () => generateKey()));
    expect(keys.size).toBe(10);
  });

  it('saves and loads order key', () => {
    saveKey('order', 'key-order-1');
    expect(loadKey('order')).toBe('key-order-1');
  });

  it('saves and loads payment key', () => {
    saveKey('payment', 'key-payment-1');
    expect(loadKey('payment')).toBe('key-payment-1');
  });

  it('returns null when no key saved', () => {
    expect(loadKey('order')).toBeNull();
  });

  it('clearKey removes only the specified action', () => {
    saveKey('order', 'key-order-1');
    saveKey('payment', 'key-payment-1');
    clearKey('order');
    expect(loadKey('order')).toBeNull();
    expect(loadKey('payment')).toBe('key-payment-1');
  });
});
