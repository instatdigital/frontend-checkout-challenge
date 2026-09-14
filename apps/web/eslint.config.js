import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import sonarjs from 'eslint-plugin-sonarjs';
import fsdImport from 'eslint-plugin-fsd-import';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'src/shared/api/openapi-types.ts'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  jsxA11y.flatConfigs.recommended,
  sonarjs.configs.recommended,
  {
    settings: {
      react: { version: 'detect' },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: { version: 'detect' },
      'fsd-import': {
        alias: { '@': 'src' },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'fsd-import': fsdImport,
    },
    rules: {
      // React hooks + refresh
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // FSD: layer hierarchy, cross-slice, public API
      'fsd-import/layer-imports': 'error',
      'fsd-import/slice-boundaries': 'error',
      'fsd-import/public-api-imports': [
        'error',
        { alias: '@', rootDir: 'src', testFilesPatterns: ['test/**/*.test.{ts,tsx}'] },
      ],
      // FSD: disable rules not needed for this project
      'fsd-import/shared-public-api-imports': 'off',
      'fsd-import/forbidden-app-imports': 'off',
      'fsd-import/no-deprecated-layer-names': 'off',
      'fsd-import/fsd-relative-path': 'off',
      'fsd-import/no-cross-slice-relative-imports': 'off',
      // TypeScript
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-invalid-void-type': 'off',
      // Resilience: no floating promises, no misused promises
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      // DRY: no direct fetch outside transport layer
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.name="fetch"]',
          message:
            'Use apiRequest() from shared/api/transport — direct fetch is not allowed in components',
        },
      ],
      // Sonarjs: DRY rules
      'sonarjs/no-identical-functions': 'warn',
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/cognitive-complexity': 'error',
      // React props already readonly by TS contract — adding readonly is redundant
      'sonarjs/prefer-read-only-props': 'off',
      // TanStack Query refetchInterval legitimately returns number | false
      'sonarjs/function-return-type': 'off',
    },
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['src/shared/api/transport.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    files: ['test/**/*.test.{ts,tsx}'],
    rules: {
      'fsd-import/public-api-imports': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      'react/display-name': 'off',
      'sonarjs/no-identical-functions': 'off',
      'sonarjs/no-duplicate-string': 'off',
    },
  },
);
