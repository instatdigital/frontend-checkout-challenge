import type { Customer, Delivery } from '@checkout/contracts';

export type CheckoutFormValues = {
  customer: Customer;
  delivery: Delivery;
};
