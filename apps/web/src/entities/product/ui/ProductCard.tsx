import clsx from 'clsx';
import type { Product } from '@checkout/contracts';
import { formatPrice } from '@/shared/lib/format';
import styles from './ProductCard.module.css';

type ProductCardProps = {
  product: Product;
  onAddToCart: (productId: string) => void;
};

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const outOfStock = product.stock === 0;
  return (
    <article className={styles.root}>
      <h2 className={styles.title}>{product.title}</h2>
      <p className={styles.description}>{product.description}</p>
      <p className={styles.price}>{formatPrice(product.price)}</p>
      <button
        className={clsx(styles.button, { [styles.button_disabled]: outOfStock })}
        disabled={outOfStock}
        onClick={() => onAddToCart(product.id)}
      >
        В корзину
      </button>
    </article>
  );
}
