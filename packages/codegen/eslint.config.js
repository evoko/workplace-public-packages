import baseConfig from '@bwp-web/eslint-config/base';

/** @type {import('typescript-eslint').Config} */
export default [
  ...baseConfig,
  {
    // The generator is a command line tool; printing progress is its job.
    files: ['bin/**/*.mjs', 'src/**/*.mjs'],
    rules: { 'no-console': 'off' },
  },
];
