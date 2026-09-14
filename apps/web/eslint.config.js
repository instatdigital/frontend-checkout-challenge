import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import fsdImport from 'eslint-plugin-fsd-import';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  jsxA11y.flatConfigs.recommended,
  {
    settings: {
      react: { version: 'detect' },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
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
    },
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['test/**/*.test.{ts,tsx}'],
    rules: {
      'fsd-import/public-api-imports': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'react/display-name': 'off',
    },
  },
);
