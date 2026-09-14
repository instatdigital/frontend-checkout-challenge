import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import fsdImport from 'eslint-plugin-fsd-import';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'fsd-import': fsdImport,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      'fsd-import': {
        alias: { '@': 'src' },
      },
    },
    rules: {
      // FSD: layer hierarchy, cross-slice, public API (same as check-fsd.mjs)
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
      // React
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // TypeScript
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
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
    },
  },
);
