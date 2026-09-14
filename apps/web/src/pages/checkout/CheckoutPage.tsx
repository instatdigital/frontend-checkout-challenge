import { useForm } from 'react-hook-form';
import type { Delivery } from '@checkout/contracts';
import { useAuthQuery, useAuthMutation } from '@/entities/session';
import {
  CustomerForm,
  DeliveryForm,
  checkoutKeys,
  getCheckoutOptions,
  createQuote,
  toDelivery,
} from '@/entities/checkout';
import type { CheckoutFormValues } from '@/entities/checkout';
import { QueryGuard } from '@/shared/ui/QueryGuard/QueryGuard';
import { formatPrice } from '@/shared/lib/format';
import './CheckoutPage.module.css';

export function CheckoutPage() {
  const {
    data: options,
    isLoading,
    error,
  } = useAuthQuery(checkoutKeys.options(), (token, signal) => getCheckoutOptions(token, signal));

  const quoteMutation = useAuthMutation(
    (body: { cartVersion: number; delivery: Delivery }, token) => createQuote(body, token),
  );

  const cart = options?.cart;
  const deliveryMethods = options?.deliveryMethods ?? [];

  const { control, handleSubmit } = useForm<CheckoutFormValues>({
    defaultValues: {
      customer: { name: '', email: '', phone: '' },
      delivery: {
        method: 'pickup',
        pickupPointId: 'point-center',
        address: { city: '', street: '', house: '' },
      },
    },
    mode: 'onBlur',
  });

  const quote = quoteMutation.data;

  const onSubmit = (data: CheckoutFormValues) => {
    if (!cart) return;
    const deliveryValue = toDelivery(data.delivery);
    if (!deliveryValue) return;
    quoteMutation.mutate({ cartVersion: cart.version, delivery: deliveryValue });
  };

  return (
    <div className="checkout">
      <h1 className="checkout__title">Оформление заказа</h1>
      <QueryGuard isLoading={isLoading} error={error}>
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
          <CustomerForm control={control} />
          <DeliveryForm deliveryMethods={deliveryMethods} control={control} />
          {quote && (
            <div className="checkout__summary">
              <p className="checkout__line">Подытог: {formatPrice(quote.subtotal)}</p>
              <p className="checkout__line">Доставка: {formatPrice(quote.shipping)}</p>
              <p className="checkout__total">Итого: {formatPrice(quote.total)}</p>
            </div>
          )}
          <button className="checkout__submit" type="submit">
            Рассчитать стоимость
          </button>
        </form>
      </QueryGuard>
    </div>
  );
}
