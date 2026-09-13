# Этап 5. Чекаут (шаг 1: контакты + доставка)

## Контракт API

**GET /api/checkout/options** → `CheckoutOptions`:

```ts
{
  cart: Cart                    // текущая корзина (с version)
  deliveryMethods: [{
    id: 'pickup' | 'courier'
    title: string
    price: number               // копейки
    freeFrom: number | null      // копейки, null = нет бесплатной доставки
    pickupPoints: [{ id, title, address }]  // пусто для courier
  }]
  paymentMethods: [{ id: 'card' | 'cash_on_delivery', title: string }]
}
```

**POST /api/quotes** body: `{ cartVersion: number, delivery: Delivery }` → `Quote`:

```ts
{
  id: string                    // quoteId для createOrder
  cartVersion: number
  items: CartItem[]
  delivery: Delivery
  subtotal: number              // копейки
  shipping: number              // копейки
  total: number                 // копейки
  currency: 'RUB'
  expiresAt: string             // ISO timestamp (10 мин)
}
```

**Delivery** (union):

```ts
{ method: 'pickup', pickupPointId: 'point-center' | 'point-north' }
| { method: 'courier', address: { city, street, house, apartment? } }
```

**Customer** (для будущего createOrder):

```ts
{ name: string, email: string, phone: string }
```

## Декомпозиция

### Шаг 1. Роут + страница-заглушка + entities/checkout/query-keys

- Добавить роут `/checkout` → CheckoutPage (заглушка: заголовок + «Переход к оформлению»)
- Обновить ссылку в CartPage (`/checkout`)
- `entities/checkout/api.ts`: добавить `checkoutKeys`
- `entities/checkout/index.ts`: экспортировать ключи

**≈ 30 строк**

### Шаг 2. Форма контактов (CustomerForm)

- Компонент `entities/checkout/ui/CustomerForm.tsx`
- Поля: имя, email, телефон
- Валидация: паттерны из контракта (`\S`, email format, `^\+[1-9]\d{9,14}$`)
- Стили: CSS Modules + БЭМ
- Тест: рендер, валидация, onChange

**≈ 150 строк**

### Шаг 3. Выбор доставки (DeliveryForm)

- Компонент `entities/checkout/ui/DeliveryForm.tsx`
- Получает `deliveryMethods` из CheckoutOptions
- Переключатель: самовывоз / курьер
- При самовывозе — выбор пункта из списка
- При курьере — поля адреса (city, street, house, apartment?)
- Тест: рендер, переключение, выбор пункта, ввод адреса

**≈ 150 строк**

### Шаг 4. Интеграция: CheckoutPage + getCheckoutOptions + createQuote

- `pages/checkout/CheckoutPage.tsx`
- `useAuthQuery(checkoutKeys.options(), ...)` → загрузка опций
- Состояние формы: customer + delivery + quote
- При выборе доставки → `createQuote({ cartVersion, delivery })`
- Отображение: подытог, доставка, итого
- QueryGuard для загрузки/ошибки
- Тест: рендер опций, расчёт стоимости, ошибка

**≈ 200 строк**

## Итого: 4 шага, ~530 строк нового кода
