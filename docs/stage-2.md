# Этап 2. Сессия и персистенция — декомпозиция

## Контекст

Сессия — основа для всех авторизованных API-вызовов. Без токена нельзя работать с корзиной,
оформлять заказ, оплачивать. Токен должен переживать перезагрузку браузера, а orderId/paymentId —
позволять восстановить незавершённую оплату.

Идемпотентные ключи привязаны к действию (заказ/оплата), хранятся до подтверждения результата.

---

## 2.1. Хранилище сессии (`src/lib/session.ts`)

Чистые функции для localStorage, без React:

- `saveSession(token, sessionId)` — записать токен и id
- `loadSession()` → `{ token, sessionId } | null`
- `clearSession()` — удалить токен и id
- `saveOrderId(orderId)` / `loadOrderId()` / `savePaymentId(paymentId)` / `loadPaymentId()`
- `clearCheckout()` — удалить orderId + paymentId (сессия остаётся)

TDD: тесты с `vi.spyOn(Storage.prototype, ...)`.

~30 строк + ~40 строк тестов.

## 2.2. Idempotency-ключи (`src/lib/idempotency.ts`)

Генерация и хранение ключей для POST-запросов:

- `generateKey()` → `crypto.randomUUID()`
- `saveKey(action, key)` — action: `'order' | 'payment'`
- `loadKey(action)` → `string | null`
- `clearKey(action)` — удалить ключ конкретного действия

TDD: тесты с mock localStorage.

~20 строк + ~25 строк тестов.

## 2.3. Провайдер сессии (`src/lib/session-context.tsx`)

React-контекст, управляющий жизненным циклом сессии:

- `SessionProvider` — обёртка в дереве компонентов
- `useSession()` → `{ token, sessionId, isLoading, error }`
- При монтировании: загрузка из localStorage → проверка через `getSession(sessionId, token)`
- Если токен невалиден (401) → новая сессия
- Если токена нет → новая сессия
- Если валиден → использовать сохранённый

TDD: renderHook + mock API-вызовы.

~50 строк + ~60 строк тестов.

---

## Порядок выполнения

| Шаг | Действие                         | Объём     | Статус |
| --- | -------------------------------- | --------- | ------ |
| 1   | Хранилище сессии + тесты         | ~30 + ~40 | ✅     |
| 2   | Idempotency-ключи + тесты        | ~20 + ~25 | ⬜     |
| 3   | Провайдер сессии + тесты         | ~50 + ~60 | ⬜     |
