import { Controller } from 'react-hook-form';
import type { Control, FieldPath, FieldValues, RegisterOptions } from 'react-hook-form';
import * as RadioGroup from '@radix-ui/react-radio-group';
import clsx from 'clsx';
import styles from './RadioGroupField.module.css';

export type RadioOption = {
  value: string;
  label: string;
  description?: string;
};

type RadioGroupFieldProps<T extends FieldValues, N extends FieldPath<T>> = {
  control: Control<T>;
  name: N;
  rules?: RegisterOptions<T, N>;
  options: RadioOption[];
  className?: string;
};

export function RadioGroupField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  rules,
  options,
  className,
}: RadioGroupFieldProps<T, N>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <RadioGroup.Root
          value={field.value}
          onValueChange={field.onChange}
          onBlur={field.onBlur}
          className={clsx(styles.root, className)}
        >
          {options.map((option) => (
            <label key={option.value} className={styles.option}>
              <RadioGroup.Item value={option.value} className={styles.radio}>
                <RadioGroup.Indicator className={styles.indicator} />
              </RadioGroup.Item>
              <span className={styles.label}>{option.label}</span>
              {option.description && (
                <span className={styles.description}>{option.description}</span>
              )}
            </label>
          ))}
          {error && <span className={styles.error}>{error.message}</span>}
        </RadioGroup.Root>
      )}
    />
  );
}
