import type { Control } from 'react-hook-form';
import type { CheckoutFormValues } from '../model/types';
import { TextField } from '@/shared/ui/TextField/TextField';
import styles from './CustomerForm.module.css';

type CustomerFormProps = {
  control: Control<CheckoutFormValues>;
};

const INVALID_EMAIL_MESSAGE = 'Некорректный email';

function validateEmail(value: unknown) {
  if (typeof value !== 'string') return INVALID_EMAIL_MESSAGE;
  if (/\s/.test(value)) return INVALID_EMAIL_MESSAGE;
  if (!value.includes('@')) return INVALID_EMAIL_MESSAGE;
  const [local, domain] = value.split('@');
  if (!local || !domain || !domain.includes('.') || domain.endsWith('.')) {
    return INVALID_EMAIL_MESSAGE;
  }
  return true;
}

export function CustomerForm({ control }: CustomerFormProps) {
  return (
    <div className={styles.root}>
      <h2 className={styles.title}>Контакты</h2>
      <TextField
        control={control}
        name="customer.name"
        rules={{
          required: 'Имя обязательно',
          minLength: { value: 2, message: 'Минимум 2 символа' },
          validate: (v) => /\S/.test(v) || 'Не может быть из пробелов',
        }}
        label="Имя"
      />
      <TextField
        control={control}
        name="customer.email"
        rules={{
          required: 'Email обязателен',
          validate: validateEmail,
        }}
        label="Email"
        type="email"
      />
      <TextField
        control={control}
        name="customer.phone"
        rules={{
          required: 'Телефон обязателен',
          pattern: { value: /^\+[1-9]\d{9,14}$/, message: 'Формат: +79990000000' },
        }}
        label="Телефон"
        type="tel"
      />
    </div>
  );
}
