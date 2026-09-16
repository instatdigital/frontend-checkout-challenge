import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import type { Delivery } from '@checkout/contracts';
import { useAuthQuery, useAuthMutation } from '@/entities/session';
import {
  CustomerForm,
  DeliveryForm,
  checkoutKeys,
  getCheckoutOptions,
  createQuote,
} from '@/entities/checkout';
import type { CheckoutFormValues } from '@/entities/checkout';
import { QueryGuard } from '@/shared/ui/QueryGuard/QueryGuard';
import { formatPrice } from '@/shared/lib/format';
import styles from './CheckoutPage.module.css';

export function CheckoutPage() {
  const navigate = useNavigate();

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
      },
    },
    mode: 'onBlur',
  });

  const quote = quoteMutation.data;

  const onSubmit = (data: CheckoutFormValues) => {
    if (!cart) return;
    quoteMutation
      .mutateAsync({ cartVersion: cart.version, delivery: data.delivery })
      .then((quote) => {
        return navigate('/checkout/payment', {
          state: { quoteId: quote.id, customer: data.customer },
        });
      })
      .catch(() => {});
  };

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Оформление заказа</h1>
      <QueryGuard isLoading={isLoading} error={error}>
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate className={styles.form}>
          <CustomerForm control={control} />
          <DeliveryForm deliveryMethods={deliveryMethods} control={control} />
          {quote && (
            <div className={styles.summary}>
              <p className={styles.line}>Подытог: {formatPrice(quote.subtotal)}</p>
              <p className={styles.line}>Доставка: {formatPrice(quote.shipping)}</p>
              <p className={styles.total}>Итого: {formatPrice(quote.total)}</p>
            </div>
          )}
          <button className={styles.submit} type="submit">
            Рассчитать стоимость
          </button>
        </form>
      </QueryGuard>
    </div>
  );
}
