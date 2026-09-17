# Stage 7. Оплата заказа (Checkout step 2)

## Цель

Добавить второй шаг оформления: выбор способа оплаты, создание заказа, банковская симуляция и обработка результата.

## Контекст

- Шаг 1 (`CheckoutPage`) уже собирает покупателя/доставку и котирует стоимость через `createQuote`.
- Для создания заказа нужны: `quoteId`, `customer`, `paymentMethod`.
- `createOrder` и `createPayment` требуют `Idempotency-Key` (`shared/lib/idempotency.ts`).
- Для карты нужно получить тестовые карты из песочницы, создать платёж, запустить симуляцию и поллить статус.
- Данные между шагами передаём через `location.state` React Router.

## Шаги реализации

### 7.1. Сущность песочницы `entities/sandbox`

1. Создать `apps/web/src/entities/sandbox/api.ts`:
   - `getSandbox(token)` → `ApiResponseData<'getSandbox', 200>`.
2. Создать `apps/web/src/entities/sandbox/index.ts` (публичный API).
3. Добавить фабрику ключей TanStack Query: `sandboxKeys.cards()`.

### 7.2. Фича создания заказа `features/create-order`

1. Создать `apps/web/src/features/create-order/lib/use-create-order.ts`:
   - `useAuthMutation`.
   - Генерация `Idempotency-Key` (`generateKey`) и сохранение в `localStorage` (`saveKey('order', key)`) перед запросом.
   - При успехе очищать ключ (`clearKey('order')`).
   - Вход: `{ quoteId, customer, paymentMethod }`.

### 7.3. Фича оплаты картой `features/pay-by-card`

1. `use-create-payment.ts` — мутация `createPayment` с `Idempotency-Key` ('payment').
2. `use-simulate-payment.ts` — мутация `createSimulation`.
3. `use-payment-status.ts` — `useAuthPolling` до терминального статуса (`success`, `declined`, `canceled`), используя `getPayment`.

### 7.4. Страница `pages/payment`

1. Создать `apps/web/src/pages/payment/PaymentPage.tsx`:
   - Получает `{ quoteId, customer }` из `useLocation().state`.
   - UI выбора метода оплаты: карта / наличные при получении.
   - При выборе карты — загрузка и отображение тестовых карт (`entities/sandbox`).
   - Кнопка «Оформить и оплатить».
2. При отправке:
   - `createOrder`.
   - Если `cash_on_delivery` — редирект на `/orders/:orderId`.
   - Если `card` — `createPayment`, затем `createSimulation`, затем polling статуса.
3. Терминальные статусы:
   - `success` → редирект `/orders/:orderId`.
   - `declined`/`canceled` → ошибка и кнопка «Попробовать ещё раз» с новым `Idempotency-Key`.

### 7.5. Роутинг

1. В `apps/web/src/app/routes.tsx` добавить `/checkout/payment` → `<PaymentPage />`.
2. В `CheckoutPage` после получения квоты делать `navigate('/checkout/payment', { state: { quoteId, customer } })`.

### 7.6. Тесты

1. `apps/web/test/PaymentPage.test.tsx`:
   - Рендер методов оплаты и списка тестовых карт.
   - Успешный заказ с наличными → вызов `createOrder`.
   - Успешная карта → `createOrder` → `createPayment` → `createSimulation` → `getPayment`.

## Критерии готовности

- Страница `/checkout/payment` открывается и позволяет выбрать способ оплаты.
- Создание заказа использует `Idempotency-Key` и сохраняет/чистит его.
- Оплата картой создаёт платёж, симуляцию и поллит статус до терминального.
- Повторная попытка после decline/cancel использует новый `Idempotency-Key`.
- Все проверки `format → build → lint → test` проходят.
