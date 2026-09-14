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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
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

  const delivery = watch('delivery');
  const quote = quoteMutation.data;

  const onSubmit = (data: CheckoutFormValues) => {
    if (!cart) return;
    const deliveryValue = toDelivery(data.delivery);
    if (!deliveryValue) return;
    quoteMutation.mutate({ cartVersion: cart.version, delivery: deliveryValue });
  };

  const deliveryError = errors.delivery;
  const methodError = deliveryError?.method;
  const pickupPointError = delivery.method === 'pickup' ? deliveryError?.pickupPointId : undefined;
  const addressErrors = delivery.method === 'courier' ? deliveryError?.address : undefined;

  return (
    <div className="checkout">
      <h1 className="checkout__title">Оформление заказа</h1>
      <QueryGuard isLoading={isLoading} error={error}>
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
          <CustomerForm register={register} errors={errors} />
          <DeliveryForm
            deliveryMethods={deliveryMethods}
            register={register}
            methodError={methodError}
            pickupPointError={pickupPointError}
            addressErrors={addressErrors}
          />
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
