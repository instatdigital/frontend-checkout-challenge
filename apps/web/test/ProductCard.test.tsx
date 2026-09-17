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

const defaultHandlers = {
  onAddToCart: vi.fn(),
  onIncrement: vi.fn(),
  onDecrement: vi.fn(),
};

describe('ProductCard', () => {
  it('renders title, description and price', () => {
    render(<ProductCard product={product} {...defaultHandlers} />);
    expect(screen.getByText('Товар А')).toBeInTheDocument();
    expect(screen.getByText('Описание товара А')).toBeInTheDocument();
    expect(screen.getByText('2 490 ₽')).toBeInTheDocument();
  });

  it('calls onAddToCart on button click', () => {
    const onAddToCart = vi.fn();
    render(<ProductCard product={product} {...defaultHandlers} onAddToCart={onAddToCart} />);
    fireEvent.click(screen.getByRole('button', { name: /в корзину/i }));
    expect(onAddToCart).toHaveBeenCalledWith(product.id);
  });

  it('disables button when stock is 0', () => {
    const outOfStock: Product = { ...product, stock: 0 };
    render(<ProductCard product={outOfStock} {...defaultHandlers} />);
    expect(screen.getByRole('button', { name: /в корзину/i })).toBeDisabled();
  });

  it('shows quantity counter when product is already in cart', () => {
    render(<ProductCard product={product} quantity={3} {...defaultHandlers} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /в корзину/i })).not.toBeInTheDocument();
  });

  it('calls onIncrement when + is clicked', () => {
    const onIncrement = vi.fn();
    render(
      <ProductCard product={product} quantity={2} {...defaultHandlers} onIncrement={onIncrement} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /увеличить/i }));
    expect(onIncrement).toHaveBeenCalledWith(product.id);
  });

  it('calls onDecrement when − is clicked', () => {
    const onDecrement = vi.fn();
    render(
      <ProductCard product={product} quantity={2} {...defaultHandlers} onDecrement={onDecrement} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /уменьшить/i }));
    expect(onDecrement).toHaveBeenCalledWith(product.id);
  });

  it('disables + when quantity reaches stock', () => {
    render(<ProductCard product={product} quantity={5} {...defaultHandlers} />);
    expect(screen.getByRole('button', { name: /увеличить/i })).toBeDisabled();
  });
});
