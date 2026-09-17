# Этап 4.6. Миграция на FSD (Feature-Sliced Design)

## Зачем

Текущая структура `api/`, `lib/`, `components/`, `pages/` группирует файлы по технической роли.
По мере роста (checkout, payment, orders) доменная логика размазывается по папкам:
cart-эндпоинты в `api/endpoints/`, CartItem в `components/`, cartKeys в `api/query-keys.ts`,
cart-мутации в `pages/CartPage/`.

FSD группирует по домену: всё связанное с cart — в `entities/cart/`.
Зависимости направлены сверху вниз: `app → pages → entities → shared`.
Каждый слайс имеет публичный API (`index.ts`), наружу экспортируется только нужное.

## Целевая структура

```
src/
  app/
    layout.tsx              — Layout (header + Outlet)
    layout.module.css
    providers.tsx           — QueryClientProvider + SessionProvider
    routes.tsx              — BrowserRouter + Routes
    styles/
      index.css             — глобальный CSS (из src/index.css)
  pages/
    catalog/
      CatalogPage.tsx
      CatalogPage.module.css
      index.ts
    cart/
      CartPage.tsx
      CartPage.module.css
      index.ts
  entities/
    product/
      api.ts                — listProducts, productKeys
      ui/
        ProductCard.tsx
        ProductCard.module.css
      index.ts
    cart/
      api.ts                — getCart, getCartItem, setCartItem, removeCartItem, cartKeys
      ui/
        CartItem.tsx
        CartItem.module.css
      index.ts
    session/
      api.ts                — createSession, getSession
      model/
        session-context.ts  — SessionState, useSession, SessionContext
      lib/
        session.ts          — localStorage helpers
        session-provider.tsx
        auth-hooks.ts       — useAuthQuery, useAuthMutation
      index.ts
    checkout/
      api.ts                — getCheckoutOptions, createQuote, getQuote
      index.ts
    order/
      api.ts                — createOrder, listOrders, getOrder
      index.ts
    payment/
      api.ts                — listPayments, createPayment, getPayment, createSimulation, getSimulation
      index.ts
  shared/
    api/
      transport.ts
      errors.ts
      api-types.ts
      openapi-types.ts      (автогенерация)
      compat-check.ts
      hooks.ts              — useApiQuery, useApiMutation
      hooks/
        use-polling.ts
      index.ts
    ui/
      QueryGuard/
        QueryGuard.tsx
        QueryGuard.module.css
        index.ts
    lib/
      format.ts
      idempotency.ts
      query-client.ts
      index.ts
  main.tsx                  — точка входа Vite (createRoot + StrictMode + providers)
```

## Маппинг текущий → целевой

| Текущее расположение            | Целевое                                     | Слой FSD |
| ------------------------------- | ------------------------------------------- | -------- |
| `src/api/transport.ts`          | `shared/api/transport.ts`                   | shared   |
| `src/api/errors.ts`             | `shared/api/errors.ts`                      | shared   |
| `src/api/api-types.ts`          | `shared/api/api-types.ts`                   | shared   |
| `src/api/openapi-types.ts`      | `shared/api/openapi-types.ts`               | shared   |
| `src/api/compat-check.ts`       | `shared/api/compat-check.ts`                | shared   |
| `src/api/hooks.ts`              | `shared/api/hooks.ts`                       | shared   |
| `src/api/hooks/use-polling.ts`  | `shared/api/hooks/use-polling.ts`           | shared   |
| `src/api/query-keys.ts`         | → расщепляется в entities/\*/api.ts         | —        |
| `src/lib/format.ts`             | `shared/lib/format.ts`                      | shared   |
| `src/lib/idempotency.ts`        | `shared/lib/idempotency.ts`                 | shared   |
| `src/lib/query-client.ts`       | `shared/lib/query-client.ts`                | shared   |
| `src/components/QueryGuard/`    | `shared/ui/QueryGuard/`                     | shared   |
| `src/api/endpoints/catalog.ts`  | `entities/product/api.ts` + productKeys     | entities |
| `src/components/ProductCard/`   | `entities/product/ui/`                      | entities |
| `src/api/endpoints/cart.ts`     | `entities/cart/api.ts` + cartKeys           | entities |
| `src/components/CartItem/`      | `entities/cart/ui/`                         | entities |
| `src/api/endpoints/session.ts`  | `entities/session/api.ts`                   | entities |
| `src/lib/session-context.ts`    | `entities/session/model/session-context.ts` | entities |
| `src/lib/session.ts`            | `entities/session/lib/session.ts`           | entities |
| `src/lib/session-provider.tsx`  | `entities/session/lib/session-provider.tsx` | entities |
| `src/api/auth-hooks.ts`         | `entities/session/lib/auth-hooks.ts`        | entities |
| `src/api/endpoints/checkout.ts` | `entities/checkout/api.ts`                  | entities |
| `src/api/endpoints/orders.ts`   | `entities/order/api.ts`                     | entities |
| `src/api/endpoints/payments.ts` | `entities/payment/api.ts`                   | entities |
| `src/components/Layout/`        | `app/layout.tsx`                            | app      |
| `src/App.tsx` (маршруты)        | `app/routes.tsx`                            | app      |
| `src/pages/CatalogPage/`        | `pages/catalog/`                            | pages    |
| `src/pages/CartPage/`           | `pages/cart/`                               | pages    |
| `src/main.tsx`                  | `src/main.tsx` (упрощается, импорт из app/) | —        |

