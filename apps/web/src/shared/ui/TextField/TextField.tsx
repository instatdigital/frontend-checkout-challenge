import { Controller } from 'react-hook-form';
import type { Control, FieldPath, FieldValues, RegisterOptions } from 'react-hook-form';
import clsx from 'clsx';
import './TextField.module.css';

type TextFieldProps<T extends FieldValues, N extends FieldPath<T>> = {
  control: Control<T>;
  name: N;
  rules?: RegisterOptions<T, N>;
  label: string;
  className?: string;
  type?: string;
};

export function TextField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  rules,
  label,
  className,
  type = 'text',
}: TextFieldProps<T, N>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <label className={clsx('text-field', className)}>
          {label}
          <input
            {...field}
            className={clsx('text-field__input', { 'text-field__input--error': !!error })}
            type={type}
          />
          {error && <span className="text-field__error">{error.message}</span>}
        </label>
      )}
    />
  );
}
