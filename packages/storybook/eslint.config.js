import baseConfig from '@bwp-web/eslint-config/base';
import reactConfig from '@bwp-web/eslint-config/react';

/** @type {import('typescript-eslint').Config} */
export default [
  { ignores: ['dist/**', 'src/generated/**'] },
  ...baseConfig,
  ...reactConfig,
  {
    // Node scripts run outside the browser and report through the console.
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: { URL: 'readonly', console: 'readonly', process: 'readonly' },
    },
    rules: { 'no-console': 'off' },
  },
];
