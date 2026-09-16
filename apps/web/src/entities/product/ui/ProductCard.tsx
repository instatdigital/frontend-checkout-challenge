import clsx from 'clsx';
import type { Product } from '@checkout/contracts';
import { formatPrice } from '@/shared/lib/format';
import styles from './ProductCard.module.css';

type ProductCardProps = {
  product: Product;
  quantity?: number;
  disabled?: boolean;
  onAddToCart: (productId: string) => void;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
};

export function ProductCard({
  product,
  quantity = 0,
  disabled,
  onAddToCart,
  onIncrement,
  onDecrement,
}: ProductCardProps) {
  const outOfStock = product.stock === 0;
  const inCart = quantity > 0;

  return (
    <article className={styles.root}>
      <h2 className={styles.title}>{product.title}</h2>
      <p className={styles.description}>{product.description}</p>
      <p className={styles.price}>{formatPrice(product.price)}</p>
      {inCart ? (
        <div className={styles.controls}>
          <button
            className={clsx(styles.button, styles.button_control)}
            aria-label="Уменьшить"
            disabled={disabled}
            onClick={() => onDecrement(product.id)}
          >
            −
          </button>
          <span className={styles.quantity}>{quantity}</span>
          <button
            className={clsx(styles.button, styles.button_control)}
            aria-label="Увеличить"
            disabled={disabled || quantity >= product.stock}
            onClick={() => onIncrement(product.id)}
          >
            +
          </button>
        </div>
      ) : (
        <button
          className={clsx(styles.button, { [styles.button_disabled]: outOfStock })}
          disabled={outOfStock || disabled}
          onClick={() => onAddToCart(product.id)}
        >
          В корзину
        </button>
      )}
    </article>
  );
}
