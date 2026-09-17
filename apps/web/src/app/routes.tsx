import { BrowserRouter, Routes, Route } from 'react-router';
import { Layout } from './layout';
import { CatalogPage } from '@/pages/catalog';
import { CartPage } from '@/pages/cart';
import { CheckoutPage } from '@/pages/checkout';
import { PaymentPage } from '@/pages/payment';
import { OrderPage } from '@/pages/order';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/payment" element={<PaymentPage />} />
          <Route path="/orders/:orderId" element={<OrderPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
