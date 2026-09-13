import type { CartItem as CartItemType } from '@checkout/contracts';
import { formatPrice } from '@/shared/lib/format';
import './CartItem.module.css';

type CartItemProps = {
  item: CartItemType;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
};

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  return (
    <div className="cart-item">
      <h3 className="cart-item__title">{item.title}</h3>
      <p className="cart-item__price">{formatPrice(item.unitPrice)} / шт.</p>
      <div className="cart-item__controls">
        <button
          className="cart-item__button"
          aria-label="Уменьшить"
          disabled={item.quantity <= 1}
          onClick={() => onQuantityChange(item.productId, item.quantity - 1)}
        >
          −
        </button>
        <span className="cart-item__quantity">{item.quantity}</span>
        <button
          className="cart-item__button"
          aria-label="Увеличить"
          onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
        >
          +
        </button>
      </div>
      <p className="cart-item__line-total">{formatPrice(item.lineTotal)}</p>
      <button
        className="cart-item__button cart-item__button--remove"
        aria-label="Удалить"
        onClick={() => onRemove(item.productId)}
      >
        ✕
      </button>
    </div>
  );
}
