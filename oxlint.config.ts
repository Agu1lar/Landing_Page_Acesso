import { defineConfig } from 'oxlint';
import core from 'ultracite/oxlint/core';
import next from 'ultracite/oxlint/next';
import react from 'ultracite/oxlint/react';
import vitest from 'ultracite/oxlint/vitest';

export default defineConfig({
  extends: [core, react, next, vitest],
  ignorePatterns: [
    'docs/scripts/**',
    'src/lib/email.test.ts',
    'docs/CI-lint-report.txt',
    'docs/CI-lint-report-after-fix.txt',
  ],
  rules: {
    'no-warning-comments': 'off', // Allow TODO and FIXME comments
    'no-inline-comments': 'off', // Allow nearby comments

    'sort-keys': 'off',
    'func-style': 'off',

    'typescript/no-unsafe-assignment': 'off', // Allow implicit `any` assignments
    'typescript/no-unsafe-call': 'off', // Allow implicit `any` calls
    'typescript/no-unsafe-member-access': 'off', // Allow member access on implicit `any` values
    'typescript/strict-boolean-expressions': 'off', // Allow non-boolean conditional checks
    'typescript/consistent-type-definitions': ['error', 'type'], // Use `type` instead of `interface`
    'typescript/no-misused-promises': 'off', // React Hook Form's handleSubmit returns a Promise-typed handler
    'typescript/strict-void-return': 'off', // Allow functions returning Promise<void> where void functions are expected
    'typescript/prefer-regexp-exec': 'off', // Allow use of String#match

    'unicorn/filename-case': 'off', // Impossible to enforce consistent filename case due to multiple conventions

    // --- JSDoc Rules (warn until backlog cleared; was blocking CI since Sprint 5) ---
    'jsdoc/require-param': 'warn',
    'jsdoc/require-param-description': 'warn',
    'jsdoc/require-returns': 'warn',
    'jsdoc/require-returns-description': 'warn',
    'vitest/prefer-describe-function-title': 'off',
    'typescript/no-deprecated': 'warn',
    'typescript/no-unsafe-type-assertion': 'warn',
    'eslint/require-unicode-regexp': 'warn',
    'eslint/complexity': 'warn',
    'eslint/no-use-before-define': 'warn',
    'eslint/no-negated-condition': 'warn',
    'unicorn/no-negated-condition': 'warn',
    'unicorn/no-useless-undefined': 'warn',
    'vitest/prefer-import-in-mock': 'off',
    'import/first': 'warn',
    'eslint/no-unused-vars': 'warn',
  },
  options: {
    reportUnusedDisableDirectives: 'error',
  },
  overrides: [
    {
      files: ['*.test.ts', '*.test.tsx', '**/*.test.ts', '**/*.test.tsx'],
      rules: {
        'vitest/prefer-import-in-mock': 'off',
        'vitest/prefer-describe-function-title': 'off',
        'import/first': 'off',
      },
    },
  ],
});
