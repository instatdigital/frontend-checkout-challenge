import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { useForm } from 'react-hook-form';
import type { FieldError } from 'react-hook-form';
import type { Delivery, CheckoutOptions } from '@checkout/contracts';
import { DeliveryForm } from '@/entities/checkout';

afterEach(cleanup);

type FormValues = { delivery: Delivery };

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

const pickupDefaults: FormValues = {
  delivery: { method: 'pickup', pickupPointId: 'point-center' },
};
const courierDefaults: FormValues = {
  delivery: { method: 'courier', address: { city: '', street: '', house: '' } },
};

function TestWrapper({
  defaults,
  addressErrors,
}: {
  defaults: FormValues;
  addressErrors?: {
    city?: FieldError;
    street?: FieldError;
    house?: FieldError;
    apartment?: FieldError;
  };
}) {
  const { register } = useForm<FormValues>({ defaultValues: defaults, mode: 'onBlur' });

  return (
    <DeliveryForm
      deliveryMethods={deliveryMethods}
      register={register}
      addressErrors={addressErrors}
    />
  );
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

  it('shows address error messages', async () => {
    render(
      <TestWrapper
        defaults={courierDefaults}
        addressErrors={{ city: { type: 'required', message: 'Город обязателен' } }}
      />,
    );
    fireEvent.click(screen.getByLabelText('Курьер'));
    await waitFor(() => {
      expect(screen.getByText('Город обязателен')).toBeInTheDocument();
    });
  });
});
