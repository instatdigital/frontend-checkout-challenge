import { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { Customer } from '@checkout/contracts';
import { useAuthQuery } from '@/entities/session';
import { getSandbox, sandboxKeys } from '@/entities/sandbox';
import { useCreateOrder } from '@/features/create-order';
import { useCreatePayment, useSimulatePayment, usePaymentStatus } from '@/features/pay-by-card';
import { QueryGuard } from '@/shared/ui/QueryGuard/QueryGuard';
import { ApiError } from '@/shared/api/errors';
import { generateKey } from '@/shared/lib/idempotency';
import { clearPaymentId, loadPaymentId, savePaymentId } from '@/shared/lib/payment-recovery';
import styles from './PaymentPage.module.css';

interface PaymentLocationState {
  quoteId: string;
  customer: Customer;
}

const TERMINAL_STATUSES = new Set(['succeeded', 'failed', 'cancelled']);

export function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { quoteId, customer } = (location.state as PaymentLocationState | undefined) ?? {};

  const [method, setMethod] = useState<'card' | 'cash_on_delivery'>('card');
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string | undefined>(
    () => loadPaymentId() ?? undefined,
  );

  const orderKey = useMemo(() => generateKey(), []);

  const {
    data: sandbox,
    isLoading,
    error,
    refetch,
  } = useAuthQuery(sandboxKeys.cards(), getSandbox);
  const createOrderMutation = useCreateOrder();
  const createPaymentMutation = useCreatePayment();
  const simulatePaymentMutation = useSimulatePayment();
  const { data: paymentStatus } = usePaymentStatus(paymentId, !!paymentId);

  const cards = sandbox?.cards ?? [];
  const selectedCard = cards.find((card) => card.id === selectedCardId);

  const quoteExpired =
    createOrderMutation.error instanceof ApiError &&
    createOrderMutation.error.status === 409 &&
    (createOrderMutation.error.code === 'QUOTE_EXPIRED' ||
      createOrderMutation.error.code === 'CART_VERSION_CONFLICT');

  const paymentError = useMemo(() => {
    if (
      paymentStatus &&
      paymentStatus.status !== 'succeeded' &&
      TERMINAL_STATUSES.has(paymentStatus.status)
    ) {
      return 'Оплата не прошла. Попробуйте другую карту.';
    }
    return null;
  }, [paymentStatus]);

  useEffect(() => {
    if (!paymentStatus) return;

    if (paymentStatus.status === 'succeeded') {
      clearPaymentId();
      void navigate(`/orders/${paymentStatus.orderId}`);
    } else if (TERMINAL_STATUSES.has(paymentStatus.status)) {
      clearPaymentId();
    }
  }, [paymentStatus, navigate]);

  const handleSubmit = useCallback(async () => {
    if (!quoteId || !customer) return;
    if (method === 'card' && !selectedCard) return;

    const order = await createOrderMutation.mutateAsync({
      body: { quoteId, customer, paymentMethod: method },
      idempotencyKey: orderKey,
    });

    if (method === 'cash_on_delivery') {
      void navigate(`/orders/${order.id}`);
      return;
    }

    if (!selectedCard) return;

    const payment = await createPaymentMutation.mutateAsync({
      orderId: order.id,
      idempotencyKey: generateKey(),
    });

    await simulatePaymentMutation.mutateAsync({
      paymentId: payment.id,
      body: { scenario: selectedCard.scenario },
    });

    savePaymentId(payment.id);
    setPaymentId(payment.id);
  }, [
    quoteId,
    customer,
    method,
    selectedCard,
    orderKey,
    createOrderMutation,
    createPaymentMutation,
    simulatePaymentMutation,
    navigate,
  ]);

  if (!quoteId || !customer) {
    return (
      <div className={styles.root}>
        <p className={styles.error}>Данные оформления недоступны. Вернитесь к чекауту.</p>
      </div>
    );
  }

  const isPending =
    createOrderMutation.isPending ||
    createPaymentMutation.isPending ||
    simulatePaymentMutation.isPending ||
    (!!paymentId && !TERMINAL_STATUSES.has(paymentStatus?.status ?? ''));

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Оплата</h1>
      <QueryGuard
        isLoading={isLoading}
        error={error}
        onRetry={() => {
          void refetch();
        }}
      >
        <div className={styles.form}>
          <div className={styles.methods}>
            <label className={styles.method}>
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={method === 'card'}
                onChange={() => setMethod('card')}
              />
              <span>Карта</span>
            </label>
            <label className={styles.method}>
              <input
                type="radio"
                name="paymentMethod"
                value="cash_on_delivery"
                checked={method === 'cash_on_delivery'}
                onChange={() => setMethod('cash_on_delivery')}
              />
              <span>Наличные при получении</span>
            </label>
          </div>

          {method === 'card' && (
            <div className={styles.cards}>
              <p className={styles.cardsTitle}>Выберите тестовую карту</p>
              {cards.map((card) => (
                <label key={card.id} className={styles.card}>
                  <input
                    type="radio"
                    name="card"
                    value={card.id}
                    checked={selectedCardId === card.id}
                    onChange={() => setSelectedCardId(card.id)}
                  />
                  <span>{card.title}</span>
                  <span className={styles.cardMask}>{card.maskedNumber}</span>
                </label>
              ))}
            </div>
          )}

          {quoteExpired && (
            <div className={styles.error}>
              <p>Расчёт устарел. Вернитесь к чекауту и пересчитайте стоимость.</p>
              <button
                type="button"
                className={styles.submit}
                onClick={() => {
                  void navigate('/checkout');
                }}
              >
                Вернуться к чекауту
              </button>
            </div>
          )}

          {paymentError && <p className={styles.error}>{paymentError}</p>}

          <button
            className={styles.submit}
            type="button"
            disabled={isPending || (method === 'card' && !selectedCardId) || cards.length === 0}
            onClick={() => {
              handleSubmit().catch(() => {});
            }}
          >
            {method === 'card' ? 'Оплатить картой' : 'Оформить заказ'}
          </button>
        </div>
      </QueryGuard>
    </div>
  );
}
