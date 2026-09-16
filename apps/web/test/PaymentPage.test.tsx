import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaymentPage } from '@/pages/payment';
import { getSandbox } from '@/entities/sandbox';
import { createOrder } from '@/entities/order';
import { createPayment, createSimulation, getPayment } from '@/entities/payment';
import type { Customer } from '@checkout/contracts';
import { defaultSession } from './helpers/mock-session';

vi.mock('@/entities/sandbox', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/sandbox')>();
  return { ...actual, getSandbox: vi.fn() };
});

vi.mock('@/entities/order', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/order')>();
  return { ...actual, createOrder: vi.fn() };
});

vi.mock('@/entities/payment', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/payment')>();
  return {
    ...actual,
    createPayment: vi.fn(),
    createSimulation: vi.fn(),
    getPayment: vi.fn(),
  };
});

vi.mock('@/entities/session/model/session-context', () => ({
  useSession: () => defaultSession,
}));

afterEach(cleanup);

const customer: Customer = { name: 'Иван', email: 'ivan@example.test', phone: '+79990000000' };

function createWrapper() {
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter
      initialEntries={[{ pathname: '/checkout/payment', state: { quoteId: 'quote-1', customer } }]}
    >
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        {children}
      </QueryClientProvider>
    </MemoryRouter>
  );
}

const cards = [
  {
    id: 'card-success',
    title: 'Успешная карта',
    maskedNumber: '4242 4242 4242 4242',
    scenario: 'success' as const,
  },
  {
    id: 'card-decline',
    title: 'Отказ',
    maskedNumber: '0000 0000 0000 0000',
    scenario: 'decline' as const,
  },
];

const order = {
  id: 'order-1',
  number: '0001',
  status: 'awaiting_payment' as const,
  paymentStatus: 'unpaid' as const,
  paymentMethod: 'card' as const,
  customer,
  items: [],
  subtotal: 100000,
  shipping: 0,
  total: 100000,
  currency: 'RUB' as const,
  createdAt: new Date().toISOString(),
  delivery: { method: 'pickup', pickupPointId: 'point-center' } as const,
};

const payment = {
  id: 'payment-1',
  orderId: 'order-1',
  status: 'pending' as const,
  amount: 100000,
  currency: 'RUB' as const,
  createdAt: new Date().toISOString(),
  failureCode: null,
};

describe('PaymentPage', () => {
  it('renders payment methods and sandbox cards', async () => {
    vi.mocked(getSandbox).mockResolvedValue({ cards, settlementDelayMs: 1200 });

    render(<PaymentPage />, { wrapper: createWrapper() });

    expect(await screen.findByText('Карта')).toBeInTheDocument();
    expect(screen.getByText('Наличные при получении')).toBeInTheDocument();
    expect(await screen.findByText('Успешная карта')).toBeInTheDocument();
  });

  it('creates order with cash on delivery and navigates', async () => {
    vi.mocked(getSandbox).mockResolvedValue({ cards, settlementDelayMs: 1200 });
    vi.mocked(createOrder).mockResolvedValue({
      ...order,
      paymentMethod: 'cash_on_delivery' as const,
    });

    render(<PaymentPage />, { wrapper: createWrapper() });

    fireEvent.click(await screen.findByLabelText('Наличные при получении'));
    fireEvent.click(screen.getByText('Оформить заказ'));

    await waitFor(() => {
      expect(createOrder).toHaveBeenCalledWith(
        { quoteId: 'quote-1', customer, paymentMethod: 'cash_on_delivery' },
        'test-token',
        expect.any(String),
      );
    });
  });

  it('creates payment, simulates and polls success', async () => {
    vi.mocked(getSandbox).mockResolvedValue({ cards, settlementDelayMs: 1200 });
    vi.mocked(createOrder).mockResolvedValue(order);
    vi.mocked(createPayment).mockResolvedValue(payment);
    vi.mocked(createSimulation).mockResolvedValue({
      id: 'sim-1',
      paymentId: 'payment-1',
      scenario: 'success',
      status: 'succeeded',
    });
    vi.mocked(getPayment).mockResolvedValue({ ...payment, status: 'succeeded' });

    render(<PaymentPage />, { wrapper: createWrapper() });

    fireEvent.click(await screen.findByText('Успешная карта'));
    fireEvent.click(screen.getByText('Оплатить картой'));

    await waitFor(() => {
      expect(createPayment).toHaveBeenCalledWith('order-1', 'test-token', expect.any(String));
    });

    await waitFor(() => {
      expect(createSimulation).toHaveBeenCalledWith(
        'payment-1',
        { scenario: 'success' },
        'test-token',
      );
    });

    await waitFor(() => {
      expect(getPayment).toHaveBeenCalledWith('payment-1', 'test-token', expect.any(AbortSignal));
    });
  });
});
