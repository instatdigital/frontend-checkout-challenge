type IdempotencyAction = 'order' | 'payment';

const KEYS: Record<IdempotencyAction, string> = {
  order: 'checkout_idempotency_order',
  payment: 'checkout_idempotency_payment',
};

export function generateKey(): string {
  return crypto.randomUUID();
}

export function saveKey(action: IdempotencyAction, key: string): void {
  localStorage.setItem(KEYS[action], key);
}

export function loadKey(action: IdempotencyAction): string | null {
  return localStorage.getItem(KEYS[action]);
}

export function clearKey(action: IdempotencyAction): void {
  localStorage.removeItem(KEYS[action]);
}
