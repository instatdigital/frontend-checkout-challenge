import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveSession,
  loadSession,
  clearSession,
  saveOrderId,
  loadOrderId,
  savePaymentId,
  loadPaymentId,
  clearCheckout,
} from '@/lib/session';

describe('session storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it.each([
    {
      name: 'session',
      save: () => saveSession('token-123', 'session-456'),
      load: loadSession,
      expected: { token: 'token-123', sessionId: 'session-456' },
    },
    { name: 'orderId', save: () => saveOrderId('order-1'), load: loadOrderId, expected: 'order-1' },
    {
      name: 'paymentId',
      save: () => savePaymentId('payment-1'),
      load: loadPaymentId,
      expected: 'payment-1',
    },
  ] as const)('saves and loads $name', ({ save, load, expected }) => {
    save();
    expect(load()).toEqual(expected);
  });

  it.each([
    { name: 'session', load: loadSession },
    { name: 'orderId', load: loadOrderId },
    { name: 'paymentId', load: loadPaymentId },
  ] as const)('returns null when no $name saved', ({ load }) => {
    expect(load()).toBeNull();
  });

  it('clears session', () => {
    saveSession('token-123', 'session-456');
    clearSession();
    expect(loadSession()).toBeNull();
  });

  it('clearCheckout removes orderId and paymentId but keeps session', () => {
    saveSession('token-123', 'session-456');
    saveOrderId('order-1');
    savePaymentId('payment-1');
    clearCheckout();
    expect(loadSession()).toEqual({ token: 'token-123', sessionId: 'session-456' });
    expect(loadOrderId()).toBeNull();
    expect(loadPaymentId()).toBeNull();
  });
});
