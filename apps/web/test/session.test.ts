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

  describe('saveSession / loadSession', () => {
    it('saves and loads session', () => {
      saveSession('token-123', 'session-456');
      expect(loadSession()).toEqual({ token: 'token-123', sessionId: 'session-456' });
    });

    it('returns null when nothing saved', () => {
      expect(loadSession()).toBeNull();
    });

    it('returns null after clearSession', () => {
      saveSession('token-123', 'session-456');
      clearSession();
      expect(loadSession()).toBeNull();
    });
  });

  describe('orderId / paymentId', () => {
    it('saves and loads orderId', () => {
      saveOrderId('order-1');
      expect(loadOrderId()).toBe('order-1');
    });

    it('returns null when no orderId', () => {
      expect(loadOrderId()).toBeNull();
    });

    it('saves and loads paymentId', () => {
      savePaymentId('payment-1');
      expect(loadPaymentId()).toBe('payment-1');
    });

    it('returns null when no paymentId', () => {
      expect(loadPaymentId()).toBeNull();
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
});
