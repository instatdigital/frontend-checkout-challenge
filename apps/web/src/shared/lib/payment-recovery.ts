const PAYMENT_ID_KEY = 'checkout_payment_id';

export function savePaymentId(paymentId: string): void {
  localStorage.setItem(PAYMENT_ID_KEY, paymentId);
}

export function loadPaymentId(): string | null {
  return localStorage.getItem(PAYMENT_ID_KEY);
}

export function clearPaymentId(): void {
  localStorage.removeItem(PAYMENT_ID_KEY);
}
