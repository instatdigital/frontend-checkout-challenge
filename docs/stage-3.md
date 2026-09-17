# Этап 3. Каталог — декомпозиция

## Контекст

Каталог — первая страница, которую видит пользователь. Показывает 4 товара из API,
каждый с названием, описанием, ценой (в рублях), статусом наличия и кнопкой «В корзину».

EVALUATION A1: «Каталог из API, товар в корзину».

---

## 3.1. Форматирование цен (`src/lib/format.ts`)

Суммы с API — копейки (целые), отображение — рубли с символом ₽.

- `formatPrice(kopecks: number): string` → `"1 290 ₽"` (пробел — неразрывный, `\u00A0`)
- Группировка разрядов пробелом, 2 знака после запятой при наличии копеек
- Примеры: `0` → `"0 ₽"`, `249000` → `"2 490 ₽"`, `129050` → `"1 290,50 ₽"`

TDD: `it.each` с парами kopecks → expected.

~10 строк + ~20 строк тестов.

## 3.2. Роутинг и Layout

Установка react-router. Создание базовой структуры навигации:

- Роуты: `/` → CatalogPage (позже добавятся `/cart`, `/checkout` и т.д.)
- `Layout` компонент (CSS Modules + BEM): шапка с названием, основная область, навигация
- `App.tsx` — маршрутизация через `createBrowserRouter` / `RouterProvider`

~40 строк.

## 3.3. Рефакторинг endpoints на OpenAPI-типы

Endpoint-функции переведены с `@checkout/contracts` на типы из `api-types.ts`:

- `ApiResponseData<Op, Status>` — тип ответа из OpenAPI
- `ApiRequestBody<Op>` — тип тела запроса из OpenAPI
- Аннотации типов вместо кастинга (`const body: ApiRequestBody<Op> = {}`)
- `compat-check.ts` гарантирует совместимость контрактов и OpenAPI

## 3.4. ProductCard (`src/components/ProductCard/`)

Карточка товара: название, описание, цена, наличие, кнопка «В корзину».

- `ProductCard.tsx` — принимает `Product` из `@checkout/contracts` + `onAddToCart`
- Кнопка disabled при `stock === 0`
- `ProductCard.module.css` — БЭМ: `.card`, `.card__title`, `.card__price`, `.card__button--disabled`

TDD: render + click.

~30 строк компонент + ~20 строк стили + ~25 строк тестов.

## 3.4. CatalogPage (`src/pages/CatalogPage/`)

Страница каталога:

- `useApiQuery(['products'], () => listProducts())` — загрузка товаров
- `useSession()` — токен для добавления в корзину
- `useApiMutation(setCartItem)` — мутация «добавить в корзину»
- Сетка карточек ProductCard
- Состояния: загрузка, ошибка, пусто

TDD: render с mock API.

~40 строк компонент + ~20 строк стили + ~30 строк тестов.

---

## Порядок выполнения

| Шаг | Действие              | Объём           | Статус |
| --- | --------------------- | --------------- | ------ |
| 1   | Форматирование цен    | ~7 + ~18        | ✅     |
| 2   | Роутинг и Layout      | ~55             | ✅     |
| 3   | Рефакторинг endpoints | ~75             | ✅     |
| 4   | ProductCard + тесты   | ~30 + ~20 + ~25 | ✅     |
| 5   | CatalogPage + тесты   | ~40 + ~20 + ~30 | ✅     |
