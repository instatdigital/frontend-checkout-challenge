import { BrowserRouter, Routes, Route } from 'react-router';
import { Layout } from './layout';
import { CatalogPage } from '@/pages/catalog';
import { CartPage } from '@/pages/cart';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
