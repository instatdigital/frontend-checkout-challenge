import { Link } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation } from '@/api/hooks';
import { getCart, setCartItem, removeCartItem } from '@/api/endpoints/cart';
import { useSession } from '@/lib/session-context';
import { CartItem } from '@/components/CartItem/CartItem';
import { formatPrice } from '@/lib/format';
import './CartPage.module.css';

type SetCartItemVars = {
  productId: string;
  body: { quantity: number };
  token: string;
};

type RemoveCartItemVars = {
  productId: string;
  token: string;
};

export function CartPage() {
  const { token } = useSession();
  const queryClient = useQueryClient();
  const {
    data: cart,
    isLoading,
    error,
  } = useApiQuery(['cart'], (signal) => getCart(token!, signal), { enabled: !!token });
  const invalidateCart = { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }) };
  const updateItem = useApiMutation<unknown, SetCartItemVars>(
    ({ productId, body, token }) => setCartItem(productId, body, token),
    invalidateCart,
  );
  const deleteItem = useApiMutation<unknown, RemoveCartItemVars>(
    ({ productId, token }) => removeCartItem(productId, token),
    invalidateCart,
  );

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (!token) return;
    updateItem.mutate({ productId, body: { quantity }, token });
  };

  const handleRemove = (productId: string) => {
    if (!token) return;
    deleteItem.mutate({ productId, token });
  };

  if (isLoading) return <p>Загрузка…</p>;
  if (error) return <p>Ошибка: {error.message}</p>;
  if (!cart?.items.length) {
    return (
      <div className="cart">
        <h1 className="cart__title">Корзина</h1>
        <p className="cart__empty">Корзина пуста</p>
        <Link to="/" className="cart__link">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="cart">
      <h1 className="cart__title">Корзина</h1>
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
    </div>
  );
}
