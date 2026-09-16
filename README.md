# Тестовое задание для фронтенд-разработчика

Нужно сделать интерфейс магазина: каталог, корзину, оформление заказа и оплату тестовой картой. Бэкенд готов, фронтенд находится в `apps/web`.

Для отбора нужно выполнить оба тестовых: [оформление заказа](https://github.com/instatdigital/frontend-checkout-challenge) и [канвас на React Flow](https://github.com/instatdigital/frontend-canvas-challenge). Пришлите ссылки на оба решения.

[Условия задания](docs/ASSIGNMENT.md) · [Работа с API](docs/INTEGRATION.md) · [Критерии оценки](docs/EVALUATION.md)

Главный критерий — обобщение кода и минимум повторяющихся операций. Одинаковые проверки HTTP-ответов и разбор ошибок в компонентах недопустимы. Отдельно оцениваем стоимость обработки данных: лишние проходы, копирования и повторные поиски снижают результат.

## Запуск

Потребуются Node.js 24.x и npm 11.x. Отдельная база данных и ключи внешних сервисов не нужны.

```sh
git clone https://github.com/instatdigital/frontend-checkout-challenge.git
cd frontend-checkout-challenge
npm ci
npm run dev
```

Команда `npm run dev` запускает и API, и фронтенд.

Swagger: [http://localhost:4000/docs/](http://localhost:4000/docs/). Спецификация: [http://localhost:4000/openapi.json](http://localhost:4000/openapi.json) или [файл в репозитории](docs/openapi.json).

В Swagger выполните `POST /api/sessions` с телом `{}`. Скопируйте `data.token` в **Authorize**, без слова `Bearer`.

## Команды фронтенда

Работа с приложением `@checkout/web`:

```sh
npm run dev -w @checkout/web      # dev-сервер
npm run build -w @checkout/web     # production build
npm run preview -w @checkout/web   # preview production build
npm run test -w @checkout/web      # unit-тесты (Vitest)
npm run lint -w @checkout/web      # ESLint
npm run typecheck -w @checkout/web # TypeScript
```

Корневые проверки:

```sh
npm run check       # форматирование, сборка, тесты и OpenAPI
npm run build
npm start           # запуск собранного бэкенда
```

При работающем API в другом терминале выполните `npm run smoke`. Эта команда проверяет покупку, отказ карты, отмену и повтор оплаты по HTTP.

## Структура

```text
apps/api/             бэкенд
apps/web/             фронтенд (React + TypeScript + Vite)
packages/contracts/   схемы API и типы TypeScript
docs/                 задание и документация
scripts/              проверки
```

### Архитектура фронтенда

`apps/web/src` построен по Feature-Sliced Design:

```text
app/        провайдеры, роуты, лейаут, глобальные стили
pages/      страницы приложения (catalog, cart, checkout, payment, order)
features/   пользовательские сценарии (add-to-cart, pay-by-card, ...)
entities/   доменные сущности (product, cart, session, checkout, order, payment)
shared/     инфраструктура без бизнес-логики (api, ui, lib)
```

Правило зависимостей: `app → pages → features → entities → shared`.

## Обработка данных

### Транспортный слой

Все HTTP-запросы идут через `shared/api/transport.ts`. Его задачи:

- Инжектировать базовый URL и заголовки, включая `Authorization: Bearer <token>` и `Idempotency-Key`.
- Разбирать конверт `{ data, meta, links }` и выдавать данные или бросать `ApiError`.
- Парсить ошибочный ответ в `ApiError` с кодом и сообщением.

Компоненты и хуки не работают с `Response` напрямую и не парсят `response.json()`.

### Ошибки

- `ApiError` — ошибки API с `status`, `code`, `message` и опционально `fields`.
- `ConflictError extends ApiError` — 409-ошибки (конфликт версий корзины, устаревший расчёт).
- `NetworkError` — сетевые проблемы.

`QueryGuard` единообразно рисует состояния загрузки и ошибки на страницах.

### Идемпотентность

`Idempotency-Key` генерируется на каждое значимое действие (создание заказа, создание платежа) и сохраняется в `localStorage` до получения подтверждения. При перезагрузке ключ и `paymentId` восстанавливаются, чтобы продолжить незавершённую оплату.

### Кеш

TanStack Query используется для кеширования, дедупликации и инвалидации. Query-ключи создаются через фабрики (`productKeys`, `cartKeys`, `orderKeys`, `checkoutKeys`). Авторизованные запросы — через `useAuthQuery`/`useAuthMutation`, публичные — через `useApiQuery`/`useApiMutation`.

### Суммы

Все денежные суммы приходят из API в копейках (целые числа). Отображение в рублях происходит через единую функцию `formatPrice` из `shared/lib/format`. Обратное преобразование в копейки не требуется, так как передаются только идентификаторы, а не суммы.

## Настройки

Адрес по умолчанию — `127.0.0.1:4000`. Если порт занят, скопируйте `.env.example` в `.env` и измените `PORT`. Для проверки другого порта передайте `BASE_URL`, например `BASE_URL=http://localhost:4100 npm run smoke`.

Фронтенд может работать на любом HTTP-порту `localhost`, `127.0.0.1` или `[::1]`. Другие разрешённые адреса задаются в `CORS_ORIGINS`. Авторизация передаётся заголовком; cookies и `credentials: include` не нужны.

Данные сохраняются в `.data/store.json`. Запускайте один экземпляр API на один файл. Для сброса остановите сервер и выполните `npm run data:reset`; затем создайте новую сессию. Если меняли `DATA_FILE`, свой файл удалите вручную при остановленном сервере.

Товары и адреса вымышленные. Остаток ограничивает количество в одной корзине и не уменьшается у других покупателей. Для получателя используйте тестовые контакты, например `buyer@example.test`. Вместо ввода номера карты интерфейс предлагает тестовые карты из API.
