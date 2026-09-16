# Stage 8. Страница успеха заказа

## Цель

Добавить страницу `/orders/:orderId`, которая показывает итоги заказа и его статус с сервера.

## Контекст

- `GET /api/orders/:orderId` уже доступен через `entities/order`.
- Заказ содержит: номер, статус, статус оплаты, способ оплаты, покупателя, позиции, доставку, суммы.
- Сообщение зависит от `paymentMethod` и `paymentStatus`, а не от факта перехода.

## Шаги

### 8.1. Страница `pages/order`

1. `pages/order/OrderPage.tsx` — получает `orderId` из `useParams`, загружает заказ через `useAuthQuery` + `orderKeys.detail(orderId)`.
2. UI:
   - Номер заказа.
   - Статус (`status`, `paymentStatus`).
   - Список товаров (название, количество, цена за штуку, сумма).
   - Доставка (метод + адрес/пункт самовывоза).
   - Итоги: подытог, доставка, итого.
   - Сообщение:
     - `paymentMethod === 'card' && paymentStatus === 'succeeded'` → «Заказ оплачен».
     - `paymentMethod === 'cash_on_delivery'` → «Заказ оформлен, оплата при получении».
3. `pages/order/index.ts` — публичный API.

### 8.2. Роутинг

- `app/routes.tsx`: `<Route path="/orders/:orderId" element={<OrderPage />} />`.

### 8.3. Query keys

- `entities/order/api.ts`: добавить `orderKeys.detail(orderId)`.

### 8.4. Тесты

- `test/OrderPage.test.tsx`:
  - Рендер карточного заказа → «Заказ оплачен».
  - Рендер заказа с наличными → «Заказ оформлен, оплата при получении».

## Критерии готовности

- Страница `/orders/:orderId` открывается и отображает данные заказа.
- Сообщение соответствует статусу с сервера.
- Все проверки lefthook проходят.
