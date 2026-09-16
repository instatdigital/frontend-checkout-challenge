import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { useForm } from 'react-hook-form';
import type { CheckoutFormValues } from '@/entities/checkout';
import { CustomerForm } from '@/entities/checkout/ui/CustomerForm';

afterEach(cleanup);

const defaultFormValues: CheckoutFormValues = {
  customer: { name: '', email: '', phone: '' },
  delivery: { method: 'pickup', pickupPointId: 'point-center' },
};

function renderWithForm(
  customer: CheckoutFormValues['customer'] = { name: '', email: '', phone: '' },
) {
  function Wrapper() {
    const { control } = useForm<CheckoutFormValues>({
      defaultValues: { ...defaultFormValues, customer },
      mode: 'onBlur',
    });
    return <CustomerForm control={control} />;
  }
  return render(<Wrapper />);
}

describe('CustomerForm', () => {
  it('renders fields with initial values', () => {
    renderWithForm({ name: 'Иван', email: 'ivan@test.com', phone: '+79990000000' });
    expect(screen.getByLabelText('Имя')).toHaveValue('Иван');
    expect(screen.getByLabelText('Email')).toHaveValue('ivan@test.com');
    expect(screen.getByLabelText('Телефон')).toHaveValue('+79990000000');
  });

  it('does not show error before blur', () => {
    renderWithForm();
    expect(screen.queryByText('Имя обязательно')).not.toBeInTheDocument();
  });

  it.each([
    { field: 'Имя' as const, error: 'Имя обязательно' },
    { field: 'Email' as const, error: 'Email обязателен' },
    { field: 'Телефон' as const, error: 'Телефон обязателен' },
  ])('shows required error for $field on blur', async ({ field, error }) => {
    renderWithForm();
    fireEvent.blur(screen.getByLabelText(field));
    await waitFor(() => {
      expect(screen.getByText(error)).toBeInTheDocument();
    });
  });

  it.each([
    { field: 'Имя' as const, value: 'A', error: 'Минимум 2 символа' },
    { field: 'Имя' as const, value: '   ', error: 'Не может быть из пробелов' },
    { field: 'Email' as const, value: 'not-email', error: 'Некорректный email' },
    { field: 'Телефон' as const, value: '89990000000', error: 'Формат: +79990000000' },
    { field: 'Телефон' as const, value: '+1', error: 'Формат: +79990000000' },
  ])('shows "$error" for $field="$value"', async ({ field, value, error }) => {
    renderWithForm();
    const input = screen.getByLabelText(field);
    fireEvent.change(input, { target: { value } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(screen.getByText(error)).toBeInTheDocument();
    });
  });

  it('accepts valid email', async () => {
    renderWithForm();
    const input = screen.getByLabelText('Email');
    fireEvent.change(input, { target: { value: 'suhushinas@gmail.com' } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(screen.queryByText('Некорректный email')).not.toBeInTheDocument();
    });
  });
});
