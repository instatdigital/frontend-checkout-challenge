import { useApiQuery } from '@/shared/api/hooks';
import { useAuthQuery } from '@/entities/session';
import { useAddToCart } from '@/features/add-to-cart';
import { useUpdateCartItem } from '@/features/update-cart-item';
import { useRemoveCartItem } from '@/features/remove-cart-item';
import { listProducts, productKeys } from '@/entities/product';
import { ProductCard } from '@/entities/product';
import { getCart, cartKeys } from '@/entities/cart';
import { QueryGuard } from '@/shared/ui/QueryGuard/QueryGuard';
import styles from './CatalogPage.module.css';

export function CatalogPage() {
  const {
    data: products,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useApiQuery(productKeys.list(), () => listProducts());
  const {
    data: cart,
    isLoading: isLoadingCart,
    error: cartError,
    refetch: refetchCart,
  } = useAuthQuery(cartKeys.detail(), (token, signal) => getCart(token, signal));

  const addToCart = useAddToCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const isMutating = addToCart.isPending || updateItem.isPending || removeItem.isPending;
  const quantities = new Map(cart?.items.map((item) => [item.productId, item.quantity]) ?? []);

  const handleAddToCart = (productId: string) => {
    addToCart.mutate({ productId, body: { quantity: 1 } });
  };

  const handleIncrement = (productId: string) => {
    const current = quantities.get(productId) ?? 0;
    updateItem.mutate({ productId, body: { quantity: current + 1 } });
  };

  const handleDecrement = (productId: string) => {
    const current = quantities.get(productId) ?? 0;
    if (current <= 1) {
      removeItem.mutate({ productId });
    } else {
      updateItem.mutate({ productId, body: { quantity: current - 1 } });
    }
  };

  const isLoading = isLoadingProducts || isLoadingCart;
  const error = productsError ?? cartError;

  const refetch = () => {
    void refetchProducts();
    void refetchCart();
  };

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Каталог</h1>
      <QueryGuard
        isLoading={isLoading}
        error={error}
        onRetry={() => {
          refetch();
        }}
      >
        {products?.length ? (
          <div className={styles.grid}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={quantities.get(product.id) ?? 0}
                disabled={isMutating}
                onAddToCart={handleAddToCart}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
              />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Товары не найдены</p>
        )}
      </QueryGuard>
    </div>
  );
}
