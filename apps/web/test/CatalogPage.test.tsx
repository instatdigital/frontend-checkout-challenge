import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { CatalogPage } from '@/pages/catalog';
import { listProducts } from '@/entities/product';
import { getCart } from '@/entities/cart';
import { createTestWrapper } from './helpers/create-wrapper';
import { defaultSession } from './helpers/mock-session';

vi.mock('@/entities/product', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/product')>();
  return {
    ...actual,
    listProducts: vi.fn(),
  };
});

vi.mock('@/entities/cart', () => ({
  getCart: vi.fn(),
  setCartItem: vi.fn(),
  removeCartItem: vi.fn(),
  cartKeys: { detail: () => ['cart'] },
}));

vi.mock('@/entities/session/model/session-context', () => ({
  useSession: () => defaultSession,
}));

const emptyCart = {
  id: 'cart-1',
  version: 0,
  items: [],
  quantity: 0,
  subtotal: 0,
  currency: 'RUB' as const,
};

beforeEach(() => {
  vi.mocked(getCart).mockResolvedValue(emptyCart);
});

afterEach(cleanup);

const wrapper = createTestWrapper();

const products = [
  {
    id: 'p-1',
    sku: 'SKU-001',
    title: 'Лампа',
    description: 'Свет',
    price: 249000,
    currency: 'RUB' as const,
    stock: 5,
  },
  {
    id: 'p-2',
    sku: 'SKU-002',
    title: 'Стол',
    description: 'Дерево',
    price: 500000,
    currency: 'RUB' as const,
    stock: 0,
  },
];

describe('CatalogPage', () => {
  it('renders product cards from API', async () => {
    vi.mocked(listProducts).mockResolvedValue(products);

    render(<CatalogPage />, { wrapper });

    expect(await screen.findByText('Лампа')).toBeInTheDocument();
    expect(screen.getByText('Стол')).toBeInTheDocument();
  });

  it('shows loading state', async () => {
    vi.mocked(listProducts).mockReturnValue(new Promise(() => {}));

    render(<CatalogPage />, { wrapper });

    expect(screen.getByText('Загрузка…')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    vi.mocked(listProducts).mockRejectedValue(new Error('Network error'));

    render(<CatalogPage />, { wrapper });

    expect(await screen.findByText(/ошибка/i)).toBeInTheDocument();
  });

  it('shows quantity counter for products already in cart', async () => {
    vi.mocked(getCart).mockResolvedValue({
      ...emptyCart,
      items: [
        {
          productId: 'p-1',
          title: 'Лампа',
          unitPrice: 249000,
          quantity: 3,
          lineTotal: 747000,
        },
      ],
    });
    vi.mocked(listProducts).mockResolvedValue(products);

    render(<CatalogPage />, { wrapper });

    expect(await screen.findByText('3')).toBeInTheDocument();
  });
});
