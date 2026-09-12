# Этап 0. Скаффолдинг — декомпозиция

## Контекст

- Монорепо: npm workspaces (`apps/*`, `packages/*`)
- Node.js 24, npm 11, TypeScript 5.9
- Существующие workspace-пакеты: `@checkout/api`, `@checkout/contracts`
- Базовый tsconfig: `ES2023`, `NodeNext`, `strict`
- Prettier: singleQuote, printWidth 100, trailingComma "all"
- `apps/web/` — пусто, кроме README.md

---

## 0.1. Инициализация проекта

Запустить `npm create vite@latest` с шаблоном `react-ts` в `apps/web`:

```bash
npm create vite@latest apps/web -- --template react-ts
```

Это создаст готовую структуру:
- `apps/web/package.json` (name: `web` → заменить на `@checkout/web`)
- `apps/web/tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- `apps/web/vite.config.ts`
- `apps/web/index.html`
- `apps/web/src/main.tsx`, `src/App.tsx`, `src/App.css`, `src/index.css`
- `apps/web/vite-env.d.ts`
- `apps/web/eslint.config.js` (удалить — линтер не нужен на этом этапе)

### Пост-генерация: правки под монорепо

1. **package.json** — переименовать workspace:
   - `"name": "web"` → `"name": "@checkout/web"`
   - Добавить `"private": true`
   - Добавить скрипт `"test": "vitest run"`

2. **tsconfig.json / tsconfig.app.json** — адаптировать под монорепо:
   - `"extends": "../../tsconfig.base.json"` вместо дефолтного
   - `"moduleResolution": "bundler"` (Vite-специфичное)
   - `"jsx": "react-jsx"`
   - Добавить `"paths": { "@/*": ["src/*"] }` в compilerOptions
   - `"noEmit": true` (сборку делает Vite)

3. **vite.config.ts** — добавить алиас:
   ```ts
   resolve: { alias: { '@': path.resolve(__dirname, 'src') } }
   ```
   CORS не нужен: бэкенд разрешает localhost на любом порту.
   Базовый URL API задаётся в транспортном слое (Этап 1).

4. **Удалить лишнее**: `eslint.config.js`, `src/App.css` (стили — CSS Modules)

### Добавить зависимости

```bash
npm install -w @checkout/web react-router @tanstack/react-query @checkout/contracts
npm install -w @checkout/web -D vitest @testing-library/react jsdom
```

**Проверка**: `npm install -w @checkout/web` → lockfile обновлён.

---

## 0.2. Vitest-конфигурация

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

---

## 0.3. Интеграция с монорепо

1. Корневой `npm run dev` не трогать — API и web запускаются отдельно
2. Проверить: `npm run build -w @checkout/web` → собирается без ошибок
3. Проверить: `npm run dev -w @checkout/web` → Vite запускается, страница открывается

---

## 0.4. Prettier-интеграция

Prettier уже в корне. Проверить, что `apps/web` не исключён в `.prettierignore`.
Запустить `npm run format:check` — новый код должен проходить.

---

## Порядок выполнения

| Шаг | Действие | Проверка |
|---|---|---|
| 1 | `npm create vite@latest apps/web -- --template react-ts` | Файлы сгенерированы |
| 2 | Правка package.json: name, private, test-скрипт | — |
| 3 | Правка tsconfig: extends, paths, moduleResolution, noEmit | — |
| 4 | Правка vite.config.ts: алиас `@` | — |
| 5 | Удалить eslint.config.js, src/App.css | — |
| 6 | Создать vitest.config.ts | — |
| 7 | `npm install -w @checkout/web` + доп. зависимости | lockfile обновлён |
| 8 | `npx tsc -p apps/web/tsconfig.app.json` | типы без ошибок |
| 9 | `npm run build -w @checkout/web` | dist/ создан |
| 10 | `npm run dev -w @checkout/web` | Vite запущен, рендерит страницу |
| 11 | `npm run test -w @checkout/web` | vitest запускается (0 тестов — ок) |
| 12 | `npm run format:check` | prettier доволен |
