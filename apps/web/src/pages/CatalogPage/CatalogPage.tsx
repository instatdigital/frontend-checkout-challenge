import { useApiQuery, useApiMutation } from '@/api/hooks';
import { listProducts } from '@/api/endpoints/catalog';
import { setCartItem } from '@/api/endpoints/cart';
import { useSession } from '@/lib/session-context';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import './CatalogPage.module.css';

type AddToCartVars = {
  productId: string;
  body: { quantity: number };
  token: string;
};

export function CatalogPage() {
  const { token } = useSession();
  const { data: products, isLoading, error } = useApiQuery(['products'], () => listProducts());
  const addToCart = useApiMutation<unknown, AddToCartVars>(({ productId, body, token }) =>
    setCartItem(productId, body, token),
  );

  if (isLoading) return <p>Загрузка…</p>;
  if (error) return <p>Ошибка: {error.message}</p>;
  if (!products?.length) return <p>Товары не найдены</p>;

  const handleAddToCart = (productId: string) => {
    if (!token) return;
    addToCart.mutate({ productId, body: { quantity: 1 }, token });
  };

  return (
    <div className="catalog">
      <h1 className="catalog__title">Каталог</h1>
      <div className="catalog__grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
        ))}
      </div>
    </div>
  );
}
