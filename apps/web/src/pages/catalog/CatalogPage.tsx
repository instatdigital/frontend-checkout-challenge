import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery } from '@/shared/api/hooks';
import { useAuthMutation } from '@/entities/session';
import { listProducts, productKeys } from '@/entities/product';
import { setCartItem, cartKeys } from '@/entities/cart';
import type { ApiRequestBody } from '@/shared/api/api-types';
import { ProductCard } from '@/entities/product';
import { QueryGuard } from '@/shared/ui/QueryGuard/QueryGuard';
import './CatalogPage.module.css';

export function CatalogPage() {
  const queryClient = useQueryClient();
  const {
    data: products,
    isLoading,
    error,
  } = useApiQuery(productKeys.list(), () => listProducts());
  const addToCart = useAuthMutation(
    ({ productId, body }: { productId: string; body: ApiRequestBody<'setCartItem'> }, token) =>
      setCartItem(productId, body, token),
    { onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.detail() }) },
  );

  const handleAddToCart = (productId: string) => {
    addToCart.mutate({ productId, body: { quantity: 1 } });
  };

  return (
    <div className="catalog">
      <h1 className="catalog__title">Каталог</h1>
      <QueryGuard isLoading={isLoading} error={error}>
        {products?.length ? (
          <div className="catalog__grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        ) : (
          <p>Товары не найдены</p>
        )}
      </QueryGuard>
    </div>
  );
}
