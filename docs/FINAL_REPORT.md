# Итоговый отчёт: Frontend Checkout Challenge

## Общая информация

- **Проект**: Monorepo — Vite 8 + React 19 + TypeScript 6 (workspace `@checkout/web`), Fastify API, shared contracts.
- **Архитектура**: FSD (Feature-Sliced Design): `app → pages → features → entities → shared`.
- **Инструменты**: Prettier, ESLint flat config, Vitest, Playwright, lefthook pre-commit.

---

## E2E-тесты: полное покрытие (13 сценариев)

Все 13 сценариев из `docs/e2e-plan.md` реализованы и проходят.

| #   | Сценарий                                  | Файл                                           | Приоритет  | Статус |
| --- | ----------------------------------------- | ---------------------------------------------- | ---------- | ------ |
| 1   | Успешная покупка картой                   | `apps/web/e2e/catalog-to-order.spec.ts`        | 🟢 Высокий | ✅     |
| 2   | Отказ карты и повтор                      | `apps/web/e2e/declined-card-retry.spec.ts`     | 🟢 Высокий | ✅     |
| 3   | Отмена платежа и повтор                   | `apps/web/e2e/cancelled-payment-retry.spec.ts` | 🟢 Высокий | ✅     |
| 4   | Наличные при получении                    | `apps/web/e2e/cash-on-delivery.spec.ts`        | 🟢 Высокий | ✅     |
| 5   | Управление количеством из каталога        | `apps/web/e2e/quantity-management.spec.ts`     | 🟢 Высокий | ✅     |
| 6   | Пустая корзина                            | `apps/web/e2e/empty-cart.spec.ts`              | 🟡 Средний | ✅     |
| 7   | Товар без остатка                         | `apps/web/e2e/out-of-stock.spec.ts`            | 🟡 Средний | ✅     |
| 8   | Валидация формы чекаута                   | `apps/web/e2e/checkout-validation.spec.ts`     | 🟡 Средний | ✅     |
| 9   | Удаление позиции из корзины               | `apps/web/e2e/remove-cart-item.spec.ts`        | 🟡 Средний | ✅     |
| 10  | Пересчёт в корзине                        | `apps/web/e2e/cart-recalculation.spec.ts`      | 🟡 Средний | ✅     |
| 11  | Устаревший quote (QUOTE_EXPIRED)          | `apps/web/e2e/quote-expired.spec.ts`           | 🔴 Сложный | ✅     |
| 12  | Восстановление платежа после перезагрузки | `apps/web/e2e/payment-recovery.spec.ts`        | 🔴 Сложный | ✅     |
| 13  | Конфликт версий корзины (409)             | покрыт в `quote-expired.spec.ts`               | 🔴 Сложный | ✅     |

### Описание ключевых сценариев

**Устаревший quote (QUOTE_EXPIRED / CART_VERSION_CONFLICT)** — `quote-expired.spec.ts`:
Добавляет товар, проходит до оплаты, через API (fetch с токеном из localStorage) меняет корзину в другой «вкладке», нажимает «Оплатить». UI корректно отображает «Расчёт устарел» и кнопку возврата к чекауту. PaymentPage обрабатывает оба кода: `QUOTE_EXPIRED` и `CART_VERSION_CONFLICT`.

**Восстановление платежа после перезагрузки** — `payment-recovery.spec.ts`:
Кликает «Оплатить», дожидается записи `checkout_payment_id` в `localStorage`, обновляет страницу. Поллинг восстанавливается автоматически и через несколько секунд на странице появляется статус заказа.

**Управление количеством из каталога** — `quantity-management.spec.ts`:
Добавляет товар, увеличивает до остатка, проверяет, что кнопка `+` блокируется. Уменьшает до 0, проверяет возврат кнопки «В корзину».

---

## Баги, найденные и исправленные в ходе работы

### 1. Слежение за idempotency key при повторе оплаты

**Проблема**: `paymentKey` генерировался один раз при монтировании страницы и повторно использовался при retry. Это делало повторную попытку идемпотентной репликой первой.
**Исправление**: `generateKey()` вызывается внутри `handleSubmit` для каждой попытки оплаты.

### 2. Сброс корзины после оформления заказа

**Проблема**: После успешного заказа в каталоге по-прежнему отображались счётчики товаров.
**Исправление**: В `useCreateOrder.onSuccess` добавлена инвалидация `cartKeys.detail()`.

### 3. Отсутствие сценария отмены карты в sandbox

**Проблема**: В UI не было кнопки для выбора отмены платежа.
**Исправление**: Добавлен `cancel` в `SandboxSchema` контрактов и `test-cancel` карта в `apps/api/src/catalog.ts`.

---

## Проверка качества кода

| Проверка                    | Результат |
| --------------------------- | --------- |
| E2E-тесты                   | 12/12 ✅  |
| API-тесты                   | 17/17 ✅  |
| Unit-тесты                  | 92/92 ✅  |
| Build                       | ✅        |
| Lint                        | ✅        |
| Typecheck                   | ✅        |
| Format (Prettier)           | ✅        |
| Pre-commit hooks (lefthook) | ✅        |

---

## Структура E2E-тестов

```
apps/web/e2e/
├── catalog-to-order.spec.ts         # Успешная покупка картой
├── declined-card-retry.spec.ts      # Отказ карты → повтор
├── cancelled-payment-retry.spec.ts  # Отмена → повтор
├── cash-on-delivery.spec.ts         # Наличные при получении
├── quantity-management.spec.ts      # Управление количеством
├── empty-cart.spec.ts               # Пустая корзина
├── out-of-stock.spec.ts             # Товар без остатка
├── checkout-validation.spec.ts      # Валидация формы чекаута
├── remove-cart-item.spec.ts         # Удаление позиции из корзины
├── cart-recalculation.spec.ts       # Пересчёт в корзине
├── quote-expired.spec.ts            # Устаревший quote / конфликт 409
└── payment-recovery.spec.ts         # Восстановление после перезагрузки
```

---

## Коммиты

Все изменения закоммичены с описательными сообщениями. Git-история чистая.

---

## Вывод

Все 13 сценариев из плана E2E-тестов реализованы и проходят. Проект проходит все проверки качества: e2e, unit, API, lint, typecheck, build и pre-commit hooks.
