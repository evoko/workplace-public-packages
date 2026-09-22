import baseConfig from '@bwp-web/eslint-config/base';
import globals from 'globals';

/** @type {import('typescript-eslint').Config} */
export default [
  ...baseConfig,
  {
    // Unlike the published packages, which target the browser, the generator runs on Node.
    // The shared base config declares no ambient globals, so they are declared here.
    files: ['**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
  {
    // The generator is a command line tool; printing progress is its job.
    files: ['bin/**/*.mjs', 'src/**/*.mjs'],
    rules: { 'no-console': 'off' },
  },
];
