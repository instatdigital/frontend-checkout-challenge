import { BrowserRouter, Routes, Route } from 'react-router';
import { Layout } from '@/components/Layout/Layout';
import { CatalogPage } from '@/pages/CatalogPage/CatalogPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<CatalogPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
