import type { CartItem as CartItemType } from '@checkout/contracts';
import { formatPrice } from '@/shared/lib/format';
import clsx from 'clsx';
import styles from './CartItem.module.css';

type CartItemProps = {
  item: CartItemType;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
};

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  return (
    <div className={styles.root}>
      <h3 className={styles.title}>{item.title}</h3>
      <p className={styles.price}>{formatPrice(item.unitPrice)} / шт.</p>
      <div className={styles.controls}>
        <button
          className={styles.button}
          aria-label="Уменьшить"
          disabled={item.quantity <= 1}
          onClick={() => onQuantityChange(item.productId, item.quantity - 1)}
        >
          −
        </button>
        <span className={styles.quantity}>{item.quantity}</span>
        <button
          className={styles.button}
          aria-label="Увеличить"
          onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
        >
          +
        </button>
      </div>
      <p className={styles.lineTotal}>{formatPrice(item.lineTotal)}</p>
      <button
        className={clsx(styles.button, styles.button_remove)}
        aria-label="Удалить"
        onClick={() => onRemove(item.productId)}
      >
        ✕
      </button>
    </div>
  );
}
