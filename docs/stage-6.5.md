# Этап 6.5. Рефакторинг DRY-2

Устранение дублирования, выявленного после этапов 5–6. Подготовка инфраструктуры для этапа 7 (оплата).

## Контекст

После завершения этапов 5 (чекаут) и 6 (дизайн-система) в коде накопилось дублирование:

- Обе страницы (CatalogPage, CartPage) вручную собирают `useAuthMutation` для `setCartItem` с одинаковой инвалидацией корзины
- `usePolling` не принимает токен — непригоден для поллинга оплаты (этап 7)
- Мёртвый код `getCartItem` в `entities/cart/api.ts`
- Тестовые обёртки QueryClient + mock сессии дублируются
- Lefthook запускает все 5 проверок даже для doc-файлов (60с вместо 5с)

## Шаги

### 6.5.0. Узкие glob в lefthook ✅

**Зачем:** Все команды имеют `glob: '*'` — коммит `.md` файла ждёт typecheck + build + lint + test (~60с). Lefthook пропускает команду, если ни один staged-файл не попадает в glob.

**Что сделано:**

```yaml
format:
  glob: '*'
typecheck:
  glob: 'apps/web/**/*.{ts,tsx,json}'
build:
  glob: 'apps/web/**/*.{ts,tsx,css,html,json}'
lint:
  glob: 'apps/web/**/*.{ts,tsx,js}'
test:
  glob: 'apps/web/**/*.{ts,tsx}'
```

**Результат:** коммит `.md`/`.yml` → только format (~5с). Коммит TS → все 5 шагов. Проверено: `build/lint/test/typecheck` показывают `(skip) no matching staged files` для `.yml`-коммита.

### 6.5.1. Создание слоя features для операций с корзиной

**Зачем:** CatalogPage и CartPage дублируют паттерн `useAuthMutation` для `setCartItem` — одинаковый тип переменных `{ productId, body }`, одинаковая инвалидация `cartKeys.detail()`. Это кросс-доменная оркестрация (cart + session), которая по FSD живёт в слое `features`, а не в `entities` (entities не импортируют друг друга).

**Что делаем:**

1. Создать слой `src/features/` с тремя фичами:

**`features/add-to-cart/`**

```typescript
// lib/use-add-to-cart.ts
import { useQueryClient } from '@tanstack/react-query';
import { useAuthMutation } from '@/entities/session';
import { setCartItem, cartKeys } from '@/entities/cart';
import type { ApiRequestBody } from '@/shared/api/api-types';

type AddToCartVars = { productId: string; body: ApiRequestBody<'setCartItem'> };

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useAuthMutation<ApiRequestBody<'setCartItem'>, AddToCartVars>(
    (vars, token) => setCartItem(vars.productId, vars.body, token),
    { onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.detail() }) },
  );
}

// index.ts
export { useAddToCart } from './lib/use-add-to-cart';
```

**`features/update-cart-item/`**

```typescript
// lib/use-update-cart-item.ts
import { useQueryClient } from '@tanstack/react-query';
import { useAuthMutation } from '@/entities/session';
import { setCartItem, cartKeys } from '@/entities/cart';
import type { ApiRequestBody } from '@/shared/api/api-types';

type UpdateCartItemVars = { productId: string; body: ApiRequestBody<'setCartItem'> };

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useAuthMutation<ApiRequestBody<'setCartItem'>, UpdateCartItemVars>(
    (vars, token) => setCartItem(vars.productId, vars.body, token),
    { onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.detail() }) },
  );
}

// index.ts
export { useUpdateCartItem } from './lib/use-update-cart-item';
```

**`features/remove-cart-item/`**

```typescript
// lib/use-remove-cart-item.ts
import { useQueryClient } from '@tanstack/react-query';
import { useAuthMutation } from '@/entities/session';
import { removeCartItem, cartKeys } from '@/entities/cart';

type RemoveCartItemVars = { productId: string };

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useAuthMutation<void, RemoveCartItemVars>(
    (vars, token) => removeCartItem(vars.productId, token),
    { onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.detail() }) },
  );
}

// index.ts
export { useRemoveCartItem } from './lib/use-remove-cart-item';
```

2. Обновить `pages/catalog/CatalogPage.tsx`:
   - Удалить `useQueryClient`, `useAuthMutation`, `ApiRequestBody`
   - Импортировать `useAddToCart` из `@/features/add-to-cart`
   - Заменить `addToCart.mutate({ productId, body: { quantity: 1 } })` на `addToCart.mutate({ productId, body: { quantity: 1 } })` (без изменений вызова)

