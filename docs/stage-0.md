# Этап 0. Скаффолдинг — декомпозиция

## Контекст

- Монорепо: npm workspaces (`apps/*`, `packages/*`)
- Node.js 24, npm 11, TypeScript 5.9
- Существующие workspace-пакеты: `@checkout/api`, `@checkout/contracts`
- Базовый tsconfig: `ES2023`, `NodeNext`, `strict`
- Prettier: singleQuote, printWidth 100, trailingComma "all"
- `apps/web/` — пусто, кроме README.md

---

## 0.1. package.json

Создать `apps/web/package.json`:

```jsonc
{
  "name": "@checkout/web",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

Зависимости:
- `react`, `react-dom` — UI
- `react-router` — роутинг (v7)
- `@tanstack/react-query` — кеш/загрузка
- `@checkout/contracts` — типы API

Dev-зависимости:
- `typescript` (из корня)
- `vite`, `@vitejs/plugin-react` — сборка
- `vitest`, `@testing-library/react`, `jsdom` — тесты
- `@types/react`, `@types/react-dom`

**Проверка**: `npm install -w @checkout/web` → корневой package-lock.json обновлён.

---

## 0.2. tsconfig.json

Создать `apps/web/tsconfig.json`:

```jsonc
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "rootDir": "src",
    "outDir": "dist",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "noEmit": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "vite-env.d.ts"]
}
```

Ключевые отличия от базового:
- `moduleResolution: "bundler"` — Vite резолвит импорты, не Node
- `jsx: "react-jsx"` — автоматический import React
- `paths: { "@/*": ["src/*"] }` — алиас для чистых импортов
- `noEmit: true` — Vite собирает, tsc только проверяет типы

---

## 0.3. Vite-конфигурация

Создать `apps/web/vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
```

Алиас `@` → `src/` — синхронизирован с tsconfig paths.
CORS не нужен: бэкенд разрешает `localhost` на любом порту по умолчанию.
Базовый URL API (`http://127.0.0.1:4000`) задаётся в транспортном слое (Этап 1).

---

## 0.4. Точки входа

### `apps/web/index.html`
```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Checkout Store</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `apps/web/src/main.tsx`
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

### `apps/web/src/App.tsx`
```tsx
export function App() {
  return <div>Checkout Store</div>;
}
```

### `apps/web/src/index.css`
Глобальные стили: сброс, шрифты, CSS-переменные для дизайн-токенов (цвета, отступы).

### `apps/web/vite-env.d.ts`
```ts
/// <reference types="vite/client" />
```

---

## 0.5. Vitest-конфигурация

Создать `apps/web/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.{ts,tsx}'],
  },
});
```

Добавить скрипт в package.json: `"test": "vitest run"`.

---

## 0.6. Интеграция с монорепо

1. `npm install -w @checkout/web` → установить зависимости, обновить lockfile
2. Обновить корневой `dev`-скрипт для запуска фронтенда параллельно с API:
   - Добавить `concurrently` или использовать `npm run dev -w @checkout/web &`
   - Или оставить ручной запуск двух терминалов (проще для тестового)
3. Проверить: `npm run build -w @checkout/web` → собирается без ошибок
4. Проверить: `npm run dev -w @checkout/web` → Vite запускается, страница открывается

---

## 0.7. Prettier-интеграция

Prettier уже в корне. Проверить, что `apps/web` не исключён в `.prettierignore`.
Запустить `npm run format:check` — новый код должен проходить.

---

## Порядок выполнения

| Шаг | Действие | Проверка |
|---|---|---|
| 1 | Создать `apps/web/package.json` | — |
| 2 | Создать `apps/web/tsconfig.json` | — |
| 3 | Создать `apps/web/vite.config.ts` | — |
| 4 | Создать `apps/web/vitest.config.ts` | — |
| 5 | Создать `apps/web/index.html` | — |
| 6 | Создать `apps/web/vite-env.d.ts` | — |
| 7 | Создать `apps/web/src/main.tsx`, `App.tsx`, `index.css` | — |
| 8 | `npm install -w @checkout/web` | lockfile обновлён |
| 9 | `npx tsc -p apps/web/tsconfig.json` | типы без ошибок |
| 10 | `npm run build -w @checkout/web` | dist/ создан |
| 11 | `npm run dev -w @checkout/web` | Vite запущен, рендерит «Checkout Store» |
| 12 | `npm run test -w @checkout/web` | vitest запускается (0 тестов — ок) |
| 13 | `npm run format:check` | prettier доволен |
