import type { Product } from '@checkout/contracts';

export const products: Product[] = [
  {
    id: 'lamp-orbit',
    sku: 'DEMO-001',
    title: 'Настольная лампа «Орбита»',
    description: 'Компактная лампа с тёплым светом для рабочего стола.',
    price: 249000,
    currency: 'RUB',
    stock: 10,
  },
  {
    id: 'mug-line',
    sku: 'DEMO-002',
    title: 'Кружка «Линия»',
    description: 'Керамическая кружка, 350 мл.',
    price: 89000,
    currency: 'RUB',
    stock: 20,
  },
  {
    id: 'bag-day',
    sku: 'DEMO-003',
    title: 'Сумка «День»',
    description: 'Тканевая сумка для ежедневных покупок.',
    price: 159000,
    currency: 'RUB',
    stock: 5,
  },
  {
    id: 'clock-dot',
    sku: 'DEMO-004',
    title: 'Часы «Точка»',
    description: 'Учебный пример товара, которого нет в наличии.',
    price: 329000,
    currency: 'RUB',
    stock: 0,
  },
];

export const deliveryMethods = [
  {
    id: 'pickup' as const,
    title: 'Самовывоз',
    price: 0,
    freeFrom: null,
    pickupPoints: [
      { id: 'point-center', title: 'Центральный пункт', address: 'г. Учебный, ул. Примерная, 1' },
      { id: 'point-north', title: 'Северный пункт', address: 'г. Учебный, ул. Макетная, 7' },
    ],
  },
  { id: 'courier' as const, title: 'Курьер', price: 39000, freeFrom: 500000, pickupPoints: [] },
];

export const paymentMethods = [
  { id: 'card' as const, title: 'Картой онлайн (тестовая оплата)' },
  { id: 'cash_on_delivery' as const, title: 'Наличными при получении' },
];

export const testCards = [
  {
    id: 'test-success',
    title: 'Тестовая карта: успешная оплата',
    maskedNumber: '•••• 4242',
    scenario: 'success' as const,
  },
  {
    id: 'test-decline',
    title: 'Тестовая карта: отказ банка',
    maskedNumber: '•••• 0002',
    scenario: 'decline' as const,
  },
  {
    id: 'test-cancel',
    title: 'Тестовая карта: отмена пользователем',
    maskedNumber: '•••• 0003',
    scenario: 'cancel' as const,
  },
];
