import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { Customer } from '@checkout/contracts';
import './CustomerForm.module.css';

type CustomerFormProps = {
  register: UseFormRegister<{ customer: Customer }>;
  errors: FieldErrors<{ customer: Customer }>;
};

const errorModifier = ' customer-form__input--error';

export function CustomerForm({ register, errors }: CustomerFormProps) {
  return (
    <div className="customer-form">
      <h2 className="customer-form__title">Контакты</h2>
      <label className="customer-form__label">
        Имя
        <input
          className={`customer-form__input${errors.customer?.name ? errorModifier : ''}`}
          {...register('customer.name', {
            required: 'Имя обязательно',
            minLength: { value: 2, message: 'Минимум 2 символа' },
            validate: (v: string) => /\S/.test(v) || 'Не может быть из пробелов',
          })}
        />
        {errors.customer?.name && (
          <span className="customer-form__error">{errors.customer.name.message}</span>
        )}
      </label>
      <label className="customer-form__label">
        Email
        <input
          className={`customer-form__input${errors.customer?.email ? errorModifier : ''}`}
          type="email"
          {...register('customer.email', {
            required: 'Email обязателен',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Некорректный email' },
          })}
        />
        {errors.customer?.email && (
          <span className="customer-form__error">{errors.customer.email.message}</span>
        )}
      </label>
      <label className="customer-form__label">
        Телефон
        <input
          className={`customer-form__input${errors.customer?.phone ? errorModifier : ''}`}
          type="tel"
          {...register('customer.phone', {
            required: 'Телефон обязателен',
            pattern: { value: /^\+[1-9]\d{9,14}$/, message: 'Формат: +79990000000' },
          })}
        />
        {errors.customer?.phone && (
          <span className="customer-form__error">{errors.customer.phone.message}</span>
        )}
      </label>
    </div>
  );
}
