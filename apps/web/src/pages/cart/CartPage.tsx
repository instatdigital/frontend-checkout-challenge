import { Link } from 'react-router';
import { useAuthQuery } from '@/entities/session';
import { getCart, cartKeys, CartItem } from '@/entities/cart';
import { useUpdateCartItem } from '@/features/update-cart-item';
import { useRemoveCartItem } from '@/features/remove-cart-item';
import { QueryGuard } from '@/shared/ui/QueryGuard/QueryGuard';
import { formatPrice } from '@/shared/lib/format';
import styles from './CartPage.module.css';

export function CartPage() {
  const {
    data: cart,
    isLoading,
    error,
    refetch,
  } = useAuthQuery(cartKeys.detail(), (token, signal) => getCart(token, signal));
  const updateItem = useUpdateCartItem();
  const deleteItem = useRemoveCartItem();

  const handleQuantityChange = (productId: string, quantity: number) => {
    updateItem.mutate({ productId, body: { quantity } });
  };

  const handleRemove = (productId: string) => {
    deleteItem.mutate({ productId });
  };

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Корзина</h1>
      <QueryGuard
        isLoading={isLoading}
        error={error}
        onRetry={() => {
          void refetch();
        }}
      >
        {cart?.items.length ? (
          <>
            <div className={styles.items}>
              {cart.items.map((item) => (
                <CartItem
                  key={item.productId}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>
            <div className={styles.footer}>
              <p className={styles.subtotal}>Итого: {formatPrice(cart.subtotal)}</p>
              <Link to="/checkout" className={styles.checkout}>
                Оформить заказ
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className={styles.empty}>Корзина пуста</p>
            <Link to="/" className={styles.link}>
              Перейти в каталог
            </Link>
          </>
        )}
      </QueryGuard>
    </div>
  );
}
