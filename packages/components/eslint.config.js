import baseConfig from '@bwp-web/eslint-config/base';
import reactConfig from '@bwp-web/eslint-config/react';
import globals from 'globals';

/** @type {import('typescript-eslint').Config} */
export default [
  // The visual checks' bundled page, Playwright's reports and the built Storybook are generated,
  // like dist/.
  {
    ignores: [
      'test/visual/.out/',
      'test-results/',
      'playwright-report/',
      'storybook-static/',
    ],
  },
  ...baseConfig,
  ...reactConfig,
  {
    // The shared base config declares no ambient globals. The visual checks run in Node and pass
    // functions into the page, so they use both.
    files: ['test/**/*.mjs', 'playwright.config.mjs'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
];
