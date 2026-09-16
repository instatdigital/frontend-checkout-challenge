import { useId } from 'react';
import { Controller } from 'react-hook-form';
import type { Control, FieldPath, FieldValues, RegisterOptions } from 'react-hook-form';
import clsx from 'clsx';
import styles from './TextField.module.css';

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
  const inputId = useId();
  const errorId = useId();

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <label htmlFor={inputId} className={clsx(styles.root, className)}>
          {label}
          <input
            {...field}
            id={inputId}
            className={clsx(styles.input, { [styles.input_error]: !!error })}
            type={type}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
          />
          {error && (
            <span id={errorId} className={styles.error}>
              {error.message}
            </span>
          )}
        </label>
      )}
    />
  );
}