3. Обновить `pages/cart/CartPage.tsx`:
   - Удалить `useQueryClient`, `useAuthMutation`, `invalidateCart`, `ApiRequestBody`
   - Импортировать `useUpdateCartItem` из `@/features/update-cart-item`
   - Импортировать `useRemoveCartItem` из `@/features/remove-cart-item`

4. Удалить `getCartItem` из `entities/cart/api.ts` (мёртвый код, не экспортируется)

**Результат:**

- FSD-иерархия: `pages → features → entities` ✓
- Entities не импортируют друг друга ✓
- Кросс-доменная оркестрация (cart + session) в features ✓
- Страницы используют `useAddToCart()`, `useUpdateCartItem()`, `useRemoveCartItem()`
- Удалено дублирование `useAuthMutation` + `useQueryClient` + инвалидация

### 6.5.2. useAuthPolling в entities/session ✅

**Зачем:** `usePolling` в `shared/api/hooks/use-polling.ts` не принимает токен. Для этапа 7 нужен поллинг `GET /api/payments/:paymentId` — это защищённый эндпоинт.

**Что сделано (отличается от плана):**

1. `useAuthPolling` добавлен **в существующий `entities/session/lib/auth-hooks.ts`** (не отдельный файл — все auth-хуки в одном месте)
2. Реализация через **композицию с `usePolling`**, а не дублирование: `useAuthPolling` берёт токен из `useSession()` и оборачивает fetcher, делегируя `refetchInterval`/остановку в `usePolling`. Логика поллинга не повторяется.
   - `useAuthPolling<T>(key, fetcher: (token, signal) => Promise<T>, shouldStop, interval?, options?)`
   - `enabled: !!token && (options?.enabled ?? true)` — не поллит без токена
3. Экспортирован из `entities/session/index.ts`
4. `usePolling` не тронут — используется для публичных запросов

**Тест:** `test/use-auth-polling.test.tsx` — 3 кейса (нет токена → не поллит; токен передаётся в fetcher; остановка по shouldStop).

**Результат:** для этапа 7 доступен `useAuthPolling` — поллинг защищённых эндпоинтов с автоподстановкой токена, без дублирования логики поллинга.

### 6.5.3. Общие тестовые хелперы ✅

**Зачем:** 4 тестовых файла дублируют `new QueryClient({ defaultOptions: { queries: { retry: false } } })` + `QueryClientProvider`. 2 файла дублируют mock сессии.

**Что сделано (отличается от первоначального плана):**

1. `test/helpers/create-wrapper.tsx`:
   - `createTestWrapper(options?: { withRouter?, queryClientOptions? })` — возвращает wrapper-компонент
   - **QueryClient создаётся ВНУТРИ компонента** (свежий кеш на каждый render), а не в замыкании — иначе данные протекают между тестами
   - Если `withRouter` — оборачивает в `MemoryRouter`
2. `test/helpers/mock-session.ts`:
   - Экспортирует только константу `defaultSession` (`{ token: 'test-token', sessionId: 's-1', isLoading: false, error: null }`)
   - **`vi.mock` НЕ вынесен в хелпер** — Vitest хоистит моки только внутри самого тест-файла, из импортированного модуля `vi.mock` не срабатывает. Каждый тест-файл сам делает `vi.mock('@/entities/session/model/session-context', () => ({ useSession: () => defaultSession }))`
3. Обновлены тесты: `api-hooks`, `auth-hooks`, `CartPage`, `CatalogPage` — используют `createTestWrapper()` и `defaultSession`. `session-context.test.tsx` не тронут (у него уникальная обёртка на `SessionProvider`).

**Результат:** обёртка QueryClient в одном месте, значения сессии — в `defaultSession`. `vi.mock` остаётся в тест-файлах (ограничение Vitest). 76 тестов проходят.

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

**6.5.0 → 6.5.1 → 6.5.3 → 6.5.2 → 6.5.4**

6.5.0 (lefthook glob) — быстрая инфраструктурная победа, ускоряет все последующие коммиты.
6.5.1 влияет на тесты, 6.5.3 обновляет те же файлы — делаем подряд.
6.5.2 — новый код, не зависит от 6.5.1/6.5.3.
6.5.4 — косметика, в конце.
