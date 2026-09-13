import { BrowserRouter, Routes, Route } from 'react-router';
import { Layout } from './layout';
import { CatalogPage } from '@/pages/catalog';
import { CartPage } from '@/pages/cart';
import { CheckoutPage } from '@/pages/checkout';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
