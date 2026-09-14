import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { DeliveryForm } from '@/entities/checkout';
import type { CheckoutOptions } from '@checkout/contracts';

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

const stubRegister = ((name: string) => ({
  name,
  onChange: async () => {},
  onBlur: async () => {},
  ref: () => {},
})) as any;

describe('DeliveryForm', () => {
  it('renders delivery methods as radio buttons', () => {
    render(<DeliveryForm deliveryMethods={deliveryMethods} register={stubRegister} />);
    expect(screen.getByLabelText('Самовывоз')).toBeInTheDocument();
    expect(screen.getByLabelText('Курьер')).toBeInTheDocument();
  });

  it('shows pickup points when pickup is selected', () => {
    render(<DeliveryForm deliveryMethods={deliveryMethods} register={stubRegister} />);
    expect(screen.getByText('Пункт Центр')).toBeInTheDocument();
    expect(screen.getByText('Пункт Север')).toBeInTheDocument();
  });

  it('shows address fields when courier is selected', async () => {
    render(<DeliveryForm deliveryMethods={deliveryMethods} register={stubRegister} />);
    fireEvent.click(screen.getByLabelText('Курьер'));
    await waitFor(() => {
      expect(screen.getByLabelText('Город')).toBeInTheDocument();
      expect(screen.getByLabelText('Улица')).toBeInTheDocument();
      expect(screen.getByLabelText('Дом')).toBeInTheDocument();
      expect(screen.getByLabelText('Квартира')).toBeInTheDocument();
    });
  });

  it('shows address error messages', async () => {
    render(
      <DeliveryForm
        deliveryMethods={deliveryMethods}
        register={stubRegister}
        addressErrors={{ city: { type: 'required', message: 'Город обязателен' } }}
      />,
    );
    fireEvent.click(screen.getByLabelText('Курьер'));
    await waitFor(() => {
      expect(screen.getByText('Город обязателен')).toBeInTheDocument();
    });
  });
});
