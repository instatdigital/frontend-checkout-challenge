# Этап 1. API-клиент — декомпозиция

## 1.1. Типы ошибок (`src/api/errors.ts`)

Типизированные ошибки для транспортного слоя:

- `ApiError` — { code, message, fields?, status }
- `ConflictError extends ApiError` — 409, для обработки конфликта версий корзины
- `NetworkError` — сбой сети (fetch выбросил, не HTTP-ошибка)

~40 строк.

## 1.2. Транспортный слой (`src/api/transport.ts`)

Единая функция `apiRequest<T>(method, path, options?)` → `Promise<T>`:

- Базовый URL: `http://127.0.0.1:4000`
- Автоинъекция `Authorization: Bearer <token>` (токен из sessionStorage/localStorage)
- Сериализация body в JSON, заголовок `Content-Type: application/json`
- `Idempotency-Key` — передаётся через options, если указан
- Разбор успешного ответа: `response.ok` → `response.json()` → извлечь `data` из конверта
- Разбор ошибки: `!response.ok` → `response.json()` → создать `ApiError`/`ConflictError`
- Сетевая ошибка: catch → `NetworkError`
- Пустой ответ (204): вернуть void

~80 строк.

## 1.3. Тесты транспортного слоя (`test/transport.test.ts`)

- Успешный GET: конверт `{data, meta, links}` → извлечённые данные
- POST с телом: Content-Type, сериализация
- Авторизация: токен подставляется в заголовок
- Idempotency-Key: передаётся в заголовок
- 409 → ConflictError
- 401 → ApiError с code SESSION_REQUIRED
- 404 → ApiError
- 204 → void
- Сетевая ошибка → NetworkError

~100 строк.

## 1.4. Эндпоинты: session, catalog, cart (`src/api/endpoints/`)

Три файла, по функции на эндпоинт, делегируют transport:

- `session.ts` — createSession, getSession
- `catalog.ts` — listProducts
- `cart.ts` — getCart, getCartItem, setCartItem, removeCartItem

Типы из `@checkout/contracts`.

Проверить D1: все запросы идут через apiRequest, компонентов с собственным fetch нет.

~70 строк.

## 1.5. Эндпоинты: checkout, orders, payments (`src/api/endpoints/`)

Три файла:

- `checkout.ts` — getCheckoutOptions, createQuote, getQuote
- `orders.ts` — createOrder, listOrders, getOrder
- `payments.ts` — listPayments, createPayment, getPayment, createSimulation, getSimulation

~80 строк.

## 1.6. TanStack Query: провайдер и утилиты (`src/lib/query-client.ts`)

Создание QueryClient с дефолтными настройками.
QueryClientProvider в App.tsx.

~20 строк.

## 1.7. Хук useQuery + хук useMutation (`src/api/hooks/`)

Обёртки над TanStack Query:

- `useApiQuery(key, fetcher)` — loading, data, error, refetch
- `useApiMutation(fetcher)` — loading, error, execute, reset

~50 строк.

## 1.8. Хук usePolling (`src/api/hooks/use-polling.ts`)

Поллинг с интервалом (500–1000мс), остановка по условию (статус = терминальный),
отмена при уходе со страницы (AbortController).

~40 строк.

## 1.9. Тесты хуков (`test/api-hooks.test.tsx`)

- useApiQuery: загрузка, данные, ошибка, refetch
- useApiMutation: выполнение, loading, ошибка
- usePolling: старт, остановка по условию, отмена при unmount

~80 строк.

---

## Порядок выполнения

| Шаг | Действие                              | Объём | Статус |
| --- | ------------------------------------- | ----- | ------ |
| 1   | Типы ошибок (`errors.ts`)             | ~40   | ✅     |
| 2   | Транспортный слой (`transport.ts`)    | ~80   | ✅     |
| 3   | Тесты транспорта                      | ~100  | ✅     |
| 4   | Эндпоинты: session, catalog, cart     | ~70   | ⬜     |
| 5   | Эндпоинты: checkout, orders, payments | ~80   | ⬜     |
| 6   | TanStack Query: провайдер + утилиты   | ~20   | ⬜     |
| 7   | Хуки useQuery + useMutation           | ~50   | ⬜     |
| 8   | Хук usePolling                        | ~40   | ⬜     |
| 9   | Тесты хуков                           | ~80   | ⬜     |
