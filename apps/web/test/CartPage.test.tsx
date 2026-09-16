import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { CartPage } from '@/pages/cart';
import { getCart } from '@/entities/cart';
import type { Cart } from '@checkout/contracts';
import { createTestWrapper } from './helpers/create-wrapper';
import { defaultSession } from './helpers/mock-session';

vi.mock('@/entities/cart', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/cart')>();
  return {
    ...actual,
    getCart: vi.fn(),
    setCartItem: vi.fn(),
    removeCartItem: vi.fn(),
  };
});

vi.mock('@/entities/session/model/session-context', () => ({
  useSession: () => defaultSession,
}));

afterEach(cleanup);

const wrapper = createTestWrapper({ withRouter: true });

const cart: Cart = {
  id: 'cart-1',
  version: 1,
  items: [
    { productId: 'lamp-orbit', title: 'Лампа', unitPrice: 249000, quantity: 2, lineTotal: 498000 },
  ],
  quantity: 2,
  subtotal: 498000,
  currency: 'RUB' as const,
};

describe('CartPage', () => {
  it('renders cart items and subtotal', async () => {
    vi.mocked(getCart).mockResolvedValue(cart);

    render(<CartPage />, { wrapper });

    expect(await screen.findByText('Лампа')).toBeInTheDocument();
    expect(screen.getByText('4 980 ₽')).toBeInTheDocument();
  });

  it('shows empty cart message', async () => {
    vi.mocked(getCart).mockResolvedValue({ ...cart, items: [], quantity: 0, subtotal: 0 });

    render(<CartPage />, { wrapper });

    expect(await screen.findByText(/корзина пуста/i)).toBeInTheDocument();
  });

  it('shows loading state', async () => {
    vi.mocked(getCart).mockReturnValue(new Promise(() => {}));

    render(<CartPage />, { wrapper });

    expect(screen.getByText('Загрузка…')).toBeInTheDocument();
  });
});
