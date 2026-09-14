import { useForm } from 'react-hook-form';
import type { Customer } from '@checkout/contracts';
import { CustomerForm } from '@/entities/checkout';
import './CheckoutPage.module.css';

type CheckoutFormValues = {
  customer: Customer;
};

const defaultValues: CheckoutFormValues = {
  customer: { name: '', email: '', phone: '' },
};

export function CheckoutPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({ defaultValues, mode: 'onBlur' });

  const onSubmit = (_data: CheckoutFormValues) => {
    // will be connected to API in step 4
  };

  return (
    <div className="checkout">
      <h1 className="checkout__title">Оформление заказа</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CustomerForm register={register} errors={errors} />
        <button className="checkout__submit" type="submit">
          Продолжить
        </button>
      </form>
    </div>
  );
}
