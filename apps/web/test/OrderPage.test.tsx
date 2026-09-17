import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrderPage } from '@/pages/order';
import { getOrder } from '@/entities/order';
import { defaultSession } from './helpers/mock-session';

vi.mock('@/entities/order', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/order')>();
  return { ...actual, getOrder: vi.fn() };
});

vi.mock('@/entities/session/model/session-context', () => ({
  useSession: () => defaultSession,
}));

afterEach(cleanup);

const order = {
  id: 'order-1',
  number: '0001',
  status: 'paid' as const,
  paymentStatus: 'succeeded' as const,
  paymentMethod: 'card' as const,
  customer: { name: 'Иван', email: 'ivan@example.test', phone: '+79990000000' },
  items: [
    {
      productId: 'lamp-orbit',
      title: 'Лампа',
      unitPrice: 249000,
      quantity: 1,
      lineTotal: 249000,
    },
  ],
  subtotal: 249000,
  shipping: 0,
  total: 249000,
  currency: 'RUB' as const,
  createdAt: new Date().toISOString(),
  delivery: { method: 'pickup', pickupPointId: 'point-center' } as const,
};

function createWrapper() {
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={['/orders/order-1']}>
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <Routes>
          <Route path="/orders/:orderId" element={children} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('OrderPage', () => {
  it('renders paid card order', async () => {
    vi.mocked(getOrder).mockResolvedValue(order);

    render(<OrderPage />, { wrapper: createWrapper() });

    expect(await screen.findByText('Заказ оплачен')).toBeInTheDocument();
    expect(screen.getByText('Лампа')).toBeInTheDocument();
    expect(screen.getByText('Итого: 2 490 ₽')).toBeInTheDocument();
  });

  it('renders cash on delivery order', async () => {
    vi.mocked(getOrder).mockResolvedValue({
      ...order,
      status: 'confirmed' as const,
      paymentStatus: 'unpaid' as const,
      paymentMethod: 'cash_on_delivery' as const,
    });

    render(<OrderPage />, { wrapper: createWrapper() });

    expect(await screen.findByText('Заказ оформлен, оплата при получении')).toBeInTheDocument();
  });
});
