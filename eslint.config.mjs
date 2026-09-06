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
    files: ['packages/acquisition/src/**/*.ts'],
    ignores: ['**/*.test.ts', '**/safe-network.ts', '**/safe-archive.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message:
            'Use acquisitionClient so destination and resource limits apply.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            'node:http',
            'node:https',
            'http',
            'https',
            'node:http2',
            'undici',
            'axios',
            'adm-zip',
            'node:zlib',
          ].map((name) => ({
            name,
            message:
              'Use safe-network or safe-archive with the shared acquisition policy.',
          })),
        },
      ],
    },
  },
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
