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
