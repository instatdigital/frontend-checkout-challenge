import { useParams } from 'react-router';
import { useAuthQuery } from '@/entities/session';
import { getOrder, orderKeys } from '@/entities/order';
import { QueryGuard } from '@/shared/ui/QueryGuard/QueryGuard';
import { formatPrice } from '@/shared/lib/format';
import styles from './OrderPage.module.css';
import type { ApiResponseData } from '@/shared/api/api-types';

type Order = ApiResponseData<'getOrder', 200>;

function getStatusMessage(order: Order) {
  if (order.paymentMethod === 'cash_on_delivery') {
    return 'Заказ оформлен, оплата при получении';
  }
  if (order.paymentStatus === 'succeeded') {
    return 'Заказ оплачен';
  }
  return `Статус: ${order.paymentStatus}`;
}

export function OrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const id = orderId ?? '';

  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useAuthQuery(orderKeys.detail(id), (token) => getOrder(id, token), { enabled: !!id });

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Заказ {order?.number ?? ''}</h1>
      <QueryGuard
        isLoading={isLoading}
        error={error}
        onRetry={() => {
          void refetch();
        }}
      >
        {order && (
          <div className={styles.content}>
            <p className={styles.status}>{getStatusMessage(order)}</p>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Товары</h2>
              <ul className={styles.items}>
                {order.items.map((item) => (
                  <li key={item.productId} className={styles.item}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemQuantity}>{item.quantity} шт.</span>
                    <span className={styles.itemPrice}>{formatPrice(item.unitPrice)}</span>
                    <span className={styles.itemTotal}>{formatPrice(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Доставка</h2>
              <p className={styles.delivery}>
                {order.delivery.method === 'pickup'
                  ? `Самовывоз: ${order.delivery.pickupPointId}`
                  : `Курьер: ${order.delivery.address.city}, ${order.delivery.address.street}, ${order.delivery.address.house}`}
              </p>
            </section>

            <div className={styles.summary}>
              <p className={styles.line}>Подытог: {formatPrice(order.subtotal)}</p>
              <p className={styles.line}>Доставка: {formatPrice(order.shipping)}</p>
              <p className={styles.total}>Итого: {formatPrice(order.total)}</p>
            </div>
          </div>
        )}
      </QueryGuard>
    </div>
  );
}
