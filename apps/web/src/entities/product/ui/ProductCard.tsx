import type { Product } from '@checkout/contracts';
import { formatPrice } from '@/shared/lib/format';
import './ProductCard.module.css';

type ProductCardProps = {
  product: Product;
  onAddToCart: (productId: string) => void;
};

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const outOfStock = product.stock === 0;
  return (
    <article className="card">
      <h2 className="card__title">{product.title}</h2>
      <p className="card__description">{product.description}</p>
      <p className="card__price">{formatPrice(product.price)}</p>
      <button
        className={`card__button${outOfStock ? ' card__button--disabled' : ''}`}
        disabled={outOfStock}
        onClick={() => onAddToCart(product.id)}
      >
        В корзину
      </button>
    </article>
  );
}
