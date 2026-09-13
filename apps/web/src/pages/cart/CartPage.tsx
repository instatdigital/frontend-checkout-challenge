import { Link } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthQuery, useAuthMutation } from '@/entities/session';
import { getCart, setCartItem, removeCartItem, cartKeys, CartItem } from '@/entities/cart';
import type { ApiRequestBody } from '@/shared/api/api-types';
import { QueryGuard } from '@/shared/ui/QueryGuard/QueryGuard';
import { formatPrice } from '@/shared/lib/format';
import './CartPage.module.css';

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
    <div className="cart">
      <h1 className="cart__title">Корзина</h1>
      <QueryGuard isLoading={isLoading} error={error}>
        {cart?.items.length ? (
          <>
            <div className="cart__items">
              {cart.items.map((item) => (
                <CartItem
                  key={item.productId}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>
            <div className="cart__footer">
              <p className="cart__subtotal">Итого: {formatPrice(cart.subtotal)}</p>
              <Link to="/checkout" className="cart__checkout">
                Оформить заказ
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="cart__empty">Корзина пуста</p>
            <Link to="/" className="cart__link">
              Перейти в каталог
            </Link>
          </>
        )}
      </QueryGuard>
    </div>
  );
}
