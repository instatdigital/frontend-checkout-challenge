import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery } from '@/api/hooks';
import { useAuthMutation } from '@/api/auth-hooks';
import { queryKeys } from '@/api/query-keys';
import { listProducts } from '@/api/endpoints/catalog';
import { setCartItem } from '@/api/endpoints/cart';
import type { ApiRequestBody } from '@/api/api-types';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import { QueryGuard } from '@/components/QueryGuard/QueryGuard';
import './CatalogPage.module.css';

export function CatalogPage() {
  const queryClient = useQueryClient();
  const {
    data: products,
    isLoading,
    error,
  } = useApiQuery(queryKeys.products(), () => listProducts());
  const addToCart = useAuthMutation(
    ({ productId, body }: { productId: string; body: ApiRequestBody<'setCartItem'> }, token) =>
      setCartItem(productId, body, token),
    { onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart() }) },
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
