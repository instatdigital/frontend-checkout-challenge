import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { CartItem } from '@/entities/cart';
import type { CartItem as CartItemType } from '@checkout/contracts';

afterEach(cleanup);

const item: CartItemType = {
  productId: 'lamp-orbit',
  title: 'Лампа Orbit',
  unitPrice: 249000,
  quantity: 2,
  lineTotal: 498000,
};

describe('CartItem', () => {
  it('renders title, quantity and line total', () => {
    render(<CartItem item={item} onQuantityChange={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('Лампа Orbit')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('4 980 ₽')).toBeInTheDocument();
  });

  it('calls onQuantityChange with new quantity', () => {
    const onQuantityChange = vi.fn();
    render(<CartItem item={item} onQuantityChange={onQuantityChange} onRemove={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('Увеличить'));
    expect(onQuantityChange).toHaveBeenCalledWith(item.productId, 3);
  });

  it('calls onRemove', () => {
    const onRemove = vi.fn();
    render(<CartItem item={item} onQuantityChange={vi.fn()} onRemove={onRemove} />);
    fireEvent.click(screen.getByLabelText('Удалить'));
    expect(onRemove).toHaveBeenCalledWith(item.productId);
  });

  it('disables decrease button at quantity 1', () => {
    const minItem: CartItemType = { ...item, quantity: 1, lineTotal: 249000 };
    render(<CartItem item={minItem} onQuantityChange={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByLabelText('Уменьшить')).toBeDisabled();
  });
});
