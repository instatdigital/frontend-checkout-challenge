import { useWatch } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import type { CheckoutOptions } from '@checkout/contracts';
import type { CheckoutFormValues } from '../model/types';
import { TextField } from '@/shared/ui/TextField/TextField';
import { RadioGroupField } from '@/shared/ui/RadioGroupField/RadioGroupField';
import './DeliveryForm.module.css';

type DeliveryFormProps = {
  deliveryMethods: CheckoutOptions['deliveryMethods'];
  control: Control<CheckoutFormValues>;
};

export function DeliveryForm({ deliveryMethods, control }: DeliveryFormProps) {
  const deliveryMethod = useWatch({ control, name: 'delivery.method' });

  const pickup = deliveryMethods.find((m) => m.id === 'pickup');

  return (
    <div className="delivery-form">
      <h2 className="delivery-form__title">Доставка</h2>
      <RadioGroupField
        control={control}
        name="delivery.method"
        rules={{ required: 'Выберите способ доставки' }}
        options={deliveryMethods.map((m) => ({ value: m.id, label: m.title }))}
        className="delivery-form__methods"
      />
      {deliveryMethod === 'pickup' && pickup && pickup.pickupPoints.length > 0 && (
        <RadioGroupField
          control={control}
          name="delivery.pickupPointId"
          rules={{ required: 'Выберите пункт выдачи' }}
          options={pickup.pickupPoints.map((p) => ({
            value: p.id,
            label: p.title,
            description: p.address,
          }))}
          className="delivery-form__pickup-points"
        />
      )}
      {deliveryMethod === 'courier' && (
        <div className="delivery-form__address">
          <TextField
            control={control}
            name="delivery.address.city"
            rules={{
              required: 'Город обязателен',
              minLength: { value: 2, message: 'Минимум 2 символа' },
            }}
            label="Город"
          />
          <TextField
            control={control}
            name="delivery.address.street"
            rules={{
              required: 'Улица обязательна',
              minLength: { value: 2, message: 'Минимум 2 символа' },
            }}
            label="Улица"
          />
          <TextField
            control={control}
            name="delivery.address.house"
            rules={{
              required: 'Дом обязателен',
              minLength: { value: 1, message: 'Введите номер дома' },
            }}
            label="Дом"
          />
          <TextField control={control} name="delivery.address.apartment" label="Квартира" />
        </div>
      )}
    </div>
  );
}
