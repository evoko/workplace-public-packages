import { includeIgnoreFile } from '@eslint/compat';
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import * as path from 'node:path';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  includeIgnoreFile(path.join(import.meta.dirname, '../../.gitignore')),
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      curly: 'warn',
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  eslintConfigPrettier,
);
