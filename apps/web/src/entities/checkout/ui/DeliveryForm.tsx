import clsx from 'clsx';
import { useState } from 'react';
import type { UseFormRegister, FieldError } from 'react-hook-form';
import type { CheckoutOptions, Delivery } from '@checkout/contracts';
import './DeliveryForm.module.css';

type DeliveryFormProps = {
  deliveryMethods: CheckoutOptions['deliveryMethods'];
  register: UseFormRegister<{ delivery: Delivery }>;
  methodError?: FieldError;
  pickupPointError?: FieldError;
  addressErrors?: {
    city?: FieldError;
    street?: FieldError;
    house?: FieldError;
    apartment?: FieldError;
  };
};

const inputClass = 'delivery-form__input';
const inputError = 'delivery-form__input--error';

export function DeliveryForm({
  deliveryMethods,
  register,
  methodError,
  pickupPointError,
  addressErrors,
}: DeliveryFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>(deliveryMethods[0]?.id ?? 'pickup');

  const pickup = deliveryMethods.find((m) => m.id === 'pickup');
  const courier = deliveryMethods.find((m) => m.id === 'courier');

  return (
    <div className="delivery-form">
      <h2 className="delivery-form__title">Доставка</h2>
      <div className="delivery-form__methods">
        {pickup && (
          <label className="delivery-form__method">
            <input
              type="radio"
              value="pickup"
              {...register('delivery.method', { required: 'Выберите способ доставки' })}
              checked={selectedMethod === 'pickup'}
              onChange={() => setSelectedMethod('pickup')}
            />
            {pickup.title}
          </label>
        )}
        {courier && (
          <label className="delivery-form__method">
            <input
              type="radio"
              value="courier"
              {...register('delivery.method', { required: 'Выберите способ доставки' })}
              checked={selectedMethod === 'courier'}
              onChange={() => setSelectedMethod('courier')}
            />
            {courier.title}
          </label>
        )}
      </div>
      {methodError && <span className="delivery-form__error">{methodError.message}</span>}
      {selectedMethod === 'pickup' && pickup && pickup.pickupPoints.length > 0 && (
        <div className="delivery-form__pickup-points">
          {pickup.pickupPoints.map((point) => (
            <label key={point.id} className="delivery-form__pickup-point">
              <input
                type="radio"
                value={point.id}
                {...register('delivery.pickupPointId', { required: 'Выберите пункт выдачи' })}
              />
              <span className="delivery-form__pickup-title">{point.title}</span>
              <span className="delivery-form__pickup-address">{point.address}</span>
            </label>
          ))}
          {pickupPointError && (
            <span className="delivery-form__error">{pickupPointError.message}</span>
          )}
        </div>
      )}
      {selectedMethod === 'courier' && (
        <div className="delivery-form__address">
          <label className="delivery-form__label">
            Город
            <input
              className={clsx(inputClass, { [inputError]: !!addressErrors?.city })}
              {...register('delivery.address.city', {
                required: 'Город обязателен',
                minLength: { value: 2, message: 'Минимум 2 символа' },
              })}
            />
            {addressErrors?.city && (
              <span className="delivery-form__error">{addressErrors.city.message}</span>
            )}
          </label>
          <label className="delivery-form__label">
            Улица
            <input
              className={clsx(inputClass, { [inputError]: !!addressErrors?.street })}
              {...register('delivery.address.street', {
                required: 'Улица обязательна',
                minLength: { value: 2, message: 'Минимум 2 символа' },
              })}
            />
            {addressErrors?.street && (
              <span className="delivery-form__error">{addressErrors.street.message}</span>
            )}
          </label>
          <label className="delivery-form__label">
            Дом
            <input
              className={clsx(inputClass, { [inputError]: !!addressErrors?.house })}
              {...register('delivery.address.house', {
                required: 'Дом обязателен',
                minLength: { value: 1, message: 'Введите номер дома' },
              })}
            />
            {addressErrors?.house && (
              <span className="delivery-form__error">{addressErrors.house.message}</span>
            )}
          </label>
          <label className="delivery-form__label">
            Квартира
            <input
              className={clsx(inputClass, { [inputError]: !!addressErrors?.apartment })}
              {...register('delivery.address.apartment')}
            />
          </label>
        </div>
      )}
    </div>
  );
}
