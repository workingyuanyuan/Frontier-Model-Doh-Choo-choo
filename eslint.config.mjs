import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/.next/**',
      // Static export output; the same generated bundles as .next/.
      'apps/bench/out/**',
      '**/coverage/**',
      '**/dist/**',
      '**/node_modules/**',
      'apps/bench/next-env.d.ts',
      'artifacts/**',
      // Verbatim copies of artifacts entries; linting third-party bytes
      // reports thousands of findings about code this repository does not own.
      'packages/acquisition/test-fixtures/**',
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    // Node scripts run outside the browser and outside the TS program.
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly' },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
);
