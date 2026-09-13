import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ProductCard } from '@/entities/product';
import type { Product } from '@checkout/contracts';

afterEach(cleanup);

const product: Product = {
  id: 'p-1',
  sku: 'SKU-001',
  title: 'Товар А',
  description: 'Описание товара А',
  price: 249000,
  currency: 'RUB',
  stock: 5,
};

describe('ProductCard', () => {
  it('renders title, description and price', () => {
    render(<ProductCard product={product} onAddToCart={vi.fn()} />);
    expect(screen.getByText('Товар А')).toBeInTheDocument();
    expect(screen.getByText('Описание товара А')).toBeInTheDocument();
    expect(screen.getByText('2 490 ₽')).toBeInTheDocument();
  });

  it('calls onAddToCart on button click', () => {
    const onAddToCart = vi.fn();
    render(<ProductCard product={product} onAddToCart={onAddToCart} />);
    fireEvent.click(screen.getByRole('button', { name: /в корзину/i }));
    expect(onAddToCart).toHaveBeenCalledWith(product.id);
  });

  it('disables button when stock is 0', () => {
    const outOfStock: Product = { ...product, stock: 0 };
    render(<ProductCard product={outOfStock} onAddToCart={vi.fn()} />);
    expect(screen.getByRole('button', { name: /в корзину/i })).toBeDisabled();
  });
});
