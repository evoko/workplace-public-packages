import baseConfig from '@bwp-web/eslint-config/base';

/** @type {import('typescript-eslint').Config} */
export default [
  ...baseConfig,
  {
    files: ['src/cli.ts', 'src/report.ts', 'scripts/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // Exercises captureConsoleErrors's console.error interception directly.
    files: ['test/mui-capture-rules.test.ts'],
    rules: {
      'no-console': 'off',
    },
  },
];
