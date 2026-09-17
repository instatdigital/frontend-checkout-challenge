# Этап 6. Дизайн-система + Radix UI

## Цель

Выделить дизайн-токены (палитра, сетка, типографика), интегрировать Radix UI для доступности,
обновить существующие компоненты на токены. Фундамент для всех следующих этапов.

---

### Шаг 1. Дизайн-токены (CSS-переменные) ✅

- Палитра: primary, secondary, error, success, neutral (50–900)
- Типографика: font-family, font-size scale, font-weight, line-height
- Отступы: spacing scale (4, 8, 12, 16, 24, 32, 48)
- Границы: border-radius (sm, md, lg), border-width
- Тени: shadow-sm, shadow-md
- Переходы: duration, easing
- Сетка: container max-width, breakpoints (390px, 1280px)

Файл: `app/styles/tokens.css` → импорт в `index.css`

**≈ 80 строк**

### Шаг 2. Обновление базовых стилей ✅

- `app/styles/index.css`: использовать токены вместо хардкода
- reset + body + глобальная типографика через var()
- Убрать хардкод цветов/размеров из index.css

**≈ 30 строк**

### Шаг 3. Radix UI — RadioGroup ✅

- Установить `@radix-ui/react-radio-group`
- Обновить `shared/ui/RadioGroupField`: Radix RadioGroup внутри вместо нативных radio
- Стилизация через CSS Modules + BEM (Radix рендерит data-attributes)
- Доступность: ARIA, keyboard navigation из коробки
- API не меняется: control, name, rules, options, className

**≈ 80 строк**

### Шаг 4. Обновление TextField на токены ✅

- `shared/ui/TextField/TextField.module.css`: цвета, отступы, границы через var()
- Focused, error, disabled состояния через токены

**≈ 30 строк**

### Шаг 5. Обновление RadioGroupField на токены ✅

- Выполнено в рамках шага 3 (Radix + токены одновременно)

### Шаг 6. Обновление entity-стилей на токены ✅

- CustomerForm.module.css: layout + spacing через var()
- DeliveryForm.module.css: layout + spacing через var()
- CheckoutPage.module.css: layout + spacing через var()
- CartPage.module.css, CatalogPage.module.css, ProductCard.module.css, CartItem.module.css
- QueryGuard.module.css
- Layout.module.css
- Все компоненты переведены на `import styles from` + новая конвенция нейминга (.root/.name/.name_modifier)

**≈ 100 строк**

### Шаг 7. Адаптив (390px / 1280px) ✅

- Медиа-запросы через @media (min-width: 1280px)
- Mobile-first: форма на всю ширину, кнопки full-width, footer stack
- Desktop: Layout padding увеличен, CatalogPage grid auto-fill, CartPage footer row
- CheckoutPage: grid 2 колонки (контакты + доставка), кнопка auto-width

**≈ 60 строк**

---

## Итого: 7 шагов, ~410 строк

## Финальная проверка ✅

Удалены 22 неиспользуемых токена: primary-50/100/200/700, neutral-100, error-50, success-50/500/700,
font-weight-normal, line-height-tight, space-8/12, radius-lg, shadow-sm/md, duration-normal,
container-sm, breakpoint-mobile/desktop.
