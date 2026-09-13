import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { CatalogPage } from '@/pages/CatalogPage/CatalogPage';

vi.mock('@/api/endpoints/catalog', () => ({
  listProducts: vi.fn(),
}));

vi.mock('@/api/endpoints/cart', () => ({
  setCartItem: vi.fn(),
}));

vi.mock('@/lib/session-context', () => ({
  useSession: () => ({ token: 'test-token', sessionId: 's-1', isLoading: false, error: null }),
}));

afterEach(cleanup);

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

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
    const { listProducts } = await import('@/api/endpoints/catalog');
    vi.mocked(listProducts).mockResolvedValue(products);

    render(<CatalogPage />, { wrapper });

    expect(await screen.findByText('Лампа')).toBeInTheDocument();
    expect(screen.getByText('Стол')).toBeInTheDocument();
  });

  it('shows loading state', async () => {
    const { listProducts } = await import('@/api/endpoints/catalog');
    vi.mocked(listProducts).mockReturnValue(new Promise(() => {}));

    render(<CatalogPage />, { wrapper });

    expect(screen.getByText('Загрузка…')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    const { listProducts } = await import('@/api/endpoints/catalog');
    vi.mocked(listProducts).mockRejectedValue(new Error('Network error'));

    render(<CatalogPage />, { wrapper });

    expect(await screen.findByText(/ошибка/i)).toBeInTheDocument();
  });
});
