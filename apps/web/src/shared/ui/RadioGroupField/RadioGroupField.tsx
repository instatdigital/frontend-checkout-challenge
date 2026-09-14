import { Controller } from 'react-hook-form';
import type { Control, FieldPath, FieldValues, RegisterOptions } from 'react-hook-form';
import clsx from 'clsx';
import './RadioGroupField.module.css';

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
        <div className={clsx('radio-group-field', className)}>
          {options.map((option) => (
            <label key={option.value} className="radio-group-field__option">
              <input
                type="radio"
                value={option.value}
                checked={field.value === option.value}
                onChange={() => field.onChange(option.value)}
                onBlur={field.onBlur}
              />
              <span className="radio-group-field__label">{option.label}</span>
              {option.description && (
                <span className="radio-group-field__description">{option.description}</span>
              )}
            </label>
          ))}
          {error && <span className="radio-group-field__error">{error.message}</span>}
        </div>
      )}
    />
  );
}
