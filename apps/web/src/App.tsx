import { BrowserRouter, Routes, Route } from 'react-router';
import { Layout } from '@/components/Layout/Layout';
import { CatalogPage } from '@/pages/CatalogPage/CatalogPage';
import { CartPage } from '@/pages/CartPage/CartPage';

export default function App() {
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