## Ключевые решения

1. **auth-hooks в entities/session** — `useAuthQuery`/`useAuthMutation` зависят от `useSession`
   (entities/session). shared/ не может зависеть от entities/ → хуки идут в session-слайс.

2. **Query-ключи в entity-слайсах** — `productKeys` в `entities/product/api.ts`,
   `cartKeys` в `entities/cart/api.ts`. Центральный `query-keys.ts` удаляется.
   Кросс-инвалидация: страница импортирует ключи нужных entities (pages > entities).

3. **Публичный API (index.ts)** — каждый entity-слайс экспортирует наружу только нужное:
   - `entities/product` → `ProductCard`, `listProducts`, `productKeys`
   - `entities/cart` → `CartItem`, `getCart`, `setCartItem`, `removeCartItem`, `cartKeys`
   - `entities/session` → `useSession`, `SessionProvider`, `useAuthQuery`, `useAuthMutation`

4. **main.tsx остаётся в src/** — Vite требует точку входа в `src/`. Файл упрощается
   до `createRoot + StrictMode + providers + routes`. Логика переносится в `app/`.

5. **Нереализованные entities (checkout, order, payment)** — эндпоинты уже написаны,
   перемещаем в слайсы для единообразия. Не orphaned — это реорганизация существующего кода.

6. **Алиас `@/`** — остаётся `@/` → `src/`. Дополнительные алиасы не вводим.

## Правила зависимостей

```
app → pages → entities → shared
                    ↕ запрещено
        (entities не импортируют друг друга напрямую,
         только через публичный API)
```

- shared → нигде не импортирует (нет зависимостей)
- entities → импортирует только shared
- pages → импортирует entities и shared
- app → импортирует pages, entities и shared

## Шаги миграции

### Шаг 1. shared/api/ — транспорт и типы

Перенести инфраструктурные файлы API в `shared/api/`, обновить все импорты.

**Перемещения:**

- `src/api/transport.ts` → `src/shared/api/transport.ts`
- `src/api/errors.ts` → `src/shared/api/errors.ts`
- `src/api/api-types.ts` → `src/shared/api/api-types.ts`
- `src/api/openapi-types.ts` → `src/shared/api/openapi-types.ts`
- `src/api/compat-check.ts` → `src/shared/api/compat-check.ts`
- `src/api/hooks.ts` → `src/shared/api/hooks.ts`
- `src/api/hooks/use-polling.ts` → `src/shared/api/hooks/use-polling.ts`

**Обновить импорты в:**

- 6 файлов endpoints (`@/api/transport` → `@/shared/api/transport`, `@/api/api-types` → `@/shared/api/api-types`)
- `auth-hooks.ts` (`@/api/errors` → `@/shared/api/errors`)
- `session-provider.tsx` (`@/api/errors` → `@/shared/api/errors`)
- `CatalogPage.tsx` (`@/api/hooks` → `@/shared/api/hooks`)
- Тесты: `transport.test.ts`, `api-hooks.test.tsx`, `auth-hooks.test.tsx`

**Удалить:** пустую директорию `src/api/hooks/` (если не используется для других файлов)

**≈ 30 строк изменений**

### Шаг 2. shared/lib/ + shared/ui/ — утилиты и UI-примитивы

Перенести утилиты и QueryGuard в shared/.

**Перемещения:**

- `src/lib/format.ts` → `src/shared/lib/format.ts`
- `src/lib/idempotency.ts` → `src/shared/lib/idempotency.ts`
- `src/lib/query-client.ts` → `src/shared/lib/query-client.ts`
- `src/components/QueryGuard/` → `src/shared/ui/QueryGuard/`

**Обновить импорты в:**

- `ProductCard.tsx` (`@/lib/format` → `@/shared/lib/format`)
- `CartItem.tsx` (`@/lib/format` → `@/shared/lib/format`)
- `main.tsx` (`@/lib/query-client` → `@/shared/lib/query-client`)
- Тесты: `format.test.ts`, `idempotency.test.ts`, `QueryGuard.test.tsx`

**≈ 15 строк изменений**

### Шаг 3. entities/product/ + entities/cart/ — доменные слайсы с UI

Создать entity-слайсы для product и cart. Расщепить query-keys.ts.

**Создать:**

- `src/entities/product/api.ts` — listProducts + `productKeys`
- `src/entities/product/ui/ProductCard.tsx` + CSS
- `src/entities/product/index.ts`
- `src/entities/cart/api.ts` — getCart, getCartItem, setCartItem, removeCartItem + `cartKeys`
- `src/entities/cart/ui/CartItem.tsx` + CSS
- `src/entities/cart/index.ts`

**Расщепить:**

- `src/api/query-keys.ts` → удалить, ключи перенесены в entity api.ts

**Обновить импорты в:**

- `CatalogPage.tsx`:
  - `@/api/endpoints/catalog` → `@/entities/product`
  - `@/api/endpoints/cart` → `@/entities/cart`
  - `@/api/query-keys` → `@/entities/product` + `@/entities/cart`
  - `@/components/ProductCard/ProductCard` → `@/entities/product`
  - `@/components/QueryGuard/QueryGuard` → `@/shared/ui/QueryGuard/QueryGuard`
  - `@/api/auth-hooks` → `@/entities/session/lib/auth-hooks` (временно, до шага 4)
- `CartPage.tsx`:
  - аналогично

**Удалить:**

- `src/api/endpoints/catalog.ts`
- `src/api/endpoints/cart.ts`
- `src/api/query-keys.ts`
- `src/components/ProductCard/`
- `src/components/CartItem/`

**Тесты:**

- `ProductCard.test.tsx` — обновить импорт ProductCard
- `CartItem.test.tsx` — обновить импорт CartItem
- `CatalogPage.test.tsx` — обновить импорты
- `CartPage.test.tsx` — обновить импорты

**≈ 40 строк изменений**

### Шаг 4. entities/session/ — сессия и авторизация

Создать entity-слайс для session, перенести контекст, провайдер, хранилище, auth-хуки.

**Создать:**

- `src/entities/session/api.ts` — createSession, getSession
- `src/entities/session/model/session-context.ts`
- `src/entities/session/lib/session.ts`
- `src/entities/session/lib/session-provider.tsx`
- `src/entities/session/lib/auth-hooks.ts`
- `src/entities/session/index.ts`

**Обновить импорты в:**

- `main.tsx` (`@/lib/session-provider` → `@/entities/session`, `@/lib/query-client` → `@/shared/lib/query-client` — уже обновлено на шаге 2)
- `CatalogPage.tsx` (`@/api/auth-hooks` → `@/entities/session`)
- `CartPage.tsx` (`@/api/auth-hooks` → `@/entities/session`)
- Тесты: `session-context.test.tsx`, `auth-hooks.test.tsx`, `session.test.ts`

**Удалить:**

- `src/api/endpoints/session.ts`
- `src/api/auth-hooks.ts`
- `src/lib/session-context.ts`
- `src/lib/session.ts`
- `src/lib/session-provider.tsx`

**≈ 30 строк изменений**

### Шаг 5. entities/checkout, order, payment — неиспользуемые домены

Перенести эндпоинты, которые не подключены к страницам.

**Создать:**

- `src/entities/checkout/api.ts` — getCheckoutOptions, createQuote, getQuote
- `src/entities/checkout/index.ts`
- `src/entities/order/api.ts` — createOrder, listOrders, getOrder
- `src/entities/order/index.ts`
- `src/entities/payment/api.ts` — listPayments, createPayment, getPayment, createSimulation, getSimulation
- `src/entities/payment/index.ts`

**Удалить:**

- `src/api/endpoints/checkout.ts`
- `src/api/endpoints/orders.ts`
- `src/api/endpoints/payments.ts`

**Импорты:** внутри файлов только `@/shared/api/transport` и `@/shared/api/api-types` — уже обновлены на шаге 1. index.ts — новый код.

**≈ 25 строк изменений**

### Шаг 6. app/ + pages/ — слой приложения и маршруты

Реструктурировать顶层: Layout → app, App.tsx → routes, main.tsx упрощается, pages переименовываются.

**Создать:**

- `src/app/layout.tsx` + `layout.module.css` — из `src/components/Layout/`
- `src/app/providers.tsx` — композиция QueryClientProvider + SessionProvider
- `src/app/routes.tsx` — BrowserRouter + Routes + Route из `src/App.tsx`
- `src/app/styles/index.css` — из `src/index.css`

**Обновить pages:**

- `src/pages/CatalogPage/` → `src/pages/catalog/` (папка в нижнем регистре)
- `src/pages/CartPage/` → `src/pages/cart/`

**Обновить main.tsx:**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Providers } from '@/app/providers';
import { Routes } from '@/app/routes';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers />
  </StrictMode>,
);
```

**Удалить:**

- `src/App.tsx`
- `src/components/Layout/`
- `src/index.css` (перемещён в app/styles/)

**≈ 30 строк изменений**

### Шаг 7. Очистка и верификация

- Удалить пустые директории: `src/api/`, `src/lib/`, `src/components/`
- Проверить, что нет «битых» импортов
- Обновить `index.html` если нужно (путь к main.tsx не меняется)
- Полная верификация: `format && build && lint && test`

**≈ 5 строк изменений**

## Итоговая структура тестов

Тесты остаются в `test/` (Vitest конфиг). Обновляются только импорты:

```
test/
  transport.test.ts          — @/shared/api/transport, @/shared/api/errors
  api-hooks.test.tsx         — @/shared/api/hooks, @/shared/api/errors
  auth-hooks.test.tsx        — @/entities/session (useAuthQuery, useAuthMutation)
  session.test.ts            — @/entities/session/lib/session
  idempotency.test.ts        — @/shared/lib/idempotency
  session-context.test.tsx   — @/entities/session
  format.test.ts             — @/shared/lib/format
  ProductCard.test.tsx       — @/entities/product
  CartItem.test.tsx          — @/entities/cart
  CatalogPage.test.tsx       — @/pages/catalog
  CartPage.test.tsx          — @/pages/cart
  QueryGuard.test.tsx        — @/shared/ui/QueryGuard/QueryGuard
```

## Риски

1. **Циклические зависимости** — entities не импортируют друг друга. Если появится потребность
   (например, cart нужен product-тип), использовать типы из `@checkout/contracts` или `shared/`.
2. **Barrel-экспорты и tree-shaking** — Vite/esbuild корректно обрабатывает barrel-экспорты
   для проекта такого размера. Если станут проблемой — переключить на прямые импорты.
3. **Размер шагов** — каждый шаг ≈ 15–40 строк реальных изменений (git diff),
   файловые перемещения через `git mv` не увеличивают дифф.
