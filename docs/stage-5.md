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

### Шаг 2. Форма контактов (CustomerForm) ✅

- Компонент `entities/checkout/ui/CustomerForm.tsx`
- Поля: имя, email, телефон
- react-hook-form: `register` + `errors` из родителя, `mode: 'onBlur'`
- Встроенные правила RHF: `required`, `minLength`, `pattern`, `validate` (без отдельного файла-валидатора)
- `errorModifier` константа для DRY (CSS-модификатор ошибки)
- Стили: CSS Modules + БЭМ
- Тест: `it.each` для required-ошибок + отдельные кейсы для pattern/minLength/validate, `waitFor` для async blur

**≈ 150 строк**

### Шаг 2а. Инфраструктура: ESLint 9 + lefthook ✅

- Миграция с oxlint на ESLint 9 (flat config)
- Наборы: `tseslint.configs.strict`, `react`, `jsx-a11y`, `sonarjs`
- FSD: `eslint-plugin-fsd-import` (`layer-imports`, `slice-boundaries`, `public-api-imports`) — заменил скрипт `check-fsd.mjs`
- DRY: `no-restricted-syntax` (запрет fetch вне transport), `sonarjs/no-identical-functions`, `sonarjs/no-duplicate-string`
- Resilience: `no-floating-promises`, `no-misused-promises`
- Lefthook pre-commit: format → build → lint → test
- Рефакторинг `session-provider.tsx` (cognitive complexity < 15): `restoreSession`, `initSession`, `initFresh`
- Фикс `main.tsx`: null guard вместо `!`
- Фикс `CheckoutPage.tsx`: `void handleSubmit(...)` для no-misused-promises
- Email-regex: упрощён для `super-linear-regex`
- Удалены: `.oxlintrc.json`, `scripts/check-fsd.mjs`, `validate-customer.ts`

### Шаг 3. CheckoutPage + DeliveryForm + API (getCheckoutOptions + createQuote) ✅

- CheckoutPage: `useAuthQuery(checkoutKeys.options(), ...)` → загрузка опций
- CheckoutPage: форма с customer + delivery, QueryGuard
- `entities/checkout/ui/DeliveryForm.tsx` — выбор доставки (самовывоз/курьер)
- При выборе доставки → `createQuote({ cartVersion, delivery })`
- Отображение: подытог, доставка, итого
- Тип формы: плоский `CheckoutFormDelivery` (обход union-ограничения FieldErrors)
- `toDelivery()` — конвертация плоского типа → `Delivery` для API
- `createQuote` принимает `Delivery` из контрактов (не `ApiRequestBody<Op>`)
- Тест: рендер опций, переключение доставки, расчёт стоимости

### Шаг 4. Field-компоненты + возврат Delivery в тип формы

Цель: DRY (убрать повтор input+clsx+error) + типобезопасность (Controller → FieldErrors не нужен).

#### 4.1. TextField + интеграция в CustomerForm ✅

- `shared/ui/TextField/TextField.tsx` + `.module.css`
- `Controller` внутри: `field` + `fieldState.error`
- Пропы: `control`, `name`, `rules`, `label`, `className`, `type?`
- CustomerForm переписать на TextField (вместо register + ручной error-вывод)
- CheckoutPage: передать `control` вместо `register` + `errors`
- Тесты CustomerForm обновить

**≈ 200 строк**

#### 4.2. RadioGroupField + интеграция в DeliveryForm ✅

- `shared/ui/RadioGroupField/RadioGroupField.tsx` + `.module.css`
- `Controller` внутри: radio-группа с options-массивом
- Пропы: `control`, `name`, `rules`, `options: { value, label }[]`, `className`
- DeliveryForm переписать на RadioGroupField + TextField
- Убрать `useState` для selectedMethod (Controller управляет состоянием)
- Убрать individual error props (`methodError`, `pickupPointError`, `addressErrors`)
- CheckoutPage: передать `control` вместо `register`
- Тесты DeliveryForm обновить

**≈ 200 строк**

#### 4.3. Упрощение: возврат Delivery + удаление toDelivery

- `CheckoutFormValues.delivery`: `Delivery` вместо `CheckoutFormDelivery`
- Удалить `CheckoutFormDelivery`, `toDelivery()` из `model/types.ts`
- Удалить `useState` + `watch('delivery')` в CheckoutPage (условная отрисовка через Controller)
- CheckoutPage: `data.delivery` напрямую в `createQuote`
- Обновить тесты

**≈ 50 строк**

## Итого: 4 шага (3 подшага в шаге 4), ~750 строк нового кода
