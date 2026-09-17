import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { useForm } from 'react-hook-form';
import type { CheckoutOptions } from '@checkout/contracts';
import { DeliveryForm } from '@/entities/checkout';
import type { CheckoutFormValues } from '@/entities/checkout';

afterEach(cleanup);

const deliveryMethods: CheckoutOptions['deliveryMethods'] = [
  {
    id: 'pickup',
    title: 'Самовывоз',
    price: 0,
    freeFrom: null,
    pickupPoints: [
      { id: 'point-center', title: 'Пункт Центр', address: 'ул. Центральная, 1' },
      { id: 'point-north', title: 'Пункт Север', address: 'ул. Северная, 5' },
    ],
  },
  {
    id: 'courier',
    title: 'Курьер',
    price: 29000,
    freeFrom: 500000,
    pickupPoints: [],
  },
];

const pickupDefaults: CheckoutFormValues = {
  customer: { name: '', email: '', phone: '' },
  delivery: { method: 'pickup', pickupPointId: 'point-center' },
};

function TestWrapper({ defaults }: { defaults: CheckoutFormValues }) {
  const { control } = useForm<CheckoutFormValues>({ defaultValues: defaults, mode: 'onBlur' });

  return <DeliveryForm deliveryMethods={deliveryMethods} control={control} />;
}

describe('DeliveryForm', () => {
  it('renders delivery methods as radio buttons', () => {
    render(<TestWrapper defaults={pickupDefaults} />);
    expect(screen.getByLabelText('Самовывоз')).toBeInTheDocument();
    expect(screen.getByLabelText('Курьер')).toBeInTheDocument();
  });

  it('shows pickup points when pickup is selected', () => {
    render(<TestWrapper defaults={pickupDefaults} />);
    expect(screen.getByText('Пункт Центр')).toBeInTheDocument();
    expect(screen.getByText('Пункт Север')).toBeInTheDocument();
  });

  it('shows address fields when courier is selected', async () => {
    render(<TestWrapper defaults={pickupDefaults} />);
    fireEvent.click(screen.getByLabelText('Курьер'));
    await waitFor(() => {
      expect(screen.getByLabelText('Город')).toBeInTheDocument();
      expect(screen.getByLabelText('Улица')).toBeInTheDocument();
      expect(screen.getByLabelText('Дом')).toBeInTheDocument();
      expect(screen.getByLabelText('Квартира')).toBeInTheDocument();
    });
  });

  it('shows address error on blur', async () => {
    render(<TestWrapper defaults={pickupDefaults} />);
    fireEvent.click(screen.getByLabelText('Курьер'));
    await waitFor(() => {
      expect(screen.getByLabelText('Город')).toBeInTheDocument();
    });
    fireEvent.blur(screen.getByLabelText('Город'));
    await waitFor(() => {
      expect(screen.getByText('Город обязателен')).toBeInTheDocument();
    });
  });
});
