# Этап 6.5. Рефакторинг DRY-2

Устранение дублирования, выявленного после этапов 5–6. Подготовка инфраструктуры для этапа 7 (оплата).

## Контекст

После завершения этапов 5 (чекаут) и 6 (дизайн-система) в коде накопилось дублирование:
- Обе страницы (CatalogPage, CartPage) вручную собирают `useAuthMutation` для `setCartItem` с одинаковой инвалидацией корзины
- `usePolling` не принимает токен — непригоден для поллинга оплаты (этап 7)
- Мёртвый код `getCartItem` в `entities/cart/api.ts`
- Тестовые обёртки QueryClient + mock сессии дублируются

## Шаги

### 6.5.1. Хуки мутаций корзины в entities/cart

**Зачем:** CatalogPage и CartPage дублируют паттерн `useAuthMutation` для `setCartItem` — одинаковый тип переменных `{ productId, body }`, одинаковая инвалидация `cartKeys.detail()`.

**Что делаем:**

1. Создать `entities/cart/lib/use-cart-mutations.ts`:
   - `useSetCartItem()` — `useAuthMutation` + `useQueryClient` + инвалидация `cartKeys.detail()`
   - `useRemoveCartItem()` — аналогично для `removeCartItem`
   - Тип переменных: `SetCartItemVars = { productId: string; body: ApiRequestBody<'setCartItem'> }` и `RemoveCartItemVars = { productId: string }`
2. Экспортировать из `entities/cart/index.ts`
3. Обновить `pages/catalog/CatalogPage.tsx` — заменить ручной `useAuthMutation` + `useQueryClient` на `useSetCartItem()`
4. Обновить `pages/cart/CartPage.tsx` — заменить 2 `useAuthMutation` + `useQueryClient` + `invalidateCart` на `useSetCartItem()` + `useRemoveCartItem()`
5. Удалить `getCartItem` из `entities/cart/api.ts` (мёртвый код, не экспортируется)

**Результат:** страницы используют `const addToCart = useSetCartItem()` / `const removeItem = useRemoveCartItem()` — без `useQueryClient`, без ручного типа переменных, без `ApiRequestBody` в страницах.

### 6.5.2. useAuthPolling в entities/session

**Зачем:** `usePolling` в `shared/api/hooks/use-polling.ts` не принимает токен. Для этапа 7 нужен поллинг `GET /api/payments/:paymentId` — это защищённый эндпоинт.

**Что делаем:**

1. Создать `entities/session/lib/use-auth-polling.ts`:
   - `useAuthPolling<T>(key, fetcher: (token, signal) => Promise<T>, shouldStop, interval?, options?)`
   - Аналог `useAuthQuery`: берёт токен из `useSession()`, `enabled: !!token && (options?.enabled ?? true)`
2. Экспортировать из `entities/session/index.ts`
3. Не трогать `usePolling` — он используется для публичных запросов (если будет)

**Результат:** для этапа 7 доступен `useAuthPolling` — поллинг защищённых эндпоинтов с автоподстановкой токена.

### 6.5.3. Общие тестовые хелперы

**Зачем:** 4 тестовых файла дублируют `new QueryClient({ defaultOptions: { queries: { retry: false } } })` + `QueryClientProvider`. 2 файла дублируют mock сессии.

**Что делаем:**

1. Создать `test/helpers/create-wrapper.tsx`:
   - `createTestWrapper(options?: { withRouter?: boolean })` — возвращает `wrapper` для renderHook/render
   - Создаёт `QueryClient` с `retry: false`, оборачивает в `QueryClientProvider`
   - Если `withRouter` — добавляет `MemoryRouter`
2. Создать `test/helpers/mock-session.ts`:
   - `mockSession(overrides?)` — `vi.mock('@/entities/session/model/session-context', ...)`
   - Default: `{ token: 'test-token', sessionId: 's-1', isLoading: false, error: null }`
3. Обновить существующие тесты:
   - `test/api-hooks.test.tsx` — использовать `createTestWrapper()`
   - `test/auth-hooks.test.tsx` — использовать `createTestWrapper()`
   - `test/CartPage.test.tsx` — использовать `createTestWrapper({ withRouter: true })` + `mockSession()`
   - `test/CatalogPage.test.tsx` — использовать `createTestWrapper()` + `mockSession()`
   - `test/session-context.test.tsx` — использовать `createTestWrapper()`

**Результат:** тестовые обёртки и моки в одном месте, при добавлении тестов этапа 7 — переиспользование.

### 6.5.4. (опционально) Документировать `as T` в transport.ts

**Зачем:** конвенция запрещает `as Type`, но в generic-транспорте это неизбежный limitation TypeScript.

**Что делаем:**

- Добавить комментарий-обоснование к двум `as T` в `shared/api/transport.ts` (строки 27, 30)
- Формат: `// eslint-disable-next-line @typescript-eslint/no-explicit-any — justified: generic transport, T determined by caller`

**Результат:** явное обоснование исключения, а не молчаливое нарушение.

## Что НЕ делаем

- **Session storage FSD-разделение** (orderId/paymentId из session → order/payment) — откладываем до этапа 9 (устойчивость), когда эти ключи будут активно использоваться
- **CSS `.title` / `.error` дублирование** — 3-7 повторений, по конвенции «не добавлять абстракции для малого числа повторений»
- **`minLength: { value: 2 }` константа** — 3 повторения, не стоит абстракции

## Порядок

6.5.1 → 6.5.2 → 6.5.3 → 6.5.4

Шаги 6.5.1 и 6.5.2 независимы, но 6.5.1 влияет на существующие тесты, а 6.5.3 обновляет те же тестовые файлы. Поэтому лучше сначала 6.5.1 (меняет прод-код), потом 6.5.3 (меняет тесты), потом 6.5.2 (новый код). Либо делать 6.5.1 + 6.5.3 вместе.

Итоговый порядок: **6.5.1 → 6.5.3 → 6.5.2 → 6.5.4**
