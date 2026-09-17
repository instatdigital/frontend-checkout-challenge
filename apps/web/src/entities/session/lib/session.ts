const KEYS = {
  token: 'checkout_token',
  sessionId: 'checkout_session_id',
  orderId: 'checkout_order_id',
  paymentId: 'checkout_payment_id',
} as const;

export function saveSession(token: string, sessionId: string): void {
  localStorage.setItem(KEYS.token, token);
  localStorage.setItem(KEYS.sessionId, sessionId);
}

export function loadSession(): { token: string; sessionId: string } | null {
  const token = localStorage.getItem(KEYS.token);
  const sessionId = localStorage.getItem(KEYS.sessionId);
  if (!token || !sessionId) return null;
  return { token, sessionId };
}

export function clearSession(): void {
  localStorage.removeItem(KEYS.token);
  localStorage.removeItem(KEYS.sessionId);
}

export function saveOrderId(orderId: string): void {
  localStorage.setItem(KEYS.orderId, orderId);
}

export function loadOrderId(): string | null {
  return localStorage.getItem(KEYS.orderId);
}

export function savePaymentId(paymentId: string): void {
  localStorage.setItem(KEYS.paymentId, paymentId);
}

export function loadPaymentId(): string | null {
  return localStorage.getItem(KEYS.paymentId);
}

export function clearCheckout(): void {
  localStorage.removeItem(KEYS.orderId);
  localStorage.removeItem(KEYS.paymentId);
}
