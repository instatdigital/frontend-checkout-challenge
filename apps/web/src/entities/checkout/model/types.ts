import type { Customer, Delivery } from '@checkout/contracts';

type CheckoutFormDelivery = {
  method: string;
  pickupPointId: string;
  address: { city: string; street: string; house: string; apartment?: string };
};

export type CheckoutFormValues = {
  customer: Customer;
  delivery: CheckoutFormDelivery;
};

export function toDelivery(form: CheckoutFormDelivery): Delivery | undefined {
  if (form.method === 'pickup') {
    return { method: 'pickup', pickupPointId: form.pickupPointId };
  }
  if (form.method === 'courier') {
    return { method: 'courier', address: form.address };
  }
  return undefined;
}
