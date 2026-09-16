import { useApiQuery } from '@/shared/api/hooks';
import { useAddToCart } from '@/features/add-to-cart';
import { listProducts, productKeys } from '@/entities/product';
import { ProductCard } from '@/entities/product';
import { QueryGuard } from '@/shared/ui/QueryGuard/QueryGuard';
import styles from './CatalogPage.module.css';

export function CatalogPage() {
  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useApiQuery(productKeys.list(), () => listProducts());
  const addToCart = useAddToCart();

  const handleAddToCart = (productId: string) => {
    addToCart.mutate({ productId, body: { quantity: 1 } });
  };

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Каталог</h1>
      <QueryGuard
        isLoading={isLoading}
        error={error}
        onRetry={() => {
          void refetch();
        }}
      >
        {products?.length ? (
          <div className={styles.grid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Товары не найдены</p>
        )}
      </QueryGuard>
    </div>
  );
}
