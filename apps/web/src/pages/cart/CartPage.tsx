import { Link } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthQuery, useAuthMutation } from '@/entities/session';
import { getCart, setCartItem, removeCartItem, cartKeys, CartItem } from '@/entities/cart';
import type { ApiRequestBody } from '@/shared/api/api-types';
import { QueryGuard } from '@/shared/ui/QueryGuard/QueryGuard';
import { formatPrice } from '@/shared/lib/format';
import styles from './CartPage.module.css';

export function CartPage() {
  const queryClient = useQueryClient();
  const {
    data: cart,
    isLoading,
    error,
  } = useAuthQuery(cartKeys.detail(), (token, signal) => getCart(token, signal));
  const invalidateCart = {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.detail() }),
  };
  const updateItem = useAuthMutation(
    ({ productId, body }: { productId: string; body: ApiRequestBody<'setCartItem'> }, token) =>
      setCartItem(productId, body, token),
    invalidateCart,
  );
  const deleteItem = useAuthMutation(
    ({ productId }: { productId: string }, token) => removeCartItem(productId, token),
    invalidateCart,
  );

  const handleQuantityChange = (productId: string, quantity: number) => {
    updateItem.mutate({ productId, body: { quantity } });
  };

  const handleRemove = (productId: string) => {
    deleteItem.mutate({ productId });
  };

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Корзина</h1>
      <QueryGuard isLoading={isLoading} error={error}>
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
